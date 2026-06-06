# FUNKY Operator Review Packet Runbook

Status: PR-D8F docs-only runbook restored for v1.0.8 evidence closure.

This runbook explains how to use the PR-D8E operator review packet as owner or
operator review material. It does not replace remote quality-gate evidence,
same-head evidence, safe artifact evidence, owner approval, runtime readiness,
staging readiness, or production readiness.

## Inputs

The packet is built from:

- D8D operator-controlled safe row package result.
- D7D staging no-tx preflight evidence result.
- Explicit metadata: `auditExportId`, `sourceHeadSha`, `sourceHash`,
  `exportedAt`.
- Explicit actor identifiers summarized as safe values:
  `operatorId`, `reviewerId`, `runKey`.

The packet must not accept raw DB rows, Prisma clients, file paths, download
paths, endpoints, secrets, raw JSONL payloads, raw receipts, raw provider errors,
raw env, or private paths.

## Packet Statuses

Allowed statuses:

- `BLOCKED`
- `NEEDS_REVIEW`
- `OWNER_REVIEW_READY`

`PASS` is not a packet status.

`OWNER_REVIEW_READY` means only that owner review material is present and safe to
inspect. It does not mean staging no-tx PASS, runtime ready, production ready,
deploy ready, or go-live ready.

## Required Safe Boundaries

The packet must preserve:

- `readinessClaim=none`
- `stagingNoTxPreflightStatus=BLOCKED`
- safe summary output only
- no raw JSONL by default
- no raw operatorId
- no raw reviewerId
- no raw runKey
- no raw endpoint
- no raw env
- no raw receipt
- no raw provider error
- no private or local path

If the input operator package includes JSONL, the packet still summarizes only
safe package metadata such as record count, entity counts, readiness claim
counts, evidence origin counts, and JSONL hash summary.

## BLOCKED Classification

The packet must stay `BLOCKED` when any of these are true:

- Missing operator package.
- Missing staging no-tx evidence.
- Metadata mismatch.
- `readinessClaim` is not `none`.
- `stagingNoTxPreflightStatus` is not `BLOCKED`.
- `noTxExecution=false`.
- funded tx, mint, sendToWallet, governance tx, TierUpdater tx, deploy, or
  staging rollout evidence is present.
- RPC URL env reading, provider construction, wallet construction, contract
  construction, auto-start, cron wiring, main.ts wiring, or trackingService
  auto-start evidence is present.
- unsafe key or unsafe value is detected.
- operatorId, reviewerId, or runKey is missing or secret-like.

Owner approval cannot override this state.

## NEEDS_REVIEW Classification

The packet may be `NEEDS_REVIEW` when safe evidence exists but owner review
material is incomplete, for example:

- `recordCount=0`.
- entity counts are missing or empty.
- source head SHA or source hash is missing.
- staging evidence status is `NEEDS_REVIEW`.
- explanation required for owner review is incomplete.

`NEEDS_REVIEW` is not a failure of product behavior by itself. It is a signal to
collect or refresh safe evidence.

## OWNER_REVIEW_READY Classification

The packet may be `OWNER_REVIEW_READY` only when:

- Operator package is safe summary only.
- Staging no-tx evidence is safe summary only.
- Metadata matches.
- no-tx checks are all true.
- `readinessClaim=none`.
- `stagingNoTxPreflightStatus=BLOCKED`.
- `recordCount > 0`.
- no unsafe key or unsafe value is detected.

This status authorizes owner review of the material only. It does not authorize
DB export, file export, artifact upload, route or CLI exposure, staging rollout,
tx sending, runtime wiring, or Docker smoke.

## Owner Review Procedure

1. Confirm the packet is from the current head.
2. Confirm remote quality-gate safe artifacts are from the same head.
3. Confirm secret scan and safe output scan are pass.
4. Confirm packet status.
5. If `BLOCKED`, keep the lane blocked and fix the safe evidence source.
6. If `NEEDS_REVIEW`, collect the missing safe evidence.
7. If `OWNER_REVIEW_READY`, review the safe summaries and decide the next PR
   lane.

Owner approval is not a substitute for:

- remote quality-gate.
- same-head evidence.
- secret scan.
- safe output scan.
- stale evidence protection.
- weakened gate protection.
- non-overridable blocker enforcement.

## What This Runbook Does Not Make Ready

The packet does not make any of these ready:

- actual DB export.
- safe DB read export code.
- file writing.
- downloadable artifact generation.
- artifact upload.
- Docker smoke.
- staging no-tx PASS.
- runtime readiness.
- production readiness.
- owner approval as a merge-gate substitute.
