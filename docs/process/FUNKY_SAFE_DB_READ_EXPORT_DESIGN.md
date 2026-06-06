# FUNKY Safe DB Read Export Design

Status: PR-D8F docs-only design restored for v1.0.8 evidence closure.

This document defines the boundary for a future safe DB read export lane. It does
not implement actual DB export, safe DB read export code, DB queries, file
writing, downloadable artifacts, artifact upload, routes, CLI scripts, cron
wiring, runtime auto-start, RPC wiring, schema changes, package changes, or
Docker smoke.

## Purpose

Safe DB read export is a future read-only evidence collection lane for
row_id-backed safe summaries. It is not a raw DB dump. It is not staging no-tx
PASS evidence. It is not runtime readiness, production readiness, deploy
readiness, or owner approval.

The first code PR after this design must stay smaller than the full lane. It
should introduce only a read-only foundation and must not add file output,
artifact upload, routes, CLI scripts, cron, main.ts wiring, trackingService
wiring, real RPC, provider construction, wallet construction, contract
construction, tx send behavior, schema migration, workflow changes, package
changes, or Docker smoke.

## Required Prerequisites

Any future safe DB read export implementation must consume the existing safe
evidence chain:

- PR-D8A safe row mapper.
- PR-D8B safe row JSONL serializer.
- PR-D8C safe row evidence package.
- PR-D8D operator-controlled safe row package boundary.
- PR-D8E owner/operator review packet boundary.

These are prerequisites for shaping evidence, not readiness claims.

## Read Boundary

Future safe DB access must be read-only.

Required controls:

- No write transaction.
- No mutation query.
- No raw DB dump.
- Explicit row limit.
- Explicit entity allowlist.
- Explicit field allowlist.
- Explicit forbidden field denylist.
- Safe row mapper before serialization.
- Safe JSONL serializer before package output.
- Safe evidence package before operator review.
- Same-head remote evidence before merge decisions.
- Safe output scan before merge decisions.

## Initial Entity Scope

The full audit candidate set is:

- `ScheduledTierUpdate`
- `JobRun`
- `tx_receipt_evidence`
- `staging_evidence`
- `Prize`
- `PrizeTransactions`
- `wallet_summary`
- `NFT metadata`
- `TokenDetail`
- `TicketCode`
- `fixture/evaluation/test rows`

PR-D8G must not implement all of these. The first implementation scope is only:

- `ScheduledTierUpdate`
- `JobRun`
- `tx_receipt_evidence`
- `staging_evidence`

`Prize`, `PrizeTransactions`, NFT metadata, `TokenDetail`, `TicketCode`, wallet
summary, and fixture/evaluation/test rows remain follow-up scopes.

## Required Common Fields

Each safe row record must include:

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

Allowed `readiness_claim` values:

- `none`
- `local_ready`
- `remote_gate_pass`
- `staging_no_tx_evidence`

Forbidden `readiness_claim` values:

- `runtime_ready`
- `staging_ready`
- `production_ready`
- `go_live_ready`
- `deploy_ready`

## Safe Public Evidence

Public chain evidence may be included only as minimal safe summaries:

- tx hash summary, not full raw tx hash.
- contract address summary, not raw full value unless an existing mapper already
  defines a safe public summary.
- block number summary.
- receipt status summary.
- chain id.

Wallet addresses must be masked or summarized. Full wallet addresses are not
safe row output.

## Forbidden Raw Data

Future export code must fail closed if any raw field or unsafe value is present.

Forbidden field classes:

- DB URL.
- JWT.
- cookie.
- Authorization header.
- RPC secret.
- private key.
- raw env.
- raw log.
- raw payload.
- raw endpoint.
- raw receipt.
- raw provider error.
- local path.
- private path.
- raw checkpoint.
- full wallet address.
- unbounded user payload.

Unsafe value patterns include secret-looking tokens, endpoint URLs, local machine
paths, private key-like values, raw receipt labels, and raw provider response
labels.

## Explicit Non-Claims

Safe DB read export is separate from:

- staging no-tx PASS.
- runtime readiness.
- production readiness.
- deployment readiness.
- owner approval.
- manual confirmation.

Passing safe DB read export would only mean that a constrained safe summary read
was shaped according to the allowlist and denylist. It would not authorize
runtime auto-start, staging rollout, tx sending, RPC/provider/wallet/contract
wiring, file export, artifact upload, or Docker smoke.

## Recommended Follow-Up Order

1. PR-D8F docs-only design and owner review boundary.
2. PR-D8G safe DB read export design-to-code foundation, read-only function only,
   no file write.
3. PR-D8H safe DB read export focused rows for `ScheduledTierUpdate` and
   `JobRun` only, mock-first or local-only safe tests.
4. PR-D8I safe DB read export JSONL package integration, still no route or CLI.
5. PR-D8J owner review packet consumes safe DB read export evidence.
6. PR-D8K staging no-tx owner review evidence refresh.

Only after those steps should the project consider real receipt fetcher cutover,
operator runbook hardening, runtime smoke, Docker smoke, or rollback runbook
work. Runtime readiness remains later than all of those.

## Docker Smoke Separation

Prior audit notes identified Docker smoke as important for backend runtime
artifact readiness. That remains a future lane. PR-D8F does not add Docker
smoke. Docker smoke must stay separate from safe DB read export and staging
no-tx owner review.

Docker smoke passing would not mean runtime ready or production ready.
