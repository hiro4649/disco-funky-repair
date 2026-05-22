# Staging No-Tx Freeze Report

Status: FUNKY-STAGE-09 freeze before tBNB funding.

This report freezes the staging verification status that can be completed before BNB/tBNB funding. It is a documentation-only checkpoint. It does not run, complete, or approve any transaction-based verification and it is not production launch approval.

## 1. Checked Commit

Repository: `hiro4649/disco-funky-repair`

Checked main commit:

- `313043fe9996b64f57473fd4f6e9b727eecc3b8f`
- Short SHA: `313043f`
- Subject: `docs: refresh crash no-tx evidence (#50)`

Human operators must confirm the running staging server is deployed from this commit or a later approved main commit before using this report as the no-tx baseline.

## 2. PR #45 Through #50 Reflection

The following staging/no-tx items are reflected in the checked main commit:

| PR | Scope | Freeze status |
| --- | --- | --- |
| #45 | STAGE-07B frontend staging RPC validation | Reflected. Staging frontend validation requires BSC testnet-looking RPC values and rejects mainnet, Ethereum, localhost, dummy, example, invalid URL, and `NEXT_PUBLIC_*PRIVATE_KEY` style values. |
| #46 | P1-01 frontend staging `MISSING_MESSAGE` keys | Reflected. Known English staging message keys are added and the reported log noise should be reduced after frontend rebuild/restart. |
| #47 | FUNKY-STAGE-08 no-tx staging evidence consolidation | Reflected. Existing no-tx staging evidence is consolidated without recording secrets. |
| #48 | P1-02 no-tx smoke runbook hardening | Reflected. Route expectations, nginx `/api` prefix preservation, `sudo nginx -t`, secret log scan, and 404 handling are documented. |
| #49 | P1-03 Crash route/socket cleanup and smoke method | Reflected. Crash gameplay controller, `/crashx` startup path, and frontend Crash component are removed; only the fixed disabled API stub remains. |
| #50 | P1-04 Crash no-tx evidence refresh | Reflected. Crash evidence now requires `GET /api/crash/games` with `410 FEATURE_DISABLED`; wrong-method 404 is not accepted as evidence. |

## 3. Frozen No-Tx Scope

The following items are treated as complete for the no-tx staging phase, subject to humans keeping the external evidence store in sync with the checked commit:

| Area | Frozen no-tx status |
| --- | --- |
| staging source | GitHub clone of `hiro4649/disco-funky-repair`; no `Rave_bk`, `var-www`, downloaded zip, desktop copy, or old Sui/DISCO source as deploy source. |
| backend runtime | Backend is expected to be online under PM2 from the staging GitHub checkout. |
| frontend runtime | Frontend is expected to be online under PM2 from the staging GitHub checkout. |
| PM2 startup | PM2 auto-startup is expected to be configured and verified on the staging server. |
| PM2 log rotation | `pm2-logrotate` is expected to be installed/configured and checked on the staging server. |
| nginx | nginx is expected to be active, `sudo nginx -t` passes, and `/api` proxying preserves the `/api` prefix. |
| backend build/test | Backend build and tests are expected to have passed on staging for the checked source. |
| frontend build | Frontend build is expected to have passed on staging for the checked source. |
| frontend env validation | STAGE-07B staging mode is expected to validate BSC testnet public RPC settings and reject unsafe public env values. |
| Prisma migration | PostgreSQL baseline migration and Prisma Client generation are expected to have succeeded on staging. |
| BSC testnet RPC | The configured staging RPC is expected to return chain ID `97`. |
| no-tx smoke | Major disabled/admin no-auth routes are expected to return the documented `410` or `401` results without requiring funded wallets. |
| secret log scan | Current-window PM2 log scan after flush/restart is expected to show no raw secrets; raw matches must not be stored in git. |
| DB schema dump evidence | Schema dump evidence is stored outside git; this repo must not contain DB dump content or connection strings. |

This freeze does not prove transaction sending, receipt handling, on-chain ownership, token balances, or BSC testnet contract behavior.

## 4. No-Tx Route Expectations

Use `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md` for the repeatable command sequence. The freeze expectations are:

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

`404` must not be treated as general protection success. It can indicate a wrong path, wrong method, stripped `/api` prefix, wrong hostname, old source, missing deploy, or nginx mismatch.

Crash-specific 404 handling:

- `POST /api/crash/games` returning `404` is only a wrong-method result and must not be used as evidence.
- `/crash/games` returning `404` is acceptable only as old non-API path absence evidence.

## 5. Crash Game Freeze

Crash game is intentionally not installed for staging or production MVP gameplay.

Frozen expectations:

- `GET /api/crash/games` returns `410 FEATURE_DISABLED` through the fixed disabled API stub.
- `/crashx` is not registered by backend startup code.
- `initCrashServer` is absent from backend source/startup.
- `apps/backend/src/app/controllers/crashGame.controller.ts` is absent.
- `apps/frontend/src/components/CrashGame` is absent.
- frontend `/fan-games` remains a `notFound()` page.
- Sidebar and normal frontend navigation do not expose Fan Games / Crash.
- No Crash controller, socket event, DB update, balance update, ticket update, FanPoint update, or on-chain path is considered installed.

Suggested source checks:

```bash
rg -n "/crashx|initCrashServer|components\\CrashGame|components/CrashGame|crashGame.controller" apps/backend/src apps/frontend/src
rg -n "crashGameRoutes|crashGame\\.routes|FEATURE_DISABLED" apps/backend/src/app/routes/crashGame.routes.ts apps/backend/src/app/routes/routes.ts
```

Expected:

- First command returns no matches.
- Second command returns only the disabled stub and route mount.

## 6. Secret Log Scan Freeze

Secret log scan remains a no-tx requirement and must be repeated after any staging restart, redeploy, or env change.

Policy:

- Flush PM2 logs before the current smoke window.
- Restart backend and frontend with approved staging env injection.
- Run no-tx smoke.
- Scan recent backend/frontend PM2 logs.
- Do not paste raw matching log lines into git, PRs, tickets, or chat.
- Record only PASS/FAIL and sanitized metadata.

No-Go if logs expose:

- raw JWT
- Authorization header
- cookie value
- private key or seed phrase
- API key or explorer URL containing an API key
- DB URL
- RPC URL with query string
- secret-manager value

## 7. PM2, nginx, And Logrotate Freeze Checks

Humans should keep these non-secret checks in the external staging evidence store:

| Check | Expected |
| --- | --- |
| PM2 process list | Backend and frontend staging processes are online. |
| PM2 cwd/script | Processes point to the GitHub checkout for the checked commit. |
| PM2 startup | Auto-startup is configured for the staging server user/service. |
| PM2 restart policy | Processes restart on failure and do not point to old source folders. |
| pm2-logrotate | Log rotation module is installed/configured; log files are not allowed to grow without bounds. |
| nginx active | nginx service is active. |
| nginx syntax | `sudo nginx -t` passes. |
| nginx `/api` proxy | `/api` prefix is preserved when proxying to backend. |
| nginx source paths | No root/alias/proxy target points to `var-www`, `Rave_bk`, downloaded zips, desktop folders, or old source copies. |

Do not store full PM2 env output or full nginx config in git if it includes private hostnames or secrets.

## 8. DB Migration Freeze Checks

Humans should keep these non-secret checks in the external staging evidence store:

| Check | Expected |
| --- | --- |
| PostgreSQL target | Staging DB only, not production DB or production clone. |
| Prisma migration deploy | `npx prisma migrate deploy` has applied the baseline migration successfully. |
| Prisma migration status | `_prisma_migrations` is up to date for the checked commit. |
| Prisma Client | `npx prisma generate` has completed. |
| migration SQL encoding | migration SQL is UTF-8 without BOM. |
| schema dump | Schema-only dump or equivalent evidence is saved outside git with no connection string or row data. |

No application data dump, `DATABASE_URL`, user rows, wallet rows, ticket rows, NFT rows, or PrizeTransaction rows may be committed.

## 9. BSC Testnet RPC Freeze Checks

Humans should keep these non-secret checks in the external staging evidence store:

| Check | Expected |
| --- | --- |
| frontend staging validation | `NEXT_PUBLIC_APP_ENV=staging` accepts only BSC testnet-looking RPC and testnet explorer values. |
| RPC chain ID | The configured staging RPC returns chain ID `97`. |
| RPC secrecy | RPC URLs with keys or query strings are not stored in git, PRs, tickets, or chat. |
| production separation | Staging RPC and explorer values are not production mainnet values. |

Static URL validation does not cryptographically prove chain ID. Chain ID `97` must be checked against the actual configured staging RPC.

## 10. Tx Items Still Incomplete

The following remain intentionally incomplete because BNB/tBNB is not funded:

- FUNKY token BSC testnet deploy/verification transaction.
- NFT contract BSC testnet deploy/verification transaction.
- FunkyTierUpdater deploy/configuration transaction.
- Wallet signature login E2E that depends on the full staging browser/wallet flow.
- Prize draw plus on-chain sendToWallet testnet transaction.
- Prize receipt retry and double-send prevention on a real testnet tx.
- Prize reservation consumption after successful transfer.
- NFT mint enable/disable and public mint transaction.
- Tier downgrade/reset reason-coded transaction.
- Governance/manual multisig or temporary staging admin transaction.
- BSC testnet transaction receipt capture and external storage.
- Contract ownership, relayer permissions, and multisig or approved temporary staging admin evidence.

Do not mark these as passed until limited tBNB is funded and non-secret receipt evidence is saved outside git.

## 11. Resume After tBNB Funding

After staging wallets receive limited tBNB, resume in this order:

1. Confirm staging source is still at `313043f` or a later approved main commit.
2. Re-run no-tx smoke to ensure the freeze assumptions still hold.
3. Confirm staging secret manager values without printing them.
4. Confirm BSC testnet RPC chain ID `97`.
5. Fund only the required staging wallets with limited tBNB.
6. Deploy or verify BSC testnet FUNKY token and save non-secret receipt metadata outside git.
7. Deploy or verify BSC testnet NFT contract and save non-secret receipt metadata outside git.
8. Deploy/configure FunkyTierUpdater and save non-secret receipt metadata outside git.
9. Confirm prize hot wallet and tier relayer are separate staging wallets with minimum required funds.
10. Confirm `PRIZE_TRANSFER_TOKEN_ALLOWLIST` contains only approved BSC testnet token addresses.
11. Run wallet signature login smoke.
12. Run API authorization smoke with unauthenticated, normal user, and admin identities.
13. Run Prize draw, inventory reservation, sendToWallet, receipt retry, and no-double-send checks.
14. Run ticket code claim, lottery/ticket claim, and Illustration draw checks.
15. Run NFT mint checks and confirm direct `PATCH /nft/:id` remains disabled.
16. Run tier downgrade/reset checks with reason-coded sync.
17. Confirm governance routes remain backend-disabled and do not broadcast tx.
18. Save all tx receipts and decoded non-secret metadata outside git.

## 12. Next Human Actions

Before tBNB funding:

1. Confirm staging server is deployed from `313043f` or later.
2. Save the no-tx freeze commit, PM2/nginx/logrotate status, DB migration status, and chain ID `97` check in the external evidence store.
3. Re-run `GET /api/crash/games` and record `410 FEATURE_DISABLED`; do not use `POST /api/crash/games` as evidence.
4. Keep BNB/tBNB unfunded until the tx verification window is intentionally opened.
5. Prepare limited staging wallets and secret-manager entries without writing values into git.

After tBNB funding:

1. Follow the resume list in section 11.
2. Store receipts outside git.
3. Keep production launch blocked until all no-tx, tx, production secret-manager, deploy-source, backup/restore, monitoring/log-rotation, and human launch-owner checks are complete.

## 13. Production Boundary

This report freezes no-tx staging status only.

It is not:

- BSC testnet tx verification completion.
- production secret-manager approval.
- production deployment approval.
- production ready declaration.
- production launch approval.

Production launch remains blocked until the full staging/testnet/production checklist is complete and the human launch owner explicitly signs off.

## 14. Command Executed For This Report

| Command | Result |
| --- | --- |
| `git diff --check` | PASS |
| `git diff origin/main --check` | PASS |
