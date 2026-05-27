# FUNKY Tier Scheduler Tx Path Audit

## Purpose

This investigation records the current tier scheduler and TierUpdater transaction path after PR #181.
It is an audit only. It does not connect JobRun, add workers, change scheduler runtime behavior,
execute transactions, or claim runtime readiness.

Current main evidence:

- Main SHA inspected: 730c50331891fe1e03db7a7e0fd4c4ebfb8569ff.
- PR #181 import-safe merge commit: c95297d7f7cf1e0385d6cb311401427b1c68c269.
- Active harness on current main: v0.9.4.
- Active self-test on current main: scripts/codex-v094-self-test.mjs.
- AGENTS.md Review Policy is present and treats scheduler, background job, and tx-path changes as high-risk boundaries.

Staging no-tx preflight remains BLOCKED. Production readiness is not claimed.

## Audit Targets

- apps/backend/src/app/services/trackingService.ts
- apps/backend/src/app/lib/tierScheduler.ts
- apps/backend/src/app/lib/tierSync.ts
- apps/backend/src/app/lib/walletBalanceMonitor.ts
- apps/backend/src/app/lib/discordAlerts.ts
- apps/backend/src/app/db/prisma_client.ts
- apps/backend/prisma/schema.prisma
- apps/backend/src/main.ts
- apps/backend/src/app/__tests__/trackingService.startup.test.ts
- apps/backend/src/app/__tests__/runtimeEntrypoint.test.ts

## Import And Startup Boundary

PR #181 made trackingService import-safe:

- app/index.ts no longer imports trackingService for side effects.
- trackingService exposes explicit startTrackingSchedulers and stopTrackingSchedulers entrypoints.
- main.ts explicitly calls startTrackingSchedulers after the HTTP server starts.
- trackingService startup tests mock cron, realtime listener, and tier scheduler modules to prove app import alone does not start cron or realtime listeners.

This removes the import side effect, but it does not separate tier tx work into a worker.
The hourly scheduled tier update cron still runs inside the HTTP process once main.ts starts tracking schedulers.

## ScheduledTierUpdate Schema Summary

The current ScheduledTierUpdate model has:

- id primary key.
- userId unique.
- scheduledAt.
- expectedTier.
- currentTier.
- processed boolean default false.
- createdAt and updatedAt timestamps.
- indexes on scheduledAt plus processed, and processed.

The model does not store:

- txHash.
- receipt status or block evidence.
- chainId.
- contract address.
- batchId.
- attempt or maxAttempts.
- lockedBy, heartbeat, or claim owner.
- status states such as CLAIMED, SENT, CONFIRMED, FAILED, or MANUAL_REVIEW.
- safeErrorKind or safeSummary.

The unique userId constraint prevents multiple scheduled rows for the same user, but it does not claim a row for one runner or prevent two processes from reading and processing the same unprocessed row.

## Tx Path Summary

The scheduled path is:

1. trackingService registers an hourly cron in startTrackingSchedulers.
2. The cron calls processScheduledTierUpdates.
3. processScheduledTierUpdates finds ScheduledTierUpdate rows with processed=false and scheduledAt within the next hour.
4. Each row recalculates a current tier and calls updateUserContractTier when the expected tier boundary is reached.
5. updateUserContractTier creates a provider, relayer wallet, and TierUpdater contract.
6. It reads the current contract tier, creates a batchId, estimates gas, gets fee data, checks relayer balance, checks gas spike state, sends the TierUpdater transaction, then waits for a receipt.
7. processScheduledTierUpdates marks processed=true only after updateUserContractTier returns.
8. processScheduledTierUpdates then calls scheduleTierUpdate to create the next future row when applicable.

There is also an immediate edge path:

- scheduleTierUpdate calls updateUserContractTier directly when daysUntilNextTier <= 0.
- realtimeHoldingDateUpdater imports scheduleTierUpdate and updateUserContractTier, so the same tx function can be reached outside the hourly scheduled row path.

## State Transition Summary

Current durable states are limited to:

- scheduled: processed=false.
- processed: processed=true.
- deleted: processed rows older than seven days can be deleted by cleanupOldScheduledUpdates.

Missing durable states:

- claimed or running.
- tx sent.
- receipt confirmed.
- failed with safe reason.
- timed out.
- manual review.
- canceled.

Because the row remains processed=false until after tx.wait succeeds and the DB update completes, the database cannot distinguish an unsent update from a sent-but-not-recorded update.

## Double-Send Risk

The current processed flag is not enough to prove no double send:

- If the process sends a transaction and exits before tx.wait resolves, the row remains processed=false and a later run can send again.
- If the process receives a successful receipt and exits before setting processed=true, the row remains eligible and can send again.
- If two HTTP processes or containers run the hourly cron at the same time, both can read the same processed=false row because there is no claim, row lock, lockedBy, or compare-and-set transition.
- If the hourly cron overlaps itself during long RPC latency, a second invocation can observe the same row before the first marks it processed.
- createTierBatchId includes Date.now and the batchId is not persisted, so a retry or second runner generates a different idempotency value.
- The immediate daysUntilNextTier <= 0 path calls updateUserContractTier without creating or claiming a ScheduledTierUpdate row.

Contract state is checked before send, but that is not a full idempotency guard for in-flight transactions or concurrent sends.

## Crash, Retry, And Resume Risk

Retries are in memory only:

- updateUserContractTier defaults to three attempts, but attempt count is not persisted.
- A process restart resets retry state.
- Failures inside processScheduledTierUpdates are caught per row and not persisted.
- scheduleTierUpdate catches errors and does not persist a safe failure state.

Important crash windows:

- After tx broadcast and before tx.wait.
- After tx.wait returns and before processed=true is written.
- After processed=true is written and before the next schedule is created.
- During alerting or gas checks before the row records any durable state.

The current code cannot resume from a txHash because no txHash or receipt evidence is stored.

## Timeout Risk

The tier tx path does not currently define a per-update timeout budget for:

- contract.holdingDate.
- estimateTierSyncGas.
- provider.getFeeData.
- provider.getBalance.
- sendTierSyncTransaction.
- tx.wait.

Long RPC delays can hold the HTTP process cron callback. There is no heartbeat or timeout marker on the ScheduledTierUpdate row.

## Gas, Balance, And Alert Behavior

The tx path checks estimated gas cost against relayer balance before sending. Insufficient balance throws and sends a contract-update failure alert, but the ScheduledTierUpdate row does not record a failed or manual-review state.

walletBalanceMonitor state is process-local:

- gas usage history is in memory.
- last gas price is in memory.
- restart loses gas spike context.

Discord alert sending is wrapped so webhook failures do not expose raw secrets, but alert evidence is not a durable tx checkpoint.

## Chain And Environment Risk

validateEnvs enforces CHAIN_ID by environment mode when it is run. The tier tx send path itself does not verify provider network chainId immediately before sending. If a runtime starts with mismatched RPC, contract address, or chain env after validation is skipped or bypassed, the tx path has no local provider-chain guard.

If TIER_RELAYER_PRIVATE_KEY, QUICKNODE_HTTP_RPC_URL, or TIER_UPDATER_CONTRACT_ADDRESS is missing, updateUserContractTier returns without sending. This is safe for no-tx behavior, but it leaves no durable skipped or blocked evidence on the scheduled row.

## Receipt Evidence Gap

The current scheduled tier path does not persist:

- txHash.
- receipt status.
- block number.
- chainId.
- contract address.
- relayer address.
- target wallet address.
- batchId.
- gas used.
- safe failure reason.

That means post-crash reconciliation and current-head evidence cannot prove whether a scheduled update was unsent, in-flight, confirmed, failed, or already retried.

## Secret And Safe Logging Check

This audit did not find code that prints private keys, DB URLs, JWTs, cookies, or raw payloads in the inspected tier scheduler path.

Remaining logging concerns:

- tierScheduler catches several errors and assigns errorName without logging or persisting a safe reason.
- alertContractUpdateFailed sanitizes error messages and truncates wallet values for alerts, but alert state is in memory and does not replace durable receipt evidence.
- The lack of durable safeSummary or safeErrorKind makes operational triage dependent on process logs and alerts.

## Recommended Next PR Split

Recommended minimal follow-up sequence:

1. Add durable tier tx state fields or a dedicated tier tx run model: status, txHash, chainId, contract address, batchId, attempt, maxAttempts, lockedBy, heartbeatAt, sentAt, confirmedAt, safeErrorKind, and safeSummary.
2. Add a claim transition that moves one row from pending to running with compare-and-set semantics before any transaction send.
3. Persist a deterministic batchId before broadcast, then persist txHash immediately after broadcast and before waiting for a receipt.
4. Split receipt reconciliation into a service-level path that can resume from txHash without sending a second transaction.
5. Add bounded RPC and tx.wait timeouts with timeout status instead of indefinite HTTP-process cron waiting.
6. Add a provider chain guard in the tx send path before broadcast.
7. Move execution from HTTP-process cron toward an explicit worker entrypoint or JobRun-owned process after durable state exists.

Suggested PR boundaries:

- PR-A: schema and service state machine only, no tx send behavior change.
- PR-B: txHash and receipt reconciliation service with unit tests, no scheduler auto-start.
- PR-C: claim and timeout handling for scheduled tier updates.
- PR-D: explicit worker entrypoint or JobRun integration.
- PR-E: staging no-tx evidence update only when non-secret evidence exists.

## Non-Goals Confirmed

This audit does not:

- connect JobRun.
- implement Prize receipt polling.
- implement trackingService worker behavior.
- redesign scheduler runtime.
- execute sendToWallet, mint, governance tx, TierUpdater tx, funded tx, deploy, or staging rollout.
- change backend, frontend, contracts, Prisma schema, migrations, package dependencies, lockfiles, Docker files, harness scripts, or workflows.

## Residual Risk

The high-risk tx path remains unresolved until durable ownership, tx checkpointing, receipt evidence, timeout handling, and replay protection are implemented. HTTP-process cron can still enter the TierUpdater transaction path after explicit startup. Staging no-tx preflight remains BLOCKED, and production readiness is not claimed.
