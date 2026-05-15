# API Authorization Audit

確認日: 2026-05-15 JST
対象commit: `57fa3ec` (`origin/main`, `P0-11 require wallet signature login (#19)`)
目的: P0-FINALでNo-Goとして残ったAPI認可不足を、main最新コードで静的棚卸しする。

## 前提

- 変更対象はこのドキュメントのみ。`apps/backend`, `apps/frontend`, `contracts`, `schema.prisma` は変更していない。
- 確認は静的解析。API起動、DB接続、E2E、本番nginx/PM2確認は未実行。
- `C:\Users\HIRO-001\Documents\IRIS_SPEC_AUTHORITY.md` は存在しなかった。今回の対象はDISCO.fan / FUNKY.fanのAPI認可監査のため、判定根拠は指定docsとmainコードに限定する。
- 全APIは `apps/backend/src/app/index.ts` の `app.use('/api', Router)` 配下で公開される。

## 確認したファイル

- `docs/security/BSC_LAUNCH_P0_FIXES.md`
- `docs/launch/P0_CLOSURE_REPORT.md`
- `docs/launch/LOCAL_VERIFICATION.md`
- `apps/backend/src/app/routes/routes.ts`
- `apps/backend/src/app/routes/*.routes.ts`
- `apps/backend/src/app/routes/ticketCodeRoutes.ts`
- `apps/backend/src/app/routes/referral.routes.ts`
- `apps/backend/src/app/routes/transactionHistory.routes.ts`
- `apps/backend/src/app/controllers/*.ts`
- `apps/backend/src/app/config/passport.ts`
- `apps/backend/src/app/routes/utils.ts`

## 認証middleware確認

| middleware | 根拠 | 判定 |
| --- | --- | --- |
| `Authenticate` | `apps/backend/src/app/config/passport.ts` | JWTを検証し、DB userの存在とJWT addressの一致を確認して `req.user.user_id` / `req.user.address` を設定する。 |
| `AuthAdmin` | `apps/backend/src/app/config/passport.ts` | admin JWTを検証し、DB adminの存在を確認する。 |

重要: middlewareが付いていても、controllerが `req.params.user_id`, `req.params.userId`, `req.body.user_id`, `req.body.wallet_address`, `req.body.walletAddress` を本人判定に使うrouteは未修正扱い。

## 確認したroute一覧

| route file | endpoints | 認可状態の要約 |
| --- | --- | --- |
| `auth.routes.ts` | `/user/auth/nonce`, `/user/signup`, `/user/logout`, `/user/verify`, `/user/refresh-token`, `/admin/signin`, `/admin/logout`, `/admin/verify` | nonce/signup/signinは公開routeとして妥当。`/user/signup` は署名検証後JWT発行。logout GETはP1 CSRF/設計残リスク。 |
| `prize.routes.ts` | `/admin/airdrop/prize*`, `/airdrop/prize*`, `/prize/transaction/:user_id/withDraw/:prize_id` | admin create/edit/cancel/failは `AuthAdmin`。admin deleteは未認証。user draw/transactions/withdrawは `Authenticate` ありだがURL `user_id` を信じる経路あり。sendは本人transactionに絞る。 |
| `user.routes.ts` | `/admin/seting/tokenbalance`, `/admin/user/all`, `/user/all`, `/admin/user/transaction/:wallet_address`, `/user/holding/*`, `/user/point/history/:user_id`, `/user/daily/point/:user_id`, `/user/info` | admin writeは `AuthAdmin`。多くのreadが未認証または本人照合なし。daily point POSTは `Authenticate` ありだがURL `user_id` を信じて更新。 |
| `lottery.routes.ts` | `/admin/user/lottery/ticket`, `/lottery/*`, `/alluser/distribute/ticket`, `/lottery/claim/ticket/to/user` | admin addは `AuthAdmin`。全体配布とclaimは未認証でDB更新。user系readは本人照合なし。 |
| `nft.routes.ts` | `/admin/nft/*`, `/nfts/*`, `/nft/:id` | `PATCH /nft/:id` は410。admin upload/delete系は `AuthAdmin` なしでDB/IPFS/ファイル更新へ到達。 |
| `ticketCodeRoutes.ts` | `/ticket-code/admin/generate`, `/ticket-code/admin/all`, `/ticket-code/claim` | adminは `AuthAdmin`。claimは未認証でbody `wallet_address` にticket加算。 |
| `illustration.routes.ts` | `/admin/illustration*`, `/illustration/*`, `/user/:userId/illustrations`, `/user/illustration`, `/user/:userId/draw-illustration` | admin writeは `AuthAdmin`。`POST /user/illustration` は410。drawは `Authenticate` ありだがURL `userId` を信じてticket/FanPoint/history更新。 |
| `dexFee.routes.ts` | `/dex/list`, `/dex/add`, `/dex/remove/:address`, `/fee/history`, `/fee/record`, `/fee/current` | write系はcontrollerで410 `MANUAL_REVIEW_REQUIRED` 固定。readは公開。 |
| `crashGame.routes.ts` | `/crash/games` | 410 `FEATURE_DISABLED` 固定。 |
| `userManage.routes.ts` | `/user-manage/balance/:wallet_address`, `/deposit`, `/withdraw`, `/bet`, `/cashout`, `/transactions/:wallet_address` | 全て410 `FEATURE_DISABLED` 固定。 |
| `trialNft.routes.ts` | `/trial-nfts/can-claim/:userId`, `/claim/:userId`, `/user/:userId`, `/total/:userId`, `/stats`, `/expire`, `/all` | 認証なし。claim/expireはDBとFanPoint/TrialNFT状態を更新。 |
| `trialNftTemplate.routes.ts` | `/trial-nft-templates/*`, `/admin/trial-nft-templates/*` | 同じrouterがpublic/admin両方にmount。create/update/delete/stats/allに `AuthAdmin` なし。 |
| `referral.routes.ts` | `/referral/referral-code/:walletAddress`, `/referral-stats/:walletAddress`, `/track-referral`, `/referral-rewards/:walletAddress`, `/debug/referral-status/:walletAddress`, `/admin/run-snapshot`, `/admin/distribute-rewards` | `referral-code` はGETだが未認証で `prisma.user.update` に到達し得る。track-referralは未認証でuser/referral reward作成。adminはbody `adminKey` 依存で `AuthAdmin` なし。 |
| `transactionHistory.routes.ts` | `/transaction-history/:walletAddress`, `/holding-date/explain/:walletAddress`, `/fifo-snapshot/:walletAddress`, `/transaction-types`, `/transaction/:txHash` | 全て未認証。wallet/txHash指定で他人の取引分類・FIFO・holding date説明を取得可能。 |
| `ticket-distribution.routes.ts` | `/admin/ticket-distribution*` | create/update/deleteは `AuthAdmin`。admin readは未認証。 |
| `news.routes.ts` | `/admin/news*`, `/news/:id` | admin writeは `AuthAdmin`。admin readは未認証だがnews公開用途ならP1以下。 |
| `monitoring.routes.ts` | `/monitoring/*` | batch実行は `AuthAdmin`。status/health系readは未認証。 |

## 安全と判断したroute

| route | 根拠 | 判定 |
| --- | --- | --- |
| `POST /user/auth/nonce` | `AuthController.issueWalletNonce` がnonce/messageを発行する公開開始点。 | P0ではない。 |
| `POST /user/signup` | `AuthController.signup` が `verifyMessage`, nonce未使用/期限をtransactionで検証後にJWT発行。wallet addressのみのJWT発行はtestも存在。 | P0-11として概ね閉じ済み。 |
| `POST /admin/signin` | admin credential loginの公開入口。 | P0ではない。 |
| `POST /admin/user/lottery/ticket` | routeに `AuthAdmin`。controllerはbody id/ticketCountでDB更新。 | admin認可あり。 |
| `POST/PATCH/DELETE /admin/ticket-distribution*` | routeに `AuthAdmin`。 | admin認可あり。 |
| `POST/PATCH/DELETE /admin/news*` | routeに `AuthAdmin`。 | admin認可あり。 |
| `POST/PATCH/DELETE /admin/illustration*` | routeに `AuthAdmin`。 | admin認可あり。 |
| `PATCH /nft/:id` | `nftMintStatusUpdateDisabled` が410固定。 | P0-02として閉じ済み。 |
| `POST /user/illustration` | `userIllustrationDisabledHandler` が410固定。 | P0-04として閉じ済み。 |
| `GET /crash/games` | 410固定。 | P0-01として閉じ済み。 |
| `/user-manage/*` | 全routeが410固定。 | P0-01として閉じ済み。 |
| `POST /dex/add`, `DELETE /dex/remove/:address`, `POST /fee/record` | controllerが410 `MANUAL_REVIEW_REQUIRED` 固定。 | P0-10Cとして閉じ済み。 |
| `POST /admin/airdrop/prize/transaction/:prize_id/cancel`, `/fail` | routeに `AuthAdmin`。controllerは未払い確定時のみ予約解除。 | admin認可あり。 |
| `POST /admin/airdrop/prize/:prize_id?`, `PATCH /admin/airdrop/prize/:prize_id` | routeに `AuthAdmin`。 | admin認可あり。 |
| `POST /airdrop/prize/send/:prize_id` | `Authenticate` 後、cookie JWTのaddressからDB userを引き、`{ id: prizeId, userId: user.id }` でtransactionを絞る。 | 大きなP0は見つからない。ただし `req.user` ではなく `jwtDecode(cookie)` 依存はP1技術負債。 |

## P0として修正が必要なroute

| route | 根拠ファイル | 問題 | 最小修正方針 |
| --- | --- | --- | --- |
| `POST /airdrop/prize/draw/:user_id` | `apps/backend/src/app/routes/prize.routes.ts`, `apps/backend/src/app/controllers/prize.controller.ts` | `Authenticate` はあるが、controllerがURL `user_id` を使って `tickets` decrement、`prizeTransactions.create`、Prize予約更新を行う。`req.user.user_id` との一致確認なし。 | URL user_idを信用せず `req.user.user_id` 固定にする。必要ならURL user_idを廃止。 |
| `GET /airdrop/prize/transactions/:user_id` | `prize.routes.ts`, `prize.controller.ts` | `Authenticate` はあるがURL `user_id` で他人の当選履歴を取得できる。さらにexpired READYを `finalizeUnpaidPrizeReservation` でEXPIRED化し予約解除する副作用あり。 | `req.user.user_id` のみ取得対象にする。read endpointの副作用を分離するか所有者一致後だけ実行。 |
| `POST /user/:userId/draw-illustration` | `illustration.routes.ts`, `illustration.controller.ts` | `Authenticate` はあるがURL `userId` を使い、ticket decrement、FanPoint、PointHistory、IllustrationHistory、TrialNFT更新へ到達する。 | `req.user.user_id` 固定。URL userId廃止または一致しない場合403。 |
| `POST /user/daily/point/:user_id` | `user.routes.ts`, `users.controller.ts` | `Authenticate` はあるがURL `user_id` を使い、PointHistory作成と `fan_points` incrementを行う。 | `req.user.user_id` 固定。重複判定も同一transactionまたはunique制約で保護。 |
| `POST /lottery/claim/ticket/to/user` | `lottery.routes.ts`, `lotter.controller.ts` | 未認証。body `userId` を信じ、`claimTickets` を `tickets` に移す。 | `Authenticate` + `req.user.user_id` 固定。body userIdを信用しない。 |
| `POST /alluser/distribute/ticket` | `lottery.routes.ts`, `lotter.controller.ts` | 未認証で全userの `lotteryTickets` を作成/更新/削除するcron/admin相当処理。 | `AuthAdmin` またはinternal job専用化。公開APIなら410/手動runbook。 |
| `DELETE /admin/airdrop/prize/:prize_id` | `prize.routes.ts`, `prize.controller.ts` | `/admin` routeだが `AuthAdmin` なしで `prisma.prize.delete` に到達。 | `AuthAdmin` 必須。可能なら削除ではなくinactive化。 |
| `POST /admin/nft/upload/metadata` | `nft.routes.ts`, `nft.controller.ts` | `AuthAdmin` なしでExcel uploadからNFT DB作成。 | `AuthAdmin` + file validation。MVP外なら410。 |
| `POST /admin/nft/upload/images` | `nft.routes.ts`, `nft.controller.ts` | `AuthAdmin` なしで画像upload/DB更新。 | `AuthAdmin` + upload制限。 |
| `POST /admin/nft/:nftId/upload-image` | `nft.routes.ts`, `nft.controller.ts` | `AuthAdmin` なしでNFT画像更新。 | `AuthAdmin`。 |
| `POST /admin/nft/upload-to-ipfs` | `nft.routes.ts`, `nft.controller.ts` | `AuthAdmin` なしでIPFS upload/metadata更新へ到達。 | `AuthAdmin`。MVP外なら410。 |
| `POST /admin/nft/refresh-matches` | `nft.routes.ts`, `nft.controller.ts` | `AuthAdmin` なしでNFT画像match更新。 | `AuthAdmin`。 |
| `DELETE /admin/nft/:id` | `nft.routes.ts`, `nft.controller.ts` | `AuthAdmin` なしでNFT削除へ到達。mint済みの場合は拒否があるが、未mint公式NFTを消せる。 | `AuthAdmin`。 |
| `POST /ticket-code/claim` | `ticketCodeRoutes.ts`, `ticketCodeController.ts` | 未認証。body `wallet_address` を信じ、該当userの `tickets` をincrementする。P0-05で二重claimは軽減済みだが本人確認なし。 | `Authenticate` + `req.user.address` / `req.user.user_id` 固定。body wallet_addressを信用しない。 |
| `POST /trial-nfts/claim/:userId` | `trialNft.routes.ts`, `trialNft.controller.ts`, `trialNftService.ts` | 未認証。URL `userId` を使いTrialNFT作成、template mintCount increment、PointHistory作成、FanPoint incrementを実行。 | MVPで使わないなら410。使うなら `Authenticate` + `req.user.user_id` 固定 + transaction/unique制約。 |
| `POST /trial-nfts/expire` | `trialNft.routes.ts`, `trialNft.controller.ts` | 未認証で期限切れTrialNFT更新を実行するadmin/cron相当処理。 | `AuthAdmin` またはinternal job専用化。 |
| `POST /trial-nft-templates/`, `PATCH /trial-nft-templates/:id`, `DELETE /trial-nft-templates/:id` | `trialNftTemplate.routes.ts`, `trialNftTemplate.controller.ts`, `routes.ts` | public mount配下でAuthAdminなし。template作成/更新/削除へ到達。`/admin/trial-nft-templates` も同じ未保護router。 | public routerは `/available` のみに分離。admin routerに `AuthAdmin`。 |
| `GET /referral/referral-code/:walletAddress` | `referral.routes.ts` | 未認証GETだが、userにreferral codeが無い場合または長さが6でない場合に `generateUniqueCode()` 後、`prisma.user.update({ where: { wallet_address }, data: { referral_code } })` へ到達する。URLの `walletAddress` を信じるため、他人walletのreferral codeを作成/上書きできる可能性がある。 | `Authenticate` + `req.user.address` 固定にし、URL walletAddressを信用しない。公開readにする場合でもDB更新はsignup/internal jobへ分離する。 |
| `POST /referral/track-referral` | `referral.routes.ts` | 未認証。body `walletAddress` / `referralCode` を信じ、user作成または `referred_by` 更新、`referralRewards.create` を行う。 | 署名ログインのsignup内処理へ一本化し、このrouteは410または `Authenticate` + `req.user.address` 固定。 |
| `POST /referral/admin/run-snapshot` | `referral.routes.ts` | `AuthAdmin` なし。body `adminKey` と環境変数比較で `referralRewards.snapshot_verified` を更新。 | `AuthAdmin` またはinternal job専用化。body adminKey認可を廃止。 |
| `POST /referral/admin/distribute-rewards` | `referral.routes.ts` | `AuthAdmin` なし。body `adminKey` でFanPoint/PointHistory/referralRewardsを更新。 | `AuthAdmin` + transaction/idempotency。MVP外なら410。 |

## 危険または未確認のroute

| route | 根拠ファイル | 判定 |
| --- | --- | --- |
| `POST /prize/transaction/:user_id/withDraw/:prize_id` | `prize.routes.ts`, `prize.controller.ts` | `Authenticate` はあるがURL `user_id` / `prize_id` を信じる。現状は存在確認後に成功レスポンスを返すだけで送金/DB更新は見つからないためP0ではなくP1/UNKNOWN。将来実装時に危険。 |
| `GET /nfts/holder/:holderId` | `nft.routes.ts`, `nft.controller.ts` | 未認証でholderId指定のNFT一覧取得。mutationはなし。P1 privacy。 |
| `GET /user/:userId/illustrations` | `illustration.routes.ts`, `illustration.controller.ts` | 未認証で他userのIllustration履歴取得。P1 privacy。 |
| `GET /user/info` | `user.routes.ts`, `users.controller.ts` | `Authenticate` はあるがbody `user_id` で任意userのtickets/claimTickets/fan_points/token balanceを取得可能。P1 privacy。 |
| `GET /user/holding/average/:user_id`, `/user/holding/history/:user_id` | `user.routes.ts`, `users.controller.ts` | `Authenticate` はあるがURL `user_id` と `req.user.user_id` の一致確認が見つからない。P1 privacy。 |
| `GET /user/point/history/:user_id`, `/user/daily/point/:user_id` | `user.routes.ts`, `users.controller.ts` | 未認証readまたは本人照合なし。P1 privacy。 |
| `GET /lottery/disco/balance/:user_id`, `/lottery/ticket/:user_id`, `/lottery/ticket/date/:user_id`, `/lottery/ticket/count/:user_id` | `lottery.routes.ts`, `lotter.controller.ts` | 未認証で他userのチケット/保有関連情報を取得可能。`count` は現状DB更新コメントアウト済み。P1 privacy。 |
| `GET /transaction-history/:walletAddress`, `/holding-date/explain/:walletAddress`, `/fifo-snapshot/:walletAddress`, `/transaction/:txHash` | `transactionHistory.routes.ts`, `transactionHistoryController.ts` | 未認証でwallet/txHash指定の取引分類、FIFO、holding date、audit詳細を取得可能。P1 privacy/情報漏えい。 |
| `GET /trial-nfts/can-claim/:userId`, `/user/:userId`, `/total/:userId`, `/stats`, `/all` | `trialNft.routes.ts`, `trialNft.controller.ts` | 未認証read。個人情報/統計漏えい。P1。ただしtrial NFT自体をMVP外にするなら全体410も候補。 |
| `GET /admin/user/all`, `/user/all`, `/admin/user/transaction/:wallet_address` | `user.routes.ts`, `users.controller.ts` | admin/個人情報readが未認証。P1だが管理画面公開前にはAuthAdmin必須。 |
| `GET /admin/airdrop/prize*`, `/admin/nfts`, `/admin/nft/uploaded-images`, `/admin/ticket-distribution*`, `/admin/illustration`, `/admin/news` | 各route/controller | admin readが未認証。直接資産更新はないが、管理データ漏えい。P1。 |
| `GET /monitoring/realtime-status`, `/quicknode-status`, `/service-health`, `/healthcheck` | `monitoring.routes.ts` | 未認証で運用状態を公開。P1。public healthcheckに限定するなら情報量を削る。 |
| `GET /dex/list`, `/fee/history`, `/fee/current` | `dexFee.routes.ts`, `dexFeeController.ts` | read-only公開。tokenomics/分類情報の公開可否は仕様未確定。P1/UNKNOWN。 |

## P1へ回せるroute

- read-onlyの個人情報・管理情報漏えいroute。
- logout GET / cookie CSRF設計。
- `sendToWallet` の `req.user` 未使用、`jwtDecode(cookie)` 依存。
- public monitoring/read-only endpointの情報量削減。
- Transaction History controllerのcatchで `error.message` をレスポンスに含める箇所。

P1扱いの理由: 現時点でDB/残高/FanPoint/NFT/Prize予約/送金状態を直接変更する根拠は見つからないため。ただし管理画面公開、本番運用、個人情報保護の観点ではローンチ前に縮小すべき。

## 次に作るべき小PR案

1. `P0-12B user-owned mutation auth`: Prize draw / Prize transactions / Illustration draw / Daily point / Lottery claim / Ticket code claimを `req.user.user_id` / `req.user.address` 固定へ変更。URL/bodyのuserId/walletを本人判定に使わない。
2. `P0-12C admin mutation auth`: NFT admin upload/delete/refresh、Prize delete、Lottery all-user distributionへ `AuthAdmin` を追加、またはMVP外なら410固定。
3. `P0-12D referral route auth or disable`: `/referral/referral-code/:walletAddress`, `/referral/track-referral`, `/referral/admin/run-snapshot`, `/referral/admin/distribute-rewards` を修正する。一般user routeは `Authenticate` + `req.user.address` 固定、admin routeは `AuthAdmin` またはinternal job専用化、MVP外なら410固定。
4. `P0-12E trial NFT auth or disable`: Trial NFT claim/expire/template create/update/deleteを、MVPで使うなら `Authenticate` / `AuthAdmin` + transaction/unique制約へ、使わないなら410固定。
5. `P1-API-read-privacy`: user/transaction/holding/referral/admin read routeを `Authenticate` / `AuthAdmin` / owner checkへ寄せ、public health/read-onlyを必要最小限に縮小。

## 本番前No-Go条件

- 上記P0 routeが1つでも残る場合はNo-Go。
- `req.user.user_id` よりURL/bodyの `user_id`, `userId`, `wallet_address`, `walletAddress`, `holderId` を優先して資産・ticket・FanPoint・Prize・NFT状態を変更できる場合はNo-Go。
- `/admin/*` またはcron/internal相当routeが `AuthAdmin` なしにDB更新、file upload、IPFS upload、FanPoint付与、ticket配布、referral報酬配布へ到達する場合はNo-Go。
- MVP外機能は修理せず、410固定またはdeploy対象外にする。

## 実行したコマンド

```powershell
git fetch origin
git log -1 --oneline origin/main
git switch -c codex/p0-12a-api-authorization-audit origin/main
git switch -c codex/p0-12a-api-authorization-audit-pr origin/main
Test-Path 'C:\Users\HIRO-001\Documents\IRIS_SPEC_AUTHORITY.md'
Get-ChildItem -Path apps/backend/src/app/routes -File | Select-Object -ExpandProperty Name
Get-ChildItem -Path apps/backend/src/app/controllers -File | Select-Object -ExpandProperty Name
rg -n "router\.(get|post|patch|put|delete)|Router\.use\(" apps/backend/src/app/routes apps/backend/src/app/routes.ts
rg -n "AuthAdmin|Authenticate|req\.user|user_id|userId|wallet_address|holderId|FEATURE_DISABLED|MANUAL_REVIEW_REQUIRED|status\(410\)|asyncHandler" apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config/passport.ts apps/backend/src/app/routes/utils.ts
rg -n "req\.user|decoded\.user_id|jwtDecode|req\.params\.(user_id|userId)|req\.body\.(user_id|userId|wallet_address|walletAddress|holderId)|wallet_address" apps/backend/src/app/controllers apps/backend/src/app/routes
rg -n "ADMIN_PRIVATE_KEY|PRIZE_HOT_WALLET_PRIVATE_KEY|TIER_RELAYER_PRIVATE_KEY|FEATURE_DISABLED|MANUAL_REVIEW_REQUIRED|update_fee|add_factory|add_pair|set_fee|fee_recipient|DEX|pair" apps/backend/src/app/controllers apps/backend/src/app/routes apps/backend/src/app/lib apps/backend/src/app/services apps/backend/src/app/config
git diff --name-only
git status --short
Get-Content -Encoding UTF8 docs/launch/API_AUTHORIZATION_AUDIT.md -First 20
Select-String -Path docs/launch/API_AUTHORIZATION_AUDIT.md -Pattern '\s+$' | Select-Object -First 20
git diff --check
git status --short --branch
```

## 成功/失敗結果

- route/controller/middlewareの静的検索は成功。
- `IRIS_SPEC_AUTHORITY.md` は見つからなかった。
- UTF-8表示確認は成功。
- 新規docの末尾空白検索は該当なし。
- `git diff --check` は成功。ただしuntracked新規fileはGit diff対象外のため、末尾空白は `Select-String` でも確認した。
- 前回レビュー指摘により、`GET /referral/referral-code/:walletAddress` をP0危険routeへ再分類し、referral route修正PRを次PR案に追加した。
- build/testは未実行。今回の変更はdocsのみで、目的はAPI認可棚卸しの静的監査。
