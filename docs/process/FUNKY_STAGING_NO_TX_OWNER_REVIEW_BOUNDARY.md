# FUNKY Staging No-Tx Owner Review Boundary

Status: PR-D8F docs-only boundary restored for v1.0.8 evidence closure.

This document defines the owner review boundary before any staging no-tx
preflight claim. It does not implement staging no-tx PASS, staging rollout,
runtime readiness, production readiness, DB export, file export, artifact upload,
routes, CLI scripts, cron, main.ts wiring, trackingService wiring, real RPC,
provider construction, wallet construction, contract construction, tx sending,
schema changes, workflow changes, or Docker smoke.

## Core Rule

`stagingNoTxPreflightStatus` remains `BLOCKED`.

D7D evidence with `EVIDENCE_READY` is not PASS.

D8E packet status `OWNER_REVIEW_READY` is not PASS.

Owner review material can support the next decision, but it cannot replace
remote quality-gate, same-head evidence, safe output scan, secret scan, or
non-overridable blocker enforcement.

## Required No-Tx Evidence

The owner review boundary requires explicit safe evidence for:

- no funded tx.
- no mint.
- no sendToWallet.
- no governance tx.
- no TierUpdater tx.
- no deploy.
- no staging rollout.
- no private key.
- no real RPC secret.
- no raw env.
- no raw endpoint.
- no raw receipt.
- no raw provider error.
- mock or injected read-only client only.
- no provider construction.
- no wallet construction.
- no contract construction.
- no auto-start.
- no cron wiring.
- no main.ts auto-start.
- no trackingService auto-start.

Any mismatch keeps the boundary `BLOCKED`.

## Evidence Requirements

Before owner review can proceed:

- Current-head remote evidence is required.
- Safe output scan is required.
- Secret scan is required.
- The operator review packet must be safe summary only.
- Operator limitations must be visible in the packet.
- Rollback/runbook gaps must remain visible before any runtime readiness claim.

## Readiness Claim Boundary

Allowed safe evidence claims for row export and review material:

- `none`
- `local_ready`
- `remote_gate_pass`
- `staging_no_tx_evidence`

Forbidden claims:

- `runtime_ready`
- `staging_ready`
- `production_ready`
- `go_live_ready`
- `deploy_ready`

For staging no-tx owner review, `readinessClaim` remains `none` unless a future
PR explicitly defines a narrow safe evidence claim. No current D8F document
changes that product boundary.

## Safe Row Field Allowlist

Common fields:

- `schema_version`
- `audit_export_id`
- `source_head_sha`
- `source_hash`
- `exported_at`
- `row_id`
- `entity_type`
- `source_table`
- `status`
- `evidence_origin`
- `readiness_claim`
- `safeSummaryOnly`

Initial PR-D8G safe row entity scope:

- `ScheduledTierUpdate`
- `JobRun`
- `tx_receipt_evidence`
- `staging_evidence`

Later candidate entities:

- `Prize`
- `PrizeTransactions`
- `wallet_summary`
- `NFT metadata`
- `TokenDetail`
- `TicketCode`
- `fixture/evaluation/test rows`

Later candidate entities must not be bundled into PR-D8G.

## Forbidden Raw Field Policy

The following must not appear in owner review packets or safe row exports:

- raw DB dump.
- raw DB URL.
- raw JWT.
- raw cookie.
- raw Authorization header.
- raw RPC secret.
- private key.
- raw env.
- raw log.
- raw payload.
- raw endpoint.
- raw receipt.
- raw provider error.
- raw local path.
- raw private path.
- full wallet address.
- raw tx hash.
- raw contract address outside an approved summary field.

Unsafe values must fail closed. Manual confirmation cannot override high
confidence sensitive findings, unsafe output, stale evidence, weakened gates, or
non-overridable blockers.

## Future Order

Recommended order after PR-D8F:

1. PR-D8G: safe DB read export code foundation, read-only function only, no file
   write.
2. PR-D8H: focused safe DB read rows for `ScheduledTierUpdate` and `JobRun`
   only, mock-first or local-only safe tests.
3. PR-D8I: safe DB read export JSONL package integration, no route or CLI.
4. PR-D8J: owner review packet consumes safe DB read export evidence.
5. PR-D8K: staging no-tx owner review evidence refresh.

Only after that should the project consider real receipt fetcher cutover,
operator runbook hardening, runtime smoke, Docker smoke, or rollback runbook
work.

## Docker Smoke Separation

Old audit notes flagged Docker smoke as important. That issue remains, but it is
not part of PR-D8F and not part of staging no-tx owner review.

Docker smoke belongs to backend runtime artifact readiness. It must stay in a
separate lane from safe DB read export and staging no-tx owner review.

Docker smoke passing would not mean staging ready, runtime ready, or production
ready.
