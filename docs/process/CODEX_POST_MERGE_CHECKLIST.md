# Codex Post-Merge Checklist

This checklist defines how Codex handles FUNKY PR merge and post-merge confirmation.
It does not authorize staging deploys or tx verification.

## Merge Preconditions

Before merge:

- Confirm the PR is in `hiro4649/disco-funky-repair`.
- Confirm the PR scope matches the task.
- Confirm GitHub quality-gate is success.
- Confirm required local checks were reported.
- Confirm secret scan was reported.
- Confirm R3 or `humanReviewRequired` is complete.
- Confirm no tx-dependent check is marked PASS without receipt evidence.
- Confirm no production ready claim exists.
- Confirm human review required by authority docs is complete.

If any item is missing, do not merge.
Use BLOCKED or UNKNOWN instead of guessing.

## Merge Steps

- Use squash merge.
- Do not push directly to main.
- Delete the merged branch after merge.
- Confirm the PR is closed as merged.
- Confirm main contains the squash commit.
- Confirm there is no stale open duplicate for the same task.

## Post-Merge Verify

After merge, verify:

- main is updated locally before the next task.
- GitHub shows the PR closed as merged.
- The branch is deleted or deletion failed for a clear reason.
- The next branch starts from current `origin/main`.
- No staging deploy, tx operation, or production action was triggered by Codex unless explicitly requested and allowed by authority docs.

## Stop Before Next Work

Stop and ask for or report a decision before the next task when:

- quality-gate did not finish successfully.
- R3 or human review is incomplete.
- merge status is unclear.
- branch deletion failed and may affect later work.
- residual P0/P1 risk was not accepted.
- staging or production state may have changed.
- tx evidence is missing for a tx-dependent claim.

## Staging Prohibited Conditions

Do not reflect to staging when:

- staging domain is undecided.
- required runtime env is missing or unclear.
- CORS, session, chainId, wallet role, or contract address is unclear.
- secret log scan has not been run for the runtime being changed.
- the task does not explicitly request staging reflection.
- authority docs say the action is BLOCKED.

## tBNB Not Funded Conditions

While tBNB is not funded, do not run:

- deploy
- mint
- sendToWallet
- tier tx
- governance tx
- funded contract verification

Record tx-dependent checks as BLOCKED, not PASS.

## Open PR Cleanup

Close an old open PR when:

- it failed required quality-gate and policy exception is not allowed.
- its findings or fixes were superseded by a newer merged PR.
- it targets a stale branch and cannot be made safe without a new review.
- it duplicates a newer PR for the same task.

When closing, state the reason without secret values or raw logs.

## Next Instruction Hygiene

After merge, keep the next Codex instruction small:

- one task.
- target repo and branch expectation.
- files allowed and files forbidden.
- required checks.
- explicit BLOCKED items.

Do not bundle unrelated cleanup, staging, tx verification, and release decisions into one instruction.
