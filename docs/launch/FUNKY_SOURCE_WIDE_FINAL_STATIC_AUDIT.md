# FUNKY-AUDIT-04 GitHub Source-Wide No-Tx Final Static Audit

Date: 2026-05-16

Checked commit: `47b36c0a0263c8b36e076f84bb7ddb82670dc0ab` (`docs: add runtime log sanitize evidence (#54)`)

This is a source-wide static and local build/test audit of the GitHub `main` source before tBNB funding. It does not send BSC testnet transactions, does not deploy contracts, does not mint NFTs, does not call `sendToWallet` on-chain, does not inspect production secret-manager values, and is not production launch approval.

No backend, frontend, contract, Prisma schema, package-lock, or `.env` code was changed by this audit. The only intended change is this documentation file.

## Audit Targets

- `apps/backend`
- `apps/frontend`
- `contracts`
- `docs/launch`
- `docs/security/BSC_LAUNCH_P0_FIXES.md`
- `apps/backend/prisma`
- backend and frontend `package.json`
- frontend `next.config.mjs`
- contracts Hardhat config
- backend routes, controllers, middlewares, auth, env validation, and Explorer helpers
- frontend admin components, wallet/signature code, and env validation
- contract sources and contract tests

## Executed Search Commands

```powershell
rg -n "nonce|verifyMessage|jwt\.sign|issue|wallet_address|walletAddress" apps/backend/src/app/controllers/auth.controller.ts apps/backend/src/app/routes/auth.routes.ts apps/backend/src/app/controllers/__tests__/auth.controller.test.ts
rg -n "AuthAdmin|Authenticate|adminKey|req\.user\.user_id|routeUserIdMatchesAuthenticatedUser|where:\s*\{\s*id:.*userId|prize_id|holderId|wallet_address" apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config/passport.ts -g "*.ts"
rg -n "crashx|initCrashServer|CrashGame|crashGame\.controller|crashGame.routes|FEATURE_DISABLED|notFound\(\)|fan-games|Fan Games" apps/backend/src apps/frontend/src docs/launch -g "*.ts" -g "*.tsx" -g "*.md"
rg -n "NEXT_PUBLIC_.*PRIVATE_KEY|PRIVATE_KEY|new Wallet\(|sendTransaction\(|writeContract\(|NEXT_PUBLIC_RPC_URL|NEXT_PUBLIC_ALCHEMY_RPC_URL|NEXT_PUBLIC_APP_ENV|sepolia|goerli|prebsc|bsc-testnet|bnb-testnet" apps/frontend/env.validation.mjs apps/frontend/env.validation.test.mjs apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx" -g "*.mjs"
rg -n "safeLog|apikey=|console\.log\([^\n]*(url|apiUrl)|console\.(error|warn)\([^\n]*,\s*(error|err|parseError)\s*\)|console\.(error|warn)\(\s*(error|err|parseError)\s*\)|Authorization:|Bearer|DATABASE_URL|JWT_SECRET|SESSION_SECRET|PRIVATE_KEY" apps/backend/src/app -g "*.ts"
rg -n "validateEnvs|PRIZE_HOT_WALLET_PRIVATE_KEY|PRIZE_TRANSFER_TOKEN_ALLOWLIST|TIER_RELAYER_PRIVATE_KEY|TIER_UPDATER_CONTRACT_ADDRESS|ETHERSCAN_API_URL|BSCSCAN_API_KEY|JWT_SECRET|DATABASE_URL|production|placeholder|dummy|localhost" apps/backend/src/app/lib apps/backend/src/app/config docs/launch/ENVIRONMENT_RUNBOOK.md
rg -n "sendToWallet|transfer_amount|transfer_token_address|reserved_amount|reservation_released_at|BROADCASTED|MANUAL_REVIEW|READY|SENDING|RECEIVED" apps/backend/src/app/controllers apps/backend/src/app/services apps/backend/src/app/lib apps/backend/prisma/schema.prisma
rg -n "MAX_SUPPLY|mintEnabled|setMint|tokenURI|batchMint|onlyOwner|_safeMint|mint\(" contracts -g "*.sol" -g "*.ts"
rg -n "VALID_TIERS|syncHoldingDateWithReason|reasonCode|DOWNGRADE|REGULAR_SYNC|update_holding_date|holdingDate" contracts apps/backend/src/app/services apps/backend/src/app/lib -g "*.sol" -g "*.ts"
rg -n "MANUAL_REVIEW_REQUIRED|GOVERNANCE|update_fee|fee_recipient|add_factory|add_pair|set_fee_exempt|addDex|removeDex|recordFee|sendTransaction|new ethers\.Wallet" apps/backend/src/app -g "*.ts"
rg -n "server\.listen|http\.createServer|from './app'|from \"\./app\"" apps/backend/src -g "*.ts"
rg -n "SESSION_SECRET|allowedOrigins|FRONTEND_APP_URL|BACKEND_API_URL|CORS|suiet|localhost|153\.127" apps/backend/src/app apps/backend/src apps/backend/src/app/lib/validateEnvs.ts docs/launch/ENVIRONMENT_RUNBOOK.md
Get-ChildItem apps\backend\prisma\migrations -Filter migration.sql -Recurse | ForEach-Object { $bytes=[System.IO.File]::ReadAllBytes($_.FullName); $rel=$_.FullName.Substring((Get-Location).Path.Length+1); "$rel HasBom=$($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)" }
cd apps/backend && npx prisma validate
cd apps/backend && rg -n "^model\s+|^enum\s+" prisma\schema.prisma
cd apps/backend && Select-String -Path prisma\migrations\*\migration.sql -Pattern 'CREATE TABLE|CREATE TYPE|wallet_login_nonces|transfer_token_address|transfer_amount|reservation_released_at|reserved_amount'
```

## PASS

| Area | Verdict | Evidence |
| --- | --- | --- |
| Wallet signature login | PASS | `apps/backend/src/app/routes/auth.routes.ts` exposes nonce issuance, and `apps/backend/src/app/controllers/auth.controller.ts` verifies `verifyMessage`, wallet address, nonce hash, expiry, and one-time consumption before JWT issuance. `auth.controller.test.ts` includes the wallet-address-only rejection and nonce replay tests. |
| JWT middleware identity check | PASS | `apps/backend/src/app/config/passport.ts` resolves JWT to DB user/admin, compares wallet address for users, and avoids logging raw token/header values. |
| Major mutation route authorization | PASS at static/test level | Prize, Illustration/Daily point, ticket/lottery, referral, ticket distribution, NFT/Trial NFT, and Prize admin mutations use `Authenticate` or `AuthAdmin`, with route tests for legacy `adminKey` bypass rejection. |
| User-owned mutation ownership | PASS at static/test level | Prize, Illustration, lottery/ticket, trial NFT, referral, ticket-code, and user point paths use `req.user.user_id` or route/body user-id equality checks rather than trusting body wallet/user fields alone. |
| Crash game MVP exclusion | PASS | `GET /api/crash/games` is a fixed `410 FEATURE_DISABLED` stub. Static search found no `initCrashServer`, no `/crashx`, no `crashGame.controller`, and no old `apps/frontend/src/components/CrashGame`. Frontend `/fan-games` calls `notFound()`. |
| Disabled/protected route documentation | PASS | `STAGING_NO_TX_SMOKE_RUNBOOK.md` and `STAGING_NO_TX_FREEZE_REPORT.md` require `410 FEATURE_DISABLED` for disabled direct routes, `401/403` for protected admin routes, and explicitly reject treating generic `404` as protection evidence. |
| Frontend public env validation | PASS | `apps/frontend/env.validation.mjs` and `env.validation.test.mjs` reject `NEXT_PUBLIC_*PRIVATE_KEY` and secret-like public env in every mode; staging only allows BSC-testnet-looking RPC values; production/default rejects testnet markers, dummy/example/localhost, and invalid URLs. |
| Frontend browser admin signing | PASS at static search level | Static search found no active frontend `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` usage outside validation/tests, no frontend `new Wallet(...)`, no direct `sendTransaction(...)`, and no browser-side governance write path in searched source. |
| Backend production env validation | PASS with residual gaps below | `apps/backend/src/app/lib/validateEnvs.ts` requires core production JWT, DB, BSC RPC, Explorer URL/key, BSC chain ID, contract addresses, Prize hot-wallet key, Prize allowlist, tier relayer key, and tier updater address. It rejects placeholder/local/testnet/zero/test-key values. |
| Explorer key validation/runtime consistency | PASS | `explorerApiKeys.ts`, `dualApiKeyManager.ts`, and `validateEnvs.ts` share the `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, and numbered fallback order. No `apikey=undefined` behavior was found in the checked helper path. |
| Targeted Explorer/RPC/IPFS log hardening | PASS at code/test level | `safeLogger.ts` is used in the known Explorer/RPC/IPFS failure paths covered by PR #53. `secretLogging.test.ts` verifies URL/API-key/token redaction and absence of previous raw URL log statements. |
| Prisma migration SQL BOM | PASS | Both `migration.sql` files returned `HasBom=False`. |
| Prize transfer state and inventory controls | PASS at static/test level | `PrizeTransaction` stores `transfer_token_address`, `transfer_amount`, `reservation_released_at`; send flow checks `READY -> SENDING`, does not recalculate amount from latest Prize data, uses fixed transfer values, and reservation tests cover draw race, send success, retry, expiry/cancel/FAILED release paths. |
| Governance / fee / DEX backend writes | PASS for direct tx prevention | `dexFeeController.ts` and `tokenManagementService.ts` return `410` / `MANUAL_REVIEW_REQUIRED` for backend governance write attempts rather than sending fee/DEX/pair txs. |
| NFT contract mint controls | PASS at static/test level | `contracts/funky-nft/funky-nft.sol` has `MAX_SUPPLY`, `mintEnabled`, owner-only sale/base URI controls, public mint to `msg.sender`, and no user-supplied public tokenURI. Hardhat NFT tests pass. |
| Tier reset/downgrade controls | PASS at static/test level | `contracts/funky/funky.sol`, `FunkyTierUpdater.sol`, backend `tierSync.ts`, and tests preserve valid tiers and reason-coded downgrade/reset paths while regular sync downgrade is rejected. |

## BLOCKED

| Area | Reason |
| --- | --- |
| BSC testnet tx behavior | tBNB is not funded; Prize transfer, NFT mint, tier relayer tx, contract deploy/configure, and real receipt retry cannot be proven. |
| Runtime PM2/nginx source proof | This audit reads the GitHub checkout only. Human operators must prove PM2 cwd/script and nginx proxy targets point to the approved GitHub commit and preserve `/api`. |
| Runtime log proof | `FUNKY_RUNTIME_LOG_SANITIZE_EVIDENCE.md` records the scan procedure, but raw staging PM2/nginx logs are external and were not available in this workspace. |
| Production secret manager | Real secret-manager values were not inspected and must not be committed. Human operators must verify separation, presence, and no production/staging sharing. |
| Browser wallet E2E | Static tests prove backend signature verification behavior, but a real staging browser-wallet nonce/signature/login flow still needs external evidence. |

## UNKNOWN

| Area | Reason |
| --- | --- |
| `schema.prisma` and migration baseline full equivalence | Full equivalence is UNKNOWN in this source-wide static audit. Static checks confirmed the migration set contains `20260515053000_baseline_current_schema` plus `20260515071000_add_wallet_login_nonces`, the P0 schema fields such as `reserved_amount`, `transfer_token_address`, `transfer_amount`, and `reservation_released_at` are present in migration SQL, and `WalletLoginNonce` exists as a follow-up migration. However, `npx prisma validate` could not run in this workspace because `DATABASE_URL` is not set, and no throwaway/shadow database diff was executed because this audit must not create, display, or store DB connection information. Staging DB `migrate deploy` is recorded in staging docs, but this source-wide audit did not inspect the staging DB itself. No DB schema change or new migration was made in this PR. |

## NO-GO

Production launch remains blocked. In addition to the external BLOCKED items above, the following source-wide static findings must be resolved or explicitly risk-accepted before production launch:

| Item | Verdict | Evidence |
| --- | --- | --- |
| Backend entrypoint/listen ambiguity | NO-GO | `apps/backend/src/app/index.ts` creates an HTTP server and calls `server.listen(...)`; `apps/backend/src/main.ts` imports `./app`, creates another server, and also calls `server.listen(...)`. `STAGING_SERVER_SETUP_RUNBOOK.md` tells PM2 to start `dist/src/main.js`. This conflicts with the intended single-listen startup model and must be corrected or proven by runtime evidence before production. |
| Production session secret fallback | NO-GO | `apps/backend/src/app/middlewares/security.ts` uses `process.env.SESSION_SECRET || 'supersecret_session_key_should_be_in_env'`, while `validateEnvs.ts` does not require `SESSION_SECRET` in production. Production must fail fast instead of using a hardcoded session secret. |
| Production CORS/static origin config | NO-GO | `apps/backend/src/app/index.ts` hardcodes `allowedOrigins` including localhost and a raw IP, instead of validating and using production/staging env origins. This conflicts with production env/source-of-truth expectations. |
| Large request body limit | NO-GO | `apps/backend/src/app/index.ts` allows `express.json({ limit: "1gb" })` and URL-encoded `1gb`; this is too large for a public crypto service unless deliberately justified and protected. |

No production ready status is granted by this audit.

## P1 Candidates

| Candidate | Why |
| --- | --- |
| P1-SEC-LOG: source-wide raw error logging cleanup | Static search still finds generic `console.error(..., error)` and `console.warn(..., error)` outside the targeted Explorer/RPC/IPFS paths. These are not all proven secret leaks, but should be converted to safe metadata logging before production hardening is considered complete. |
| P1-READ-AUTH: read/privacy route tightening | Several read routes remain unauthenticated or public despite admin-like naming or wallet-specific data, including `GET /admin/user/all`, `GET /admin/user/transaction/:wallet_address`, transaction-history wallet routes, and monitoring status routes. Treat as privacy/ops exposure unless intentionally public. |
| P1-DEPLOY-CONFIG: deployment config cleanup | Hardhat configs contain default public BSC RPC fallbacks and `PRIVATE_KEY` account wiring for deploy scripts, while frontend admin UI still has stale Sepolia explorer links/import traces. This is not a no-tx code mutation failure, but it can confuse staging/production verification. |

## tBNB Funding Wait Items

Do not mark these PASS until limited staging tBNB is funded and non-secret receipt evidence is stored outside git:

1. FUNKY token BSC testnet deploy/verification.
2. NFT contract BSC testnet deploy/verification.
3. FunkyTierUpdater BSC testnet deploy/configuration.
4. Prize draw plus `sendToWallet` testnet transfer.
5. Prize receipt retry and no-double-send behavior against a real tx.
6. Prize inventory reservation and release behavior across actual tx success/failure boundaries.
7. NFT mint enable/disable and metadata behavior on BSC testnet.
8. Tier downgrade/reset reason-code sync against deployed contracts.
9. Governance route disabled behavior with production-like staging contracts.
10. Post-tx PM2/nginx secret log scan.

## Production Launch Blockers

Production launch is not allowed until:

1. The NO-GO source findings above are fixed or formally risk-accepted by the launch owner.
2. All tBNB wait items have non-secret BSC testnet evidence.
3. Runtime PM2/nginx evidence proves the server runs from the approved GitHub commit and not `Rave_bk`, `var-www`, local desktop copies, old zips, or old Sui/DISCO source.
4. Production secret-manager values are verified by humans without printing or committing them.
5. Runtime log scans after no-tx and tx flows show no raw Authorization header, JWT, cookie, private key, DB URL, RPC URL with query string, or Explorer/API-key-bearing URL.
6. Backup/restore, monitoring, log rotation, and rollback evidence are complete.

## Next Repair PR Suggestions

Maximum three:

1. **FUNKY-P0-RUNTIME-01**: fix backend startup to one server/listen path, align PM2 runbook with actual entrypoint, and add a minimal startup smoke test or script check.
2. **FUNKY-P0-ENV-02**: require `SESSION_SECRET`, remove hardcoded session fallback, make cookie domain and CORS origins env-driven and production-validated, and reduce/request-validate body size limits.
3. **FUNKY-P1-READ-LOG-03**: tighten read/privacy routes and convert remaining generic raw error logging to safe metadata logging.

## Executed Verification Commands

```powershell
cd apps/backend && npm run build
cd apps/backend && npm test -- --runInBand
cd apps/frontend && node env.validation.test.mjs
cd apps/frontend && npm run build
cd contracts && npx hardhat compile
cd contracts && npx hardhat test
cd contracts && npm run compile:nft
cd contracts && npm run test:nft
cd apps/backend && npx prisma validate
git diff --check
```

## Verification Results

| Command | Result |
| --- | --- |
| `cd apps/backend && npm run build` | PASS |
| `cd apps/backend && npm test -- --runInBand` | PASS: 24 suites, 199 tests |
| `cd apps/frontend && node env.validation.test.mjs` | PASS |
| `cd apps/frontend && npm run build` | PASS; emitted safe disabled-env warning for missing production public env and a Browserslist age warning |
| `cd contracts && npx hardhat compile` | PASS |
| `cd contracts && npx hardhat test` | PASS: 34 passing, 16 pending |
| `cd contracts && npm run compile:nft` | PASS |
| `cd contracts && npm run test:nft` | PASS: 16 passing |
| `cd apps/backend && npx prisma validate` | BLOCKED: `DATABASE_URL` is not set in this workspace; no dummy or real DB URL was created for this docs-only audit |
| `git diff --check` | PASS |
