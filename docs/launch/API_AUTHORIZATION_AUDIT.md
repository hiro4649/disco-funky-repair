# API Authorization Audit

## 確認日

2026-05-15 JST

## 対象commit

`a35674c8bd11ed7fbfaefcfbc1b3c7abe8089d13` (`origin/main`, `fix: require admin auth for referral admin routes (#22)`)

## 目的

P0-12B と P0-12C 反映後の `main` 最新状態で、BSC ローンチ前の API 認可 No-Go が残っているかを再監査した。

このPRは監査doc更新のみ。`apps/backend`, `apps/frontend`, `contracts`, `schema.prisma`, lockfile は変更しない。

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
- `apps/backend/src/app/routes/utils.ts`

## 認証middlewareの前提

| middleware | 根拠 | 判定 |
| --- | --- | --- |
| `Authenticate` | `apps/backend/src/app/config/passport.ts` | user JWTを検証し、DB user存在確認とJWT address / DB wallet address照合後に `req.user.user_id` と `req.user.address` を設定する。 |
| `AuthAdmin` | `apps/backend/src/app/config/passport.ts` | admin JWTを検証し、DB admin存在確認後にadmin処理へ進める。 |

## P0-12B / P0-12Cで閉じたP0

| route | 現在の判定 | 根拠 |
| --- | --- | --- |
| `GET /referral/referral-code/:walletAddress` | P0-12Bで完了。未認証ではDB更新に到達しない。本人wallet以外は403。 | `apps/backend/src/app/routes/referral.routes.ts:38` は `Authenticate` 付き。`req.user.user_id` からDB userを取得し、DB walletとURL walletを照合してから `prisma.user.update` する。 |
| `POST /referral/track-referral` | P0-12Bで完了。未認証ではDB更新に到達しない。body `walletAddress` / `userId` を本人判定に使わない。 | `apps/backend/src/app/routes/referral.routes.ts:120` は `Authenticate` 付き。transaction内で `req.user.user_id` のDB userを正にして `user.update` / `referralRewards.create` する。 |
| `POST /referral/admin/run-snapshot` | P0-12Cで完了。body `adminKey` 依存なし。admin JWTなしではsnapshot更新に到達しない。 | `apps/backend/src/app/routes/referral.routes.ts:288` は `AuthAdmin` 付き。 |
| `POST /referral/admin/distribute-rewards` | P0-12Cで完了。body `adminKey` 依存なし。admin JWTなしではFanPoint / PointHistory / referralRewards更新に到達しない。 | `apps/backend/src/app/routes/referral.routes.ts:330` は `AuthAdmin` 付き。 |

## 安全またはP0修正済みと判断したroute

| route / group | 判定 | 根拠 |
| --- | --- | --- |
| Wallet署名ログイン | P0-11で完了。wallet addressだけでJWT発行しない。 | `apps/backend/src/app/controllers/auth.controller.ts:85` nonce発行、`:184` 署名検証、nonce一回使用化後にJWT発行。 |
| Crash game / user-manage | P0-01で完了。MVP外として410固定。 | `apps/backend/src/app/routes/crashGame.routes.ts:12`, `apps/backend/src/app/routes/userManage.routes.ts:12-17` |
| `PATCH /nft/:id` | P0-02で完了。直接mint status更新routeは410固定。 | `apps/backend/src/app/routes/nft.routes.ts:63` |
| `POST /user/illustration` | P0-04で完了。任意Illustration追加routeは410固定。 | `apps/backend/src/app/routes/illustration.routes.ts:27` |
| ticket code admin generate/list | admin認可あり。 | `apps/backend/src/app/routes/ticketCodeRoutes.ts:15-16` |
| ticket distribution create/update/delete | admin認可あり。 | `apps/backend/src/app/routes/ticket-distribution.routes.ts:9,12,13` |
| illustration admin create/update/delete | admin認可あり。 | `apps/backend/src/app/routes/illustration.routes.ts:18,20,21` |
| news admin create/update/delete | admin認可あり。 | `apps/backend/src/app/routes/news.routes.ts:9,12,13` |
| monitoring daily batch | admin認可あり。 | `apps/backend/src/app/routes/monitoring.routes.ts:54` |
| backend DEX / fee write | P0-10Cで直接txとDB更新済み扱いを停止。410固定。 | `apps/backend/src/app/routes/dexFee.routes.ts:9-14`, `apps/backend/src/app/controllers/dexFeeController.ts:49,54,115` |
| prize send | 大きな二重送金P0はP0-06/07/10Aで閉じている。本人transaction条件もある。 | `apps/backend/src/app/controllers/prize.controller.ts:880` 以降で `id` とログインwallet由来userに紐づくPrizeTransactionだけを送金対象にする。ただし `req.user` ではなくcookie decode依存が残るためP1。 |

## 残っているP0 route

| 優先 | route | 根拠ファイル | P0理由 | 最小修正方針 |
| --- | --- | --- | --- | --- |
| P0-12D-1 | `POST /airdrop/prize/draw/:user_id` | `apps/backend/src/app/routes/prize.routes.ts:19`, `apps/backend/src/app/controllers/prize.controller.ts:561-645` | `Authenticate` はあるが、controllerがURL `user_id` を使ってticket decrement、PrizeTransaction作成、Prize在庫予約を行う。`req.user.user_id` との一致確認がないため、一般ユーザーJWTで他人userのticket/当選状態を操作できる可能性がある。 | URL `user_id` を本人判定に使わず `req.user.user_id` 固定にする。必要ならURL user_idは廃止または一致確認。 |
| P0-12D-2 | `GET /airdrop/prize/transactions/:user_id` | `apps/backend/src/app/routes/prize.routes.ts:20`, `apps/backend/src/app/controllers/prize.controller.ts:791-872` | `Authenticate` はあるが、URL `user_id` のPrizeTransactionを取得し、expired READYを `finalizeUnpaidPrizeReservation(..., EXPIRED)` で状態変更/予約解除する副作用がある。本人確認なしで他人の未払いPrize予約をEXPIRED化できる可能性がある。 | `req.user.user_id` 固定にし、read endpointの副作用を分離するか、本人一致後だけfinalizeを実行。 |
| P0-12D-3 | `POST /user/:userId/draw-illustration` | `apps/backend/src/app/routes/illustration.routes.ts:28`, `apps/backend/src/app/controllers/illustration.controller.ts:299-430` | `Authenticate` はあるが、URL `userId` を使ってticket decrement、FanPoint、PointHistory、IllustrationHistory、TrialNFT bonus更新へ進む。`req.user.user_id` との一致確認がない。 | `req.user.user_id` 固定にし、URL `userId` を廃止または一致必須にする。 |
| P0-12D-4 | `POST /user/daily/point/:user_id` | `apps/backend/src/app/routes/user.routes.ts:20`, `apps/backend/src/app/controllers/users.controller.ts:289-352` | `Authenticate` はあるが、URL `user_id` を使って `pointHistory.create` と `user.fan_points increment` を行う。本人確認なしで他人にdaily pointを付与できる可能性がある。 | `req.user.user_id` 固定にし、URL `user_id` を廃止または一致必須にする。 |
| P0-12D-5 | `POST /lottery/claim/ticket/to/user` | `apps/backend/src/app/routes/lottery.routes.ts:20`, `apps/backend/src/app/controllers/lotter.controller.ts:330-364` | 未認証。body `userId` を信じて `claimTickets` を0にし、`tickets` をincrementする。 | `Authenticate` + `req.user.user_id` 固定。body `userId` は信じない。 |
| P0-12D-6 | `POST /alluser/distribute/ticket` | `apps/backend/src/app/routes/lottery.routes.ts:19`, `apps/backend/src/app/controllers/lotter.controller.ts:238-307` | 未認証で全ユーザーのLotteryTicket作成/更新/削除に到達する。cron/admin相当の資産系処理。 | `AuthAdmin` またはinternal job専用化。MVP外なら410。 |
| P0-12D-7 | `POST /ticket-code/claim` | `apps/backend/src/app/routes/ticketCodeRoutes.ts:19`, `apps/backend/src/app/controllers/ticketCodeController.ts:129-223` | P0-05で二重claimは軽減済みだが、未認証でbody `wallet_address` を信じて該当userのticketsをincrementする。 | `Authenticate` + `req.user.address` / `req.user.user_id` 固定。body `wallet_address` は信じない。 |
| P0-12D-8 | NFT admin upload/delete/refresh/IPFS routes | `apps/backend/src/app/routes/nft.routes.ts:22,25,28,31,38,47`, `apps/backend/src/app/controllers/nft.controller.ts:132,232,303,350,515,903` | `/admin/nft/*` だが `AuthAdmin` なしでExcel upload、image upload、IPFS upload、NFT DB更新、NFT削除に到達する。公式NFT metadata/管理情報を未認証で変更できる可能性。 | 全admin NFT mutation routeに `AuthAdmin`。MVP外のIPFS/upload処理は410も検討。 |
| P0-12D-9 | `DELETE /admin/airdrop/prize/:prize_id` | `apps/backend/src/app/routes/prize.routes.ts:11`, `apps/backend/src/app/controllers/prize.controller.ts:541-548` | `/admin` routeだが `AuthAdmin` なしで `prisma.prize.delete` に到達する。Prizeカタログ/当選対象を未認証で削除できる。 | `AuthAdmin` 必須。可能なら物理削除ではなくinactive化。 |
| P0-12D-10 | `POST /trial-nfts/claim/:userId` | `apps/backend/src/app/routes/trialNft.routes.ts:14`, `apps/backend/src/app/controllers/trialNft.controller.ts:56-84`, `apps/backend/src/app/lib/trialNftService.ts:122-203` | 未認証でURL `userId` を使ってTrialNFT作成、template mintCount increment、PointHistory作成、FanPoint incrementへ進む。 | MVPで使わないなら410。使うなら `Authenticate` + `req.user.user_id` 固定 + transaction/unique制約確認。 |
| P0-12D-11 | `POST /trial-nfts/expire` | `apps/backend/src/app/routes/trialNft.routes.ts:30`, `apps/backend/src/app/lib/trialNftService.ts:222-244` | 未認証で期限切れTrialNFTの状態更新に到達するadmin/cron相当処理。 | `AuthAdmin` またはinternal job専用化。 |
| P0-12D-12 | Trial NFT template create/update/delete | `apps/backend/src/app/routes/trialNftTemplate.routes.ts:29,32,35`, `apps/backend/src/app/routes/routes.ts:44-45`, `apps/backend/src/app/controllers/trialNftTemplate.controller.ts:17,201,289` | 同一routerが `/trial-nft-templates` と `/admin/trial-nft-templates` にmountされ、create/update/deleteに `AuthAdmin` がない。未認証でtemplate作成、IPFS upload、更新、削除に到達する。 | public routerは `/available` のみに限定。admin mount側だけ `AuthAdmin` 付きmutationを許可。 |

## P1へ回せるroute / 残リスク

| route / group | 分類 | 理由 |
| --- | --- | --- |
| `GET /referral/referral-stats/:walletAddress`, `/referral/referral-rewards/:walletAddress`, `/referral/debug/referral-status/:walletAddress` | P1 privacy | P0-12B/Cでmutation系は閉じた。残りはwallet指定readで、個人/紹介情報漏えいの可能性。 |
| `GET /transaction-history/:walletAddress`, `/holding-date/explain/:walletAddress`, `/fifo-snapshot/:walletAddress`, `/transaction/:txHash` | P1 privacy | 未認証でwallet/txHash指定の取引分類、FIFO、holding情報を取得できる。DB更新は確認できない。 |
| `GET /user/point/history/:user_id`, `/user/daily/point/:user_id`, `/user/holding/*/:user_id`, `POST /user/info` | P1 privacy / owner-check debt | read系または情報取得。`Authenticate` 付きrouteでもbody/URL user idを使う箇所があるため、本人固定に寄せるべき。 |
| Admin read routes (`/admin/user/all`, `/admin/user/transaction/:wallet_address`, `/admin/nfts`, `/admin/nft/uploaded-images`, `/admin/ticket-distribution*`, `/admin/news`, `/admin/illustration`, `/admin/airdrop/prize*`) | P1 admin data exposure | 直接DB更新はないが、管理画面情報が未認証で読める。P0 mutation修正後に `AuthAdmin` へ寄せる。 |
| Lottery read routes (`/lottery/disco/balance/:user_id`, `/lottery/ticket/:user_id`, `/lottery/ticket/date/:user_id`, `/lottery/ticket/count/:user_id`) | P1 privacy | 未認証で他人userのticket/token関連情報を読める。`count` は現状コメントアウト済みでDB更新は確認できない。 |
| `POST /airdrop/prize/send/:prize_id` | P1 technical debt | `Authenticate` 後にcookie `userAuth` を `jwtDecode` してuserを引く。該当PrizeTransactionはuserIdで絞るが、`req.user.user_id` に統一すべき。 |
| `POST /prize/transaction/:user_id/withDraw/:prize_id` | UNKNOWN/P1 | `Authenticate` はあるが、route param名とcontroller destructuringが不一致で実処理は400になりやすい。資産更新は確認できないが、不要なら410または削除候補。 |
| Monitoring read routes | P1 ops exposure | `/monitoring/realtime-status`, `/quicknode-status`, `/service-health`, `/healthcheck` は未認証read。公開healthcheckに必要なもの以外は情報量を下げる。 |

## UNKNOWN

| 対象 | UNKNOWN理由 |
| --- | --- |
| 本番PM2/nginx/deployでこの `origin/main` が実際に参照されるか | `docs/launch/RUNTIME_SOURCE_OF_TRUTH.md` では人間のサーバ確認が必要。本監査はrepo上のmain静的解析。 |
| staging/testnetでadmin JWT cookie/headerが全画面から正しく送られるか | 本監査ではローカル起動/API結合テスト未実行。 |
| Trial NFTをBSC MVPで使うか | MVP外なら410固定が最短。使うなら認可だけでなくtransaction/unique/idempotencyも必要。 |

## 次に作るべき小PR案

優先度順に3つ以内へ絞る。

1. `P0-12D-PR1 user-owned asset mutation auth`
   - 対象: `POST /airdrop/prize/draw/:user_id`, `GET /airdrop/prize/transactions/:user_id`, `POST /user/:userId/draw-illustration`, `POST /user/daily/point/:user_id`
   - 方針: `req.user.user_id` を唯一の本人IDにする。URL/body userIdは廃止または一致必須。Prize transaction readの副作用は本人確認後だけ実行。

2. `P0-12D-PR2 ticket claim and lottery admin auth`
   - 対象: `POST /ticket-code/claim`, `POST /lottery/claim/ticket/to/user`, `POST /alluser/distribute/ticket`
   - 方針: ticket claimは `Authenticate` + `req.user` 固定。all-user distributionは `AuthAdmin` / internal job / 410 のどれかに固定。

3. `P0-12D-PR3 admin NFT and Trial NFT gate`
   - 対象: NFT admin upload/delete/refresh/IPFS、Trial NFT claim/expire、Trial NFT template create/update/delete、Prize admin delete
   - 方針: 本番MVPで使わないTrial NFT系は410推奨。使うadmin NFT/Prize delete系は `AuthAdmin` 必須化。Trial NFT template routerはpublic/adminを分離。

## 本番前No-Go条件

- 上記「残っているP0 route」が1つでも残る場合はBSC production launch不可。
- user資産/ticket/FanPoint/Prize/NFT/TrialNFT状態をURL/body `user_id`, `userId`, `wallet_address`, `walletAddress`, `holderId` で変更できる場合はNo-Go。
- `/admin/*` またはcron/internal相当のDB更新、file upload、IPFS upload、ticket配布、FanPoint配布、Prize/NFT管理が `AuthAdmin` なしで実行できる場合はNo-Go。

## 実行したコマンド

```powershell
Test-Path "C:\Users\HIRO-001\Documents\IRIS_SPEC_AUTHORITY.md"
git fetch origin
git log --oneline -5 origin/main
git switch -c codex/p0-12d-api-auth-reaudit origin/main
Get-Content -Raw docs/launch/API_AUTHORIZATION_AUDIT.md
Get-Content -Raw docs/launch/P0_CLOSURE_REPORT.md
Get-Content -Raw docs/security/BSC_LAUNCH_P0_FIXES.md
rg -n "router\.(get|post|patch|put|delete)|Router\.use\(" apps/backend/src/app/routes
rg -n "AuthAdmin|Authenticate|req\.user|req\.params\.(user_id|userId|walletAddress|wallet_address|holderId)|req\.body\.(user_id|userId|wallet_address|walletAddress|holderId)|status\(410\)|FEATURE_DISABLED|MANUAL_REVIEW_REQUIRED" apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config/passport.ts
Get-Content -Raw apps/backend/src/app/routes/prize.routes.ts
Get-Content -Raw apps/backend/src/app/routes/lottery.routes.ts
Get-Content -Raw apps/backend/src/app/routes/nft.routes.ts
Get-Content -Raw apps/backend/src/app/routes/trialNftTemplate.routes.ts
Get-Content -Raw apps/backend/src/app/routes/illustration.routes.ts
Get-Content -Raw apps/backend/src/app/routes/ticketCodeRoutes.ts
Get-Content -Raw apps/backend/src/app/routes/trialNft.routes.ts
Get-Content -Raw apps/backend/src/app/routes/user.routes.ts
Get-Content -Raw apps/backend/src/app/routes/referral.routes.ts
Get-Content -Raw apps/backend/src/app/routes/transactionHistory.routes.ts
Get-Content -Raw apps/backend/src/app/routes/ticket-distribution.routes.ts
Get-Content -Raw apps/backend/src/app/routes/routes.ts
Select-String -Path apps/backend/src/app/controllers/prize.controller.ts -Pattern "static async drawPrize|static async getPrizeTransactions|static async sendToWallet|static async withDrawPrizeToken|static async deletePrize|user_id|req.user|finalizeUnpaid" -Context 3,6
Select-String -Path apps/backend/src/app/controllers/illustration.controller.ts -Pattern "drawIllustration|getUserIllustrations|req.params.userId|req.user|processDraw" -Context 3,6
Select-String -Path apps/backend/src/app/controllers/ticketCodeController.ts -Pattern "claimTicketCode|wallet_address|req.user|generateGlobalTicketCode" -Context 3,6
Select-String -Path apps/backend/src/app/controllers/lotter.controller.ts -Pattern "distributeTicketToAllUser|lotteryClaimTicketToUser|checkAndUpdateLotteryTicket|req.params.user_id|req.body.userId|tickets|claimTickets" -Context 3,6
Select-String -Path apps/backend/src/app/lib/trialNftService.ts -Pattern "export async function claimTrialNFT|prisma\.trialNFT|pointHistory|fan_points|mintCount|update|create" -Context 2,5
Select-String -Path apps/backend/src/app/controllers/nft.controller.ts -Pattern "uploadExcel|uploadImages|uploadSingleImage|uploadToIPFS|refreshImageMatches|deleteNFT|prisma\.nft|fs\." -Context 2,5
Select-String -Path apps/backend/src/app/controllers/trialNftTemplate.controller.ts -Pattern "static async create|static async update|static async delete|prisma\.trialNftTemplate|upload" -Context 2,6
Select-String -Path apps/backend/src/app/controllers/setTicketDistribute.controller.ts -Pattern "static async create|static async update|static async delete|prisma" -Context 2,5
```

## 検証結果

- `IRIS_SPEC_AUTHORITY.md`: 見つからない。今回の対象はDISCO.fan / FUNKY.fan API認可監査のため、IRIS仕様は判定根拠に使っていない。
- `origin/main`: `a35674c` までfetch済み。P0-12C PR #22 がmerge済みであることを確認。
- 静的route/controller監査: 実施。
- `git diff --check`: 成功。
