# FUNKY Tier Update Runtime Adoption Plan

## Purpose

This document plans the runtime adoption sequence for the ScheduledTierUpdate foundations added by PR #187, PR #191, and PR #192.

This is PR-D1 design only. It does not change runtime scheduler behavior, send transactions, poll receipts, connect JobRun, or claim runtime readiness.

Current evidence:

- Main SHA inspected: 27401cb391dd9e42af5a907c2c292c5687e36ce7.
- PR #187 added ScheduledTierUpdate state machine fields.
- PR #191 added tx sent / confirmed / failed evidence helpers.
- PR #192 added claim / heartbeat / timeout helpers.
- Active harness on current main: v0.9.6.
- Active self-test on current main: scripts/codex-v096-self-test.mjs.

Runtime readiness is not claimed. Staging no-tx preflight remains BLOCKED.

## Current Runtime Flow

The current scheduled tier path is still the legacy HTTP-process cron path:

1. `main.ts` starts the HTTP server and explicitly calls `startTrackingSchedulers`.
2. `trackingService.ts` registers the hourly scheduled tier update cron.
3. The cron calls `processScheduledTierUpdates`.
4. `processScheduledTierUpdates` queries `scheduledTierUpdate` rows where `processed=false` and `scheduledAt` is within the next hour.
5. For each row, it recalculates the current holding days and tier.
6. If the expected tier boundary was crossed, it calls `updateUserContractTier`.
7. `updateUserContractTier` creates the provider, relayer wallet, and TierUpdater contract.
8. It reads the current on-chain holding date.
9. If the contract tier already matches, it returns without sending.
10. Otherwise it estimates gas, checks fee data, checks relayer balance, checks gas spike state, sends the transaction, and waits for the receipt in the same function.
11. After `updateUserContractTier` returns, `processScheduledTierUpdates` marks the row `processed=true`.
12. It then calls `scheduleTierUpdate` for the next boundary.

Important current gaps:

- `processScheduledTierUpdates` does not claim rows before processing.
- `TX_SENT` and `CONFIRMED` rows are not yet excluded by status-aware runtime logic.
- `createTierBatchId` still uses `Date.now` in the current send path.
- `tx.hash` is only available after `sendTierSyncTransaction` returns.
- `tx.wait` currently happens before any durable txHash evidence is written.
- A crash after broadcast and before `processed=true` can still lead to a future resend.

## Current Foundation Inventory

`ScheduledTierUpdate` now has durable lifecycle fields:

- status: `PENDING`, `CLAIMED`, `TX_SENT`, `CONFIRMED`, `FAILED`, `TIMED_OUT`, `MANUAL_REVIEW`, `CANCELED`.
- attempt / maxAttempts.
- lockedBy / lockedAt / heartbeatAt / lockExpiresAt.
- batchId.
- txHash / txChainId / txContractAddress / txFrom / txTo.
- txBlockNumber / txReceiptStatus / txReceiptTimestamp / txGasUsed.
- sentAt / confirmedAt / failedAt.
- safeErrorKind / safeSummary.
- processed remains for backward compatibility.

Existing helper boundaries:

- `tierUpdateState.ts`: pure state transition data builders and deterministic batch id helper.
- `tierUpdateTxStateService.ts`: injectable tx sent / confirmed / failed evidence service; not runtime-wired.
- `tierUpdateClaimService.ts`: injectable claim / heartbeat / timeout / release service; not runtime-wired.

## Target Safe Runtime Flow

The final safe runtime flow should move row ownership and tx evidence ahead of receipt waiting:

1. Select only claimable rows:
   - `processed=false`.
   - status is `PENDING`, `FAILED`, or `TIMED_OUT`.
   - `attempt < maxAttempts`.
   - `lockExpiresAt` is null or expired.
   - `scheduledAt` is due.
2. Claim exactly one row with compare-and-set semantics.
3. Refresh heartbeat around long operations.
4. Recalculate tier and read current contract state.
5. If the contract already matches the target tier, mark the row safe-terminal without sending. The exact state should be designed before implementation; recommended candidate is `CONFIRMED` only if non-secret on-chain evidence is captured, otherwise `MANUAL_REVIEW` or a dedicated no-op status in a later schema PR.
6. Build and persist a deterministic batchId before broadcast.
7. Broadcast the tx.
8. Immediately persist `TX_SENT` evidence with `txHash`, chainId, contract address, relayer address, user wallet address, batchId, and sentAt.
9. Do not wait for the receipt before saving txHash.
10. A separate receipt reconciliation path reads `TX_SENT` rows and records `CONFIRMED`, `FAILED`, or `MANUAL_REVIEW`.
11. Only confirmed receipt evidence should set `processed=true`.
12. After confirmation, schedule the next tier boundary if applicable.

## State Transition Summary

```text
PENDING
  -> CLAIMED
  -> TX_SENT
  -> CONFIRMED

PENDING
  -> CLAIMED
  -> FAILED
  -> PENDING or CLAIMED on a later retry, while attempt < maxAttempts

PENDING
  -> CLAIMED
  -> TIMED_OUT
  -> PENDING or CLAIMED on a later retry, while attempt < maxAttempts

TX_SENT
  -> CONFIRMED
  -> FAILED or MANUAL_REVIEW only after receipt reconciliation evidence

CONFIRMED, MANUAL_REVIEW, CANCELED
  -> terminal for automatic send paths
```

Rules:

- `TX_SENT` rows must never be selected for a new send.
- `CONFIRMED` rows must never be selected for a new send.
- `processed=true` rows must never be selected for a new send.
- `CLAIMED` rows may be timed out only after `lockExpiresAt`.
- Receipt reconciliation owns `TX_SENT` rows; scheduled send processing does not.

## Claim Ownership Boundary

The claim owner should cover the pre-broadcast decision window only:

- select due rows.
- claim row.
- recalculate tier.
- verify contract state.
- build deterministic batchId.
- run pre-broadcast gas/balance/chain checks.
- broadcast tx.
- write `TX_SENT` evidence.

After `TX_SENT`, ownership changes from "send owner" to "receipt reconciliation owner".

Do not keep a row in `CLAIMED` while waiting indefinitely for receipt confirmation. The receipt wait can be slow, and the durable txHash should be the resume anchor.

Recommended initial lock duration:

- 15 minutes for claim / pre-broadcast work, matching the current helper default.
- Refresh heartbeat before and after potentially slow pre-broadcast steps: contract read, gas estimation, fee data, balance check, gas spike check, and broadcast.
- Do not use a long lock to cover receipt waiting; use `TX_SENT` plus receipt reconciliation instead.

## TxHash Before Tx.Wait Plan

The first runtime PR that touches broadcast must split the current `updateUserContractTier` flow:

1. Prepare provider / wallet / contract.
2. Read current contract tier.
3. If send is needed, call `sendTierSyncTransaction`.
4. Capture `tx.hash` from the returned transaction object.
5. Call `recordTierUpdateTxSent` before any `tx.wait`.
6. Return the txHash or a safe sent result to the caller.
7. Let receipt reconciliation confirm later.

`tx.wait` should not be the only path to durable evidence. If `tx.wait` remains in the broadcast PR for a transition period, it must happen after `recordTierUpdateTxSent`, and a crash after broadcast must be resumable from the row.

## Receipt Reconciliation Boundary

Receipt reconciliation must be a separate runtime path:

- Query `TX_SENT` rows with a non-null txHash.
- Do not send transactions.
- Use txHash and chainId to fetch receipt.
- If receipt is successful, call `recordTierUpdateConfirmed`.
- If receipt is failed, missing beyond policy, or chain mismatched, call `recordTierUpdateFailed` with safeErrorKind / safeSummary or move to `MANUAL_REVIEW`.
- Set `processed=true` only after confirmed receipt evidence is durable.
- Schedule the next tier boundary only after confirmation.

This PR should not be combined with first claim adoption or first tx broadcast split.

## Crash Window Analysis

| Crash window | Current risk | Target handling |
| --- | --- | --- |
| Before claim | Row can be picked by any process | Claim compare-and-set controls ownership |
| After claim, before broadcast | Row may remain CLAIMED | lockExpiresAt permits timeout and retry |
| After broadcast, before txHash save | Still dangerous | Must minimize and make txHash save immediate after tx return |
| After txHash save, before receipt | Resume from TX_SENT without resending |
| After receipt, before processed=true | Reconciliation can re-check txHash and mark confirmed |
| After processed=true, before next schedule | Follow-up PR must make next scheduling idempotent |

The most important improvement is saving txHash before waiting for the receipt.

## No-Double-Send Analysis

No-double-send depends on these conditions being implemented in order:

1. Status-aware query excludes `TX_SENT`, `CONFIRMED`, terminal statuses, and `processed=true`.
2. Claim compare-and-set prevents two send owners from working the same row.
3. Deterministic batchId is persisted before broadcast.
4. txHash is persisted immediately after broadcast and before `tx.wait`.
5. Receipt reconciliation resumes from txHash and never broadcasts.
6. Future worker/JobRun integration preserves the same ownership and state transition rules.

Skipping directly to tx send wiring without status-aware query and txHash persistence would keep the double-send risk open.

## PR Split

### PR-D1: Runtime Adoption Design

Expected files:

- `docs/process/FUNKY_TIER_UPDATE_RUNTIME_ADOPTION_PLAN.md`

Allowed changes:

- Docs/process plan only.

Forbidden changes:

- Runtime scheduler changes.
- Tx send changes.
- Receipt polling.
- JobRun hookup.
- Schema/migration changes.

### PR-D2: Status-Aware Scheduled Query

Expected files:

- `apps/backend/src/app/lib/tierScheduler.ts`
- focused tests for query behavior, if existing test structure permits without real DB/RPC.

Allowed changes:

- `processScheduledTierUpdates` query excludes `TX_SENT`, `CONFIRMED`, terminal statuses, and `processed=true`.
- No tx broadcast behavior change.
- No claim service connection yet.

Forbidden changes:

- Do not send tx differently.
- Do not call claim service yet.
- Do not change `updateUserContractTier` or `sendTierSyncTransaction`.

### PR-D3: Claim Service Runtime Adoption

Expected files:

- `apps/backend/src/app/lib/tierScheduler.ts`
- focused tests for claim-only selection and owner-matching behavior.

Allowed changes:

- `processScheduledTierUpdates` claims a row before considering it for send.
- Only claimed rows are eligible for the existing decision path.
- Heartbeat refresh around pre-broadcast decision steps may be added.
- On pre-broadcast safe failure, record FAILED/TIMED_OUT through claim service.

Forbidden changes:

- Do not persist txHash yet unless PR-D4 is included.
- Do not split tx broadcast and receipt.
- Do not add receipt polling.
- Do not add JobRun or worker entrypoint.

### PR-D4: Broadcast / Receipt Split

Expected files:

- `apps/backend/src/app/lib/tierScheduler.ts`
- `apps/backend/src/app/lib/tierSync.ts` only if the return contract or deterministic batch id boundary must be adjusted.
- focused tests for txHash-before-wait evidence.

Allowed changes:

- Split broadcast from receipt confirmation.
- Persist deterministic batchId before broadcast.
- Persist `TX_SENT` via `recordTierUpdateTxSent` immediately after `sendTierSyncTransaction` returns tx.hash.
- Remove or defer receipt waiting from the send path, or keep it only after txHash has already been persisted.

Forbidden changes:

- Do not implement general receipt polling in the same PR.
- Do not mark runtime ready.
- Do not add JobRun worker.

### PR-D5: Receipt Reconciliation Runtime Path

Expected files:

- a receipt reconciliation service or focused tier scheduler module.
- tests for TX_SENT -> CONFIRMED / FAILED / MANUAL_REVIEW.

Allowed changes:

- Read `TX_SENT` rows with txHash.
- Fetch receipt using a safe injected provider boundary.
- Persist CONFIRMED / FAILED / MANUAL_REVIEW evidence.
- Set `processed=true` only on confirmed receipt evidence.

Forbidden changes:

- Do not broadcast transactions.
- Do not add JobRun worker in the same PR.
- Do not claim production or staging readiness.

### PR-D6: Worker / JobRun Integration

Expected files:

- explicit worker entrypoint or JobRun-owned orchestration files.
- tests for worker startup boundaries.

Allowed changes:

- Move execution away from HTTP-process cron toward an explicit worker or JobRun-owned path.
- Preserve claim, txHash, and receipt reconciliation boundaries.

Forbidden changes:

- Do not combine with first txHash persistence or first receipt reconciliation.
- Do not remove staging no-tx BLOCKED status without non-secret runtime evidence.

## Worker And JobRun Boundary

JobRun integration should come after:

- durable state fields exist.
- status-aware query exists.
- claim service is connected.
- txHash-before-wait persistence exists.
- receipt reconciliation exists.

JobRun should own orchestration and observability, not replace the ScheduledTierUpdate row lifecycle. The ScheduledTierUpdate state remains the asset-specific no-double-send ledger.

## Staging No-Tx Relationship

Staging no-tx preflight remains BLOCKED until runtime evidence exists and no funded tx is required. This plan does not deploy, connect runtime tx paths, or run funded actions.

Any future staging evidence PR must use non-secret evidence and must not mark tx-dependent checks PASS without receipt evidence.

## Non-Goals

This plan does not:

- change backend product code.
- change Prisma schema or migrations.
- change `processScheduledTierUpdates`.
- change `updateUserContractTier`.
- change `sendTierSyncTransaction`.
- connect claim service to runtime.
- implement receipt polling.
- send transactions.
- create provider, wallet, contract, RPC connection, or tx.wait.
- connect JobRun or worker runtime.
- change frontend, contracts, package files, lockfiles, Docker files, workflows, or harness scripts.
- deploy, mint, sendToWallet, governance tx, TierUpdater tx, funded tx, or staging rollout.

## Residual Risk

The high-risk tier tx runtime path remains unresolved until PR-D2 through PR-D6 are implemented and verified. The current HTTP-process cron can still enter the legacy tx path after explicit startup. Runtime readiness is not claimed. Staging no-tx preflight remains BLOCKED.
