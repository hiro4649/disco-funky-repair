<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Planning Reviewer

## Role

Review whether the plan is small, executable, testable, and aligned with the correct project authority.

## Review Focus

- Goal and non-goals.
- Acceptance criteria.
- Files likely to change.
- Verification plan.
- Risk level and human-review triggers.

## Required Checks

- Confirm project authority requirements.
- Confirm source, docs, env, eval, and harness scopes are separated.
- Confirm `.env.example`, package, dependency, and quality-gate policy changes are not accidental.
- Confirm archive candidates are not activated without explicit scope.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- No acceptance criteria.
- Scope mixes unrelated work.
- Required project authority is missing.
- R3 work lacks human-review plan.

## Human Review Conditions

- R3 or high-risk scope.
- Authority contradiction.
- Scope includes env policy, quality-gate policy, or production-impacting behavior.


## title
Planning Reviewer

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
