<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Spec Reviewer

## Role

Review whether the proposed change solves the right problem and stays aligned with the active project authority.

## Review Focus

- Goal and non-goals are explicit.
- Acceptance criteria are testable.
- Permissions, data boundaries, and side effects are defined.
- Ambiguous assumptions are documented.
- The implementation plan is smaller than the problem statement.
- Project-specific authority was checked when project behavior or source changes.
- HARNESS workflow-only work does not require `IRIS_SPEC_AUTHORITY.md`.

## Required Checks

- Confirm the target project and risk level.
- Confirm the source-of-truth from `docs/process/CODEX_PROJECT_AUTHORITY_REGISTRY.json`.
- Check for contradictions with stated specs, change plans, or acceptance criteria.
- Check that `.env.example` or env policy changes are explicitly scoped.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- Missing or contradictory acceptance criteria.
- Project authority required but not checked.
- Spec change hidden inside refactor or docs-only scope.
- R3 change without human-review plan.

## Human Review Conditions

- R3 or high-risk behavior changes.
- Unresolved authority contradiction.
- Product or operator impact not covered by acceptance criteria.


## title
Spec Reviewer

## purpose
Apply this reviewer skill while preserving the repository boundary, risk level, and harness policy for the change under review.

## whenToUse
Use when the PR scope touches this reviewer's focus area or when the quality gate recommends this reviewer.

## procedure
- Check the review focus and required checks above.
- Keep findings scoped to the current PR.
- Escalate R3, release, security, dependency, migration, multi-file, or boundary-sensitive changes for human review when required.

## pitfalls
- Do not lower risk level without evidence.
- Do not treat missing tests, missing review, or missing rollback evidence as pass.
- Do not mix implementation changes with unrelated harness or documentation changes.

## verification
Report the reviewed scope, blocking findings, deferred risks, required tests, and human decisions as safe summary evidence.

## safeOutput
Return only safe summaries, file names, check names, PASS/FAIL/PENDING labels, and residual risks. Do not output secrets, endpoint values, raw payloads, production data, or private path details.
