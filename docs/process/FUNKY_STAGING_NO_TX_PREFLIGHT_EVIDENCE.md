# FUNKY Staging No-Tx Preflight Evidence

This document records the current FUNKY staging no-tx preflight evidence state.
It is a docs-only evidence record.
It does not execute deploy, mint, sendToWallet, governance tx, TierUpdater tx, funded tx, or staging rollout.

Codex must not declare production ready.
`UNKNOWN` and `BLOCKED` are not `PASS`.
Empty fields, `TBD`, unconfirmed evidence, unfunded wallets, missing receipts, missing domain, or missing runtime log inspection are not `PASS`.
This document records the current preflight state only and does not prove staging runtime behavior.

## Evidence Context

```json
{
  "environment": "staging",
  "domain": "<BLOCKED>",
  "headSha": "3edd822808874a26c050c21c6d2560a2d29e675c",
  "checkedAt": "2026-05-21T16:06:55.5915890Z",
  "checkedByRole": "implementation-reviewer",
  "checkType": "no-tx-preflight",
  "overallStatus": "BLOCKED",
  "reason": "staging domain, staging runtime env evidence, funding status, and runtime log evidence are not fully confirmed"
}
```

## Scope

This evidence record is limited to no-tx preflight readiness.
It does not include funded tx smoke, NFT mint, Prize sendToWallet, TierUpdater tx, governance/config tx, or receipt confirmation.

Use these status values only:

- `PASS`
- `FAIL`
- `BLOCKED`
- `UNKNOWN`
- `MANUAL_REVIEW`

Do not convert `BLOCKED` or `UNKNOWN` to `PASS` without non-secret evidence.

## Evidence Safety Rules

Do not include private keys, seed phrases, API keys, DB URLs, JWTs, cookies, Authorization headers, raw payloads, secret values, or production logs.
If evidence requires a domain, URL, response, or runtime log that is not available, record `BLOCKED` or `UNKNOWN`.
If a future evidence item includes public URLs or screenshots, confirm they do not expose secret-like values before linking them.

## No-Tx Preflight Table

| Check | Current Status | Evidence State | Next Action |
| --- | --- | --- | --- |
| Staging domain decided | `BLOCKED` | No approved staging domain evidence is recorded here. | Decide and record the staging domain using non-secret evidence. |
| HTTPS enabled | `BLOCKED` | Domain-dependent; no HTTPS evidence is recorded here. | Recheck after staging domain is decided. |
| `BACKEND_APP_ENV` / `APP_ENV` staging evidence | `UNKNOWN` | Runtime env evidence has not been recorded. | Confirm staging runtime env without exposing values beyond safe names/status. |
| `BACKEND_CORS_ORIGINS` staging-only evidence | `BLOCKED` | Final staging origin depends on the staging domain. | Confirm explicit staging origin after domain decision. |
| `SESSION_SECRET` presence evidence without value | `UNKNOWN` | Presence has not been verified in this evidence record. | Confirm presence only; never record the value. |
| `COOKIE_DOMAIN` evidence without cookie value | `BLOCKED` | Domain-dependent; cookie value must not be recorded. | Confirm safe domain summary after staging domain decision. |
| BSC testnet chainId `97` evidence | `UNKNOWN` | No runtime/provider evidence is recorded here. | Confirm public chainId evidence without private RPC credentials. |
| Frontend public env staging-safe evidence | `UNKNOWN` | Public env names and staging-safe summaries are not recorded here. | Confirm public env names only; do not record secret-like values. |
| Admin route protection evidence | `BLOCKED` | Requires staging route access after domain/runtime availability. | Confirm unauthenticated and non-admin access are denied. |
| Public catalog minimal exposure evidence | `BLOCKED` | Requires staging public API access after domain/runtime availability. | Confirm public response omits admin/internal fields. |
| Upload/static images-only evidence | `BLOCKED` | Requires staging static route access after domain/runtime availability. | Confirm non-image files are not served. |
| Status/health no-secret evidence | `BLOCKED` | Requires staging endpoint access after domain/runtime availability. | Inspect response without storing secret-like values. |
| Runtime logs no secret evidence | `UNKNOWN` | Runtime log inspection is not performed in this PR. | Inspect runtime logs later without copying sensitive logs. |
| Runtime logs no DB URL evidence | `UNKNOWN` | Runtime log inspection is not performed in this PR. | Confirm no DB URL appears without recording DB URL. |
| Runtime logs no JWT/cookie/private key evidence | `UNKNOWN` | Runtime log inspection is not performed in this PR. | Confirm absence without copying sensitive values. |
| Runtime logs no raw payload evidence | `UNKNOWN` | Runtime log inspection is not performed in this PR. | Confirm absence without storing raw payload. |
| `PATCH /api/nft/:id` disabled evidence | `BLOCKED` | Requires staging route access after domain/runtime availability. | Confirm disabled response and no state mutation. |
| Crash/user-manage disabled evidence | `BLOCKED` | Requires staging route/UI access after domain/runtime availability. | Confirm disabled or protected behavior. |

## Not Checked In This No-Tx Preflight

The following items are outside this no-tx evidence record and are not `PASS`:

- tBNB funding
- NFT deploy
- NFT mint
- NFT mint receipt
- Prize sendToWallet
- Prize receipt
- TierUpdater tx
- governance/config tx
- funded tx smoke
- receipt evidence review

These items must remain `BLOCKED`, `UNKNOWN`, or `MANUAL_REVIEW` until funded tx smoke is explicitly approved and public receipt evidence exists.

## Stop Conditions

Stop no-tx preflight review and mark the relevant item `FAIL`, `BLOCKED`, or `MANUAL_REVIEW` if:

- staging and production values are mixed;
- BSC testnet chainId `97` cannot be confirmed for staging;
- any secret-like value appears in evidence, responses, logs, PR text, screenshots, or comments;
- public routes expose admin/internal fields;
- upload/static serves non-image data;
- disabled routes are re-enabled;
- a deploy, mint, sendToWallet, governance tx, TierUpdater tx, or other funded tx would be required to continue.

## Residual Risks

- Staging domain is not confirmed.
- HTTPS is not confirmed.
- Staging runtime env evidence is not recorded.
- CORS, cookie domain, and public env evidence are not final.
- Runtime log inspection is not performed.
- tBNB funding and receipt checks are not part of this no-tx preflight.
- This document records blockers and unknowns only; it does not prove staging behavior.

## Next Action

Decide the staging domain, wire staging runtime env, and collect no-tx smoke evidence using `docs/process/FUNKY_STAGING_NO_TX_SMOKE_CHECKLIST.md`.
Do not proceed to funded tx smoke until no-tx blockers are resolved and human approval is recorded for the current head.
