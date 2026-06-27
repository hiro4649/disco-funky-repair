# FUNKY Next Task

## Highest-Priority Next Task

Complete local project memory restoration and v1.3.0 authority wording reconciliation, then request owner approval before any push or remote CI.

Do not continue D8AR until this task is merged or explicitly accepted by the owner.

## Required Files

- docs/PROJECT_SPEC.md
- docs/PROJECT_STATUS.md
- docs/NEXT_TASK.md
- docs/CHANGELOG.md
- docs/process/CODEX_V130_SPEC.md, only if the v1.3.0 authority contradiction is confirmed.

## Implementation Strategy

1. Use latest main as authority.
2. Create the four project memory docs.
3. Classify v1.3.0 authority using AGENTS.md, CODEX_HARNESS_MANIFEST.json, CODEX_ACTIVE_POLICY_INDEX.json, and CODEX_V130_SPEC.md.
4. Correct only stale explanatory wording if it conflicts with machine manifest authority.
5. Run local checks only.
6. Keep the branch local until owner approval is given after the GitHub Actions quota reset.

## Acceptance Criteria

- Four project memory docs exist.
- v1.3.0 authority contradiction is classified and resolved in documentation.
- No product code changed.
- PR #364 untouched.
- PR #361 untouched.
- Local v130 active checks pass.
- v130 compatibility cases for v129 rollback, v128 compatibility, and v127 readable compatibility pass.
- Direct v129/v128/v127 self-test behavior under active v1.3.0 is recorded. If still failing, mark Needs verification.
- Secret scan passes.
- git diff --check passes.
- Local target gate result is recorded.
- No remote CI is triggered during the Actions freeze.

## Expected Risks

- Local gate is not remote same-head evidence.
- PR #364 may remain conflicting after this docs task.
- PR #361 may remain stale after this docs task.
- Remote validation remains pending until owner approval.
- Direct legacy self-test execution under active v1.3.0 may fail because those scripts expect their own active tuple. Needs verification before treating as a harness blocker.

## Validation Steps

Run locally:

- node --check scripts/codex-v130-self-test.mjs
- node --check scripts/codex-v129-self-test.mjs
- node --check scripts/codex-v128-self-test.mjs
- node --check scripts/codex-v127-self-test.mjs
- node --check scripts/codex-local-quality-gate.mjs
- node --check scripts/codex-workflow-quality-runner.mjs
- CODEX_HARNESS_MODE=target CODEX_PROFILE_COMPAT_MODE=off CODEX_QUALITY_REPORT=json node scripts/codex-v130-self-test.mjs --json
- CODEX_HARNESS_MODE=target CODEX_PROFILE_COMPAT_MODE=off CODEX_QUALITY_REPORT=json node scripts/codex-v129-self-test.mjs --json
- CODEX_HARNESS_MODE=target CODEX_PROFILE_COMPAT_MODE=off CODEX_QUALITY_REPORT=json node scripts/codex-v128-self-test.mjs --json
- CODEX_HARNESS_MODE=target CODEX_PROFILE_COMPAT_MODE=off CODEX_QUALITY_REPORT=json node scripts/codex-v127-self-test.mjs --json
- node scripts/codex-secret-safety-scan.mjs
- git diff --check
- CODEX_HARNESS_MODE=target CODEX_PROFILE_COMPAT_MODE=off CODEX_QUALITY_REPORT=json node scripts/codex-local-quality-gate.mjs

## Estimated Complexity

Low to medium. Documentation-only authority restoration with local validation. Remote evidence is intentionally deferred.
