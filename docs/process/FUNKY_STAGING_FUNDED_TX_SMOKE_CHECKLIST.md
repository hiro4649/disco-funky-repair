# FUNKY Staging Funded Tx Smoke Checklist

This checklist is for FUNKY staging checks that require funded BSC testnet transactions.
Do not run this checklist until tBNB funding and human approval are confirmed.

Codex must not execute deploy, mint, sendToWallet, governance tx, TierUpdater tx, or staging rollout.
Codex must not declare production ready.
`UNKNOWN` and `BLOCKED` are not `PASS`.

## Required Preconditions

Before any funded tx smoke item can be marked `PASS`, confirm:

- no-tx smoke is complete or explicitly accepted by a human reviewer;
- staging domain is decided;
- HTTPS is enabled;
- staging runtime and public env are confirmed;
- BSC testnet chainId is `97`;
- tBNB funding is confirmed for the required staging roles;
- wallet roles are separated and reviewed;
- human approval is recorded for the current head SHA.

If any precondition is missing, mark funded tx smoke `BLOCKED`.

## Status Values

Allowed status values:

- `PASS`
- `FAIL`
- `BLOCKED`
- `UNKNOWN`
- `MANUAL_REVIEW`

## Evidence Safety

Receipt evidence may contain only non-secret public data:

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

Do not include private keys, seed phrases, API keys, DB URLs, JWTs, cookies, Authorization headers, raw payloads, or production logs.
Do not treat txHash alone as receipt confirmation.
Do not treat DB updates alone as on-chain success.

## Checklist

| Check | Expected Evidence | Status |
| --- | --- | --- |
| tBNB funding confirmed | Funding status for required staging roles using public-safe evidence only | `BLOCKED` |
| NFT deploy or existing NFT contract confirmed | chainId `97`, contract address, owner/role evidence | `UNKNOWN` |
| NFT baseURI configured | Public contract read or receipt evidence; no secret values | `UNKNOWN` |
| NFT mintEnabled configured | Public contract read or receipt evidence | `UNKNOWN` |
| NFT mint receipt confirmed | tx receipt, chainId, contract address, recipient, tokenId, `Transfer` event | `UNKNOWN` |
| NFT owner state confirmed | Public owner lookup or index evidence after receipt confirmation | `UNKNOWN` |
| Prize send receipt confirmed | tx receipt, chainId, contract address, recipient, amount, event log | `UNKNOWN` |
| Prize txHash-only success is rejected | Evidence that `RECEIVED` is not based on txHash alone | `UNKNOWN` |
| Prize no-double-send confirmed | Existing txHash/state/idempotency/reservation checked before retry | `UNKNOWN` |
| TierUpdater receipt confirmed | tx receipt, chainId, contract address, role, event/log evidence | `UNKNOWN` |
| governance/config receipt confirmed | tx receipt and role evidence for config operation | `UNKNOWN` |
| secret log scan after funded tx | Runtime logs inspected without copying sensitive values | `UNKNOWN` |
| rollback/manual review plan confirmed | Non-reversible tx handling and manual review path recorded | `UNKNOWN` |

## Receipt Evidence Template

Use one record per tx.

```json
{
  "environment": "staging",
  "domain": "<staging-domain>",
  "headSha": "<git-head-sha>",
  "checkedAt": "<ISO-8601 timestamp>",
  "checkedByRole": "asset-security-reviewer",
  "checkType": "funded-tx-smoke",
  "result": "<short non-secret result>",
  "status": "<PASS | FAIL | BLOCKED | UNKNOWN | MANUAL_REVIEW>",
  "evidence": {
    "txHash": "<public tx hash>",
    "chainId": "97",
    "from": "<public sender>",
    "to": "<public recipient or contract>",
    "contractAddress": "<public contract address>",
    "blockNumber": "<public block number>",
    "receiptStatus": "<success | failure | unknown>",
    "timestamp": "<public timestamp>",
    "amount": "<public amount>",
    "eventLog": "<public event summary>"
  },
  "residualRisks": [
    "<non-secret residual risk>"
  ],
  "nextAction": "<next non-secret action>"
}
```

## Prize Send Rules

Prize send evidence must prove:

- provider chainId matches expected BSC testnet chainId `97`;
- contract address matches the expected staging contract;
- recipient matches the expected public recipient;
- amount matches the expected public amount;
- event log or receipt fields match the expected transfer;
- txHash alone was not used to mark completion;
- no duplicate send occurred.

If receipt is unavailable, mark the item `MANUAL_REVIEW` or `UNKNOWN`, not `PASS`.

## Rollback And Stop Conditions

Stop and move to manual review if:

- chainId is not `97`;
- staging and production values are mixed;
- contract address does not match expected staging config;
- receipt status is failed or missing;
- event log is missing or conflicts with expected recipient/amount;
- txHash exists but receipt is unconfirmed;
- a duplicate-send risk exists;
- runtime logs contain secret-like values;
- wallet role ownership cannot be confirmed.

On-chain tx cannot be treated as reversible.
Rollback means stopping further actions, preserving public evidence, and using reviewed config changes or manual review before any next tx.
