<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Boundary Reviewer

## Role

Review whether the change preserves project boundaries, contracts, and ownership.

## Review Focus

- Core / adapter boundaries.
- Runtime contracts and I/O shape.
- Public API or schema changes.
- Handoff points between systems.
- Project-specific R3 boundary rules.

## Required Checks

- Confirm validation stays at the correct boundary.
- Confirm project responsibilities are not moved without explicit scope.
- Confirm external contract changes have tests and review.
- For IRIS-live2d-renderer, check Live2D cue schema, renderer boundary, public summary, adapter handoff, and engine response normalization.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- Contract change without spec or tests.
- Boundary moved across Core / Adapter or renderer handoff without explicit review.
- R3 boundary change without human review.

## Human Review Conditions

- R3 boundary changes.
- Public schema or runtime contract changes.
- Renderer boundary and handoff changes.


## title
Boundary Reviewer

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
