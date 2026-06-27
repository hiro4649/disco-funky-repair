# FUNKY Changelog

## 2026-06-27

- Restored project memory documentation locally:
  - docs/PROJECT_SPEC.md
  - docs/PROJECT_STATUS.md
  - docs/NEXT_TASK.md
  - docs/CHANGELOG.md
- Classified v1.3.0 authority as hybrid: Source/Core v1.3.0 with active FUNKY target metadata-gate projection.
- Corrected stale v1.3.0 explanatory wording to match the current machine manifest and active policy.
- Ran local validation: v130 self-test pass, v130 compatibility cases pass, secret scan pass, diff check pass, local target gate pass.
- Recorded direct v129/v128/v127 self-test failures under active v1.3.0 as Needs verification.
- No product, runtime, package, lockfile, DB, source, Docker, staging, production, frontend, or contracts work.
- No push, PR creation, PR update, or remote CI due current GitHub Actions cost-control freeze.

## Recent Project History

- PR #360: merged D8 safe validation kernel.
- PR #361: open D8AR actual-source candidate field policy boundary. Do not touch until project memory and v1.3.0 authority are resolved.
- PR #362: merged v1.2.7 harness install.
- PR #363: merged v1.2.7 target coherence repair.
- PR #364: open draft harness evidence repair. Do not merge or update.
- PR #366: merged v1.2.9 target rollout.
- PR #369: merged v1.3.0 Core metadata bridge canary.

## Current Status

Documentation-authority restoration is local-only. Remote validation is pending owner approval after the Actions quota reset.
