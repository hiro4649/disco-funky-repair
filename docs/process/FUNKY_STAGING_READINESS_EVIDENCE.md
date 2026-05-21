# FUNKY Staging Readiness Evidence

This document defines the evidence format for FUNKY staging readiness checks.
It is a docs-only operating record format.
It does not execute deploy, mint, sendToWallet, governance tx, TierUpdater tx, or staging rollout.

Codex must not declare production ready.
`UNKNOWN` and `BLOCKED` are not `PASS`.
Empty fields, `TBD`, pending review, missing funding, missing domain, missing receipt, or missing runtime log inspection must not be converted to `PASS`.

## Scope

Use this evidence format for:

- staging domain and HTTPS checks;
- staging runtime env and public env checks;
- no-tx smoke checks;
- funded tx smoke checks;
- receipt evidence review;
- runtime log inspection;
- R3 human confirmation records.

This document must stay consistent with:

- `docs/process/FUNKY_SPEC_AUTHORITY.md`
- `docs/process/FUNKY_RELEASE_GATE.md`
- `docs/process/FUNKY_ASSET_OPERATION_RUNBOOK.md`
- the Funky Asset Safety Rule in `AGENTS.md`

## Status Values

Allowed `status` values:

- `PASS`
- `FAIL`
- `BLOCKED`
- `UNKNOWN`
- `MANUAL_REVIEW`

Rules:

- `PASS` requires evidence.
- `FAIL` requires a short, non-secret reason and next action.
- `BLOCKED` means verification cannot proceed.
- `UNKNOWN` means evidence is missing or not yet reviewed.
- `MANUAL_REVIEW` means a human reviewer must decide before the item can be accepted.

## Evidence Safety

Do not write secret values into evidence, PR text, logs, screenshots, comments, or artifacts.
Do not include private keys, seed phrases, API keys, DB URLs, JWTs, cookies, Authorization headers, raw payloads, or production logs.

Receipt evidence may include only public data:

- txHash
- chainId
- from
- to
- contract address
- block number
- status
- timestamp
- public amount
- public event name and public event fields

Do not treat txHash alone as receipt confirmation.
Do not treat a DB update alone as on-chain success.

## Evidence Record Template

Use one record per check or per tx evidence item.

```json
{
  "environment": "staging",
  "domain": "<staging-domain-or-BLOCKED>",
  "headSha": "<git-head-sha>",
  "checkedAt": "<ISO-8601 timestamp>",
  "checkedByRole": "<role>",
  "checkType": "<no-tx-smoke | funded-tx-smoke | receipt-evidence | runtime-log-inspection | manual-review>",
  "result": "<short non-secret result>",
  "status": "<PASS | FAIL | BLOCKED | UNKNOWN | MANUAL_REVIEW>",
  "evidence": {
    "url": "<non-secret evidence URL or empty>",
    "txHash": "<public tx hash or empty>",
    "chainId": "<public chain ID or empty>",
    "contractAddress": "<public contract address or empty>",
    "recipient": "<public recipient or empty>",
    "amount": "<public amount or empty>",
    "eventLog": "<public event evidence summary or empty>"
  },
  "residualRisks": [
    "<non-secret residual risk>"
  ],
  "nextAction": "<next non-secret action>"
}
```

## Required Evidence Groups

### Staging Domain And Env

- staging domain decision
- HTTPS enabled
- backend runtime env is staging
- frontend public env is staging-safe
- CORS origins are explicit staging origins only
- cookie domain is correct for staging
- session secret exists, without recording the value
- BSC testnet chainId `97` is confirmed

If the staging domain is not decided, mark staging readiness as `BLOCKED`.

### No-Tx Smoke

Record no-tx smoke evidence with:

- environment
- domain
- headSha
- checkedAt
- checkedByRole
- status per check
- non-secret evidence URL or screenshot reference when available
- residual risks

No-tx smoke must not include mint, sendToWallet, governance tx, TierUpdater tx, or any on-chain write.

### Funded Tx Smoke

Record funded tx smoke only after tBNB funding is confirmed.
If tBNB is not funded, mark funded tx smoke as `BLOCKED`.

Funded tx smoke must keep NFT mint, Prize send, TierUpdater, and governance/config evidence separated.
Each tx evidence item must include receipt evidence, not only txHash.

### Runtime Log Inspection

Runtime log inspection must confirm that logs do not include:

- secret values
- DB URLs
- JWTs
- cookies
- private keys
- Authorization headers
- raw payloads
- production logs

If runtime logs are unavailable, mark the item as `UNKNOWN` or `BLOCKED`, not `PASS`.

### R3 Manual Confirmation

Human approval for R3 items must be tied to the current head SHA.
If the head SHA changes, the manual confirmation must be repeated for the new head.

## Readiness Summary Template

```markdown
## FUNKY Staging Readiness Summary

- environment:
- domain:
- headSha:
- checkedAt:
- checkedByRole:
- noTxSmokeStatus:
- fundedTxSmokeStatus:
- runtimeLogInspectionStatus:
- receiptEvidenceStatus:
- manualReviewStatus:
- overallStatus:

### Evidence Links
- no-tx smoke:
- funded tx smoke:
- receipt evidence:
- runtime logs:
- manual confirmation:

### Residual Risks
-

### Next Action
-
```

`overallStatus` must be the strictest status. For example, one `BLOCKED` item means the overall staging readiness is not `PASS`.
