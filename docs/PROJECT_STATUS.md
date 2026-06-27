# FUNKY Project Status

## Repository State

Repository: hiro4649/disco-funky-repair

Workdir used for this session: C:\Users\konto\Documents\Codex\FUNKY

Current branch: codex/funky-project-memory-v130-authority-local

Current main SHA: 05a8d785745b8d2f09ba4988da37ca2fc6b825af

Current local commit SHA: pending local commit at time of documentation edit. Needs verification after commit.

Active harness: v1.3.0

Active self-test: scripts/codex-v130-self-test.mjs

Project memory docs: created locally in this branch.

CI status: not run remotely. Remote CI is intentionally avoided under the current four-day GitHub Actions cost-control rule.

## Open PRs

| PR | Branch | Head | State | Files | Status |
| --- | --- | --- | --- | --- | --- |
| #364 | codex/funky-v127-legacy-compatibility-repair | c7fc56b6cb0ecd1505cce5faeeb7bc3d436e8c98 | open / draft | 18 | Remote quality gate success exists, but PR is behind latest main, conflicting, not approved, and not merge-ready. Do not touch. |
| #361 | codex/funky-actual-source-candidate-field-policy-boundary | 79896ac17137bcb98751447867275e71cb4c9d2b | open | 2 | Stale v1.2.6-era product PR, behind main. Do not touch until project memory and v1.3.0 authority are resolved. |

## Completed Work

- D8 fixture lane completed through main.
- PR #360 merged D8 safe validation kernel.
- PR #362 installed v1.2.7.
- PR #363 repaired v1.2.7 target coherence.
- PR #366 rolled out v1.2.9 target profile.
- PR #369 installed HARNESS v1.3.0 Core metadata bridge canary.
- Missing project memory docs restored locally in this branch.
- v1.3.0 authority contradiction classified as hybrid metadata-gate target projection.

## Remaining Work

- Owner review of the local project memory documentation branch.
- Owner approval before any push, PR creation, PR update, or remote CI.
- Resolve or supersede PR #364 after v1.3.0 authority is accepted.
- Re-evaluate PR #361 only after project memory and authority docs are accepted.

## Active Blockers

- GitHub Actions cost-control freeze: no push, PR creation/update, rerun, or remote CI without explicit owner approval.
- PR #364 is behind latest main and conflicting.
- PR #361 is stale and behind main.
- D8AR, D8AS, D8AT, runtime, staging, and production remain blocked.

## Risks

- v1.3.0 machine manifest and older explanatory prose previously disagreed. This branch corrects the prose only.
- PR #364 may be superseded by a cleaner v1.3.0-compatible repair path. Needs verification.
- Local checks are not remote same-head evidence.

## Test Status

Local validation for this branch:

| Check | Result |
| --- | --- |
| node --check scripts/codex-v130-self-test.mjs | pass |
| node --check scripts/codex-v129-self-test.mjs | pass |
| node --check scripts/codex-v128-self-test.mjs | pass |
| node --check scripts/codex-v127-self-test.mjs | pass |
| node --check scripts/codex-local-quality-gate.mjs | pass |
| node --check scripts/codex-workflow-quality-runner.mjs | pass |
| v130 self-test | pass |
| v130 compatibility cases for v129 rollback, v128 compatibility, and v127 readable compatibility | pass |
| v129 self-test direct execution | fail; expected active v129 tuple. Needs verification. |
| v128 self-test direct execution | fail; expected active v128 tuple. Needs verification. |
| v127 self-test direct execution | fail; expected active v127 tuple. Needs verification. |
| secret safety scan | pass |
| git diff --check | pass |
| local target quality gate | pass |

Local checks are not remote same-head evidence.

## Do-Not-Touch List

- PR #364: do not merge, ready, approve, close, authorize, or update.
- PR #361: do not touch.
- No D8AR, D8AS, D8AT implementation.
- No runtime, DB, source access, Prisma, RPC, wallet, contract, transaction, Docker, staging, production, package, lockfile, migration, frontend, or contracts work.
