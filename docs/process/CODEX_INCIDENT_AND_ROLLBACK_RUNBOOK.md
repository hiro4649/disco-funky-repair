# Codex Incident And Rollback Runbook

This runbook defines how Codex should respond to FUNKY incidents and rollback decisions.
It does not authorize new feature work.

## When To Use

Use this runbook for:

- staging runtime failure
- quality-gate failure
- secret leak suspicion
- admin auth failure
- CORS/env failure
- tx failure
- Prize send failure
- NFT mint failure
- TierUpdater failure
- rollback decision

During an incident, do not create a new feature PR.
Keep work limited to evidence capture, containment, rollback planning, and explicitly approved fixes.

## Non-Secret Evidence To Save

Before rollback or stop decisions, save only non-secret evidence:

- repo and PR number
- commit SHA
- workflow run id or job name
- failing command name
- safe error name
- route name or component name
- chainId
- public contract address
- txHash
- receipt status
- block number
- timestamp
- public amount
- affected environment name
- human decision owner

Do not save raw request bodies, raw headers, raw cookies, raw production logs, or raw env dumps.

## Information Never To Save

Never save or quote:

- secret values
- private keys
- seed phrases
- API keys
- DB URLs
- JWTs
- cookies
- Authorization headers
- session values
- raw production logs
- raw payloads

If a leak is suspected, stop copying logs and report only the safe summary.

## Initial Response

- Stop the risky action.
- Identify whether the issue is runtime, quality-gate, secret, auth, CORS/env, tx, Prize, NFT, or TierUpdater.
- Preserve non-secret evidence.
- Classify as P0, P1, P2, UNKNOWN, or BLOCKED.
- Do not declare recovery complete.
- Do not declare production ready.
- Ask for human decision when rollback, tx retry, env change, or key rotation may be required.

## Rollback Decision

Rollback may be considered when:

- runtime is broken after a merge or deploy.
- admin auth is unsafe or unavailable.
- CORS or env configuration blocks safe operation.
- a quality-gate failure indicates unsafe main state.
- secret leak suspicion exists and containment requires reverting exposure.
- tx config points at the wrong chain, wallet, or contract.

Do not rollback blindly.
Confirm the target commit, affected environment, and expected state with a human owner.

## Stop Conditions

Stop and require human review when:

- secret exposure is suspected.
- staging and production may be mixed.
- chainId is not BSC testnet `97` for staging.
- txHash exists but receipt status is unclear.
- Prize send may have broadcast but receipt is missing.
- NFT mint may have broadcast but ownership is unclear.
- TierUpdater tx may have broadcast but role or receipt is unclear.
- rollback could hide evidence.
- required evidence is UNKNOWN.

## Incident-Specific Rules

Quality-gate failure:

- Do not use policy exception by default.
- Report the final relevant failure only.
- Do not create a fix PR unless explicitly requested.

Secret leak suspicion:

- Stop log expansion.
- Preserve safe metadata only.
- Require human rotation and containment decision.

Admin auth failure:

- Do not relax AuthAdmin.
- Do not restore body adminKey bypass.
- Do not return admin tokens to browser JS.

CORS/env failure:

- Do not mix staging and production origins.
- Do not print runtime secret values.
- Confirm configured env names only.

Tx, Prize send, NFT mint, and TierUpdater failure:

- Do not retry blindly.
- Preserve txHash if present.
- Verify receipt before any retry decision.
- Treat missing receipt as UNKNOWN or BLOCKED.
- Require human approval before another tx.

## Review Ownership

- Codex: safe evidence summary, changed-file review, command result summary, and residual risk.
- Project owner: incident priority and acceptable downtime.
- Security reviewer: secret, auth, cookie, token, and log exposure.
- Asset reviewer: txHash, receipt, wallet role, no-double-send, and chain safety.
- Release owner: rollback, hotfix, and go/no-go decision.
- Domain owner: staging domain and HTTPS decisions.

Codex must not declare production ready or recovery complete on its own.
