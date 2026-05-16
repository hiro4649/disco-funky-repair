# STAGE-11 HTTPS Staging Migration Evidence

Status: evidence report template and current checkpoint for HTTPS staging migration.

This document records the non-secret evidence that must be collected after moving staging from temporary `http://<server-ip>` access to an HTTPS staging domain. It does not include raw env output, secrets, API keys, private keys, DB URLs, cookies, JWTs, Authorization headers, or transaction proofs.

This is not production launch approval. Because BNB/tBNB is not funded, transaction-based checks remain incomplete and must not be marked as PASS in this report.

## 1. Checked Main Commit

Repository: `hiro4649/disco-funky-repair`

Checked main commit:

- `63350c1c1e16236041fd51c90c08719555ef116a`
- Short SHA: `63350c1`
- Subject: `docs: add staging https domain migration runbook (#58)`

Report date: `2026-05-16`

Humans must confirm the running staging server is deployed from this commit or a later approved `main` commit before using this file as migration evidence.

## 2. Evidence Handling Rules

Do not paste raw server env, raw logs, secret-manager values, private keys, API keys, DB URLs, JWTs, cookies, Authorization headers, or full PM2 env output into this repository, PRs, tickets, chat, or shared notes.

Allowed evidence format:

- PASS/FAIL/PENDING status.
- command names without secret-bearing output.
- sanitized hostname evidence if the hostname itself is intended to be public.
- sanitized counts or summaries from log scans.
- screenshots only if they do not reveal secrets, cookies, JWTs, admin panels with private data, or wallet private material.

If a check produces secret-like output, store no raw output in git. Record only a sanitized summary and rotate exposed credentials if any secret was shown.

## 3. HTTPS Migration Evidence Summary

The following fields are intentionally `PENDING` because the actual staging server evidence was not provided to Codex in this workspace.

| Item | Status | Evidence summary |
| --- | --- | --- |
| Staging domain | PENDING | Not provided to Codex. Record only the public staging hostname after DNS is configured. |
| DNS confirmation | PENDING | Confirm DNS resolves to the staging server without recording private provider details. |
| nginx `server_name` | PENDING | Confirm nginx uses the staging hostname and not raw IP, localhost, production domain, `var-www`, `Rave_bk`, or local copies. |
| certbot / TLS certificate | PENDING | Confirm certificate is issued for staging hostname only. Do not store certificate private key. |
| frontend public env HTTPS URLs | PENDING | Confirm `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_SOCKET_API_URL` are HTTPS staging URLs. Do not paste raw env output. |
| backend `BACKEND_APP_ENV=staging` | PENDING | Confirm presence only through a safe OK/FAIL check. |
| backend `BACKEND_CORS_ORIGINS` | PENDING | Confirm it contains only the HTTPS staging origin(s), with no raw IP, localhost, HTTP origin, or production domain. |
| backend `SESSION_SECRET` | PENDING | Confirm presence only. Never record the value. |
| `REQUEST_BODY_LIMIT` | PENDING | Confirm effective value is `5mb` or lower. |
| PM2 backend/frontend | PENDING | Confirm both processes are online and point to the GitHub checkout for the checked commit. |
| nginx service | PENDING | Confirm nginx is active and `sudo nginx -t` passes. |
| HTTPS curl | PENDING | Confirm HTTPS frontend/API health without recording cookies or headers. |
| browser check | PENDING | Confirm staging loads through HTTPS and does not rely on raw IP or HTTP. |
| no-tx smoke rerun | PENDING | Rerun documented no-tx smoke and record only sanitized status results. |
| secret log scan | PENDING | Scan PM2/nginx logs and record only sanitized PASS/FAIL summary. |
| Excel upload size check | PENDING | Confirm 10MB-or-less file behavior and above-10MB rejection without uploading private data. |

## 4. Required HTTPS Checks

### DNS

Expected:

- staging hostname resolves to the staging server.
- production hostnames are not used.
- old source paths and local copies are not deployment targets.

Record:

- PASS/FAIL only.
- sanitized public hostname if acceptable for the project.
- no registrar or account secrets.

### nginx

Expected:

- `server_name` uses the HTTPS staging hostname.
- nginx keeps `/api` prefix behavior consistent with `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md`.
- `sudo nginx -t` passes.
- nginx is active.
- no nginx root, alias, or proxy target points to `Rave_bk`, `var-www`, downloaded zip source, desktop source, or old Sui/DISCO source.

Record:

- command names and PASS/FAIL.
- do not paste full nginx config if it contains private paths or hostnames that should not be public.

### TLS Certificate

Expected:

- certificate is issued for staging hostname only.
- HTTP redirects to HTTPS.
- certbot renewal dry run succeeds or is scheduled for follow-up.

No-Go:

- production hostname included in staging cert.
- certificate private key copied into repo, PR, ticket, chat, or log archive.

## 5. Frontend Public Env Evidence

Expected after HTTPS migration:

- `NEXT_PUBLIC_APP_URL` points to the HTTPS staging frontend origin.
- `NEXT_PUBLIC_API_URL` points to the HTTPS staging API origin or the HTTPS staging origin that proxies `/api`.
- `NEXT_PUBLIC_SOCKET_API_URL` points to the HTTPS staging socket/API origin.
- `NEXT_PUBLIC_APP_ENV=staging`.
- BSC testnet RPC/explorer values remain staging-only and pass `apps/frontend/env.validation.test.mjs`.

No-Go:

- `http://<server-ip>` in any browser-facing public env.
- `localhost`, `127.0.0.1`, raw IP, production domain, or HTTP origin in browser-facing public env.
- any `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*ADMIN_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*HOT_WALLET`, or `NEXT_PUBLIC_*JWT`.

Evidence status: PENDING.

## 6. Backend Env Evidence

Expected after HTTPS migration:

- `BACKEND_APP_ENV` is set to `staging`.
- `BACKEND_CORS_ORIGINS` contains only HTTPS staging origin(s).
- `SESSION_SECRET` is present, but the value is never printed or recorded.
- `REQUEST_BODY_LIMIT` is `5mb` or lower.
- PR #56 runtime hardening is reflected in the deployed source.
- PR #57 Excel upload limit is reflected in the deployed source.

No-Go:

- missing `SESSION_SECRET`.
- hardcoded session fallback.
- raw IP, localhost, HTTP origin, or production hostname in `BACKEND_CORS_ORIGINS`.
- body limit higher than approved staging value.

Evidence status: PENDING.

## 7. Runtime Process Evidence

Expected:

| Check | Expected result |
| --- | --- |
| PM2 backend | online, running from GitHub checkout for checked commit. |
| PM2 frontend | online, running from GitHub checkout for checked commit. |
| PM2 startup | configured for staging server. |
| pm2-logrotate | installed/configured. |
| nginx | active. |
| nginx syntax | `sudo nginx -t` passes. |
| frontend HTTPS curl | returns expected staging response without cookies or secrets in evidence. |
| backend HTTPS curl | returns expected health or protected response without cookies or secrets in evidence. |
| browser check | HTTPS staging page loads; no raw IP fallback. |

Evidence status: PENDING.

## 8. No-Tx Smoke Rerun Evidence

Rerun no-tx smoke after HTTPS migration. Use `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md` as the source of truth.

Expected examples:

| Target | Method and path | Expected |
| --- | --- | --- |
| Direct NFT status update disabled | `PATCH /api/nft/<nft-id>` | `410 FEATURE_DISABLED` |
| Direct user illustration disabled | `POST /api/user/illustration` | `410 FEATURE_DISABLED` |
| Referral admin snapshot | `POST /api/referral/admin/run-snapshot` | `401` or `403` without admin auth |
| All-user ticket distribution | `POST /api/alluser/distribute/ticket` | `401` or `403` without admin auth |
| Admin NFT listing | `GET /api/admin/nfts` | `401` or `403` without admin auth |
| Admin ticket distribution listing | `GET /api/admin/ticket-distribution` | `401` or `403` without admin auth |
| Crash game disabled stub | `GET /api/crash/games` | `410 FEATURE_DISABLED` |

Rules:

- `POST /api/crash/games` must not be used as evidence because wrong-method `404` is not protection proof.
- `/crash/games` `404` is only old path absence evidence.
- `404` must not be treated as general protection success for other routes.
- no transaction, deploy, mint, transfer, or tier relayer tx checks are allowed before tBNB funding.

Evidence status: PENDING.

## 9. Secret Log Scan Evidence

Run secret log scan after PM2 flush/restart and no-tx smoke.

Scan targets:

- PM2 backend logs.
- PM2 frontend logs.
- nginx access/error logs.

Forbidden patterns include:

- `apikey=`
- `Authorization:`
- `Bearer`
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `PRIVATE_KEY`
- database URL schemes
- 64-hex private-key-like values
- cookies or session tokens

Record:

- PASS/FAIL and sanitized counts only.
- no raw matching lines.
- no full logs.

Evidence status: PENDING.

## 10. Excel Upload Evidence

PR #57 reduced admin Excel upload limit to 10MB.

Expected human check after HTTPS migration:

- admin-authenticated Excel upload at or below 10MB behaves according to the admin flow.
- upload over 10MB is rejected.
- no unauthenticated upload route is introduced.
- test file contains no private user data or production data.

This check is not NFT minting, IPFS upload proof, or on-chain verification.

Evidence status: PENDING.

## 11. Tx Items Still Blocked

Because BNB/tBNB is not funded, the following remain BLOCKED and must not be marked PASS:

- FUNKY token BSC testnet deploy and verification.
- NFT contract BSC testnet deploy and verification.
- FunkyTierUpdater deploy and configuration.
- Prize draw with funded test wallet.
- Prize `sendToWallet` testnet transfer and receipt confirmation.
- Prize inventory reservation behavior under real tx completion.
- NFT mint testnet transaction.
- tier downgrade/reset transaction.
- governance/multisig/manual on-chain procedure verification.

## 12. Production Launch Status

Production launch approval: NO.

This report only defines the required evidence for HTTPS staging migration and records that the evidence has not yet been supplied to Codex. Production launch remains blocked until:

- all HTTPS staging evidence above is collected without secrets;
- no-tx smoke passes after HTTPS migration;
- secret log scan passes after HTTPS migration;
- tBNB-funded transaction checks pass on BSC testnet;
- production secret manager and deployment evidence are reviewed separately.

## 13. Next Human Actions

1. Complete DNS, nginx, certificate, PM2, frontend env, and backend env migration on the staging server.
2. Confirm the staging server runs the checked commit or later approved `main`.
3. Rerun frontend validation/build and backend health checks without printing env values.
4. Rerun no-tx smoke through HTTPS.
5. Rerun PM2/nginx secret log scan after PM2 flush/restart.
6. Verify Excel upload behavior for 10MB-or-less and above-10MB files using non-private test files.
7. Keep raw evidence outside git if it contains host-private details, logs, cookies, headers, or secret-like material.
8. Fund tBNB only after no-tx HTTPS staging evidence is clean, then start the tx verification runbook.
