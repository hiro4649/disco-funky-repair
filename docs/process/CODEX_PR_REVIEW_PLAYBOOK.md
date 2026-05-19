# Codex PR Review Playbook

This playbook defines how Codex reviews FUNKY PRs.
It does not replace `docs/process/FUNKY_SPEC_AUTHORITY.md`.

## Read Before Review

Before reviewing a FUNKY PR, read:

- `AGENTS.md`
- `docs/process/FUNKY_SPEC_AUTHORITY.md`
- `docs/process/FUNKY_RELEASE_GATE.md`
- `docs/process/FUNKY_ASSET_OPERATION_RUNBOOK.md`
- `docs/process/FUNKY_KNOWN_RISKS.md`
- `docs/process/CODEX_PR_REVIEW_PLAYBOOK.md`
- `docs/process/CODEX_POST_MERGE_CHECKLIST.md`

If staging, runtime failure, secret leak suspicion, tx failure, or rollback is involved, also read:

- `docs/process/CODEX_INCIDENT_AND_ROLLBACK_RUNBOOK.md`

## Scope Check

- Confirm the PR is in `hiro4649/disco-funky-repair`.
- Do not inspect or reference IRIS files.
- Confirm changed files before reviewing behavior.
- Confirm PR type: harness, docs-only, implementation, security, dependency, test-only, or contract.
- Confirm the diff is small and limited to the stated task.
- Confirm `apps/backend`, `apps/frontend`, `contracts`, `docs/launch`, package files, lockfiles, and real `.env` files are not mixed into a PR unless the task explicitly allows them.
- Confirm authority docs are followed.
- Do not treat older launch docs as higher authority than `FUNKY_SPEC_AUTHORITY.md`.

## Gate Check

- Confirm Harness v0.6.5 result.
- Confirm secret scan result.
- Confirm GitHub quality-gate result.
- If quality-gate is `in_progress`, wait.
- If quality-gate failed, inspect only the final relevant failure log section and report that failure.
- Confirm R3 and `humanReviewRequired` status.
- Treat R3 or `humanReviewRequired` as requiring human review before merge.
- Policy exception is forbidden by default.
- Do not mark unexecuted tx checks as PASS.
- Do not declare production ready.

## Risk Classification

Classify findings as:

- P0: launch-stopping risk such as secret exposure, unauthorized admin mutation, staging/production mixup, asset loss, double send, or false tx success.
- P1: must-fix or human-reviewed launch risk such as weak auth, unclear receipt evidence, unsafe retry, raw token logging risk, or weak runtime boundary.
- P2: non-blocking improvement, documentation gap, or warning cleanup.
- UNKNOWN: evidence is missing.
- BLOCKED: funding, domain, human approval, environment, or external service is missing.

UNKNOWN and BLOCKED are not PASS.

## Review Comment Format

Use findings first.
For each actionable issue, include:

- Priority: P0, P1, P2, UNKNOWN, or BLOCKED.
- File and line when available.
- Impact.
- Required fix or decision.
- Evidence used.

Do not include secret values, JWTs, cookies, Authorization headers, private keys, API keys, DB URLs, raw production logs, or raw request payloads.

## Merge Decision

Mergeable means:

- The PR is scoped to FUNKY.
- It does not inspect or change IRIS files.
- The diff matches the task and stays small.
- Required local checks and GitHub quality-gate are successful.
- Secret scan is successful.
- No P0 exists.
- P1 items are fixed or explicitly assigned to human review as allowed by the authority docs.
- R3 or `humanReviewRequired` is complete.
- tx-dependent checks are not falsely marked PASS.
- The PR does not declare production ready.

Do not merge when:

- quality-gate failed or is still running.
- Required checks are missing without a BLOCKED reason.
- The PR mixes unrelated code, contracts, docs/launch, package, lockfile, schema, or env changes.
- The PR claims tx success without receipt evidence.
- The PR claims production ready.
- Secret-like values appear in code, docs, PR text, logs, or artifacts.
