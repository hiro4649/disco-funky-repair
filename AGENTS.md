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
<!-- CODEX_QUALITY_HARNESS_BEGIN -->
CODEX_QUALITY_HARNESS_FILE v0.9.2

## Codex Target Harness Boundary

Source harness boundary: this target repository consumes Codex Development Harness v0.9.2 through docs/process/CODEX_HARNESS_MANIFEST.json, not CODEX_SOURCE_HARNESS_MANIFEST.json.
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
- allow CODEX_SKIP_NPM=1 only when change classification and product verification policy allow it;
- require product verification when product-relevant files, package files, runtime readiness claims, or performance claims are present.

v0.9.2 preserves v0.9.0 remote reliability and adds Security Lifecycle, Evidence Automation, and Review Independence:
- pre-checkout safe artifact lifeboat and no-artifact failure classification;
- registry-backed classification coverage and remote/local parity checks;
- PR template compiler hints and gate decision trace;
- version lineage, PR evidence rendering, safe artifact classification, security lifecycle, review independence, task brief compiler, environment profile, AGENTS context budget, evidence repair hints, and v092 self-test.

Do not add Agentmemory, Hermes runtime, GEPA, DSPy, MCP, SQLite memory, LLM judge, hidden chain-of-thought inspection, automatic skill rewriting, auto commit, auto push, or prompt auto-apply as part of this harness block.
Do not treat targetQualityScoreStatus or a passing harness gate as product runtime readiness.

<!-- CODEX_QUALITY_HARNESS_END -->
