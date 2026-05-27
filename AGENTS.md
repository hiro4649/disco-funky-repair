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
CODEX_QUALITY_HARNESS_FILE v0.9.3

## Codex Target Harness Boundary

Source harness boundary: this target repository consumes Codex Development Harness v0.9.3 through docs/process/CODEX_HARNESS_MANIFEST.json, not CODEX_SOURCE_HARNESS_MANIFEST.json.
Method reference: use docs/process/CODEX_OPENAI_CODEX_METHOD_POLICY.md and docs/process/code_review.md for Codex method and review evidence expectations.
Plan-first: use a short plan for R3, workflow, product-relevant, security, release, or ambiguous changes before editing.
Safe output: reports and artifacts must be safe-summary only. Do not print raw logs, raw diffs, raw payloads, raw PR body, comments, endpoint values, private paths, production data, personal data, tokens, or secrets.
Merge-ready claim: do not claim merge readiness unless the current target gate, evidence, and required confirmations all support it.
Manual confirmation: R3 or owner-gated changes require current-head project-owner confirmation before merge. Manual confirmation cannot override non-overridable failures.
Profile/core separation: target mode keeps profile compatibility off unless the project owner explicitly opts in.

Task discipline: classify work as bugfix, feature, refactor, investigation, review, release-gate, harness-change, or docs-only before editing. Keep task-specific workflow detail in skills or docs/process, not in AGENTS.md.

Current target-mode requirements:
- keep this AGENTS.md readable across the whole file;
- keep exactly one current harness block;
- preserve project authority outside this block;
- run target quality gates with CODEX_HARNESS_MODE=target, CODEX_PROFILE_COMPAT_MODE=off, and CODEX_QUALITY_REPORT=json;
- preserve target hotfixes, target-specific adaptations, and target patch manifest entries during rollouts;
- treat workflow_dispatch as diagnostic only, not as a pull_request check substitute;
- require same-head evidence for PR evidence packs, manual confirmation, remote runs, artifacts, and safe summaries when applicable;
- allow CODEX_SKIP_NPM=1 only when change classification and product verification policy allow it;
- require product verification when product-relevant files, package files, runtime readiness claims, performance claims, or Docker smoke requirements are present.

v0.9.3 preserves v0.9.2 evidence automation and security lifecycle while adding Target Hotfix Preservation, Product Context Fidelity, and Runtime Artifact Assurance:
- target patch manifest, previous target hotfix preservation, and rollout conflict gates;
- remote product PR context and target script classification fixtures;
- same-head artifact evidence and Docker smoke current-head artifact checks;
- CODEX_SKIP_NPM product override protection, goal condition checks, review policy classifier, compact PR evidence, and v093 self-test.

Do not add Agentmemory, Hermes runtime, GEPA, DSPy, MCP, SQLite memory, LLM judge, hidden chain-of-thought inspection, automatic skill rewriting, auto commit, auto push, or prompt auto-apply as part of this harness block.
Do not treat targetQualityScoreStatus or a passing harness gate as product runtime readiness.

<!-- CODEX_QUALITY_HARNESS_END -->
