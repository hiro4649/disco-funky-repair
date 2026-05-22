# FUNKY-AUDIT-07 Read And Privacy Route Exposure Audit

Status: GitHub source-wide static audit for read/privacy route exposure.

This audit reviews read-only, monitoring, static file, and frontend API call surfaces that may expose user, wallet, referral, NFT, Prize, ticket, admin, or operational information. It does not modify backend, frontend, contracts, schema, lockfiles, env files, or deployment configuration.

This is not production launch approval. The staging HTTPS domain is still pending, so do not casually `git pull` and `pm2 restart` staging with PR #56+ runtime strictness. BNB/tBNB is not funded, so tx, deploy, transfer, mint, and tier-relayer checks remain untested.

## 1. Checked Commit

Repository: `hiro4649/disco-funky-repair`

Checked main commit:

- `10eb615476757b3b6aca4a1d24ed374fe9bea1c7`
- Short SHA: `10eb615`
- Subject: `docs: add staging domain pending freeze note (#60)`

Audit date: `2026-05-16`

## 2. Audit Scope

Reviewed:

- `apps/backend/src/app/routes`
- `apps/backend/src/app/controllers`
- `apps/backend/src/app/middlewares`
- `apps/backend/src/app/config/passport.ts`
- `apps/backend/src/app/index.ts`
- `apps/frontend/src`
- `apps/frontend/utils`
- `docs/launch/API_AUTHORIZATION_AUDIT.md`
- `docs/launch/FUNKY_SOURCE_WIDE_FINAL_STATIC_AUDIT.md`

Not performed:

- no code changes;
- no staging deploy;
- no `git pull` / `pm2 restart` on staging;
- no tx checks;
- no contract deploy;
- no secret or raw env inspection.

## 3. Classification Rules Used

| Class | Meaning in this audit |
| --- | --- |
| P0 | Unauthenticated or normal-user access to all-user information, admin-equivalent information, secret-like operational information, or any path that can still mutate another user's data. |
| P1 | Other-user privacy reads, monitoring/read exposure, unclear public read endpoints, or static file surfaces that may overexpose uploaded operational files. |
| P2 | Display/API naming ambiguity, docs gap, or public read endpoint that appears low risk but should be clarified. |
| UNKNOWN | The code path needs product intent or runtime proof before classifying as safe. |

## 4. Route And Controller Inventory

### User / Admin User Routes

| Route | Middleware | Controller | Audit result |
| --- | --- | --- | --- |
| `GET /admin/seting/tokenbalance` | none | `UserController.getTokenBalance` | P0 candidate. Admin-named operational token balance read is unauthenticated. |
| `POST /admin/seting/tokenbalance` | `AuthAdmin` | `UserController.setTokenBalance` | Safe for mutation scope; admin auth required. |
| `GET /admin/user/all` | none | `UserController.getAllUserData` | P0 candidate. Returns all-user admin view including wallet, tickets, FanPoint, PrizeTransactions, LotteryTickets, ownedToken. |
| `GET /user/all` | none | `UserController.getAllUsers` | P0 candidate. Returns all-user wallet/ticket list without auth. |
| `GET /admin/user/transaction/:wallet_address` | none | `UserController.getUserPrizeTransaction` | P0 candidate. Admin-named arbitrary-wallet Prize transaction read is unauthenticated. |
| `GET /user/holding/average/:user_id` | `Authenticate` | `UserController.getAverageHoldingDate` | P1. Auth exists, but controller uses route `user_id` directly and does not compare to `req.user.user_id`. |
| `GET /user/holding/history/:user_id` | `Authenticate` | `UserController.getHoldDateHistory` | P1. Auth exists, but controller uses route `user_id` directly and does not compare to `req.user.user_id`. |
| `GET /user/point/history/:user_id` | `Authenticate` | `UserController.getUserPointHistory` | Safe for owner read; controller compares route user id to authenticated user. |
| `GET /user/daily/point/:user_id` | `Authenticate` | `UserController.getUserDailyPointBonus` | Safe for owner read; controller compares route user id to authenticated user. |
| `POST /user/daily/point/:user_id` | `Authenticate` | `UserController.setUserDailyPointBonus` | Safe for mutation scope; controller compares route user id to authenticated user. |
| `POST /user/info` | `Authenticate` | `UserController.getUserInfo` | P1. Auth exists, but controller reads body `user_id` and does not compare to `req.user.user_id`; exposes tickets, claimTickets, FanPoint, and token balances for arbitrary user id. |

Evidence:

- routes: `apps/backend/src/app/routes/user.routes.ts:9-23`
- all-user/admin reads: `apps/backend/src/app/controllers/users.controller.ts:27-132`
- owner-checked point reads: `apps/backend/src/app/controllers/users.controller.ts:146-180`, `401-440`
- holding reads without owner comparison: `apps/backend/src/app/controllers/users.controller.ts:182-310`
- body `user_id` read without owner comparison: `apps/backend/src/app/controllers/users.controller.ts:489-541`

### Referral Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| `GET /referral/referral-code/:walletAddress` | `Authenticate` | Safe for mutation/read scope; owner wallet comparison exists before referral code creation. |
| `POST /referral/track-referral` | `Authenticate` | Safe for mutation scope; authenticated user is loaded and body wallet mismatch is rejected. |
| `GET /referral/referral-stats/:walletAddress` | none | P1. Arbitrary wallet referral counts are public. |
| `GET /referral/referral-rewards/:walletAddress` | none | P1. Arbitrary wallet reward list includes referred wallet and created date. |
| `GET /referral/debug/referral-status/:walletAddress` | none | P1. Debug route reveals user existence, `referred_by`, related reward records, expiration status, and referrer/referred state. |
| `POST /referral/admin/run-snapshot` | `AuthAdmin` | Safe for admin mutation scope. |
| `POST /referral/admin/distribute-rewards` | `AuthAdmin` | Safe for admin mutation scope. |

Evidence:

- routes and inline logic: `apps/backend/src/app/routes/referral.routes.ts:38-369`

### Transaction / Holding Read Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| `GET /transaction-history/:walletAddress` | none | P1. Arbitrary wallet transaction classifications and summaries can be read. |
| `GET /holding-date/explain/:walletAddress` | none | P1. Arbitrary wallet holding-date calculation can be read; controller also logs wallet/user object candidates. |
| `GET /fifo-snapshot/:walletAddress` | none | P1. Arbitrary wallet FIFO active purchase queue, amounts, and tx hashes can be read. |
| `GET /transaction/:txHash` | none | P1. Arbitrary transaction audit detail includes user wallet and holdingDate. |
| `GET /transaction-types` | none | Safe public reference data. |

Evidence:

- routes: `apps/backend/src/app/routes/transactionHistory.routes.ts:14-39`
- controller reads: `apps/backend/src/app/controllers/transactionHistoryController.ts:22-306`

### Monitoring / Operational Read Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| `GET /monitoring/realtime-status` | none | P1. Exposes websocket/RPC health and reconnect attempts. |
| `GET /monitoring/quicknode-status` | none | P1. Exposes QuickNode credit usage, limits, projected usage, warnings, and background job state. |
| `GET /monitoring/service-health` | none | P2/P1. Simple service health is useful for uptime, but public exposure should be explicitly intended. |
| `GET /monitoring/healthcheck` | none | P2. Healthcheck can remain public if intentionally used by external monitoring; document expected fields. |
| `POST /monitoring/run-daily-batch` | `AuthAdmin` | Safe for admin mutation scope. |

Evidence:

- routes and inline handlers: `apps/backend/src/app/routes/monitoring.routes.ts:22-179`

### Prize Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| `GET /admin/airdrop/prize` and `GET /admin/airdrop/prize/:prize_id` | `AuthAdmin` | Safe for admin read scope. |
| Prize admin create/update/delete/cancel/fail | `AuthAdmin` | Safe for admin mutation scope. |
| `GET /airdrop/prize` | none | P2/UNKNOWN. Public prize catalog is likely intended, but response includes token detail and Prize configuration fields; confirm intended public fields. |
| User Prize draw/history/send/withdraw routes | `Authenticate` | Safe for mutation/owner scope based on P0-12E and controller owner checks. |

Evidence:

- routes: `apps/backend/src/app/routes/prize.routes.ts:9-22`
- public prize catalog: `apps/backend/src/app/controllers/prize.controller.ts:400-433`
- owner transaction read/send: `apps/backend/src/app/controllers/prize.controller.ts:820-948`

### NFT / Trial NFT Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| NFT admin upload/read/delete routes | `AuthAdmin` | Safe for admin route scope; upload middleware is after `AuthAdmin`. |
| `GET /nfts/mintable` | none | P2/UNKNOWN. Public mintable catalog may be intended; confirm public fields and BSC MVP behavior. |
| `GET /nft/:id` | none | P2/UNKNOWN. Public NFT metadata for minting may be intended; confirm public fields. |
| `GET /nfts/holder/:holderId` | none | P1. Arbitrary holder ID collection read exposes holder NFT list. |
| `PATCH /nft/:id` | fixed `410` | Safe for disabled direct mint status update. |
| `GET /trial-nfts/can-claim/:userId` | none | P1. Arbitrary user claim eligibility and existing trial NFT state can be read. |
| `GET /trial-nfts/user/:userId` | none | P1. Arbitrary user's active trial NFTs can be read. |
| `GET /trial-nfts/total/:userId` | none | P1. Arbitrary user's real and trial NFT count can be read. |
| Trial NFT claim | `Authenticate` | Safe for mutation scope; controller compares route user id to authenticated user. |
| Trial NFT admin/template admin routes | `AuthAdmin` | Safe for admin route scope. |
| `GET /trial-nft-templates/available` | none | Safe/P2. Public available template catalog appears intended; confirm public fields. |

Evidence:

- NFT routes: `apps/backend/src/app/routes/nft.routes.ts:23-64`
- NFT public controller fields: `apps/backend/src/app/controllers/nft.controller.ts:671-802`
- Trial NFT routes: `apps/backend/src/app/routes/trialNft.routes.ts:12-34`
- Trial NFT public controllers: `apps/backend/src/app/controllers/trialNft.controller.ts:29-202`
- Trial NFT template routes: `apps/backend/src/app/routes/trialNftTemplate.routes.ts:17-36`

### Illustration / Ticket / Lottery Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| Illustration create/update/delete | `AuthAdmin` | Safe for admin mutation scope. |
| `GET /admin/illustration` | none | P1/P2. Admin-named list is public; if same as public catalog, rename or document. |
| `GET /illustration/:id`, `GET /illustration/rarity/:rarity` | none | Safe/P2. Public illustration catalog appears intended; confirm fields. |
| `GET /user/:userId/illustrations` | `Authenticate` | Safe for owner read; controller checks route user id. |
| `POST /user/illustration` | fixed `410` | Safe disabled route. |
| `POST /user/:userId/draw-illustration` | `Authenticate` | Safe for mutation scope; owner and ticket transaction checks were previously fixed. |
| lottery user ticket/balance/date/count reads | `Authenticate` | Safe for owner scope; controller checks route user id. |
| `GET /lottery/update-status` | none | P2/P1. Public batch-running status; likely operational read exposure. |
| ticket-code admin routes | `AuthAdmin` | Safe for admin route scope. |
| ticket-code claim | `Authenticate` | Safe for mutation scope after P0-05/P0-12G. |
| ticket distribution admin routes | `AuthAdmin` | Safe for admin route scope. |

Evidence:

- illustration routes: `apps/backend/src/app/routes/illustration.routes.ts:18-28`
- owner check: `apps/backend/src/app/controllers/illustration.controller.ts:160-190`
- lottery routes: `apps/backend/src/app/routes/lottery.routes.ts:9-20`
- lottery owner checks: `apps/backend/src/app/controllers/lotter.controller.ts:28-132`, `209-278`, `373-427`
- ticket code routes: `apps/backend/src/app/routes/ticketCodeRoutes.ts:15-22`
- ticket distribution routes: `apps/backend/src/app/routes/ticket-distribution.routes.ts:9-13`

### DEX / Fee / Governance Read Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| `GET /dex/list` | none | P1. Operational DEX list includes `addedBy`, `txHash`, timestamps. |
| `GET /fee/history` | none | P1. Fee history includes `changedBy`, `txHash`, holdingDate, old/new values. |
| `GET /fee/current` | none | P1/P2. Current fee settings may be public tokenomics info, but should be documented. |
| `POST /dex/add`, `DELETE /dex/remove/:address`, `POST /fee/record` | none route-level, fixed `410` controller | Safe for mutation scope because controller returns manual-review disabled response; route-level admin auth still cleaner. |

Evidence:

- routes: `apps/backend/src/app/routes/dexFee.routes.ts:8-15`
- disabled writes and read fields: `apps/backend/src/app/controllers/dexFeeController.ts:12-146`

### News Routes

| Route | Middleware | Audit result |
| --- | --- | --- |
| `POST/PATCH/DELETE /admin/news` | `AuthAdmin` | Safe for mutation scope. |
| `GET /admin/news` | none | P2/UNKNOWN. Admin-named list is public; likely intended as news list but should be renamed or protected. |
| `GET /news/:id` | none | Safe public read. |

Evidence:

- routes: `apps/backend/src/app/routes/news.routes.ts:9-13`

### Static File Serving

| Surface | Audit result |
| --- | --- |
| `app.use(express.static(uploadsPath))` | P1/UNKNOWN. Entire `uploads` root is publicly served. This may expose more than intended, including Excel upload directories or temp metadata if present. |
| `app.use('/api/icons', express.static(uploadsPath))` | P1/UNKNOWN. Public serving from uploads root supports icon/image URLs but should be narrowed to intended image/icon directories. |

Evidence:

- static setup: `apps/backend/src/app/index.ts:68-79`
- NFT uploaded image paths: `apps/backend/src/app/controllers/nft.controller.ts:594-624`

### Frontend API Call Review

| Frontend area | Audit result |
| --- | --- |
| Normal user auth flow | Safe for P0 login scope. `AuthContext` uses nonce request and wallet signature before `/user/signup`. |
| Normal user dashboard/lottery components | P0/P1 support evidence. Public UI calls admin-named `/admin/seting/tokenbalance` from normal user surfaces (`Dashboard`, `LotteryTicketCalendar`, `NotEnoughTicketsModal`), matching backend unauthenticated read exposure. |
| Referral context | P1. Calls public referral stats by wallet address. Mutation `track-referral` uses authenticated flow, but stats/rewards privacy remains. |
| Transaction services | P1. Calls wallet/txHash read routes without owner proof in backend. |
| Admin pages | Mostly dependent on backend `AuthAdmin`; however some components use global `axios` or `fetch` instead of `apiClient`. Static audit cannot prove browser headers/cookies are consistently attached. |
| Official NFT UI | P2. Still calls disabled `PATCH /api/nft/:id`; backend returns `410`, so this is UX/cleanup rather than privacy mutation. |

Evidence:

- frontend API grep: `apiClient.(get|post|patch|delete|put)`, `axios.(...)`, `fetch(...)` in `apps/frontend/src` and `apps/frontend/utils`
- normal user admin-tokenbalance calls: `apps/frontend/src/components/Dashboard/Dashboard.tsx:163`, `apps/frontend/src/components/Lottery/LotteryTicketCalendar.tsx:67`, `apps/frontend/src/components/Lottery/NotEnoughTicketsModal.tsx:22`
- transaction service wallet routes: `apps/frontend/src/services/transactionService.ts:30-92`
- referral context routes: `apps/frontend/src/context/ReferralContext.tsx:47-96`

## 5. Safe / Acceptable In This Audit

These routes were treated as safe for this read/privacy audit or already covered by prior P0 fixes:

- wallet nonce + signature login path;
- `Authenticate` + owner-checked user mutations;
- Prize user draw/history/send/withdraw owner paths;
- ticket code claim;
- lottery claim and owner ticket reads;
- illustration draw/history owner paths;
- direct `/user/illustration` disabled `410`;
- direct `PATCH /nft/:id` disabled `410`;
- Crash game disabled `GET /api/crash/games` `410`;
- user-manage disabled `410`;
- admin mutation routes that require `AuthAdmin`;
- upload routes where `AuthAdmin` precedes multer middleware;
- transaction-type reference route.

Safe does not mean production ready; staging smoke and HTTPS domain migration are still pending.

## 6. P0 Candidates

| Priority | Route / surface | Reason | Suggested fix |
| --- | --- | --- | --- |
| P0 | `GET /admin/user/all` | Unauthenticated all-user admin view exposes wallet, tickets, FanPoint, PrizeTransactions, LotteryTickets, ownedToken. | Require `AuthAdmin`; consider response minimization. |
| P0 | `GET /user/all` | Unauthenticated all-user wallet/ticket list. | Require `AuthAdmin` or remove from public MVP. |
| P0 | `GET /admin/user/transaction/:wallet_address` | Unauthenticated arbitrary-wallet Prize transaction read under admin namespace. | Require `AuthAdmin`; if user-facing, add owner route using `req.user.user_id`. |
| P0 | `GET /admin/seting/tokenbalance` | Unauthenticated admin-named operational token balance read; public frontend also calls it from normal user UI. | Require `AuthAdmin` or replace with a public sanitized endpoint if needed. |

No unauthenticated mutation route was newly confirmed in this audit, aside from routes already fixed/disabled in prior P0 work.

## 7. P1 Candidates

| Area | Route / surface | Reason | Suggested fix |
| --- | --- | --- | --- |
| User privacy | `POST /user/info` | Authenticated user can request another user's `user_id` and read tickets, claimTickets, FanPoint, and token balances. | Ignore body `user_id`; use `req.user.user_id`. |
| User privacy | `GET /user/holding/average/:user_id`, `/user/holding/history/:user_id` | Authenticated user can read another route `user_id` because controller does not owner-check. | Add route user id equality check. |
| Referral privacy | `/referral/referral-stats/:walletAddress`, `/referral/referral-rewards/:walletAddress`, `/referral/debug/referral-status/:walletAddress` | Arbitrary wallet referral state and reward records are public. | Require owner `Authenticate` or `AuthAdmin`; remove debug route from public runtime. |
| Transaction privacy | `/transaction-history/:walletAddress`, `/holding-date/explain/:walletAddress`, `/fifo-snapshot/:walletAddress`, `/transaction/:txHash` | Arbitrary wallet/txHash holding and transaction details are public. | Require owner wallet check or `AuthAdmin`; keep `/transaction-types` public. |
| Trial NFT privacy | `/trial-nfts/can-claim/:userId`, `/trial-nfts/user/:userId`, `/trial-nfts/total/:userId` | Arbitrary user's claim eligibility, active trial NFTs, and NFT counts are public. | Require owner `Authenticate` or expose only public aggregate fields. |
| NFT privacy | `/nfts/holder/:holderId` | Arbitrary holder collection read. | Require owner check or explicitly document as public collection gallery. |
| Monitoring | `/monitoring/realtime-status`, `/monitoring/quicknode-status` | Operational health, reconnect counts, credit usage, and projections are public. | Require `AuthAdmin` or reduce to sanitized public health. |
| Governance reads | `/dex/list`, `/fee/history` | Operational governance/fee metadata including txHash/changedBy is public. | Require `AuthAdmin` or publish a reduced public tokenomics endpoint. |
| Static file serving | `express.static(uploadsPath)` and `/api/icons` from uploads root | Publicly serves the entire uploads root, not only intended images/icons. | Restrict static serving to intended image/icon directories; keep Excel/temp files private. |

## 8. P2 Candidates

| Area | Reason |
| --- | --- |
| `GET /admin/illustration` | Admin-named read route is public; may be low risk if same as public catalog, but naming/access policy is unclear. |
| `GET /admin/news` | Admin-named news list is public; likely should be renamed to public news list or protected. |
| `GET /fee/current` | May be intended public tokenomics info; response should be explicitly documented. |
| `GET /monitoring/service-health`, `/monitoring/healthcheck` | Public healthcheck may be intended; fields should remain minimal and documented. |
| frontend admin layout/API usage | Some admin UI calls use `axios` or `fetch` directly. Backend auth is the source of truth, but frontend consistency should be cleaned up later. |
| disabled NFT PATCH UI call | Frontend still calls disabled `PATCH /api/nft/:id`; backend protects it with `410`, but UI should avoid dead flow. |

## 9. UNKNOWN

| Area | Why unknown |
| --- | --- |
| public Prize catalog field set | Product decision needed: current public response includes full Prize record plus tokenDetail. It may expose more than needed. |
| public NFT mintable metadata | Product decision needed: public minting/catalog behavior should define exactly which NFT fields are intended. |
| public Trial NFT templates | Product decision needed: available templates are probably public, but returned fields should be fixed. |
| static upload content on existing staging | Source shows uploads root is public, but actual staging file contents were not inspected because raw server evidence may contain private material. |

## 10. Next Small PR Proposals

Limit the next work to small PRs:

1. `P0-READ-01 Protect all-user/admin read routes`
   - Target: `/admin/user/all`, `/user/all`, `/admin/user/transaction/:wallet_address`, `/admin/seting/tokenbalance`.
   - Change: require `AuthAdmin`, or split safe public aggregate endpoint if public UI still needs token balance.
   - Reason: these four P0 candidates must be closed first as P0 before P1/P2 read/privacy cleanup starts.

2. `P1-READ-02 Owner-gate user/referral/transaction read routes`
   - Target: `/user/info`, holding reads, referral stats/rewards/debug, transaction history/explain/FIFO/detail.
   - Change: use `req.user.user_id` and DB wallet ownership; keep public reference route `/transaction-types`.
   - Reason: closes other-user privacy reads.

3. `P1-READ-03 Monitoring/static exposure reduction`
   - Target: monitoring read endpoints, DEX/fee reads, static `uploads` serving.
   - Change: require `AuthAdmin` or reduce public fields; serve only intended image/icon directories.
   - Reason: reduces operational and file exposure before production.

## 11. Staging / Tx Freeze Reminder

- Staging domain is still pending.
- Do not pull PR #56+ `main` into live staging and restart PM2 casually until the HTTPS staging domain and `BACKEND_CORS_ORIGINS` are ready.
- Do not put `http://<server-ip>`, localhost, or raw IP origins into `BACKEND_CORS_ORIGINS`.
- Do not remove `BACKEND_APP_ENV=staging` to bypass strict runtime.
- tBNB is not funded; tx checks remain blocked.
- Do not deploy contracts, send Prize transfers, mint NFTs, run tier tx, or mark tx items PASS.

## 12. Commands Executed

```powershell
git status --short --branch
git fetch origin
git rev-parse origin/main
git log -1 --oneline origin/main
git switch -c codex/funky-audit-07-read-privacy-route-audit origin/main
rg --files apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config
rg -n "router\.(get|post|put|patch|delete)" apps/backend/src/app/routes -g "*.ts"
rg -n "Authenticate|AuthAdmin|walletAddress|wallet_address|userId|user_id|holderId|prize_id|adminKey" apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config/passport.ts apps/backend/src/app/routes/utils.ts
rg -n "apiClient\.(get|post|patch|delete|put)|axios\.(get|post|patch|delete|put)|fetch\(" apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx"
Get-Content apps/backend/src/app/routes/user.routes.ts
Get-Content apps/backend/src/app/routes/transactionHistory.routes.ts
Get-Content apps/backend/src/app/routes/referral.routes.ts
Get-Content apps/backend/src/app/routes/monitoring.routes.ts
Get-Content apps/backend/src/app/routes/nft.routes.ts
Get-Content apps/backend/src/app/routes/illustration.routes.ts
Get-Content apps/backend/src/app/routes/lottery.routes.ts
Get-Content apps/backend/src/app/routes/ticketCodeRoutes.ts
Get-Content apps/backend/src/app/routes/dexFee.routes.ts
Get-Content apps/backend/src/app/routes/news.routes.ts
Get-Content apps/backend/src/app/routes/ticket-distribution.routes.ts
Get-Content apps/backend/src/app/routes/trialNft.routes.ts
Get-Content apps/backend/src/app/routes/trialNftTemplate.routes.ts
Get-Content apps/backend/src/app/routes/routes.ts
Get-Content apps/backend/src/app/controllers/users.controller.ts
Get-Content apps/backend/src/app/controllers/transactionHistoryController.ts
Get-Content apps/backend/src/app/controllers/dexFeeController.ts
Get-Content apps/backend/src/app/index.ts
git diff --check
```

## 13. Verification Result

- Code changes: none.
- Backend/frontend/contracts/schema/package-lock changes: none.
- `.env`, secret, API key, private key, DB connection information: not created, displayed, saved, or committed.
- `git diff --check`: pass.
- tx verification: not performed.
- production ready: no.
