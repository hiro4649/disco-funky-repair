# Codex Harness v0.8.2 Improvement Proposal

## Purpose

This proposal records improvement candidates for the FUNKY Codex Harness v0.8.2 after comparing v0.7.2, v0.8.1, and the current v0.8.2 behavior after the PR #131 and PR #132 fixes.

This is a docs-only proposal. It does not change product code, workflow files, harness implementation, scripts, package metadata, lockfiles, Prisma schema, migrations, backend code, frontend code, or contracts.

## Current Context

- Current main SHA at proposal creation: `431a2c4648fb72144859f0addabbb7e8177c179b`
- Active harness version: v0.8.2
- PR #136 status: merged
- Staging no-tx preflight: `BLOCKED`
- Runtime readiness claimed: no
- Release readiness claimed: no

## Version Comparison

| Version | Primary Orientation | Major Additions | Main Limitation | Overall Score |
| --- | --- | --- | --- | --- |
| v0.7.2 | Source-harness oriented | Early source-side policy checks, safer manual evidence shape | Weak target-repo awareness and weaker product verification handling | 63 |
| v0.8.1 | Target-repo mode | `targetRepoMode`, target quality score, stronger target merge readiness gates | Product check skip behavior and PR-body evidence requirements needed more precise handling | 78 |
| v0.8.2 current | Target workflow evidence mode | `workflowRunner`, evidence normalization, product verification evidence, safe test metrics artifact, stale PR audit | Stronger, but still noisy for staging evidence, risk-specific PR bodies, dummy DB handling, safe-output field semantics, and readiness level separation | 88 |

## Feature Score Table

| Capability | v0.7.2 | v0.8.1 | v0.8.2 Current | Notes |
| --- | ---: | ---: | ---: | --- |
| Source policy visibility | 70 | 78 | 84 | v0.8.2 keeps source rules visible while adding target evidence. |
| Target repo classification | 45 | 82 | 88 | v0.8.1 introduced target repo mode; v0.8.2 improved artifacts. |
| Product verification enforcement | 50 | 72 | 87 | PR #131/#132 reduced invalid reports and target product-check skip gaps. |
| Safe artifact generation | 55 | 75 | 90 | v0.8.2 emits better safe summaries and failure reasons. |
| PR body evidence ergonomics | 60 | 68 | 76 | Still too heavy for low-risk docs-only work and can require exact wording. |
| Stale evidence protection | 55 | 72 | 86 | v0.8.2 adds stale PR audit, but merge-adjacent checks can be tighter. |
| Staging readiness evidence | 45 | 60 | 70 | Current gates do not yet model staging evidence as a first-class schema. |
| Safe output precision | 62 | 76 | 82 | Current scan is safer, but field-aware treatment would reduce false positives without weakening detection. |

## v0.8.2 Strengths

- Target quality score gives a single merge-readiness signal with blocking and optional statuses separated.
- Workflow runner now emits safe artifacts instead of silently failing in more cases.
- Evidence normalization makes local and remote evidence easier to compare.
- Product verification evidence is explicitly represented instead of being only implied by logs.
- Safe test metrics artifact reduces the need to inspect raw logs.
- Stale PR audit makes current-head evidence more visible.
- PR #131 and PR #132 improved failure diagnosability and product-code PR handling.

## v0.8.2 Weaknesses

- Staging evidence is still represented mostly through PR body text rather than a dedicated schema and gate.
- PR body requirements are not yet light enough by risk level, so docs-only or proposal-only PRs can need product-style evidence wording.
- Dummy DB handling is not standardized, so local and remote Prisma validation can differ in how non-secret DB env is supplied.
- Safe output scanning can still treat internal labels and evidence fields too similarly to user-provided values.
- Product check diff classification is effective but broad, and can be refined by backend, frontend, contracts, package, lockfile, docs, and harness-only buckets.
- Merge-adjacent stale evidence checks can be stricter around head SHA, merge ref SHA, artifacts, and final PR body edits.
- Readiness language needs stronger separation between runtime readiness, staging no-tx readiness, funded-tx readiness, and production-release readiness.

## Prioritized Improvements

### 1. Staging Evidence Schema And Gate

Add a dedicated staging evidence schema and target gate for no-tx and funded-tx evidence. The schema should support `PASS`, `FAIL`, `BLOCKED`, `UNKNOWN`, and `MANUAL_REVIEW` without converting missing evidence into pass.

Required fields should include environment, domain, head SHA, checked time, checked role, check type, evidence summary, non-secret evidence links or identifiers, residual risks, and next action.

### 2. Risk-Specific PR Body Weighting

Make the PR body template lighter by risk level and change type. R1/R2 docs-only proposals should not need the same product-verification wording as R3 product-code changes, while still requiring safe output, stale evidence, and scope boundaries.

### 3. Standard Non-Secret Dummy DB Validation

Standardize dummy DB env handling for Prisma validation in local and remote gates. The value must remain non-secret, must not be printed, and must be clearly reported as validation-only.

### 4. Field-Aware Safe Output Scan

Separate internal reason-code labels, status labels, artifact keys, and user-provided evidence values. Internal safe labels should be allowlisted narrowly, while actual secrets, credentials, tokens, connection strings, cookies, private keys, full request bodies, and raw runtime logs must remain blocking.

### 5. Finer Product Check Diff Classification

Split product check routing by changed path groups:

- backend source and backend tests
- frontend source and frontend tests
- contracts and contract tests
- package and lockfile changes
- Prisma schema and migration changes
- docs-only
- harness/workflow-only

This should reduce unnecessary product checks while preserving mandatory checks for product-code and package-sensitive PRs.

### 6. Stronger Merge-Adjacent Stale PR Audit

Before merge, require a fresh check that PR head SHA, merge ref SHA, remote artifact target SHA, PR body timestamp, and changed file list still match the evidence. PR body edits after a successful run should be treated as stale if the gate depends on body evidence.

### 7. Four-Level Readiness Separation

Separate readiness claims into four explicit levels:

- runtime readiness
- staging no-tx readiness
- funded-tx readiness
- production-release readiness

Each level should require its own evidence and must not inherit pass state from a weaker level. `BLOCKED` and `UNKNOWN` must never be converted into pass.

## Non-Goals

- Do not change product code.
- Do not change backend, frontend, contracts, Prisma schema, or migrations.
- Do not change workflow files.
- Do not change harness implementation.
- Do not change scripts or CODEX policy files in this proposal.
- Do not change package metadata or lockfiles.
- Do not claim staging no-tx readiness.
- Do not claim runtime readiness.
- Do not revive Crash game, virtual-balance user-manage, NFT PATCH, or direct admin contract-write flows.

## Implementation Split Plan

### PR-A: This Docs-Only Proposal

Record the v0.8.2 assessment, scores, improvement priorities, and split plan.

### PR-B: Staging Evidence Schema

Add a schema and gate for staging no-tx and funded-tx evidence. Keep it separate from product implementation.

### PR-C: PR Body Template Simplification

Adjust PR body templates and body gates for risk-specific evidence requirements.

### PR-D: Dummy DB Validation Standard

Standardize non-secret dummy DB env handling in local and remote validation paths.

### PR-E: Field-Aware Safe Output Scan

Refine safe output scan handling for internal labels versus user-provided evidence values.

### PR-F: Product Diff Classifier Refinement

Split product verification routing by path group and check type.

### PR-G: Merge-Adjacent Stale Evidence Gate

Strengthen final pre-merge stale evidence checks for head SHA, merge ref SHA, artifacts, PR body edits, and changed files.

### PR-H: Readiness Level Gate

Introduce explicit readiness-level claims and gates for runtime, staging no-tx, funded-tx, and production-release readiness.

## Residual Risks

- This proposal does not implement any harness changes.
- Staging no-tx preflight remains `BLOCKED`.
- tBNB funding, real receipt checks, runtime log inspection, and staging domain evidence remain unresolved.
- Future implementation PRs must be reviewed separately and must not weaken secret scanning, safe output scanning, or product verification.
