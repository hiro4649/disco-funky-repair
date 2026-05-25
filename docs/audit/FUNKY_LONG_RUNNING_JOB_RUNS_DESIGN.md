# FUNKY Long-Running Job Runs Design

## Purpose

This docs-only design covers the remaining scheduler risks after PR #160 and
PR #161. It focuses on long-running jobs, all-user processing, external API/RPC
jobs, receipt polling, worker ownership, checkpointing, retry, timeout, and
resume behavior.

This document does not implement schema, migrations, backend code, frontend
code, contracts, package changes, lockfile changes, harness changes, workflow
changes, or CODEX policy changes.

## Current Main SHA

- Current main SHA audited: `bcc40b4f96b2489169f53deec6afbaf1c51e5678`
- PR #160 scheduler distributed lock audit merge: `68cddd91272a9e97b792a633bcd6d1af6d0b8311`
- PR #161 referral cleanup advisory lock merge: `97eaba006ffdf466125eadcb1012422e01388f24`
- Harness marker observed: `CODEX_QUALITY_HARNESS_FILE v0.8.8`
- Scope: FUNKY only, docs-only long-running scheduler design
- Runtime readiness claimed: no
- staging no-tx preflight remains BLOCKED
- production readiness not claimed

## Scope

In scope:

- tracking token balance all-user processing
- daily tracking fallback and manual daily batch
- realtime external polling and websocket event processing
- wallet monitor alerting
- tier transaction and TierUpdater transaction flows
- Prize receipt polling and full job queue design
- any all-user snapshot-like process that calls external API/RPC providers

Out of scope:

- short DB-only scheduler implementation
- Prisma schema or migration creation
- backend runtime changes
- frontend changes
- contracts changes
- package or lockfile changes
- harness, workflow, scripts, or CODEX policy changes
- deploy, mint, sendToWallet execution, governance transaction, TierUpdater
  transaction, funded transaction, or staging rollout

## Inventory Table

| Job or flow | Current start path | External API/RPC | DB writes | Existing timeout | Existing retry | Resume/checkpoint | Idempotency or guard | Concurrent execution risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Six-hour token balance processing | `app/index.ts` imports `services/trackingService.ts`; cron `0 */6 * * *`; calls `processSixHourTokenBalance()` | QuickNode token balance, QuickNode/Etherscan token transactions, websocket emit | `user`, `ownedToken`, `lotteryTickets`, `referralRewards`, `pointHistory` | Lower API/RPC helpers use timeout wrappers; no whole-job budget | Per-call fallback exists in lower services; no job-level retry state | None for the whole job | Process-local `isSixHourUpdateInProgress`; some per-record predicates | Multiple app instances can duplicate external calls, ticket/referral work, and DB load | `job_runs` with per-user checkpoint and chunked worker; do not use xact advisory lock around the whole job |
| Daily tracking fallback | `trackingService.ts`; cron `0 22 * * *`; calls `checkingHoldingDateFromOnChain()` and `updateHoldingDateMilestones()` | Etherscan, QuickNode/RPC, contract tier sync | `user`, `holdDateHistory`, `transactionCheckpoint`, scheduled tier rows, contract sync side effects | HTTP/RPC helper timeouts; no whole-job budget | Some realtime fallback backoff exists elsewhere; no job-level retry state | `TransactionCheckpoint` per user exists | Process-local `userProcessingLock` only | Scheduled and manual runs can overlap; multiple instances can process the same users | `job_runs` parent run plus per-user checkpoint claim rows; separate contract sync worker |
| Manual daily batch | `monitoring.routes.ts` `POST /run-daily-batch`; calls `checkingHoldingDateFromOnChain()` | Same as daily tracking fallback | Same as daily tracking fallback | Same as underlying job | Same as underlying job | Same as underlying job | Admin auth only; no distributed overlap guard | Manual run can overlap scheduled fallback or another admin request | Same `jobName`/run family as scheduled fallback with runKey distinguishing manual trigger |
| Realtime event listener | `trackingService.ts` calls `startRealtimeEventListener()` at process startup | Websocket provider, QuickNode fast path, Etherscan fallback, Discord alerts | `user`, `holdDateHistory`, `transactionCheckpoint`, scheduled tier rows | RPC/HTTP helper timeouts and reconnect sleeps; no durable listener lease | Reconnect attempts are process-local | Per-user `TransactionCheckpoint`; no listener checkpoint/lease | Singleton only inside one process; `userProcessingLock` is process-local | Multiple app instances can open duplicate subscriptions and duplicate user processing | Leader lease or worker partitioning plus event checkpoint; per-user job rows for processing |
| Realtime user processing | `realtimeEventListener.ts` -> `processUserRealtime()` | QuickNode transaction lookup, Etherscan fallback, contract tier update path, websocket emit | `user`, FIFO `holdDateHistory`, `transactionCheckpoint`, scheduled tier rows | HTTP/RPC helper timeouts; Etherscan fallback has explicit sleeps | Etherscan fallback delays `10s/30s/60s/120s`; no durable retry state | `TransactionCheckpoint` per user | `withUserLock` process-local | Duplicate listeners can process the same user across instances | Per-user `job_runs`/claim row keyed by `userId + eventTxHash` or `userId + block range` |
| Token registration / prize discovery | `trackingService.ts`; cron `0 1-23/8 * * *`; calls `registerAllEthereumTokens()` | Etherscan token transfers, RPC token metadata/balance, DexScreener, deliberate sleeps | `prize`, `tokenDetail` | HTTP/RPC helper timeouts; no whole-job budget | Per-token catch; no job-level retry or resume | None | Upsert/update style reduces duplicates | Duplicate instances can fan out to providers and race prize/token updates | `job_runs` with token cursor and per-token attempt state |
| Scheduled tier updates | `trackingService.ts`; hourly cron; calls `processScheduledTierUpdates()` | Contract RPC, gas estimate, fee data, balance read, transaction send, `tx.wait()`, Discord alerts | `scheduledTierUpdate`, wallet gas usage memory, contract state | Some RPC helpers exist in supporting modules, but `tx.wait()` has no durable receipt polling state | In-function retry loop with backoff | `ScheduledTierUpdate.processed` only | `processed` flag after send; no distributed send reservation | Duplicate workers can send the same TierUpdater transaction before `processed` flips | Worker state machine: reserve row, broadcast, store tx hash, poll receipt separately |
| Full holding-date contract sync | `holdingDateService.ts` via fallback path or recovery helpers | Contract read, gas estimate, transaction send, `tx.wait()` | Contract side effects; DB reads | No job-level budget | Per-user catch only | None | No distributed guard | Duplicate full sync can send redundant txs and hold remote waits | Separate job family with user cursor and receipt polling |
| Wallet monitor daily check | `trackingService.ts`; cron `0 3 * * *`; calls `walletBalanceMonitor.performDailyBalanceCheck()` | RPC native balance, Discord alerting | In-memory monitor state only | RPC read timeout | No durable retry | None | In-memory cooldown only | Multiple instances can send duplicate alerts | Persist alert state or `job_runs` alert lease; no xact lock without DB state |
| Hourly holding duration update | `trackingService.ts`; hourly cron; calls `updateAllUsersHoldingDuration()` | No provider call, but emits websocket notification | `user` all-user writes | No whole-job budget | Per-user catch; no durable retry | None | Recalculation is repeatable, but not distributed locked | Multiple instances duplicate all-user writes and emits | Chunked `job_runs` with cursor; DB-only chunks may use short transactions |
| Prize transfer receipt handling | `prize.controller.ts` `sendToWallet()` and status checks | RPC receipt polling and provider reads | `prizeTransactions`, `prize` reservation release | RPC read/write timeout wrappers; tx broadcast returns without waiting after PR #146 | Request retry is user-driven; no worker retry | `PrizeTransactions.status` and `tx_hash` only | Status transitions reduce some races | Broadcasted transfers depend on later request to poll receipt; no full queue worker | Prize receipt polling worker with state machine, idempotent reservation release, and manual review boundary |
| Prize full job queue | Not implemented; current transfer path is request-driven | Would include provider receipt polling and transfer state | `prizeTransactions`, `prize`, future job rows | Not present | Not present | Not present | Current statuses: `READY`, `SENDING`, `BROADCASTED`, `MANUAL_REVIEW`, `RECEIVED`, `EXPIRED`, `CANCELLED`, `FAILED` | Request path cannot guarantee background receipt completion | Dedicated queue/worker PR after schema design |

## Why Xact Advisory Lock Is Not Enough

Transaction-scoped advisory locks are effective for short DB-only jobs. They were
appropriate for Trial NFT expiration in PR #159 and for referral cleanup in PR
#161 because the protected work is short and uses the same Prisma transaction
client.

They are not appropriate for long-running jobs that call external API/RPC
providers, websocket providers, Discord webhooks, or contract transaction
helpers. Holding a database transaction while waiting on remote systems can keep
a pooled connection open across provider latency, retry backoff, receipt waits,
rate limits, or partial failure. That increases lock duration, blocks unrelated
database work, and still does not provide durable resume semantics after process
death.

Process-local locks are also insufficient in distributed environments. Flags
such as `isSixHourUpdateInProgress`, singleton listener variables, in-memory
alert cooldowns, and `userProcessingLock` protect one Node process only. They do
not coordinate PM2 cluster workers, multiple containers, blue/green deploys, or
manual endpoint overlap.

The correct boundary for long jobs is short database transactions that claim
small units of work, commit progress, release the connection, call external
systems outside long DB transactions where possible, and store enough checkpoint
state to resume or retry safely.

## Proposed `job_runs` Schema

This is a design proposal only. Do not create schema or migration in this PR.

Suggested table fields:

| Field | Purpose |
| --- | --- |
| `jobName` | Stable job family, such as `tracking_token_balance_six_hour` or `prize_receipt_polling` |
| `runKey` | Idempotency key for a specific schedule window, manual request, event hash, or per-user chunk |
| `status` | `PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`, `TIMED_OUT`, `MANUAL_REVIEW`, `CANCELED` |
| `startedAt` | First time a worker starts the run |
| `finishedAt` | Completion or terminal time |
| `heartbeatAt` | Last worker heartbeat for stale-run detection |
| `attempt` | Current attempt count |
| `maxAttempts` | Configured retry ceiling |
| `lockedBy` | Worker identity or instance id, safe summary only |
| `checkpoint` | JSON cursor, user id range, block range, token cursor, tx hash, or chunk position |
| `safeErrorKind` | Safe category such as `provider_timeout`, `receipt_pending`, `rate_limited`, `manual_review_required` |
| `safeSummary` | Non-secret status summary with no raw payloads, URLs, keys, JWTs, cookies, private keys, or production logs |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last row update timestamp |

Recommended uniqueness:

- unique `(jobName, runKey)` for idempotent creation
- index `(jobName, status, heartbeatAt)` for worker pickup
- index `(status, updatedAt)` for stale run recovery
- optional secondary table for per-item work units if a job has many users,
  tokens, receipts, or block ranges

## Proposed Job States

| State | Meaning | Allowed next states |
| --- | --- | --- |
| `PENDING` | Run or work item is created but not claimed | `RUNNING`, `CANCELED` |
| `RUNNING` | Worker claimed the run and is heartbeating | `SUCCEEDED`, `FAILED`, `TIMED_OUT`, `MANUAL_REVIEW`, `CANCELED`, `PENDING` after stale lease recovery |
| `SUCCEEDED` | Work completed and all durable effects are committed | terminal |
| `FAILED` | Retryable or terminal failure after attempts are exhausted | `PENDING` if manually retried, terminal otherwise |
| `TIMED_OUT` | Worker exceeded job or item budget | `PENDING`, `MANUAL_REVIEW`, or terminal depending on job |
| `MANUAL_REVIEW` | Automated path cannot safely decide or continue | terminal until operator action |
| `CANCELED` | Operator or superseding run canceled the work | terminal |

## Retry Policy

Use retry at the smallest durable unit:

- per user for tracking and holding-date jobs
- per token for token discovery
- per scheduled tier update row for TierUpdater tx flows
- per prize transaction for receipt polling
- per alert state for wallet monitor

Retry should be bounded by `maxAttempts` and exponential backoff. Store only
safe error classes in `safeErrorKind`; avoid raw provider errors, raw payloads,
full URLs, secrets, or private transaction inputs.

Recommended retry classes:

- `provider_timeout`
- `provider_unavailable`
- `rate_limited`
- `receipt_pending`
- `receipt_failed`
- `insufficient_funds`
- `chain_mismatch`
- `stale_checkpoint`
- `manual_review_required`

## Timeout Policy

PR #147 added lower-level timeout budgets for external HTTP/RPC reads and
writes. That is necessary but not enough. Each job also needs a whole-run budget
and a per-item budget.

Recommended budgets:

- realtime user processing: per event/user budget with fallback state when
  indexing is delayed
- six-hour token balance: per-user budget and chunk budget, not one all-user
  transaction
- daily tracking fallback: per-user budget plus run budget, with resumable
  checkpoint
- token discovery: per-token budget and provider rate-limit budget
- tier tx: broadcast budget separate from receipt-polling budget
- prize receipt polling: short polling budget per receipt, repeated by worker
  until terminal or manual review
- wallet monitor: short balance-read and alert-send budget; persist alert
  suppression state if duplicate alerts matter

## Checkpoint And Cursor Model

Checkpoint data should represent progress, not just final status.

Recommended cursor shapes:

- tracking all-user process: `{ userCursor, processedUserIdsCount, failedUserIdsCount }`
- incremental transaction processing: `{ userId, startBlock, lastProcessedBlock, lastTransactionHash }`
- realtime processing: `{ userId, eventTxHash, eventBlockNumber, fallbackAttempt }`
- token discovery: `{ tokenAddressCursor, page, lastTokenAddress }`
- tier tx worker: `{ scheduledTierUpdateId, txHash, currentContractTier, targetTier }`
- prize receipt polling: `{ prizeTransactionId, txHash, lastReceiptStatus, lastCheckedAt }`
- wallet monitor: `{ alertKind, lastState, lastAlertAt }`

Existing `TransactionCheckpoint` is useful for per-user chain progress, but it
does not claim distributed work, heartbeat a running worker, or model whole-job
retry. A `job_runs` layer should reference or complement it rather than replace
it blindly.

## Idempotency Strategy

Use deterministic `runKey` values:

- scheduled all-user jobs: `jobName + scheduleWindowStart`
- manual daily batch: `jobName + manual + requestId`
- realtime user events: `jobName + userId + eventTxHash`
- token discovery: `jobName + tokenAddress + scheduleWindowStart`
- scheduled tier update: `jobName + scheduledTierUpdateId`
- Prize receipt polling: `jobName + prizeTransactionId + txHash`

Use conditional updates for state transitions:

- claim: `PENDING` to `RUNNING` only when status and stale lease conditions
  match
- heartbeat: update only by current `lockedBy`
- finish: `RUNNING` to terminal only by current `lockedBy`
- retry: terminal retry only by explicit operator or retry scheduler path

Keep side effects idempotent:

- do not send a contract transaction unless the row was reserved for that
  worker
- store tx hash immediately after broadcast
- never release Prize reservation twice
- only mark receipt terminal after evidence is persisted
- use existing unique constraints such as `TransactionAudit(userId, tx_hash)`
  and `PointHistory(userId, reason, dailyWindowKey)` where applicable

## Safe Logging Strategy

All job worker logs should be safe-summary only:

- include `jobName`, `runKey` prefix or hash, `status`, `attempt`, and
  `safeErrorKind`
- include numeric counts such as processed/skipped/failed
- include user ids only where current code already treats them as safe metadata
- do not log DB URLs, JWTs, cookies, private keys, full explorer URLs, API keys,
  raw payloads, provider responses, wallet private material, or production logs
- use `safeLogError` and `safeLogWarn` with non-secret metadata

## Staging Verification Requirements

Before any implementation can claim runtime readiness, staging evidence must be
non-secret and specific to each job family:

- one worker claims a run; a second worker skips or picks another unit
- stale heartbeat is recovered without duplicate side effects
- retries stop at `maxAttempts`
- timeout moves the run to `TIMED_OUT` or retryable state
- checkpoint resumes from the last committed unit
- external provider failures store safe error classes only
- Prize receipt polling handles `BROADCASTED`, `RECEIVED`, failed receipt,
  pending receipt, and manual review boundaries
- tier tx worker stores tx hash before receipt polling
- manual daily batch cannot overlap scheduled daily fallback

staging no-tx preflight remains BLOCKED until such evidence exists.

## Migration Impact

Implementing this design requires a Prisma schema and migration in a later PR.
This docs-only PR intentionally does not create them.

Expected migration work:

- add `job_runs` table
- possibly add `job_run_items` for per-user, per-token, per-receipt, or per-tier
  rows
- add indexes for pickup and stale lease recovery
- backfill is not required for historical runs, but existing `BROADCASTED`
  Prize transactions may need enqueue-on-start logic
- rollback must stop workers before dropping job tables or state columns

## Implementation PR Split

Recommended split:

1. Docs-only design: this PR.
2. Schema-only migration for `job_runs` and optional `job_run_items`.
3. Worker core: claim, heartbeat, stale recovery, retry, timeout, and safe
   summary helpers.
4. Tracking all-user worker: six-hour token balance and daily fallback with
   per-user checkpointed chunks.
5. Realtime processing coordination: leader lease or event work items keyed by
   user/event.
6. Tier tx worker: reserve scheduled update, broadcast tx, store tx hash, poll
   receipt separately.
7. Prize receipt polling worker: process `BROADCASTED` transactions to terminal
   status or `MANUAL_REVIEW`.
8. Wallet monitor distributed alert suppression.
9. Scheduler observability endpoint with safe summary only.
10. Staging evidence PR after non-secret runtime evidence exists.

## Required Judgments

- Transaction-scoped advisory lock is effective for short DB-only jobs.
- Trial NFT expiration is already locked by PR #159.
- Referral cleanup is already locked by PR #161.
- External API/RPC and long-running processing should not be wrapped in a
  transaction-scoped advisory lock because it would hold a transaction during
  remote waits.
- Process-local locks are insufficient in distributed environments.
- Long jobs need `job_runs`, short DB transactions, heartbeat, retry, timeout,
  and checkpoint.
- PR #147 timeout budgets protect individual external calls but do not provide
  resume or checkpoint behavior.
- PR #146 separated Prize transfer broadcast from HTTP receipt waiting, but a
  full receipt polling state machine is still not implemented.

## Non-goals

- No backend implementation changes.
- No frontend changes.
- No contract changes.
- No Prisma schema changes.
- No migration.
- No package or lockfile changes.
- No harness, workflow, scripts, CODEX policy, or docs/process changes.
- No Trial NFT scheduler implementation changes.
- No trackingService implementation changes.
- No Prize job queue implementation.
- No balance UNKNOWN implementation.
- No Float / Decimal migration implementation.
- No auth, cookie, refresh-token, admin prize update, or expired referral
  implementation changes.
- No PrismaClient singleton changes.
- No deploy, mint, sendToWallet execution, governance transaction, TierUpdater
  transaction, funded transaction, or staging rollout.
- No secrets or raw payloads.
