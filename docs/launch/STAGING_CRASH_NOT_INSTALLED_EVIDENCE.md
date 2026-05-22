# Staging Crash Not Installed Evidence

Status: P1-04 Crash no-tx evidence refresh after PR #49.

This document records the expected staging evidence after PR #49. It does not prove production launch readiness and does not complete any tx-based checks.

## Checked Source

- Repository: `hiro4649/disco-funky-repair`
- Checked main commit: `6d427580f01bb9a65631f6a71295451515f5d570`
- Short SHA: `6d42758`
- Subject: `P1-03 Clarify Crash game no-tx smoke method (#49)`

PR #49 is reflected in this checked main commit. Staging evidence must be refreshed only after the staging server is redeployed from this commit or a later main commit.

## Crash Policy

Crash game is intentionally not installed for the staging or production MVP.

The only remaining backend API path is a thin disabled smoke stub:

- `GET /api/crash/games` must return `410 FEATURE_DISABLED`.

The following must not be used as protection evidence:

- `POST /api/crash/games` returning `404`, because it only proves the wrong HTTP method was used.
- `/crash/games` returning `404`, except as old non-API path absence evidence.

## Required Source Absence Checks

Run these from the repository root after checking out the same commit deployed to staging:

```bash
git rev-parse HEAD
rg -n "/crashx|initCrashServer|components\\CrashGame|components/CrashGame|crashGame.controller" apps/backend/src apps/frontend/src
rg -n "crashGameRoutes|crashGame\\.routes|FEATURE_DISABLED" apps/backend/src/app/routes/crashGame.routes.ts apps/backend/src/app/routes/routes.ts
cat 'apps/frontend/src/app/(home)/fan-games/page.tsx'
rg -n "Fan Games|fan-games" apps/frontend/src/components/Sidebar/index.tsx
```

Expected:

- `git rev-parse HEAD` matches `6d427580f01bb9a65631f6a71295451515f5d570` or a later approved main commit.
- The `/crashx`, `initCrashServer`, `components/CrashGame`, and `crashGame.controller` search returns no matches.
- The `crashGameRoutes` search returns only the disabled stub and route mount.
- `/fan-games` remains a `notFound()` page.
- Sidebar has no Fan Games / Crash navigation item.

## Required No-Tx Route Evidence

Run without cookies, Authorization headers, wallet funding, or tx signing:

```bash
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X GET "<staging-api-base>/api/crash/games"
rm -f /tmp/no-tx-response.json
```

Expected:

- HTTP status: `410`
- Sanitized response code/message: `FEATURE_DISABLED`

Do not paste raw headers, cookies, env values, host secrets, or full response bodies if they contain operational details.

## Related No-Tx Route Expectations

Crash cleanup does not change the other no-tx smoke expectations:

| Target | Method and path | Expected |
| --- | --- | --- |
| Direct NFT status update disabled | `PATCH /api/nft/<nft-id>` | `410 FEATURE_DISABLED` |
| Direct user illustration disabled | `POST /api/user/illustration` | `410 FEATURE_DISABLED` |
| Referral admin snapshot | `POST /api/referral/admin/run-snapshot` | `401 Unauthenticated` |
| Referral admin reward distribution | `POST /api/referral/admin/distribute-rewards` | `401 Unauthenticated` |
| All-user ticket distribution | `POST /api/alluser/distribute/ticket` | `401 Unauthenticated` |
| Admin NFT listing | `GET /api/admin/nfts` | `401 Unauthenticated` |
| Admin ticket distribution listing | `GET /api/admin/ticket-distribution` | `401 Unauthenticated` |
| Crash game disabled stub | `GET /api/crash/games` | `410 FEATURE_DISABLED` |

404 remains invalid protection evidence for these routes unless the route is explicitly documented as an old path absence check.

## Secret Log Scan Boundary

Secret log scan results must not record raw secret-bearing lines.

Do not write these values into git, PRs, issues, tickets, or chat:

- raw JWT or Authorization header
- cookie value
- private key or seed phrase
- API key or explorer URL containing an API key
- DB URL
- RPC URL with query string
- secret-manager value

Record only PASS/FAIL and sanitized metadata.

## Tx Boundary

BNB/tBNB is still not funded for tx checks in this no-tx evidence scope.

Do not mark these as complete here:

- Prize sendToWallet transaction
- NFT mint transaction
- tier downgrade/reset transaction
- FUNKY token or NFT deployment transaction
- governance, fee, DEX, pair, or ownership transaction
- receipt retry or on-chain event verification

This document is not production launch approval.
