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
CODEX_QUALITY_HARNESS_FILE v0.8.2

## Target Harness Boundary

This repository is a downstream target using Codex Development Harness v0.8.2.
Harness work must stay in harness-managed files unless the task explicitly asks
for product code changes. Preserve readable project authority and boundary text
outside this block.

## Source Harness Boundary

The source harness is maintained outside this target repository. Do not copy
source-only manifests, source-only profiles, or source repo README content into
target-mode work.

## Plan-First Rule

Use plan-first for R3, ambiguous, security-sensitive, migration, release,
dependency, multi-file, or architecture tradeoff work. Keep the plan short and
connect it to affected areas, entrypoints, and failure propagation risk.

## Safe Output Rule

Use safe summary only. Do not print raw logs, raw diffs, raw payloads, secret
values, endpoint values, private paths, production data, or personal data.

## Target Verification Rule

Harness-only changes may use `CODEX_SKIP_NPM=1`. Product-relevant changes,
runtime readiness claims, package changes, or lockfile changes require product
verification evidence and must not be hidden by npm skip.

## Workflow Runner Rule

Target quality-gate uses the v0.8.2 workflow runner, normalized product
verification evidence, stale PR audit, safe test metrics, and compact reason
summary artifacts. Artifacts must stay safe-summary only.

## Merge-Ready Claim Rule

Do not claim merge-ready unless required gates, current-head evidence, target
quality score, product verification policy, and human confirmation rules are
satisfied.

## Manual Confirmation Limit

Manual confirmation cannot override non-overridable failures: secret scan,
blocked paths, high-confidence sensitive findings, stale evidence, unsafe
output, product/harness scope mixing, unreadable AGENTS context, missing target
score, or weakened quality gates.

## Profile/Core Separation

Source harness version and profile template version are separate. Target mode
uses `CODEX_HARNESS_MODE=target` and does not require source profiles unless a
project explicitly opts in.

<!-- CODEX_QUALITY_HARNESS_END -->
