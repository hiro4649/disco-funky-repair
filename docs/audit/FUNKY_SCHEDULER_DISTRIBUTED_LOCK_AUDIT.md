# FUNKY Scheduler Distributed Lock Audit

## Purpose

This docs-only audit classifies the remaining scheduler distributed-lock boundaries after PR #159. It does not add implementation, schema, migration, workflow, harness, package, frontend, or contract changes.

The key goal is to avoid placing transaction-scoped PostgreSQL advisory locks around long-running jobs or jobs that call external APIs, RPC providers, Discord webhooks, or on-chain transaction flows. PR #159 safely applied a transaction-scoped advisory lock only to the short Trial NFT expiration path where the job body runs through the same Prisma transaction client.

## Current Main

- Current main SHA audited: `9e2ffab70598802ed48d8e7a95294200b6ac82f7`
- PR #159 merge: `fix(funky): guard scheduler jobs with advisory lock (#159)`
- Harness marker checked: `CODEX_QUALITY_HARNESS_FILE v0.8.5`
- Scope: FUNKY only, docs-only scheduler lock audit
- Runtime readiness claimed: no
- staging no-tx preflight remains BLOCKED
- No production readiness claim

## Current Scheduler Inventory

| Scheduler or entrypoint | Start path | Schedule or trigger | External API/RPC | DB writes | Existing idempotency or guard | Distributed lock status | Safe log status | Timeout status | Risk class | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Daily referral process | `main.ts` -> `CronService.startAllCronJobs()` -> `SnapshotService.runDailyProcess()` | Daily `00:00 UTC` | No external call in current active path | Current active cleanup path is count-only | Process-local `CronService.isRunning`; expired state represented by `expires_at <= now` | None | `safeLogError` at cron and snapshot layers | Not relevant for current DB count-only path | B, E, F | Candidate for a narrow DB-only advisory lock if the active body stays short. Do not cover commented snapshot/reward paths without reassessing. |
| Trial NFT expiration | `main.ts` -> `startTrialNFTSchedulers()` -> `startTrialNFTExpirationScheduler()` | Daily `00:00 UTC` | No | Yes, expiration update through transaction client | DB predicate and transaction client | Present: `withPostgresAdvisoryJobLock('trial_nft_expiration_daily', tx => expireOldTrialNFTs(tx))` | `safeLogError` in scheduler, lock skip uses `safeLogWarn` | Not external-call bound | A | Already safe-leaning after PR #159. Keep transaction body short and DB-only. |
| Trial NFT daily bonus | `main.ts` -> `startTrialNFTSchedulers()` -> `startDailyNFTBonusScheduler()` | Daily `00:01 UTC` | Yes, NFT/RPC balance checks through `getDiscoNFTEVM` | Yes, point history and user/trial NFT updates | `PointHistory` daily window unique key and `P2002` handling prevent duplicate point awards | None | `safeLogError` in scheduler | External read timeout exists in lower RPC helpers, but the job loops users | C, F | Do not wrap in transaction-scoped advisory lock. Use job-level coordination or job_runs design if duplicate external calls and load must be controlled. |
| Six-hour token balance processing | `app/index.ts` side-effect import -> `trackingService` -> `processSixHourTokenBalance()` | Every 6 hours | Yes, QuickNode/Etherscan and token transaction APIs | Yes, token ownership, ticket, referral, lottery, point history updates | Process-local `isSixHourUpdateInProgress`; mixed per-record checks; some award paths are not fully transaction-reserved | None | `safeLogError` in top-level and per-user paths | External helpers have timeout wrappers, job itself is all-user and batch-style | D, E, F | Needs job_runs/checkpoint design and narrower idempotency review. Transaction advisory lock would hold a DB transaction across external calls and batch work. |
| Daily tracking fallback | `app/index.ts` side-effect import -> `trackingService` -> `checkingHoldingDateFromOnChain()` then `updateHoldingDateMilestones()` | Daily `22:00 UTC` | Yes, Etherscan reads and contract tier sync path | Yes, user holding state, checkpoints, tier scheduling, contract sync records | Process-local per-user `userProcessingLock`; checkpoints reduce repeated work but are not distributed mutual exclusion | None | `safeLogError` at trackingService top-level; lower paths have mixed safe logging and some swallowed per-user errors | Etherscan/RPC helpers have request timeouts, but whole job can be long | C, D, E | Needs job_runs or worker/checkpoint design. Contract update paths need state-machine semantics rather than a transaction lock. |
| Prize probability recalculation | `app/index.ts` side-effect import -> `trackingService` -> `setProbability()` | Every 8 hours | No known external call in this function | Yes, recalculates prize probability fields | Recalculation is deterministic/idempotent-ish, but concurrent writes are still redundant | None | No local `safeLogError`; trackingService wrapper catches only escaped errors | Not external-call bound | B, F | Candidate for DB-only advisory lock after refactoring to accept a transaction client and proving the loop stays short. |
| Token registration / prize discovery | `app/index.ts` side-effect import -> `trackingService` -> `registerAllEthereumTokens()` | Every 8 hours, shifted | Yes, Etherscan, RPC reads, DexScreener, deliberate sleeps | Yes, token detail, prize, and related records | Uses upsert/update style in places, but long external discovery can duplicate load | None | No local `safeLogError`; trackingService does not wrap this job with try/catch | Lower external helpers have timeouts; function includes delays and multi-token loops | C, D, E | Do not add transaction-scoped advisory lock. Use job_runs/worker design or leader election for long external discovery. |
| Ticket code expiration | `app/index.ts` side-effect import -> `trackingService` -> `ticketCode.updateMany()` | Daily `00:00 UTC` | No | Yes, marks old pending ticket codes expired | `updateMany` predicate is idempotent | None | `safeLogError` in trackingService block | Not external-call bound | B, F | Good DB-only candidate for a small advisory lock if desired. It is safe without lock for correctness but duplicate DB work remains. |
| Scheduled tier updates | `app/index.ts` side-effect import -> `trackingService` -> `processScheduledTierUpdates()` | Hourly | Yes, contract RPC, gas checks, transaction send, receipt wait | Yes, scheduled update rows and related tier state | `processed` flag exists, but concurrent workers can race before marking processed | None | Top-level `safeLogError`; internal catches may swallow detail | RPC read/write helpers have timeouts, but transaction send and receipt wait can be long | D, E | Needs worker/job_runs plus receipt polling state machine. Do not hold a DB transaction while sending or waiting for contract transactions. |
| Scheduled tier cleanup | `app/index.ts` side-effect import -> `trackingService` -> `cleanupOldScheduledUpdates()` | Daily `02:00 UTC` | No | Yes, deletes processed old scheduled updates | `deleteMany` predicate is idempotent | None | Top-level `safeLogError` | Not external-call bound | B, F | DB-only advisory lock candidate. Schema/migration not required if limited to the delete transaction. |
| Hourly holding duration update | `app/index.ts` side-effect import -> `trackingService` -> `updateAllUsersHoldingDuration()` | Hourly | No remote API, but emits websocket updates | Yes, all-user average holding-duration writes | Recomputes from history, but all-user processing is not distributed locked | None | Top-level `safeLogError`; internal per-user errors are often swallowed | No explicit whole-job budget | D, E, F | Prefer job_runs/chunk checkpoint or bounded worker design. A single transaction lock would be too broad for all-user processing. |
| Admin wallet balance monitor | `app/index.ts` side-effect import -> `trackingService` -> `walletBalanceMonitor.performDailyBalanceCheck()` | Daily `03:00 UTC` | Yes, RPC balance read and Discord alert path | No normal DB write in the daily check | In-memory cooldown only | None | Top-level `safeLogError` | RPC helper timeout exists | C, E, F | Needs distributed alert suppression or status store if duplicate alerts matter. Transaction advisory lock is not a good fit without DB work. |
| Realtime event listener | `app/index.ts` side-effect import -> `trackingService` -> `startRealtimeEventListener()` | Process startup and reconnect loop | Yes, websocket, QuickNode/Etherscan fallback, tier scheduling | Yes, user holding state, checkpoints, scheduled tier updates | Process-local singleton and `userProcessingLock` only | None | Uses `safeLogError` in several realtime paths | RPC/read helper timeouts exist, websocket listener is long-lived | D, E | Treat as worker/leader-election scope, not cron. Multiple app instances can open duplicate subscriptions. |
| Manual daily batch endpoint | `monitoring.routes.ts` -> `checkingHoldingDateFromOnChain()` | Admin request | Yes, same Etherscan/checkpoint path as fallback | Yes | No distributed overlap guard with scheduled fallback | None | `safeLogError` in route handler | Same as underlying job | D, E | Include in job_runs design so manual runs cannot overlap scheduled runs. |

## Lock Status Summary

The only current distributed lock in main is the PR #159 transaction-scoped PostgreSQL advisory lock around Trial NFT expiration. That use is safe-leaning because the lock acquisition and job body share the same Prisma transaction client, the job is DB-only, and the transaction is short.

All other scheduler guards are process-local only or absent. Process-local flags protect one Node process but do not protect PM2 cluster mode, multiple containers, or horizontally scaled instances.

## Idempotency Summary

- Trial NFT expiration: DB predicate and transaction-scoped lock.
- Trial NFT daily bonus: daily `PointHistory` unique key and `P2002` handling prevent duplicate point awards, but duplicate external NFT checks remain possible.
- Referral daily cleanup: current active path is count-only and preserves the audit trail by treating `expires_at <= now` as expired.
- Referral reward distribution: if re-enabled, `distributeReferralRewardOnce` reserves rows with transactional `updateMany` before awarding.
- Ticket expiration and scheduled tier cleanup: idempotent `updateMany` or `deleteMany` predicates.
- Six-hour token balance processing: has a process-local in-progress flag, but this is not distributed. Some ticket/referral/lottery update paths still need a deeper concurrency review before broad distributed execution.
- Tier update transaction sending: `processed` flags exist, but they are not sufficient as a distributed send lock or receipt-polling state machine.
- Realtime processing: process-local singleton and per-user promise lock reduce duplicate work inside one process only.

## External API/RPC Status

Jobs that call QuickNode, Etherscan, DexScreener, Discord, websocket listeners, or contract transaction helpers should not be wrapped in transaction-scoped advisory locks. Those calls can block, retry, or wait on remote systems while holding a database transaction open.

This applies to:

- Trial NFT daily bonus
- Six-hour token balance processing
- Daily tracking fallback
- Token registration / prize discovery
- Scheduled tier updates
- Admin wallet balance monitor
- Realtime event listener
- Manual daily batch endpoint

## Timeout Status

The codebase has lower-level timeout wrappers for HTTP and RPC reads/writes, including token balance and price helpers. These do not create a whole-job timeout budget. All-user jobs, batch jobs, websocket listeners, deliberate sleeps, and receipt waits still need job-level budgeting, checkpointing, and recovery semantics before a distributed lock is added around the whole operation.

## Risk Classification

### A. Already safe-leaning

- Trial NFT expiration: transaction-scoped advisory lock, short DB-only body, same transaction client.

### B. Transaction-scoped advisory lock candidates

- Daily referral cleanup, only while it remains the current count-only `runDailyProcess` body.
- Ticket code expiration.
- Scheduled tier cleanup.
- Prize probability recalculation, after proving the loop is bounded and refactoring to a transaction client.

### C. Advisory lock would be risky if added broadly

- Trial NFT daily bonus.
- Referral snapshot verification if re-enabled.
- Token registration / prize discovery.
- Admin wallet balance monitor.
- Any scheduler path that performs external API/RPC calls or waits between batches.

### D. job_runs table, worker, checkpoint, or state-machine design needed

- Six-hour token balance processing.
- Daily tracking fallback and manual daily batch endpoint.
- Scheduled tier updates and contract receipt handling.
- Realtime event listener.
- Hourly holding duration update.

### E. Process-local lock is insufficient

- `CronService.isRunning`.
- `dailyBonusScheduler` and `expirationScheduler` module variables.
- `isSixHourUpdateInProgress`.
- `userProcessingLock`.
- Realtime event listener singleton.
- Wallet monitor in-memory cooldown.

### F. Existing idempotency reduces correctness risk but not operational load

- Trial NFT daily bonus point award idempotency.
- Referral reward reservation path if re-enabled.
- Ticket code expiration.
- Scheduled tier cleanup.
- Referral expired count-only cleanup.

## Why Not Add Transaction Advisory Locks To Long Jobs

`pg_try_advisory_xact_lock` is safe when the protected work is short and stays inside the same database transaction. It becomes risky when the protected work calls external APIs, sends contract transactions, waits for receipts, sleeps between batches, or processes all users. In those cases, the application would hold an open database transaction and pooled connection across remote latency, retries, and partial failure.

Session-scoped advisory locks are also not a simple substitute with Prisma pooling because lock release must happen on the same database session. PR #159 intentionally avoided that risk for Trial NFT expiration by using a transaction-scoped lock and passing the transaction client into the job body.

## Recommended PR Split

- PR-A docs-only scheduler lock audit: this PR
- PR-B DB-only short scheduler advisory lock candidates
- PR-C trackingService / all-user process job_runs design
- PR-D Prize full job queue / receipt polling state machine
- PR-E scheduler safe status observability
- PR-F staging evidence only after non-secret runtime evidence exists

## Non-goals

- No backend implementation changes.
- No frontend changes.
- No contract changes.
- No Prisma schema or migration changes.
- No package or lockfile changes.
- No harness, workflow, scripts, or CODEX policy changes.
- No Trial NFT scheduler implementation change.
- No trackingService implementation change.
- No Prize job queue implementation.
- No balance UNKNOWN implementation.
- No Float / Decimal migration implementation.
- No auth, cookie, refresh-token, admin prize update, or expired referral implementation changes.
- No deploy, mint, sendToWallet, governance transaction, TierUpdater transaction, funded transaction, or staging rollout.
- No secrets or raw payloads.

## Staging Evidence Requirement

staging no-tx preflight remains BLOCKED. Scheduler lock expansion should not claim runtime readiness until non-secret runtime evidence exists for the specific candidate job, including skip behavior, overlap behavior, failure logging, and rollback or retry behavior.
