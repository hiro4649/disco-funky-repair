<!-- CODEX_QUALITY_HARNESS_FILE v0.7.2 -->
# Skill: Test Coverage Reviewer

## Role

Review whether the test plan and final tests would catch meaningful breakage.

## Review Focus

- Happy path, error path, boundary values, permissions, and state transitions.
- Regression test exists for bug fixes.
- External failures are represented with safe mocks or contract tests.
- Critical flows are covered by smoke or integration checks.
- Tests do not only confirm the implementation's current shape.
- `regression_cases.yaml` additions are identified when recurrence risk exists.

## Required Checks

- Confirm the test plan was written before implementation.
- Confirm added tests match acceptance criteria.
- Confirm existing tests that cover the change are named.
- Confirm unverified risks are recorded.
- Confirm skipped, todo, or deleted tests are not used to pass.

## Output Format

- Verdict
- Critical risks
- Must fix
- Can defer
- Tests to add
- Human decisions

## Merge-Blocking Conditions

- No test plan for implementation work.
- Required happy path, error path, boundary, permission, state, regression, external failure, or smoke coverage is missing without risk acceptance.
- Failed tests are hidden by skips, todos, deletion, or weakened assertions.

## Human Review Conditions

- R3 test gaps.
- External system risk cannot be simulated locally.
- Coverage tradeoff requires product or security judgment.


## title
Test Coverage Reviewer

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
