<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Refactor Reviewer

## Role

Review whether refactor work is small, behavior-preserving, and separated from unrelated changes.

## Review Focus

- One responsibility per PR.
- Source, docs, eval, harness, and env policy are not mixed.
- Characterization tests cover unclear behavior.
- Verify and quality-gate results are compared before and after.
- Failure learnings are added to `FAILURES.md` and regression cases.

## Required Checks

- Confirm no hidden behavior change.
- Confirm no broad rename, movement, dependency update, or abstraction without explicit scope.
- Confirm tests pass before and after.
- Confirm R3 changes have human review.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- Refactor hides behavior change.
- Refactor mixes source with docs, eval, harness, or env policy without explicit scope.
- Verify or quality gate regresses.
- R3 refactor lacks human review.

## Human Review Conditions

- R3 refactor.
- Public contract or boundary movement.
- Large rename or file movement.


## title
Refactor Reviewer

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
