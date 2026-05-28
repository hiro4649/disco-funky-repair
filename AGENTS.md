# AGENTS.md

## FUNKY Authority Boundary

Unreadable legacy guidance was present in this file. Do not interpret that text
as project authority. For FUNKY product behavior, asset operations, staging,
wallet, contract, admin, BSC, or release decisions, use the canonical project
process documents, especially:

- `docs/process/FUNKY_SPEC_AUTHORITY.md`
- `docs/process/FUNKY_RELEASE_GATE.md`
- `docs/process/FUNKY_ASSET_OPERATION_RUNBOOK.md`
- `docs/process/FUNKY_KNOWN_RISKS.md`
- `docs/process/CODEX_PR_REVIEW_PLAYBOOK.md`
- `docs/process/CODEX_POST_MERGE_CHECKLIST.md`
- `docs/process/CODEX_INCIDENT_AND_ROLLBACK_RUNBOOK.md`

If those documents are missing, ambiguous, or conflict with the task, stop and
report the risk instead of inventing rules.

Harness-only work must stay in harness-managed files. Do not modify FUNKY apps,
contracts, product source, tests, specs, package files, lockfiles, runtime
files, or `scripts/run-tests.js` unless the project owner explicitly requests
product work and required verification evidence is available.

## Review Policy

Do not run Codex review after every small edit. Use Codex review at meaningful
change boundaries: commit-sized changes, before opening a pull request, and for
risky changes.

Risky changes include authentication, authorization, permissions, billing,
payments, database migrations, data deletion, external API calls,
security-sensitive logic, concurrency, background jobs, shared core logic,
public API changes, error handling, workflow changes, harness changes, release
changes, product-relevant changes, external audit findings, and quality-gate
fixes.

Before running review, run the relevant formatter, linter, typecheck, and tests
when available. Treat high-priority review findings as blockers unless there is
a clear reason not to fix them. If a high-priority finding is not fixed, explain
why.

Low-priority findings may be ignored when they do not affect correctness,
security, maintainability, or user-facing behavior. After fixing review
findings, rerun the relevant tests.
<!-- CODEX_QUALITY_HARNESS_BEGIN -->
CODEX_QUALITY_HARNESS_FILE v0.9.7

## Codex Target Harness Boundary

This target repository consumes Codex Development Harness v0.9.7 through
`docs/process/CODEX_HARNESS_MANIFEST.json`; do not copy or create
`CODEX_SOURCE_HARNESS_MANIFEST.json` here. Keep product authority outside this
block intact.

## Target Doctrine And Skill Routing

Keep AGENTS.md compact: doctrine, routing map, and links only. Put detailed
policy in `docs/process`. Load only task-needed skills, normally four or fewer
and never more than five. Use `docs/process/CODEX_AGENTS_DOCTRINE_POLICY.md`,
`docs/process/CODEX_SKILL_ROUTING_POLICY.md`,
`docs/process/CODEX_SUBAGENT_GOVERNANCE_POLICY.md`, and related v0.9.5/v0.9.6/v0.9.7 files for detailed rules.

## Target Safety Rules

Harness-only work must stay in harness-managed files. Do not modify product
source, product tests, runtime assets, package files, lockfiles, profiles, or
product config not owned by harness unless the project owner explicitly requests
product work and required verification evidence is available.

Maintain the source harness boundary and profile/core separation. Use a
plan-first workflow for nontrivial work, keep safe output in evidence artifacts,
and require manual confirmation before any merge-ready claim. Manual
confirmation cannot override non-overridable harness failures. Do not print raw
logs, raw diffs, raw runtime data, raw model paths, secrets, endpoints, private
paths, production data, or personal data. Do not print raw logs.
Manual confirmation cannot override non-overridable harness failures.

Do not treat targetQualityScoreStatus or a passing harness gate as product
runtime readiness. Fixture pass, browser smoke pass, dataset audit readiness,
Game/Tool Adapter fixture pass, and beloved avatar audit readiness are not
runtime readiness.

Run target quality gates with `CODEX_HARNESS_MODE=target`,
`CODEX_PROFILE_COMPAT_MODE=off`, and `CODEX_QUALITY_REPORT=json`. Preserve target
hotfixes and target-specific adaptations during rollout. Require same-head
evidence for PR evidence, manual confirmation, remote runs, artifact summaries,
and product-relevant PR context.

Do not treat targetQualityScoreStatus or a passing harness gate as product
runtime readiness. Fixture pass is not runtime readiness.

<!-- CODEX_QUALITY_HARNESS_END -->
