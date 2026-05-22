# API Authorization Audit

## P0-FINAL-2 API Authorization Re-Audit

Date: 2026-05-15 JST

Checked commit: `54a76e59b1e11646108b89d43bafa32fbe53b628` (`54a76e5 P0-13C BSC production env safety (#34)`)

Scope: static re-audit after P0-12B through P0-12K and P0-13A. This section is the latest status and supersedes older historical sections below. No backend/frontend/contracts code was changed for this audit.

### Closed API Authorization P0

| Area | Status | Evidence |
| --- | --- | --- |
| Wallet login | CLOSED | `apps/backend/src/app/routes/auth.routes.ts` exposes `/user/auth/nonce` and `/user/signup`; `apps/backend/src/app/controllers/auth.controller.ts` requires signed nonce message before JWT issuance. |
| Referral normal API | CLOSED | `apps/backend/src/app/routes/referral.routes.ts` requires `Authenticate` for `/referral-code/:walletAddress` and `/track-referral`; controller logic uses authenticated user context before DB update. |
| Referral admin | CLOSED | Snapshot and reward distribution routes require `AuthAdmin`; body `ADMIN_KEY` is not a standalone admin path. |
| Prize user mutations | CLOSED | `apps/backend/src/app/routes/prize.routes.ts` requires `Authenticate` for draw, transaction history, send, and withdraw routes; controller paths use `req.user.user_id` and owner conditions for user-owned transactions. |
| Prize admin mutations | CLOSED | Prize create/update/delete/cancel/fail/admin listing routes require `AuthAdmin`. |
| Illustration and daily point mutations | CLOSED | Draw and daily point mutation routes require `Authenticate`; disabled direct assignment remains `410 FEATURE_DISABLED`; controllers compare route/body user IDs to `req.user.user_id`. |
| Ticket code and lottery user routes | CLOSED | Ticket claim and lottery claim/check routes require `Authenticate`; all-user ticket distribution requires `AuthAdmin`. |
| Ticket distribution admin | CLOSED | Ticket distribution create/list/detail/update/delete routes require `AuthAdmin`. |
| NFT admin and Trial NFT admin/template | CLOSED | NFT upload/delete/admin read routes and Trial NFT admin/template routes require `AuthAdmin`; upload middleware is after `AuthAdmin`. `PATCH /nft/:id` remains disabled. |
| Governance / fee / DEX / pair writes | CLOSED | Backend write routes return disabled/manual-review responses and do not execute on-chain governance transactions. |
| Crash game / user-manage MVP-excluded routes | CLOSED | Crash game, `/crashx`, `/fan-games`, and user-manage public flows remain disabled or unreachable. |
| Auth token logging | CLOSED | `apps/backend/src/app/config/passport.ts` logs token/header presence and safe error names only; raw JWT, Authorization header, and cookie values are not logged or returned. |

### Remaining API Authorization P0

No remaining API authorization P0 was found in this static re-audit.

This is not a production-ready assertion. Staging must still verify real cookies, headers, CORS/reverse proxy behavior, deploy source, and role-specific UI/API access.

### Staging Verification Pending

- Unauthenticated requests must be rejected for all user/admin mutation routes.
- Normal user JWT must be rejected for admin mutation routes.
- Admin JWT must be required for Prize admin, NFT admin, Trial NFT admin/template, ticket distribution, referral admin, and monitoring batch routes.
- User JWT owner checks must reject other users' `userId`, `wallet_address`, `holderId`, and `prize_id` where relevant.
- Upload routes must reject before file persistence or DB mutation for unauthenticated and normal user JWT requests.
- Disabled routes must still return `410 FEATURE_DISABLED` or stay unreachable.

### P1 Read/Privacy Residuals

| Route group | Classification | Reason |
| --- | --- | --- |
| Admin read routes such as `/admin/user/all`, `/admin/user/transaction/:wallet_address`, `/admin/seting/tokenbalance`, `/admin/illustration`, `/admin/news` | P1 | These are read/privacy or operational visibility concerns; no P0 asset mutation path was found in this audit. |
| User/wallet read routes such as `/user/all`, `/user/info`, holding history, referral stats/rewards, transaction history, FIFO/holding explain, Trial NFT user read, NFT holder read | P1 | Some reads remain broader than ideal or rely on wallet/user parameters. They should be narrowed, but were not classified as P0 because the audited paths do not mutate assets, tickets, NFT ownership, points, prize state, or admin settings. |
| Monitoring read routes | P1 | Operational metadata should be reduced or admin-gated where appropriate. Mutation/batch routes remain admin-gated. |

### Production No-Go Conditions

API authorization becomes production No-Go again if any of the following is true:

1. Any unauthenticated route can mutate DB state, asset balances, tickets, FanPoint, NFT ownership/status, prize transactions, referral rewards, tier state, or admin/governance configuration.
2. Any normal user JWT can reach admin mutation, upload, distribution, snapshot, reward distribution, or governance-equivalent routes.
3. Any route trusts URL/body `userId`, `user_id`, `wallet_address`, `holderId`, or `prize_id` without checking `req.user.user_id` or `AuthAdmin` as appropriate.
4. Any route accepts body `adminKey` as a substitute for `AuthAdmin`.
5. Upload middleware runs before `AuthAdmin` on admin upload routes.
6. Disabled MVP routes are re-enabled without a separate P0 review.

### Next PR Candidates

No further P0 API authorization PR is proposed from this static audit.

P1 candidates:

1. `P1-01 Protect read/privacy routes`
   - Add `AuthAdmin` or owner checks to read-only admin/user/wallet routes.
2. `STAGING-01 API authorization smoke test`
   - Run staging E2E checks for unauthenticated, normal user, and admin JWT access.
3. `P1-02 Monitoring read exposure reduction`
   - Gate or reduce operational read endpoints that expose internal status.

### Commands Executed For This Section

Results are recorded in `docs/launch/P0_CLOSURE_REPORT.md`.

## 確認日

2026-05-15 JST

## 確認したcommit

`69ca470c3131afd63a6174c2de3804759c2d39e9` (`origin/main`, `fix: require admin auth for prize admin routes (#29)`)

## 目的

P0-12B から P0-12J までの反映後、BSCローンチ前 No-Go として残っていた API 認可不足が main 最新で閉じているかを静的再監査した。

このPRは監査docs更新のみ。`apps/backend`, `apps/frontend`, `contracts`, `schema.prisma`, lockfile は変更しない。

## 確認したファイル

- `AGENTS.md`
- `docs/security/BSC_LAUNCH_P0_FIXES.md`
- `docs/launch/P0_CLOSURE_REPORT.md`
- `docs/launch/LOCAL_VERIFICATION.md`
- `apps/backend/src/app/routes/routes.ts`
- `apps/backend/src/app/routes/*.ts`
- `apps/backend/src/app/controllers/*.ts`
- `apps/backend/src/app/middlewares/*.ts`
- `apps/backend/src/app/config/passport.ts`

## 監査結論

API認可不足No-Goは、静的コード上は production No-Go から staging確認待ちへ降格可能。

根拠:
- 未認証で資産系DB更新に到達できる公開routeは、今回の確認範囲では見つからなかった。
- 一般ユーザーJWTで admin mutation に到達できるrouteは、今回の確認範囲では見つからなかった。
- body `adminKey` だけで管理処理に到達するrouteは、今回の確認範囲では見つからなかった。
- Prize / Illustration / Daily point / ticket / lottery / referral / Trial NFT claim の user-owned mutation は、`req.user.user_id` またはDB上の本人walletを基準にしている。
- NFT / Trial NFT template upload route は upload middleware より前に `AuthAdmin` が置かれている。
- Crash game、user-manage、direct NFT mint status update、direct illustration assignment は 410 またはMVP外として停止済み。

P0-13Aで `apps/backend/src/app/config/passport.ts` の admin token / Authorization header / JWT / cookie の生値ログ出力は削除済み。認証失敗ログはsafe metadataのみになり、raw tokenをclient responseにも返さない。

## 閉じたAPI認可P0

| 対象 | 現在の判定 | 根拠 |
| --- | --- | --- |
| wallet署名ログイン | CLOSED | `apps/backend/src/app/controllers/auth.controller.ts:85-124`, `184-274` でnonce発行、署名検証、nonce一回利用後にJWT発行。 |
| referral通常API | CLOSED | `apps/backend/src/app/routes/referral.routes.ts:38`, `120` は `Authenticate`。controller内で `req.user.user_id` とDB wallet照合後に `prisma.user.update` / `referralRewards.create` へ進む。 |
| referral admin | CLOSED | `apps/backend/src/app/routes/referral.routes.ts:288`, `330` は `AuthAdmin`。snapshot / reward distribution はadmin JWTなしで到達しない。 |
| Prize user mutation | CLOSED | `apps/backend/src/app/routes/prize.routes.ts:19-22` は `Authenticate`。`apps/backend/src/app/controllers/prize.controller.ts:574-580`, `704-732`, `820-833`, `917-941` で `req.user.user_id` と本人所有条件を使用。 |
| Prize admin mutation | CLOSED | `apps/backend/src/app/routes/prize.routes.ts:9-15` は list/detail/create/update/delete/cancel/fail すべて `AuthAdmin`。 |
| Illustration / Daily point mutation | CLOSED | `apps/backend/src/app/routes/illustration.routes.ts:28`, `apps/backend/src/app/routes/user.routes.ts:20` は `Authenticate`。`illustration.controller.ts:327-340`, `users.controller.ts:315-323` で本人ID一致を確認。 |
| ticket code claim | CLOSED | `apps/backend/src/app/routes/ticketCodeRoutes.ts:19` は `Authenticate`。`ticketCodeController.ts:129-248` で `req.user.user_id` からDB userを取得し、body wallet不一致は403。 |
| lottery user-owned mutation | CLOSED | `apps/backend/src/app/routes/lottery.routes.ts:20` は `Authenticate`。`lotter.controller.ts:373-388` でbody `userId` が本人以外なら403。 |
| all-user ticket distribution | CLOSED | `apps/backend/src/app/routes/lottery.routes.ts:19` は `AuthAdmin`。 |
| ticket distribution admin | CLOSED | `apps/backend/src/app/routes/ticket-distribution.routes.ts:9-13` は create/list/detail/update/delete すべて `AuthAdmin`。 |
| NFT admin upload/delete/update | CLOSED | `apps/backend/src/app/routes/nft.routes.ts:23-48` は upload / IPFS / refresh / delete / admin read すべて `AuthAdmin`。upload middleware は `AuthAdmin` の後。 |
| direct NFT mint status update | CLOSED | `apps/backend/src/app/routes/nft.routes.ts:64` は固定 410。 |
| Trial NFT claim/admin/template | CLOSED | `apps/backend/src/app/routes/trialNft.routes.ts:15` は `Authenticate`、`trialNft.controller.ts:63-88` でroute userIdと `req.user.user_id` を照合。`trialNft.routes.ts:28-34` と `trialNftTemplate.routes.ts:24-36` は admin/template mutation が `AuthAdmin`。template upload middleware は `AuthAdmin` の後。 |
| POST `/user/illustration` | CLOSED | `apps/backend/src/app/routes/illustration.routes.ts:27` は固定 410。 |
| Crash game / user-manage MVP外機能 | CLOSED | `apps/backend/src/app/routes/crashGame.routes.ts:12`, `userManage.routes.ts:12-17` は固定 410。 |
| governance / fee / DEX / pair write | CLOSED | `apps/backend/src/app/controllers/dexFeeController.ts:49`, `54`, `115` は固定 410 `MANUAL_REVIEW_REQUIRED`。 |

## まだ残るAPI認可P0

今回の静的監査では、API認可不足として残るP0 routeは見つからなかった。

注意:
- これは main 最新の静的監査結果。stagingで cookie/header、CORS、reverse proxy、admin UI から同じ認可挙動になることは未確認。
- 本番PM2/nginx/deployが `apps/backend` の main 最新を参照することは、人間がサーバ上で確認する必要がある。

## staging確認待ち

| 対象 | 確認内容 |
| --- | --- |
| admin JWT / cookie | Prize、NFT、Trial NFT、ticket distribution、referral admin、monitoring batch が admin JWT だけで通り、未認証・一般ユーザーJWTでは拒否されること。 |
| user JWT / cookie | Prize draw/send/history、Illustration draw/history、Daily point、ticket claim、lottery claim、Trial NFT claim が本人JWTだけで通り、他人userId/wallet指定では403になること。 |
| upload middleware order | NFT upload、Trial NFT template uploadで、未認証・一般ユーザーJWTの場合にファイル保存やDB更新へ進まないこと。 |
| MVP外 route | Crash game、user-manage、`PATCH /nft/:id`、`POST /user/illustration` が本番相当環境でも410のままであること。 |
| deploy source | `docs/launch/RUNTIME_SOURCE_OF_TRUTH.md` のとおり、var-www / Rave_bk 由来の古いソースがPM2/nginxから参照されないこと。 |

## P1へ回せるread/privacy系

| route / group | 理由 |
| --- | --- |
| `GET /admin/user/all`, `GET /admin/user/transaction/:wallet_address`, `GET /admin/seting/tokenbalance` | DB更新はないが、admin相当データが未認証で読める。P1で `AuthAdmin` 化推奨。 |
| `GET /admin/illustration`, `GET /admin/news` | admin画面向けreadが未認証。DB更新はないためP1。 |
| `GET /user/all`, `POST /user/info` | user情報read。`POST /user/info` は `Authenticate` ありだがbody `user_id` で他人情報を読める。P1 owner-check debt。 |
| `GET /user/holding/average/:user_id`, `GET /user/holding/history/:user_id` | `Authenticate` はあるがroute `user_id` を本人照合していないread。P1 privacy。 |
| `GET /referral/referral-stats/:walletAddress`, `GET /referral/referral-rewards/:walletAddress`, `GET /referral/debug/referral-status/:walletAddress` | wallet指定read。referral mutationは閉じているが、情報露出はP1。 |
| `GET /transaction-history/:walletAddress`, `GET /holding-date/explain/:walletAddress`, `GET /fifo-snapshot/:walletAddress`, `GET /transaction/:txHash` | wallet/txHash指定read。DB更新は確認できないが、取引分類・FIFO・holding情報の露出はP1。 |
| `GET /trial-nfts/can-claim/:userId`, `GET /trial-nfts/user/:userId`, `GET /trial-nfts/total/:userId` | Trial NFT user情報read。claim mutationは本人照合済みだが、readはP1。 |
| `GET /nfts/holder/:holderId` | holderId指定read。mint status updateは410だが、collection readはP1 privacy。 |
| monitoring read routes | `/monitoring/realtime-status`, `/quicknode-status`, `/service-health`, `/healthcheck` はread/ops情報。公開に必要なもの以外はP1で情報量削減。 |

## production No-Goとして残すべき項目

| 項目 | 判定 | 根拠 / 理由 |
| --- | --- | --- |
| `AuthAdmin` / `Authenticate` のtokenログ出力 | CLOSED | P0-13Aで `apps/backend/src/app/config/passport.ts` から raw admin/user token、Authorization header、JWT、cookie値のログ出力を削除。JWT検証失敗時もerror nameなどsafe metadataだけを記録する。 |
| staging未確認 | NO-GO until verified | API認可不足は静的には閉じているが、stagingでcookie/header、admin UI、reverse proxy、PM2/nginx参照先を確認するまでproduction readyとは書けない。 |
| 本番deploy元未確認 | NO-GO until verified | main最新が実際の本番PM2/nginx/deploy元でなければ、P0修正が反映されない。 |

## 次に作るべきPR

API認可不足P0としての追加PRは不要。

次に作るべき小PR候補は最大3件:

1. `P1-01 Protect admin/read privacy routes`
   - 対象: admin read、user read、transaction/referral/holding read
   - 内容: DB更新を伴わないread/privacy routeを `AuthAdmin` または本人JWTへ寄せる。
2. `STAGING-01 API authorization smoke test`
   - 対象: staging環境
   - 内容: 未認証、一般ユーザーJWT、admin JWT、他人userId/wallet指定のE2E smoke testを実行し、API認可No-Goを正式にstaging確認済みにする。

## 実行したコマンド

```powershell
Test-Path "C:\Users\HIRO-001\Documents\IRIS_SPEC_AUTHORITY.md"
git fetch origin --prune
git switch -c codex/p0-12k-api-auth-final-audit origin/main
git rev-parse HEAD
git log --oneline -10 origin/main
Get-Content -Path AGENTS.md
Get-Content -Path docs\launch\API_AUTHORIZATION_AUDIT.md
rg -n "router\.(get|post|patch|put|delete)|Router\.use\(" apps/backend/src/app/routes
rg -n "AuthAdmin|Authenticate|adminKey|req\.user|req\.params\.(user_id|userId|walletAddress|wallet_address|holderId|prize_id)|req\.body\.(user_id|userId|wallet_address|walletAddress|holderId|adminKey)|FEATURE_DISABLED|status\(410\)" apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config/passport.ts
Select-String -Path apps/backend/src/app/controllers/prize.controller.ts -Pattern "const getAuthenticatedPrizeUserId|static async drawPrize|static async getPrizeTransactions|static async sendToWallet|static async withDrawPrizeToken|static async deletePrize|static async createNewPrize|static async editPrize" -Context 4,28
Select-String -Path apps/backend/src/app/controllers/illustration.controller.ts -Pattern "getAuthenticatedIllustrationUserId|static async getUserIllustrations|static async drawIllustration|static async create|static async update|static async delete" -Context 4,24
Select-String -Path apps/backend/src/app/controllers/users.controller.ts -Pattern "getAuthenticatedUserId|static async getAverageHoldingDate|static async getHoldDateHistory|static async getUserPointHistory|static async getUserDailyPointBonus|static async setUserDailyPointBonus|static async getUserInfo|static async getTokenBalance|static async getAllUserData|static async getUserPrizeTransaction" -Context 4,24
Select-String -Path apps/backend/src/app/controllers/ticketCodeController.ts -Pattern "export const claimTicketCode|wallet_address|authenticatedUserId|authenticatedWalletAddress|updateMany|ticketCode.update|user.update|generateGlobalTicketCode|getAllTicketCodes" -Context 3,18
Select-String -Path apps/backend/src/app/controllers/trialNft.controller.ts -Pattern "getAuthenticatedTrialNftUserId|checkCanClaim|claimTrialNFT|getUserTrialNFTs|getTotalNFTCount|getStats|expireOldNFTs|getAllTrialNFTs" -Context 4,24
Get-Content -Path apps/backend/src/app/controllers/dexFeeController.ts -TotalCount 140
Get-Content -Path apps/backend/src/app/routes/nft.routes.ts
Get-Content -Path apps/backend/src/app/routes/trialNftTemplate.routes.ts
Get-Content -Path apps/backend/src/app/routes/trialNft.routes.ts
Get-Content -Path apps/backend/src/app/routes/transactionHistory.routes.ts
Get-Content -Path apps/backend/src/app/controllers/transactionHistoryController.ts -TotalCount 260
rg -n 'prisma\.[A-Za-z0-9_]+\.(create|update|updateMany|delete|deleteMany|upsert)|\$transaction' apps/backend/src/app/controllers apps/backend/src/app/routes apps/backend/src/app/lib -g '!**/__tests__/**'
git diff --check
```

## 検証結果

- `IRIS_SPEC_AUTHORITY.md`: 見つからない。今回の対象はDISCO.fan / FUNKY.fan repoのAPI認可監査であり、IRIS仕様は根拠にしていない。
- `origin/main`: `69ca470c3131afd63a6174c2de3804759c2d39e9` までfetch済み。P0-12J PR #29 merge済み。
- 静的route/controller監査: 完了。
- `git diff --check`: 成功。
