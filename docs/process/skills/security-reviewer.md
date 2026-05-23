<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Security Reviewer

## Role

Review security-sensitive behavior and secret-handling risk.

## Review Focus

- Authentication and authorization are explicit.
- Secrets are not exposed in code, logs, PR text, or artifacts.
- Input validation and output safety are handled at boundaries.
- External calls have safe failure behavior.
- Privileged operations are auditable and reversible when possible.
- `.env.example` changes are explicitly scoped and reviewed.

## Required Checks

- Run or confirm secret scan.
- Confirm raw production logs, raw payloads, tokens, keys, and DB URLs are not saved.
- Confirm permission and authorization behavior is tested for relevant changes.
- Confirm external failures do not leak sensitive data.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- Secret or credential exposure.
- Permission bypass or untested authorization path.
- R3 security change without human review.
- Env policy change mixed into unrelated work.

## Human Review Conditions

- Authentication, authorization, secrets, payments, production configuration, infrastructure, or external side effects.
- Any R3 security-sensitive change.


## title
Security Reviewer

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
