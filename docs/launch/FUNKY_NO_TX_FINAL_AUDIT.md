# FUNKY-AUDIT-01 No-Tx Staging Code And Config Final Audit

Date: 2026-05-16 JST

Repository: `hiro4649/disco-funky-repair`

Checked commit: `60889ba6c50bc0b37b37076620d6582ec0c21fdb` (`docs: freeze no-tx staging status (#51)`)

This is a static no-tx audit. It does not send BSC testnet transactions, does not verify funded wallets, does not verify production secret-manager values, and is not production launch approval.

Code changes in this PR: none. This PR adds this documentation report only.

## Audit Targets

- Backend auth middleware: `apps/backend/src/app/config/passport.ts`
- Wallet signature login: `apps/backend/src/app/routes/auth.routes.ts`, `apps/backend/src/app/controllers/auth.controller.ts`
- API authorization routes/controllers under `apps/backend/src/app/routes` and selected controllers
- Disabled routes: Crash, user-manage, direct NFT status update, direct user illustration assignment
- Crash not-installed posture in backend and frontend source
- Frontend staging env validation: `apps/frontend/env.validation.mjs`, `apps/frontend/env.validation.test.mjs`
- Backend production env validation: `apps/backend/src/app/lib/validateEnvs.ts`, `apps/backend/src/app/config/env.ts`
- Explorer API key and raw URL logging paths under `apps/backend/src/app/lib`
- Prisma migration SQL encoding under `apps/backend/prisma/migrations`
- Staging runbooks:
  - `docs/launch/STAGING_NO_TX_FREEZE_REPORT.md`
  - `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md`
  - `docs/launch/STAGING_SERVER_SETUP_RUNBOOK.md`
  - `docs/launch/ENVIRONMENT_RUNBOOK.md`

## PASS

| Area | Static result | Evidence |
| --- | --- | --- |
| Wallet address only JWT issuance | PASS at code level | `/user/auth/nonce` and `/user/signup` are present in `auth.routes.ts`; `auth.controller.ts` creates a nonce, includes wallet/nonce/issuedAt/expiresAt in the message, verifies the signature with `verifyMessage`, consumes the nonce, and only then issues JWT. `auth.controller.test.ts` includes a wallet-only JWT rejection test. |
| AuthAdmin / Authenticate raw token logging | PASS at code level | `passport.ts` logs token/header presence booleans and error names, not raw Authorization headers, cookies, or JWT values. `passport.test.ts` checks raw admin/user token values are not logged or returned. |
| Admin/user mutation authorization | PASS at static route level | Prize admin, NFT admin, Trial NFT admin/template, ticket distribution, referral admin, lottery all-user distribution, and admin upload routes are protected by `AuthAdmin`; user-owned Prize/Illustration/Daily point/ticket/lottery/referral routes use `Authenticate`. |
| Body `adminKey` as admin substitute | PASS in audited route set | Static route search found admin mutation routes using `AuthAdmin`; no audited admin mutation path was accepted through body `adminKey` alone. |
| User-owned mutation owner checks | PASS at static route/controller level | Prize, Illustration/Daily point, ticket code, referral, lottery, and Trial NFT paths use authenticated `req.user.user_id` or compare route/body user IDs against it before mutation. |
| Disabled direct routes | PASS at code level | `PATCH /nft/:id` and `POST /user/illustration` return fixed `410 FEATURE_DISABLED`; user-manage deposit/withdraw/bet/cashout/balance/history routes return fixed disabled responses. |
| Crash game not installed for gameplay | PASS at code level | `crashGame.routes.ts` only exposes `GET /crash/games` as a fixed `410 FEATURE_DISABLED` stub. Static search found no `initCrashServer`, no `/crashx`, no `crashGame.controller`, and no `apps/frontend/src/components/CrashGame`. Frontend `/fan-games` calls `notFound()`. A small `CrashGameIcon` remains only as an icon component, not a gameplay route/component. |
| Crash smoke expected status | PASS in docs | `STAGING_NO_TX_SMOKE_RUNBOOK.md` and `STAGING_NO_TX_FREEZE_REPORT.md` require `GET /api/crash/games` -> `410 FEATURE_DISABLED`, reject using `POST /api/crash/games` as evidence, and limit `/crash/games` `404` to old-path absence only. |
| 404 handling | PASS in docs | The staging no-tx docs state that `404` must not be treated as general protection success because it can mean wrong path, wrong method, stripped `/api`, wrong host, old source, or missing deploy. |
| nginx `/api` proxy policy | PASS in docs | `STAGING_SERVER_SETUP_RUNBOOK.md` and `STAGING_NO_TX_SMOKE_RUNBOOK.md` document preserving the `/api` prefix and using `sudo nginx -t`. |
| Frontend staging env validation | PASS at code/test level | `env.validation.mjs` has explicit `NEXT_PUBLIC_APP_ENV=staging` mode. Staging requires BSC testnet-looking RPC values, rejects mainnet/Ethereum/Sepolia/Goerli/localhost/dummy/example/invalid values, and rejects `NEXT_PUBLIC_*PRIVATE_KEY`/secret-like names in every mode. |
| Frontend production env validation | PASS at code/test level | Production or unspecified mode rejects BSC testnet markers such as `prebsc`, `bsc-testnet`, `bnb-testnet`, Ethereum RPC, localhost, dummy, example, invalid URL, and public secret-like env names. |
| Frontend browser private key signing | PASS at static search level | Static search found no frontend reference to `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` outside validation/tests, no frontend `new Wallet(...)`, no direct `sendTransaction(...)`, and no browser governance write path in the searched frontend source. |
| Backend production env validation | PASS at code/test level | `validateEnvs.ts` requires production JWT, DB, API origins, RPC, explorer URL/key, chain ID `56`, token/NFT/tier addresses, prize hot wallet key, allowlist, and tier relayer key/updater address. It rejects placeholder/local/testnet/zero/test-key values. |
| Explorer API key runtime order | PASS for shared config helper | `config/env.ts` exports `ETHERSCAN_API_KEY` through `getPrimaryExplorerApiKey()`, and `explorerApiKeys.ts` uses the documented order: `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, `ETHERSCAN_API_KEY1`, `ETHERSCAN_API_KEY2`, `BSCSCAN_API_KEY1`, `BSCSCAN_API_KEY2`. |
| Ethereum mainnet explorer fallback | PASS in checked targeted file | `incrementalHoldingDateProcessor.ts` no longer has the old `https://api.etherscan.io/api?` fallback; production with missing `ETHERSCAN_API_URL` throws instead of silently using Ethereum mainnet. |
| Migration SQL BOM | PASS | Static byte check found no UTF-8 BOM in current `migration.sql` files. |
| Tx completion claims | PASS in docs | `STAGING_NO_TX_FREEZE_REPORT.md` keeps tx-based items incomplete until limited tBNB is funded and non-secret receipt evidence is saved outside git. |

## BLOCKED

| Area | Why blocked | Required evidence |
| --- | --- | --- |
| BSC testnet tx behavior | tBNB is not funded, so tx behavior cannot be proven. | Fund limited staging wallets, run testnet tx checks, and save non-secret tx hash/receipt metadata outside git. |
| Prize sendToWallet real receipt path | Static tests and no-tx smoke do not prove real BSC testnet transfer, receipt retry, or no-double-send behavior. | Execute Prize draw/send/receipt retry on BSC testnet with controlled staging wallets. |
| Prize inventory reservation on real tx | No-tx audit cannot prove inventory reservation/consumption against real chain receipt timing. | Run draw/reserve/send/retry scenarios after tBNB funding. |
| NFT contract and mint flow | Static code/docs cannot prove testnet deploy, mint enabled/disabled behavior, ownership, or metadata behavior. | Deploy/verify NFT contract on BSC testnet and record non-secret receipt evidence. |
| Tier reset/downgrade on-chain | Static code/docs cannot prove reason-coded tier reset/downgrade with a live contract. | Deploy/configure FunkyTierUpdater and run reason-coded sync on BSC testnet. |
| Production secret manager | No real secret-manager values were inspected, and none should be committed. | Human operator must verify required values exist, are separated by purpose, and no production secret is shared with staging. |
| Runtime PM2/nginx target | This audit reads repo files only; it cannot prove the staging server currently runs this commit. | Human operator must confirm PM2 cwd/script and nginx proxy targets point to the GitHub checkout at `60889ba` or later. |
| Runtime log scan | Static source search cannot prove current PM2 logs are clean after real restarts and failures. | Flush PM2 logs, restart with approved env, run smoke, scan recent logs, and record only PASS/FAIL plus sanitized metadata outside git. |

## NO-GO

The following are No-Go for production launch:

1. tBNB-funded transaction verification is incomplete.
2. Production secret-manager values, deploy source, PM2/nginx targets, backups, monitoring, and log rotation have not been human-verified for production.
3. Any staging or production log containing raw Authorization headers, JWTs, cookies, private keys, DB URLs, RPC URLs with query strings, or explorer/API-key-bearing URLs.
4. Static audit found explorer/API request paths that build URLs containing `apikey=` and then log raw error objects in nearby catch blocks. Examples include:
   - `apps/backend/src/app/lib/quicknodeRpcService.ts`
   - `apps/backend/src/app/lib/trackingTokenBalanceEthereum.ts`
   - `apps/backend/src/app/lib/trackingTokensEthereum.ts`
   - `apps/backend/src/app/lib/incrementalHoldingDateProcessor.ts`
   - `apps/backend/src/app/lib/realtimeHoldingDateUpdater.ts`

   The targeted raw `console.log(url)` regressions are gone, but raw error-object logging may still expose request config or URL details depending on the HTTP client/runtime error. Treat this as production No-Go until these paths are sanitized or a dedicated runtime failure-log proof shows no API-key-bearing URL can appear.
5. `apps/backend/src/app/controllers/nft.controller.ts` still logs a prefix of `NFT_STORAGE_API_KEY` as a known P1 log-hardening debt. Production logging should not print any secret prefix.
6. `apps/backend/src/app/lib/walletBalanceMonitor.ts` reads `ADMIN_PRIVATE_KEY` for monitoring. It is not an asset/governance tx signer in the audited P0 flow, but production must not inject a real admin private key unless this residual risk is explicitly accepted and documented by the human launch owner.
7. Any `404` is used as generic protection evidence. Only the specifically documented old Crash path or wrong-method Crash case may use `404` as absence/wrong-method evidence; disabled direct routes must show `410`, and protected admin/user routes must show `401` or `403`.

No production ready status is granted by this audit.

## tBNB Funding Wait Items

Do not mark these PASS before tBNB funding:

- FUNKY token BSC testnet deploy/verification transaction.
- NFT contract BSC testnet deploy/verification transaction.
- FunkyTierUpdater deploy/configuration transaction.
- Wallet signature login E2E through a real staging browser wallet flow.
- Prize draw, inventory reservation, sendToWallet testnet transfer, receipt retry, and double-send prevention.
- NFT mint enable/disable and public mint transaction.
- Tier reset/downgrade reason-coded transaction.
- Governance route disabled behavior while production-like staging contracts exist.
- BSC testnet tx receipt capture and external non-secret evidence storage.
- Contract ownership, relayer permissions, and multisig or approved temporary staging admin evidence.

## Staging Human Checks Still Required

- Confirm staging is deployed from commit `60889ba6c50bc0b37b37076620d6582ec0c21fdb` or a later approved main commit.
- Confirm PM2 backend/frontend processes are online and have cwd/script paths under the GitHub checkout, not `Rave_bk`, `var-www`, downloaded zips, desktop folders, or old source copies.
- Confirm `sudo nginx -t` passes and nginx preserves the `/api` prefix when proxying to backend.
- Confirm `GET /api/crash/games` returns `410 FEATURE_DISABLED`; do not use `POST /api/crash/games` as evidence.
- Confirm direct disabled routes return `410 FEATURE_DISABLED`.
- Confirm unauthenticated admin routes return `401` and normal user JWTs return `403` where appropriate.
- Confirm BSC testnet RPC reports chain ID `97`.
- Confirm Prisma migrations are applied and migration SQL remains UTF-8 without BOM.
- Confirm PM2 logs are flushed before smoke, then scanned after restart/smoke without recording raw secret-like matches in git.
- Confirm frontend build uses `NEXT_PUBLIC_APP_ENV=staging` and public staging URLs, not localhost browser-facing URLs.

## Next Post-tBNB Audit

After limited tBNB funding:

1. Re-run no-tx smoke first and confirm the freeze assumptions still hold.
2. Run wallet signature login E2E with a real staging wallet.
3. Deploy or verify BSC testnet FUNKY, NFT, and FunkyTierUpdater contracts.
4. Run Prize draw/sendToWallet/receipt retry/no-double-send checks and save non-secret receipts externally.
5. Run ticket code, lottery/ticket claim, Illustration draw, NFT mint, and tier downgrade/reset checks.
6. Confirm governance routes remain backend-disabled and do not broadcast tx.
7. Re-run secret log scan after tx failures and successes, recording only sanitized PASS/FAIL evidence.

## Commands Executed

```powershell
git switch -C codex/funky-no-tx-final-audit origin/main
git log -1 --pretty=format:"%H %s"
rg -n "nonce|signature|verifyMessage|JWT|jwt|sign|wallet|wallet_address|walletAddress|Authenticate|AuthAdmin|adminKey|ADMIN_KEY" apps\backend\src\app\routes apps\backend\src\app\controllers apps\backend\src\app\middlewares apps\backend\src\app\config apps\backend\src\app\services -g '!**/*.map'
rg -n "crash|crashx|initCrashServer|CrashGame|fan-games" apps\backend\src apps\frontend\src docs\launch -g '!**/*.map'
rg -n "FEATURE_DISABLED|410|notFound\(|/api/crash/games|POST /api/crash/games|404|401|403|proxy_pass|sudo nginx -t|/api prefix|prefix" docs\launch apps\backend\src apps\frontend\src -g '!**/*.map'
rg -n "NEXT_PUBLIC_APP_ENV|NEXT_PUBLIC_RPC_URL|NEXT_PUBLIC_ALCHEMY_RPC_URL|PRIVATE_KEY|testnet|prebsc|bsc-testnet|bnb-testnet|sepolia|goerli|localhost|dummy|example" apps/frontend/env.validation.mjs apps/frontend/env.validation.test.mjs docs/launch/ENVIRONMENT_RUNBOOK.md
rg -n "validateEnvs|PRIZE_HOT_WALLET_PRIVATE_KEY|PRIZE_TRANSFER_TOKEN_ALLOWLIST|TIER_RELAYER_PRIVATE_KEY|TIER_UPDATER_CONTRACT_ADDRESS|ETHERSCAN_API_URL|BSCSCAN_API_KEY|JWT_SECRET|DATABASE_URL|production|placeholder|dummy|localhost" apps/backend/src/app/lib apps/backend/src/app/config docs/launch/ENVIRONMENT_RUNBOOK.md
Get-ChildItem apps\backend\prisma\migrations -Filter migration.sql -Recurse | ForEach-Object { $bytes=[System.IO.File]::ReadAllBytes($_.FullName); $rel=$_.FullName.Substring((Get-Location).Path.Length+1); "$rel HasBom=$($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)" }
rg -n "const url = .*apikey=|axios\.get\(url\)|fetch\(url\)|console\.error\(.*error\)|console\.log\(.*url|url:" apps/backend/src/app/lib/getToken.ts apps/backend/src/app/lib/quicknodeRpcService.ts apps/backend/src/app/lib/trackingTokenBalanceEthereum.ts apps/backend/src/app/lib/trackingTokensEthereum.ts apps/backend/src/app/lib/incrementalHoldingDateProcessor.ts apps/backend/src/app/lib/realtimeHoldingDateUpdater.ts
rg -n "NEXT_PUBLIC_ADMIN_PRIVATE_KEY|NEXT_PUBLIC_.*PRIVATE_KEY|new Wallet\(|sendTransaction\(|writeContract|update_fee|add_dex|remove_dex|setDefaultRoyalty|withdraw\(" apps/frontend/src apps/frontend/env.validation.mjs apps/frontend/env.validation.test.mjs
```

Additional check after staging this documentation file:

```powershell
git diff --cached --check
```

Result: PASS.
