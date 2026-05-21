# FUNKY Staging No-Tx Smoke Checklist

This checklist records staging smoke checks that do not perform on-chain transactions.
It does not execute deploy, mint, sendToWallet, governance tx, TierUpdater tx, or staging rollout.

Codex must not declare production ready.
`UNKNOWN` and `BLOCKED` are not `PASS`.
Only mark an item `PASS` when non-secret evidence exists.

## Required Context

Record this before starting:

- environment: `staging`
- domain:
- headSha:
- checkedAt:
- checkedByRole:
- runtime:
- evidence location:

If staging domain is undecided, mark domain-dependent checks `BLOCKED`.

## Status Values

Allowed status values:

- `PASS`
- `FAIL`
- `BLOCKED`
- `UNKNOWN`
- `MANUAL_REVIEW`

## Checklist

| Check | Expected Evidence | Status |
| --- | --- | --- |
| Staging domain is decided | Domain owner record or approved staging URL | `UNKNOWN` |
| HTTPS is enabled | HTTPS request evidence without secret values | `UNKNOWN` |
| Backend runtime is staging | `BACKEND_APP_ENV=staging`, `APP_ENV=staging`, or equivalent safe runtime evidence without secret values | `UNKNOWN` |
| CORS is staging-only | `BACKEND_CORS_ORIGINS` contains explicit staging origin only; value may be summarized without secrets | `UNKNOWN` |
| Session secret exists | Presence confirmed without recording the value | `UNKNOWN` |
| Cookie domain is correct | Domain summary only; no cookie value | `UNKNOWN` |
| BSC testnet chainId is `97` | Public chain ID evidence | `UNKNOWN` |
| Frontend public env is staging-safe | Public env names and non-secret origin/address summaries only | `UNKNOWN` |
| Admin route protection works | Unauthenticated and non-admin access denied; admin path not reached without `AuthAdmin` | `UNKNOWN` |
| Public catalog is minimal | Public response omits admin/internal fields | `UNKNOWN` |
| Upload/static returns images only | Non-image requests rejected or not served | `UNKNOWN` |
| Status/health endpoint exposes no secrets | Response inspected for secret-like values | `UNKNOWN` |
| Runtime logs expose no secrets | Logs inspected without copying raw sensitive logs into evidence | `UNKNOWN` |
| Runtime logs expose no DB URL | Logs inspected without copying DB URL | `UNKNOWN` |
| Runtime logs expose no JWT/cookie/private key | Logs inspected without copying sensitive values | `UNKNOWN` |
| Runtime logs expose no raw payload | Logs inspected without storing raw payload | `UNKNOWN` |
| `PATCH /api/nft/:id` remains disabled | Route returns disabled response; no state mutation | `UNKNOWN` |
| Crash/user-manage disabled state is preserved | Disabled or protected behavior confirmed | `UNKNOWN` |

## Evidence Record

For each item, record:

```json
{
  "environment": "staging",
  "domain": "<staging-domain-or-BLOCKED>",
  "headSha": "<git-head-sha>",
  "checkedAt": "<ISO-8601 timestamp>",
  "checkedByRole": "<role>",
  "checkType": "no-tx-smoke",
  "result": "<short non-secret result>",
  "status": "<PASS | FAIL | BLOCKED | UNKNOWN | MANUAL_REVIEW>",
  "evidence": {
    "url": "<non-secret evidence URL or empty>",
    "note": "<short non-secret summary>"
  },
  "residualRisks": [
    "<non-secret residual risk>"
  ],
  "nextAction": "<next non-secret action>"
}
```

## No-Tx Stop Conditions

Stop and mark `FAIL`, `BLOCKED`, or `MANUAL_REVIEW` if:

- staging and production env, origin, domain, wallet, or chain data are mixed;
- any secret-like value appears in response, logs, PR text, evidence, or screenshots;
- admin protection is bypassed;
- public catalog exposes internal/admin fields;
- upload/static serves non-image data;
- disabled routes are re-enabled;
- a tx would be required to continue.

Do not continue into funded tx smoke from this checklist.
Funded tx smoke must use `docs/process/FUNKY_STAGING_FUNDED_TX_SMOKE_CHECKLIST.md`.
