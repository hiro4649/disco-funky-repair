<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Preview Smoke Reviewer

## Role

Review whether preview or smoke evidence is enough to trust the changed workflow before merge.

## Review Focus

- Project verify command ran.
- Local quality gate ran.
- Secret scan ran.
- Runtime, renderer, contract, or integration smoke path was checked when relevant.
- Skipped checks are recorded as not run, not pass.

## Required Checks

- Use `docs/codex/PREVIEW_SMOKE_CHECK_STANDARD.md`.
- Confirm commands, results, and failures are recorded.
- Confirm remote quality-gate status when a PR exists.
- Confirm merge-after verify plan exists.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- Required preview or smoke check missing without risk acceptance.
- Failed remote check unresolved.
- Skipped project verify marked as pass.

## Human Review Conditions

- R3 smoke gap.
- External preview cannot represent the production-critical path.
- Remote quality gate fails and requires risk acceptance.


## title
Preview Smoke Reviewer

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
