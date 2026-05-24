# FUNKY Legacy Schema And Dependency Decision Record

## Purpose

This decision record fixes the current handling of legacy Sui/Suiet, virtual-balance, `disco_balance`, `DiscoTransactions`, dependency, helper, and comment remnants found in current FUNKY `main`.

It is a docs-only decision record. It does not change implementation, schema, migrations, packages, lockfiles, workflows, harness files, or runtime behavior.

## Evidence Context

- Current main SHA: `2085d71887611da09b963d442ecf31fa6beec9c0`
- Source of decision: current-main residual reference audit after PR #134
- Document status: decision record for future cleanup sequencing
- Runtime readiness claimed: no
- Staging no-tx preflight: `BLOCKED`

## Decision Status

The legacy references are not one single cleanup class. They are split into DB compatibility items, future package/helper cleanup candidates, stale-client disabled routes, and false positives.

The most important decision is that `disco_balance`, `DiscoTransactions`, and `DiscoTransactionType` are retained for now. They are not safe-to-delete residue.

## Legacy Virtual-Balance DB Fields

The following DB-facing names are retained for now:

- `disco_balance`
- `DiscoTransactions`
- `DiscoTransactionType`

These names may be legacy or BSC-launch-inconsistent, but they can affect current DB compatibility, existing rows, Prisma migration history, generated client behavior, and any current runtime reads or writes.

They must not be renamed or removed without a migration impact audit.

## Sui And Suiet Remnants

The current audit classified the following as cleanup candidates, not immediate removals in this docs-only PR:

- backend `@mysten/sui` dependency and lockfile entries
- `isValidSuiAddess.ts`
- `displaySuiBalance.ts`
- unused SuiScan-style constants in `tokenHeplers.ts`
- Sui wallet comment in `snapshot.service.ts`
- frontend `.wkit-new-to-sui` CSS selector

These are candidates for a separate cleanup PR only after import checks, build/test results, package and lockfile review, and human confirmation of scope.

## What Must Be Retained

- `disco_balance`, `DiscoTransactions`, and `DiscoTransactionType` are retained pending migration impact audit.
- Crash and user-manage stale-client backend routes are retained to return `410 FEATURE_DISABLED`.
- NFT PATCH disabled route behavior is retained.
- Direct admin contract-write remains out of scope and manual-review only.

## What May Be Removed Later

The following may be removed later, but not in this decision record:

- unused Sui helper files if they are import-free and tests/build pass
- unused Sui dependency entries if package and lockfile updates are isolated in a package cleanup PR
- low-risk comments that mention old Sui wallet assumptions
- non-runtime CSS selectors tied only to removed wallet UI, if frontend build confirms no usage

## What Must Not Be Removed Without Migration Audit

Do not remove, rename, or repurpose `disco_balance`, `DiscoTransactions`, or `DiscoTransactionType` until a DB migration impact audit exists.

That audit must identify:

- current runtime reads and writes
- existing data and compatibility needs
- backfill or compatibility strategy
- rollback strategy
- Prisma migration plan
- staging verification evidence
- human approval for the actual migration PR

## Required Follow-Up PR Split

- PR-A: docs-only decision record. This PR.
- PR-B: backend/package cleanup for unused Sui helper and dependency remnants, only if import-free and package/lockfile checks pass.
- PR-C: DB migration impact audit for `disco_balance`, `DiscoTransactions`, and `DiscoTransactionType`. No migration yet.
- PR-D: actual DB migration only after audit and human approval.
- PR-E: staging evidence PR only after non-secret staging evidence exists.

Package and lockfile changes must not be mixed with schema changes or docs-only decision records.

## Disabled And Out-Of-Scope Flows

- Crash game remains out of FUNKY scope and is not a revival candidate.
- Virtual-balance user-manage remains disabled.
- Backend stale-client `410 FEATURE_DISABLED` routes are intentionally retained.
- NFT PATCH remains disabled.
- Direct admin contract-write remains out of scope and manual-review only.

## Staging Status

Staging no-tx preflight remains `BLOCKED`.

This document does not claim runtime readiness or release readiness. Staging domain, runtime environment, tBNB funding, real receipt checks, and runtime log inspection remain outside this PR.

## Non-Goals

This decision record does not:

- change backend code
- change frontend code
- change contracts
- change Prisma schema
- create or alter migrations
- change package or lockfile contents
- remove Sui/Suiet helpers or dependencies
- revive Crash game
- revive virtual-balance user-manage
- revive NFT PATCH
- revive direct admin contract-write
- deploy or roll out staging
