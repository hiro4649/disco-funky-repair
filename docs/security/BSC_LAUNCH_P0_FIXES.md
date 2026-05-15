# BSCローンチ前 P0修正依頼

対象:
- `funky-export/source-export/home-ubuntu/disco/backend`
- `funky-export/source-export/home-ubuntu/disco/front-end`
- `Funky-Contracts-main/Funky-Contracts-main`

## 1. 保有期間tier連携の不一致

最優先で修正してください。

現状:
- Contract: `funky/funky.sol`
  - `update_holding_date(address,uint16,bytes32,bytes32)`
  - fee tier: `0,31,91,181,271,361,541,721`
- Backend:
  - `src/app/lib/tierScheduler.ts`
  - `src/app/lib/holdingDateService.ts`
  - `src/app/services/tokenManagementService.ts`
  - `update_holding_date(address,uint16)` を呼んでいる
  - tier: `0,30,180,360,720`

修正理由:
- ABIが一致せず、tier更新txが失敗する可能性が高い。
- backendが `30/180/360/720` を保存すると、contract側の `feePercent` が未定義になり、売却手数料が想定通り発生しない可能性がある。
- `FunkyRave` はtier updaterをコントラクトに限定しているため、backend EOAから直接更新する設計も合っていない。

必要修正:
- backendのABIをcontract最新仕様に合わせる。
- reasonCode / batchId を付与して呼び出す。
- backend tierを `0,31,91,181,271,361,541,721` に統一する。
- tier updater用コントラクトまたは正式な更新経路を用意し、`add_tier_updater` で登録する。

## 2. ウォレット署名ログイン未実装

現状:
- `front-end/src/context/AuthContext.tsx`
- `front-end/src/components/Header/index.tsx`
- `backend/src/app/controllers/auth.controller.ts`
- wallet addressだけで `/user/signup` してJWTを発行している。

修正理由:
- 他人のwallet addressを入力するだけでログインできる可能性がある。

必要修正:
- nonce発行APIを追加。
- frontendでwallet署名。
- backendで署名検証後にJWT発行。
- JWT後の本人判定は `req.user.user_id` のみに統一する。

## 3. API認可不足

現状:
- `backend/src/app/routes/lottery.routes.ts`
- `backend/src/app/routes/dexFee.routes.ts`
- `backend/src/app/routes/nft.routes.ts`
- `backend/src/app/routes/trialNft.routes.ts`
- `backend/src/app/routes/userManage.routes.ts`
- userId / wallet addressをURLやbodyで受け、本人確認やadmin認証が不足している。

修正理由:
- チケット、DEX設定、NFT管理、内部残高を第三者が操作できる危険がある。

必要修正:
- 一般ユーザーAPIは `Authenticate` 必須。
- admin/API管理系は `AuthAdmin` 必須。
- `:user_id`, `userId`, `wallet_address` は信用せず、ログイン済み本人と一致確認する。
- MVP外機能は一旦ルート遮断する。

## 4. 当選トークン送金の所有者チェック不足

現状:
- `backend/src/app/controllers/prize.controller.ts`
- `sendToWallet` が `prize_id` だけで当選履歴を取得している。
- `prizeTransaction.userId === loginUser.id` の確認がない。
- status遷移と二重送金防止が弱い。

修正理由:
- 他人の当選IDを指定して、自分のwalletへ送金できる可能性がある。
- 並列実行で二重送金される可能性がある。

必要修正:
- 当選履歴取得条件を `{ id: prizeId, userId: req.user.user_id }` にする。
- `READY` のみ送金可能にする。
- `READY -> SENDING -> RECEIVED/FAILED` をtransactionまたは排他制御で守る。
- tx hash、amount、token address、失敗理由を保存する。

## 5. フロントエンド秘密鍵露出

現状:
- `front-end/src/components/admin/TokenManagement/index.tsx`
- `front-end/src/components/admin/NFTManagement/index.tsx`
- `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` を読み、ブラウザ側で署名者を作っている。

修正理由:
- `NEXT_PUBLIC_*` はブラウザに公開されるため、実秘密鍵を置くと即漏洩する。

必要修正:
- frontendから秘密鍵処理を完全撤去する。
- adminのオンチェーン操作はbackend API経由にする。
- backend側でもadmin認証、操作ログ、tx hash保存を必須にする。

## 6. ガチャ抽選とチケット消費の安全化

現状:
- `backend/src/app/controllers/prize.controller.ts`
- 当選作成とチケット減算が分離している。
- 確率抽選が重み付きランダムではなく、最大probability候補から選ばれている。

修正理由:
- 連打や並列実行でチケット残高が壊れる可能性がある。
- 表示確率と実抽選結果が一致しない可能性がある。

必要修正:
- チケット確認、当選作成、チケット減算をDB transaction化する。
- 在庫不足Prizeを抽選対象から除外する。
- `probability` を重みとして使うランダム抽選に修正する。

## 7. BSC本番env検証不足

現状:
- `backend/src/app/lib/validateEnvs.ts`
- JWT/admin系のみ必須チェックしている。

修正理由:
- RPC、秘密鍵、token address、BscScan APIが未設定でも起動し、実行時に失敗する可能性がある。

必要修正:
- `QUICKNODE_HTTP_RPC_URL`
- `QUICKNODE_WS_RPC_URL`
- `ADMIN_PRIVATE_KEY`
- `TOKEN_CONTRACT_ADDRESS`
- `NFT_CONTRACT_ADDRESS`
- `ETHERSCAN_API_KEY` または `BSCSCAN_API_KEY`
- `ETHERSCAN_API_URL`

上記を本番必須にする。

## 推奨順

1. tier連携修正
2. 署名ログイン
3. API認可修正
4. 当選送金修正
5. frontend秘密鍵撤去
6. 抽選/チケットtransaction化
7. BSC env必須化
8. MVP外機能の非公開化
9. testnetでbuild/test/Hardhat compile/実送金確認

## Codex実装メモ

実装済み:
- `funky/FunkyTierUpdater.sol` を追加。
- `scripts/deploy-tier-updater.js` と `package.json` deploy scriptを追加。
- backendのtier境界を `0,31,91,181,271,361,541,721` に統一。
- backendのtier更新を `TIER_UPDATER_CONTRACT_ADDRESS.syncHoldingDate(user,tier,batchId)` 経由に変更。
- `TIER_UPDATER_CONTRACT_ADDRESS` をenvに追加し、本番env必須チェックに追加。
- `/user/auth/nonce` を追加し、`/user/signup` はwallet署名検証後のみJWT発行するよう変更。
- JWT middlewareで `user_id` と `wallet_address` の一致確認を追加。
- user系、lottery系、ticket-code系、NFT系、trial NFT系、DEX/fee系、userManage系、referral admin系の認証/認可を強化。
- referral通常API、transaction history、illustration draw/historyにも本人確認を追加。
- auth/draw/send/claim系に既存rate limiterを適用。
- ガチャ抽選をweighted randomに変更し、チケット減算と当選作成をPrisma transaction内で実行。
- 当選送金はログインユーザー本人の `prizeTransaction` のみ許可し、`READY` のみ `SENDING -> RECEIVED` に進むよう変更。
- frontendの `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` 使用を撤去し、admin画面は秘密鍵なしのread-only接続に変更。
- NFT用Hardhat設定の `evmVersion` を `cancun` に変更。OpenZeppelin 5.4系が使う `MCOPY` は `paris` ではcompile不可で、BSC Mainnet Tycho以降はCancun EIPs対応済み。
- frontendのlint errorを解消し、`package-lock.json` を `npm ci` 可能な状態へ更新。
- backendのJWT middleware / 本人確認helperを型安全化し、本人確認helperの最小Jestテストを追加。
- backend起動構造を修正。`app/index.ts` の import 時 `server.listen` を廃止し、`main.ts` がSocket.IO付き `server` を1回だけlistenする構成に変更。
- production CORSを `FRONTEND_ORIGINS` ベースに変更し、localhost/IP originを本番許可から除外。
- request body limitを `1gb` から `REQUEST_BODY_LIMIT` または `10mb` に縮小。
- productionでは `SESSION_SECRET` 必須化。Cookie domainの `disco.fan` 固定を撤去し、必要な場合のみ `COOKIE_DOMAIN` で指定する形に変更。
- monitoringの `realtime-status` / `quicknode-status` をadmin認証必須化。
- claimTicketsのclaim処理をDB transaction化し、同時実行による二重claimを防止。
- 当選送金でrecipient/token address検証、正の送金額チェック、receipt status確認を追加。
- 当選送金額を `Math.round(amount * 10 ** decimals)` から `ethers.parseUnits` に変更し、JS number由来の整数桁あふれリスクを低減。
- `dualApiKeyManager` を `ETHERSCAN_API_KEY1/2` 必須から、`ETHERSCAN_API_KEY` または `BSCSCAN_API_KEY` 1本でも起動可能な構成に変更。

残り:
- contracts `compile` / `test` / `compile:nft` / `test:nft`、backend `build`、frontend `build` は実行済み。
- frontend `npm ci` / `lint` / `build` は実行済み。lintはwarningのみ。`npm ci` は `--legacy-peer-deps` なしでも通過。
- backend `npm test` は実行済み。`requestUser` helper 5 tests passing。
- backend起動確認はダミーenvで `dist/src/main.js` を短時間実行。`BSCSCAN_API_KEY` 1本でも即時クラッシュせず、タイムアウトまで動作確認。検証用nodeプロセスは停止済み。
- `npm audit --omit=dev` 結果: backend 29件（critical 1 / high 18）、frontend 25件（critical 2 / high 12）、contracts 29件（high 4）。major upgradeや代替パッケージ判断が必要なため未修正。
- backend全体lintは既存lint違反が残っているため未通過。2026-05-15時点で 1949 errors / 161 warnings。
- testnet deploy時は `FunkyTierUpdater` を先にdeployし、そのアドレスを `FUNKY_TIER_UPDATER` として `configure:funky:*` で `FunkyRave` に登録すること。
- backend本番envに `TIER_UPDATER_CONTRACT_ADDRESS` を必ず設定すること。
- 署名ログインnonceは既存DB変更を避けるためメモリ保持。複数backendプロセス構成にする場合はDB/Redis保存へ変更すること。
- frontend adminのオンチェーン操作はread-only化したため、必要ならbackend側にadmin認証付き操作APIを別途実装すること。

## 2026-05-15 追加監査メモ

追加実装:
- Admin/User JWTをレスポンス本文へ返さないよう修正。認証状態はhttpOnly cookieのみで運ぶ。
- Frontend admin loginからRedux token保存とAuthorization header設定を削除。`/admin/verify`の`admin_id`に合わせてID保存を修正。
- `verifyUser` / `refreshToken`でJWT内wallet addressとDB wallet addressを照合。`verifyAdmin`でJWT内emailとDB emailを照合。
- NFT/Trial NFT画像アップロード、NFT metadata Excelアップロードに拡張子+MIME許可リストと安全なファイル名生成を追加。
- Excel upload上限を実質1GBから10MBへ修正。
- Referral admin snapshot/distributionからbody `ADMIN_KEY`依存を削除。`AuthAdmin` cookie認証へ一本化。
- Referral reward配布をPrisma transaction化。`rewarded=false`の条件付き更新、両ユーザーpoint加算、PointHistory作成を同一transactionで実行。
- Referral登録で未検証コードを`referred_by`に保存しないよう修正。自己紹介、重複紹介、途中失敗を防ぐためuser更新とreward作成をtransaction化。

修正理由:
- JWTをJSON/Redux/headerへ置くとXSS時に管理者tokenが漏洩する。cookie-onlyへ寄せる。
- cookie内JWTが古いuser/admin IDを指していても、DB上のwallet/emailと一致しない場合は拒否する必要がある。
- 管理者アップロードでも任意ファイル保存は危険。SVGや実行可能/偽装ファイル、巨大ExcelによるDoSを避ける。
- Referral報酬は途中失敗や並列実行で二重付与/片側付与になり得るため、DB transactionと条件付き更新が必要。
- `ADMIN_KEY` bodyチェックは運用env漏れ/未設定で管理画面からの正規操作を壊し、認証責務が二重化するため削除。

検証:
- backend `npm run build`: pass
- backend `npm test -- --runInBand`: pass (`requestUser` 5 tests)
- backend upload関連target eslint: pass
- backend auth/referral target eslint: fail。既存の`auth.controller.ts` / `referral.routes.ts`に多数のlint違反が残存。
- backend full `npm run lint`: fail (`1949 errors / 161 warnings`)
- frontend `npm run lint`: pass with existing warnings only
- frontend `npm run build`: pass

残リスク:
- backend全体lintは未解消。2026-05-15時点で`1949 errors / 161 warnings`があり、段階的に別タスク化が必要。
- 実DB/RPC/ウォレットでのreferral報酬配布、cookie login、upload拒否の結合テストは未実行。
- `authChallenges`はメモリ保存のまま。複数backend process構成ではDB/Redis保存へ変更が必要。
- 既存DBに不正な`referred_by`やself-referral rewardが残っている場合は、migration/cleanup SQLが必要。

## 2026-05-15 追加監査・残タスク整理

この回で実装した追加修正:
- `trackingTokenBalanceEthereum.ts`の6時間cron内に残っていた古いreferral報酬配布をtransaction化。`rewarded=false`を条件付き更新し、両ユーザーのpoint加算とPointHistory作成を同一transactionへ入れた。
- アップロードファイル名安全化後もNFT画像マッチングが壊れないよう、`nft.controller.ts`に旧形式`timestamp----name`と新形式`timestamp-random-name`の両方を正規化して比較する処理を追加。
- `nft.controller.ts`のLighthouse uploadログから`NFT_STORAGE_API_KEY`の先頭表示を削除。

P0 残タスク:
- Crash gameをMVPから外す、または認証・残高更新・乱数を全面修正する。現状はSocket認証が未使用、`join-game`が任意wallet addressを受け取る、cashout/refundでwalletではなくsocket idを残高更新へ渡す、進行中ゲームの`privateSeed`を`games`イベントで返すため、資金系ゲームとしてローンチ不可。
- `user-manage`系の仮想DISCO残高APIとCrash gameの導線を統一する。Frontendは一般ユーザーから`/user-manage/deposit|withdraw|bet|cashout`を呼ぶが、backend routeは`AuthAdmin`で保護されており、現在の導線は実ユーザーでは成立しない。
- `snapshot.service.ts`を使うなら、`referral.routes.ts`/6時間cronと同じtransactionロジックへ統一する。現状の`runDailyProcess`ではsnapshot/rewardがコメントアウトされ、未使用メソッド側は18 decimalsではなく9 decimals前提、かつ非transaction配布が残っている。

P1 残タスク:
- `app/index.ts`の`express.static(uploadsPath)`と`/api/icons -> uploadsPath`はuploads全体を公開する。画像だけを`/api/icons/images`に限定し、Excel/一時metadata JSONをpublic配下に置かない構造へ分離する。
- `snapshot.service.ts`/`trackingTokenBalanceEthereum.ts`/`referral.routes.ts`に分散したreferral判定・付与ロジックを1つのserviceへ集約する。現状は同じ責務が複数箇所にあり、再発リスクが高い。
- Sui/DISCO由来の命名とコメントをBSC/FUNKYへ整理する。ただし先に使う機能と捨てる機能を固定し、広範囲リネームは最後に回す。

P2 残タスク:
- scripts配下の検証用ログでWebhook URLの一部を表示している箇所を削除する。通常起動経路ではないが、共有ログに残るリスクがある。
- Contract governanceはmulti-adminだが、multisig/timelockはコード上強制されていない。ローンチ手順でadminをmultisigにし、EOA運用を避ける。

今回の検証:
- backend `npm run build`: pass
- backend `npm test -- --runInBand`: pass (`requestUser` 5 tests)
- JWT本文返却/Admin token Redux保存/IPFS API key部分ログの再スキャン: 該当なし
## 2026-05-15 追加監査・認証後API/ゲーム/残タスク整理

今回確認したこと:
- Trial NFT、Transaction History、Referral通常APIは、`Authenticate` 後に `req.user` の userId と URL/body の userId または wallet address を照合している。ここは現時点で P0 ではない。
- Cookie 認証化後も backend は `Authorization: Bearer` fallback を残している。frontend 側の admin token 保存は消えているが、backend policy としてまだ明確化が必要。

P0 追加:
- `ticketCodeController.claimTicketCode` は `findUnique -> ticketCode.update -> user.update` が分離しており、同じ code を並列 claim すると複数ユーザー/複数回 ticket 加算される可能性がある。`/ticket-code/claim` は `Authenticate` + rate limit 済みだが、DB transaction と `status=PENDING` 条件付き update が必要。
  - 対象: `backend/src/app/controllers/ticketCodeController.ts`
  - 最小修正: `prisma.$transaction` 内で `ticketCode.updateMany({ where: { id, status: 'PENDING' } })` を実行し、更新件数が1件の時だけ user tickets を increment。期限切れ更新も transaction 内へ寄せる。
  - 追加推奨: code は現在6文字かつ `Math.random`。`crypto.randomBytes` または `crypto.randomInt` ベースに変更し、長さを10-12文字以上へ上げる。
- Crash game / virtual DISCO balance は MVP から外すか全面修正が必要。現状のままローンチ不可。
  - 対象: `backend/src/app/controllers/crashGame.controller.ts`, `backend/src/app/routes/crashGame.routes.ts`, `backend/src/app/routes/userManage.routes.ts`, `front-end/src/components/CrashGame/*`
  - 根拠: Socket の `auth` が未使用、`join-game` が任意 wallet address を受け取る、`privateSeed` を進行中ゲームで返す、乱数が `Math.random`、refund/cashout が wallet address ではなく socket id を残高更新に渡す。
  - frontend は `/user-manage/deposit|withdraw` に mock tx hash (`deposit_${Date.now()}` / `withdraw_${Date.now()}`) を送るが、backend は `AuthAdmin` にしているため現導線は一般ユーザーでは成立しない。仮に一般公開すると任意入金/mint に近い危険がある。
  - 最小修正方針: MVPでは `/crashx` socket、`/crash/games`、`/fan-games` 導線、`user-manage` 一般ユーザー導線を無効化。採用する場合は、署名済みwallet本人確認、server-side ledger、on-chain deposit/withdraw検証、CSPRNG/commit-reveal、DB transaction を含む別タスクにする。

P1 追加:
- Cookie 認証後の CSRF 方針が未完成。production cookie は `sameSite=strict` だが、状態変更API全体に CSRF token はない。`/user/logout` と `/admin/logout` は GET。
  - 対象: `backend/src/app/config/passport.ts`, `backend/src/app/index.ts`, `backend/src/app/routes/auth.routes.ts`
  - 最小修正: browser向けAPIでは Bearer fallback と CORS `Authorization` 許可を外す、または machine/API用ルートを分離する。状態変更APIへ double-submit CSRF token 追加。logout は POST 化。
- `app.use(express.static(uploadsPath))` と `/api/icons -> uploadsPath` が uploads 全体を公開している。
  - 対象: `backend/src/app/index.ts`
  - 最小修正: public は `uploads/images` のみに限定。Excel、metadata JSON、一時ファイルは private storage へ分離。
- Referral snapshot/reward は `referral.routes.ts`、6時間cron、`snapshot.service.ts` に責務が分散している。`snapshot.service.ts` は未使用気味かつ古い Sui/9 decimals 前提が残る。
  - 最小修正: referral reward 判定/付与は1つの service に集約し、18 decimals と BSC token address 前提に統一。未使用 service は削除または admin route から呼ばれない形で明示的に隔離。

P2 追加:
- Contract governance は multi-admin だが、multisig/timelock/pause はコード上強制されない。`remove_tier_updater` は最後の updater を直接削除できないため、侵害時は「新updater追加 -> 旧updater削除」の運用手順が必要。
  - 対象: `Funky-Contracts-main/Funky-Contracts-main/funky/funky.sol`, `FunkyTierUpdater.sol`
  - 最小修正: launch runbook に admin multisig、tier updater owner multisig、緊急ローテーション手順、fee変更手順を固定。コードで pause/timelock を入れるかは別判断。

最小タスク順:
1. Crash game を MVP に入れる/捨てる判断を固定。捨てるなら socket/route/frontend導線を無効化。
2. ticket code claim を transaction 化し、乱数コード生成を CSPRNG 化。
3. Cookie 認証の CSRF/Bearer fallback 方針を確定して実装。
4. uploads 公開範囲を images のみに限定。
5. referral snapshot/reward を1 service に集約し、BSC/18 decimals 前提で統一。
6. contract admin/tier updater の multisig 運用手順を launch checklist に入れる。

## 2026-05-15 追加監査: NFT/Illustration/DB/本番設定の残リスク

今回確認したこと:
- `/lottery/update-status` は `isSixHourUpdateRunning()` を返すだけで、DB更新は見つからない。現時点では公開読み取りAPIとして扱える。
- Trial NFT、Transaction History、Referral通常APIは本人確認の追加済み箇所が多く、直近のP0ではない。
- ただし NFT/Illustration/FanPoint 系に、BSCローンチ前に止めるべき残リスクがある。

P0: NFT自己mint/ポイント付与
- 対象: `backend/src/app/routes/nft.routes.ts`, `backend/src/app/controllers/nft.controller.ts`
- `PATCH /nft/:id` が一般ユーザー認証だけで呼べる。body の `holderId` と `mintStatus` を信じて DB の NFT 所有状態を更新し、`mintStatus=true` の場合に FanPoint を付与している。
- on-chain mint tx、receipt、Transfer log、token owner の検証がないため、ユーザーが自分でNFTをmint済みにできる可能性がある。
- さらにポイント付与が一回限りかDB制約で保証されていないため、同一NFTに対する重複付与リスクがある。
- 最小修正: このAPIを admin/internal 専用にする。ユーザー操作で更新する場合は `txHash` を必須にし、BSC RPCで receipt/log/contract owner を検証する。ポイント付与はDB transaction内で「未mintからmint済みへ変わった1回だけ」に限定する。

P0: Illustrationガチャのチケット未消費
- 対象: `backend/src/app/routes/illustration.routes.ts`, `backend/src/app/controllers/illustration.controller.ts`
- `POST /user/:userId/draw-illustration` は `user.tickets < 1` を確認するが、draw成功後に `tickets` を decrement していない。
- 1枚以上チケットを持つユーザーが、rate limit の範囲内で繰り返しFanPoint/Illustration履歴を増やせる可能性がある。
- 最小修正: draw処理全体を Prisma transaction に入れ、最初に `tickets > 0` 条件付き `decrement` を行う。減算成功時だけ抽選、PointHistory、fan_points更新、illustrationHistory作成を実行する。

P0: 任意Illustration追加API
- 対象: `backend/src/app/routes/illustration.routes.ts`, `backend/src/app/controllers/illustration.controller.ts`
- `POST /user/illustration` は本人確認済みでも、ユーザーが任意の `illustrationId` を自分に追加できる形に見える。
- NFT保有者の場合、追加時に `illustration.earned_pts` のFanPointが付与されるため、抽選結果を経由しないポイント付与経路になり得る。
- 最小修正: MVPでは admin/internal 専用にするか削除する。ユーザー向けに残す場合は、直前の正規draw結果または署名済みclaim tokenと照合する。

P1: Trial NFT claim の並列実行
- 対象: `backend/src/app/lib/trialNftService.ts`
- 月次claim確認、TrialNFT作成、template `mintCount` 加算、PointHistory作成、user fan_points加算が分離している。
- 並列リクエストで同月複数claim、maxMints超過、ポイント二重付与が起きる可能性がある。
- 最小修正: `(userId, month)` 相当のunique制約またはclaim keyを追加し、template更新は `mintCount < maxMints` の条件付きupdateにする。作成とポイント付与は1 transactionへまとめる。

P1: Daily point/Trial bonus の重複付与
- 対象: `backend/src/app/controllers/users.controller.ts`, `backend/src/app/lib/trialNftService.ts`
- Daily point は「当日AM/PM履歴の存在確認」と「PointHistory作成/user更新」が分離している。
- Trial NFT daily bonus も cron 再実行時の一日一回保証がDB制約で固定されていない。
- 最小修正: bonus window/day を含む一意キーをPointHistory側に作るか、claim/bonus ledger tableを追加し、作成とuser更新をtransaction化する。

P1: BscScan/API key のログ露出
- 対象: `backend/src/app/lib/getToken.ts`, `backend/src/app/lib/incrementalHoldingDateProcessor.ts`, `backend/src/app/lib/realtimeHoldingDateUpdater.ts`
- `apikey=` を含むURLをそのまま `console.log` している箇所がある。
- 本番ログ、外部監視、障害調査共有でBscScan API key が漏れる可能性がある。
- 最小修正: URLログから `apikey` を削除またはマスクする。ログは address、page、block range、status のみにする。

P1: Prisma migration 不在
- 対象: `backend/prisma/schema.prisma`, `backend/package.json`
- `prisma/migrations` が見つからず、`package.json` に `prisma migrate deploy` / `prisma generate` の本番手順がない。
- ローンチ時にDB構造を再現できず、環境差分で権限/残高/ポイント処理が壊れるリスクがある。
- 最小修正: 現行本番DBを基準に migration baseline を作り、deploy手順に `prisma migrate deploy` と `prisma generate` を入れる。

P1: BSC本番設定に古いSepolia/Sui由来が残る
- 対象: `backend/src/app/config/env.ts`, `backend/src/app/lib/incrementalHoldingDateProcessor.ts`, `front-end/src/components/admin/TokenManagement/index.tsx`, `front-end/src/components/admin/NFTManagement/index.tsx`, `front-end/src/components/OfficalDiscoNFT/index.tsx`, `front-end/src/config.js`
- backend dev/test default に古い contract address や Ethereum API URL fallback が残る。
- frontend admin 画面に `Sepolia Testnet` 表示と `sepolia.etherscan.io` link が残る。NFT address fallback も固定値が残る。
- `front-end/src/config.js` にはSui package idが残るが、現時点では未使用に見える。
- 最小修正: BSCでは chain/explorer/address をenv必須にする。fallback addressは削除し、未設定ならUIを無効化する。

P1: 金額/トークン量の Float 混在
- 対象: `backend/prisma/schema.prisma`, token tracking系lib
- `HoldDateHistory.purchase_amount` は Decimal(38,18) だが、`disco_balance`, `held_amount`, `Prize.balance`, `TransactionHistory.amount` などに Float/DoublePrecision が残る。
- ERC20 18 decimals、抽選残高、仮想残高、履歴集計で丸め誤差が発生し得る。
- 最小修正: on-chain token量と送金額は Decimal/string/BigInt を境界で統一する。表示用だけNumberへ変換する。

P1: 署名ログインnonceのメモリ保存
- 対象: `backend/src/app/controllers/auth.controller.ts`
- nonceは `Map` メモリ保存で5分TTL。単一プロセスでは動くが、複数backendプロセス、restart、load balancer 環境では検証が不安定になる。
- 最小修正: DBまたはRedisに保存し、wallet address、nonce hash、expiresAt、usedAt を持たせる。検証時は一回限りで消費する。

P2: 使わない認証/旧設定の掃除
- 対象: `front-end/utils/setAuthToken.ts`, `front-end/src/config.js`
- frontend側の `setAuthToken` は現時点で参照が見つからない。Sui package設定も未使用に見える。
- 最小修正: MVP機能固定後に削除候補へ入れる。今はP0修正を優先し、削除は最後に回す。

最小タスク順:
1. `PATCH /nft/:id` を admin/internal 専用化、または on-chain receipt/owner 検証付きに変更する。
2. Illustration draw を transaction化し、チケットを条件付きdecrementする。
3. `POST /user/illustration` を停止または admin/internal 専用化する。
4. Trial NFT、Daily point、Trial daily bonus に一意制約/ledger/transactionを追加する。
5. API key を含むURLログを全削除またはマスクする。
6. BSC explorer/address/env fallback を本番必須設定に寄せる。
7. Prisma migration baseline と本番deploy手順を作る。
8. Float混在箇所を「送金/残高に直結する順」でDecimal/string/BigIntへ寄せる。

## 2026-05-15 最終追加監査: contract/NFT/公開入口/env

今回確認したこと:
- backend route棚卸しでは、公開でDB更新する新規P0は追加発見なし。P0は既に記録済みの NFT/Illustration/Crash/ticket claim が中心。
- Transaction History、User holding/point、Referral通常APIは本人確認が入っている。
- `.env` 実体や秘密鍵そのもののコミットは見つからない。ただし env名、RPC、API key利用箇所、ログ露出リスクは残る。
- token contract はtier feeの基本実装はあるが、運用停止/ガバナンス/有効tier固定はローンチ前に整理が必要。
- NFT contract は公式限定NFTとしては未完成。

P0: NFT contractが公式限定NFTとして無制限mint可能
- 対象: `Funky-Contracts-main/Funky-Contracts-main/funky-nft/funky-nft.sol`
- `mint(address to, string tokenURI)` と `batchMint(address to, string[] tokenURIs)` が public payable。支払い条件を満たせば、誰でも任意の `to` と任意の `tokenURI` でmintできる。
- supply cap、tokenURI allowlist、backend署名voucher、sale開始/停止、mint先の制限がない。
- 「FUNKY Genesis NFT は限定・公式metadataで販売する」仕様なら、このままではローンチ不可。任意metadata NFTが公式コントラクト上に作られる。
- 最小修正: `MAX_SUPPLY`、mint有効/停止フラグ、owner管理のbaseURIまたはmetadata allowlist、EIP-712 voucher/merkle proof のいずれかを追加。ユーザーmintは `to == msg.sender` を基本にし、代理mintが必要なら署名で許可する。

P1: NFT contractの価格feed/withdraw/owner運用
- 対象: `funky-nft/funky-nft.sol`, `scripts/deploy-nft.js`, `hardhat.config.nft.js`
- constructorで `priceFeedAddress` と `royaltyRecipient` のzero address確認がない。
- Chainlink `latestRoundData()` の `updatedAt` / stale price / round completeness を確認していない。
- `withdraw()` が `transfer` のため、ownerをmultisig/contract walletにした場合に失敗する可能性がある。
- `Ownable(msg.sender)` のため、deploy直後のownerはdeploy鍵。multisig移管手順が必須。
- 最小修正: zero address check、stale price guard、`call` + result check のwithdraw、deploy直後の `transferOwnership(multisig)` runbook化。

P1: token contractのfee tier keyが任意に作れる
- 対象: `funky/funky.sol`
- `update_fee_percentage(uint16 _holdingDate, uint16 _newFeePercent)` は `_holdingDate` の有効値を制限していない。
- backendが使うtierは `0,31,91,181,271,361,541,721` だが、admin操作ミスで未知tierにfeeを設定できる。`update_holding_date` も任意 `uint16` を受けるため、backend/contractのtier不一致が再発し得る。
- 最小修正: valid tier mapping/array をcontract側に持たせ、fee更新とholdingDate更新は有効tierだけ許可する。

P1: token contractに緊急停止がない
- 対象: `funky/funky.sol`, `FunkyTierUpdater.sol`
- sell fee、DEX登録、tier updater、fee recipient の設定ミスや秘密鍵侵害時に、transfer/tier updateを一時停止する仕組みがない。
- ERC20そのものを止めない設計なら妥当だが、ローンチ運用では「何を止めるか」を明確にする必要がある。
- 最小修正: 少なくとも tier update と admin fee変更の運用停止手順をrunbook化。コードで対応するなら `Pausable` を使い、pause対象を `update_holding_date` / fee変更 / DEX登録に限定するか、全transfer停止まで含めるかを事前決定する。

P1: frontend画像設定が広すぎる
- 対象: `front-end/next.config.mjs`
- `images.remotePatterns` が `https://**` を許可し、`dangerouslyAllowSVG: true`、`unoptimized: true` になっている。
- 現時点でupload側はMIME制限を入れているが、DBや外部URI由来の画像を表示する導線では、任意host/SVGを許す運用リスクが残る。
- 最小修正: NFT/IPFS/CDN/BSCScan等、必要hostだけに限定。SVGを使う必要がなければ `dangerouslyAllowSVG` をfalseへ戻す。

P2: Sui/DISCO由来依存と表示名が残る
- 対象: `backend/package.json`, `backend/prisma/schema.prisma`, `backend/src/app/routes/routes.ts`, `front-end/src/config.js`, frontend locale/admin表示
- backend package名/description、`@mysten/sui` dependency、Prismaコメント、welcome text、Sui package id、Sepolia explorer表示が残る。
- 直接のハッキング原因ではないが、BSC版の保守・監査・運用手順で混乱する。
- 最小修正: MVP機能固定後に、使わないSui依存と古い表示名を削除。ユーザー導線・API名の大規模改名は最後に回す。

P2: frontend buildでlint無視設定
- 対象: `front-end/next.config.mjs`
- `eslint.ignoreDuringBuilds: true` のため、CI/buildだけではlint違反を止められない。
- 最小修正: 既存lint違反整理後、production CIではlintを必須化する。

追加後の最小タスク順:
1. 既存P0の `PATCH /nft/:id`, Illustration draw, `POST /user/illustration` を修正。
2. NFT contractを「限定公式NFT」に合わせて cap/metadata制御/停止/owner移管まで実装。
3. token contractのvalid tier制約を追加し、backend tier更新と一致させる。
4. ticket claim、Trial NFT、Daily point の二重付与防止をtransaction/unique制約で固める。
5. BSC env、explorer、API keyログ、Prisma migration、Float混在を順番に片付ける。
6. Crash game と user-manage のMVP採否を固定し、捨てる場合は導線/route/socketを無効化。

静的監査の状態:
- backend / frontend / contracts の主要ローンチ経路に対する静的監査は一巡完了。
- ここから先は新規監査を増やすより、P0実装と build/test/Hardhat compile/test/testnet検証へ進む段階。

## 2026-05-15 記録漏れ確認・セキュリティ監査確認

記録漏れとして追記:
- ガチャ抽選の乱数公平性が独立タスクとして弱かった。
- 対象: `backend/src/app/controllers/prize.controller.ts`, `backend/src/app/controllers/illustration.controller.ts`
- `drawPrize` の weighted random と Illustration draw のポイント帯選択で `Math.random()` を使っている。
- crypto reward / NFT / FanPoint が絡む抽選では、`Math.random()` は暗号学的乱数ではなく、抽選結果の事後監査ログも不足している。
- Illustration draw はさらに、ポイント帯を乱数で選んだ後、その帯の中では最高 `probability` のIllustrationを選ぶため、同一帯内の各Illustration確率が実抽選に反映されない。
- 最小修正: `crypto.randomInt` または `crypto.randomBytes` ベースのCSPRNGへ変更する。抽選ごとに `drawId`, `algorithmVersion`, `eligiblePrizeIds`, `weights`, `roll`, `seedHash` または `serverSeedHash`, `resultId`, `createdAt` をDBへ保存する。
- 公平性を外部説明するなら commit-reveal 方式、または運営署名付きの抽選ログを導入する。

確認済み:
- P0/P1/P2の主要カテゴリは記録済み: 署名ログイン、API認可、当選送金、秘密鍵露出、tier連携、CORS/body limit、upload、referral、ticket claim、Crash game、CSRF、static uploads、NFT/Illustration、Trial NFT/Daily bonus、API keyログ、Prisma migration、BSC env、Float混在、nonce、NFT contract、token contract governance、frontend画像設定、lint/audit。
- `.env` 実体や秘密鍵そのもののコミットは今回の検索範囲では見つからない。
- `dangerouslySetInnerHTML` / `innerHTML` は見つかったが、確認した範囲では静的service worker登録または内部生成confettiで、ユーザー入力由来の即時P0 XSS証拠は見つからない。
- `npm audit --omit=dev` の結果は既に記録済み。未修正のままなので、依存更新はP1の別タスクとして残る。

監査状態:
- 記録漏れ確認後、静的セキュリティ監査は完了扱い。
- 次は追加監査ではなく、P0実装、依存audit対応、build/test/Hardhat compile/testnet検証へ進む。

## 2026-05-15 タスク対象修正: Crash game除外

方針:
- Crash game は実装予定なしのため、機能完成・乱数改善・残高連携修正の対象から除外する。
- ただし、コードやroute/socket/frontend導線が残る場合は、BSCローンチ時にユーザーから到達できないよう無効化・非表示にする。

タスク数の更新:
- 修正タスク合計: 27件 -> 26件。
- P0: 7件 -> 6件。
- P1: 16件のまま。
- P2: 4件のまま。

除外したP0:
- Crash game / virtual DISCO balance をゲームとして完成させるタスク。

残す安全確認:
- `/crashx` socket、`/crash/games`、`/fan-games`、frontend CrashGame 導線、一般ユーザー向け `user-manage` 導線が本番で公開されないことを確認する。

## 2026-05-15 厳格セキュリティ監査: 送金/抽選券の追加リスク

追加P0:
- 当選送金後のDB更新失敗で二重送金が起き得る。
  - 対象: `backend/src/app/controllers/prize.controller.ts`
  - 根拠: `sendToWallet` は `sendTokensToWallet()` がreceipt成功を返した後に `prizeTransactions` を `RECEIVED` へ更新する。このDB更新が失敗すると同じ `catch` で `SENDING -> READY` に戻すため、チェーン上では送金済みなのに再実行で再送できる状態になる。
  - 最小修正: 送金tx発行後は `READY` に戻さない。`tx_hash` を先に保存し、`BROADCASTED` / `MANUAL_REVIEW` / `RECEIVED` のような状態に分ける。catchは「tx送信前/送信失敗」と「tx送信後のDB永続化失敗」で分離し、tx_hashがある再試行は再送ではなくreceipt確認から再開する。

追加P1:
- ガチャ券配布が冪等ではなく、cron/admin再実行で同日チケットが重複付与され得る。
  - 対象: `backend/src/app/lib/trackingTokenBalanceEthereum.ts`, `backend/src/app/controllers/lotter.controller.ts`
  - 根拠: `handleUserTickets` は同日の `lotteryTickets` が存在しても `ticket` と `user.claimTickets` をincrementする。`processSixHourTokenBalance` / `processWeeklyBonus` / admin配布が再実行されると、同じ保有条件に対して抽選券が追加付与される可能性がある。抽選券は当選トークンに直結するため、単なる表示不整合ではない。
  - 最小修正: `userId + distributionDate + distributionType` の一意キーまたはledgerを追加し、同一期間・同一根拠の配布は1回だけにする。再計算時は差分だけを反映し、`lotteryTickets`, `claimTickets`, `tickets` を1 transactionで更新する。

追加P1:
- 当選送金APIの想定外エラーがレスポンスへ露出している。
  - 対象: `backend/src/app/controllers/prize.controller.ts`
  - 根拠: `sendToWallet` の外側catchが `error: err` を返す。RPC/ethers/DBエラー内容がクライアントへ出ると、運用情報や内部構造の露出につながる。
  - 最小修正: クライアントへは固定文言とcorrelation idのみ返す。詳細はサーバログに限定し、秘密値やRPC URL/API keyをマスクする。

タスク数の再更新:
- Crash game除外後の修正タスク合計: 26件 -> 29件。
- P0: 6件 -> 7件。
- P1: 16件 -> 18件。
- P2: 4件のまま。

監査完了判断:
- 追加の厳格監査で新規P0/P1を上記に記録済み。
- Crash gameは実装予定なしのため、完成タスクには戻さない。本番でroute/socket/frontend導線を無効化する安全確認だけ残す。
- これ以上は追加監査ではなく、P0実装、build/test、Hardhat compile/testnet送金確認へ進む段階。

## 2026-05-15 厳格セキュリティ監査: server export重複ソース/秘密値

追加P0:
- `funky-export/source-export/var-www` 配下に古いSui版の稼働コピーらしき backend/frontend が残っている。
  - 対象: `var-www/disco-back-end`, `var-www/disco.fan`
  - 根拠: `var-www/disco-back-end/src/app/utils/tokenHeplers.ts` は `SuiClient`, `Ed25519Keypair`, `coinWithBalance`, `platformKeypair` を使ったSui送金実装のまま。`var-www/disco.fan` も `@suiet/wallet-kit`, Sui package id, `suivision.xyz` 導線が多数残っている。
  - 危険: BSC版として修正する対象が `home-ubuntu/disco` でも、本番のsystemd/pm2/nginx/deployが `var-www` 側を参照していると、P0修正をすべてすり抜けて古いSui版が稼働する。
  - 最小修正: ローンチ前に稼働プロセス、nginx root/proxy、pm2/systemd、deploy scriptの参照先を固定する。BSC版の単一source of truthを決め、`var-www` 側は本番artifactとして再生成するか、明示的に除外/削除する。起動確認ではAPIレスポンスだけでなく、プロセスcwdとcommit/hashをログ出力して照合する。

追加P1:
- 古い `var-www/disco-back-end` にNFT storage API keyのハードコードfallbackが残っている。
  - 対象: `var-www/disco-back-end/src/app/services/nftService.ts`
  - 根拠: `process.env.NFT_STORAGE_API_KEY || '<固定値>'` の形で固定API keyが埋め込まれている。
  - 危険: export共有、Git管理、ログ/調査共有でAPI keyが漏えいし、NFT/IPFS storageの不正利用や運用コスト、公式metadata汚染の原因になる。
  - 最小修正: 該当keyを即時失効/ローテーションし、fallbackを削除する。API keyは環境変数/secret managerのみから読み、未設定時は起動失敗にする。

タスク数の再更新:
- 直前の修正タスク合計: 29件 -> 31件。
- P0: 7件 -> 8件。
- P1: 18件 -> 19件。
- P2: 4件のまま。

監査完了判断:
- 追加の厳格監査で、実装コードではなく「どのコードが本番で動くか」のP0を追加記録済み。
- 秘密情報検索では、対象ソース内に `.env` 実体は見つからない。ただし上記の固定API key fallbackは漏えい済み扱いでローテーション必須。
- これ以上は追加監査ではなく、P0実装、deploy参照先確認、secret rotation、build/test/Hardhat compile/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: var-www管理API認可漏れ

追加P0:
- 古い `var-www/disco-back-end` に未認証の管理APIが多数残っている。
  - 対象: `var-www/disco-back-end/src/app/routes/prize.routes.ts`, `var-www/disco-back-end/src/app/routes/nft.routes.ts`, `var-www/disco-back-end/src/app/routes/user.routes.ts`, `var-www/disco-back-end/src/app/routes/ticket-distribution.routes.ts`
  - 根拠: `GET /admin/airdrop/prize`, `GET /admin/airdrop/prize/:prize_id`, `DELETE /admin/airdrop/prize/:prize_id`, `POST /admin/nft/upload/metadata`, `POST /admin/nft/upload/images`, `GET /admin/nfts`, `GET /admin/user/all`, `GET /admin/user/transaction/:wallet_address`, `GET /admin/ticket-distribution`, `GET /admin/ticket-distribution/:id` などに `AuthAdmin` が付いていない。
  - 危険: もしPM2/nginx/deployが `var-www/disco-back-end` を参照していると、外部から賞品削除、NFT metadata/upload、全ユーザー情報・取引履歴・ticket配布設定の閲覧が可能になる。暗号通貨サービスでは資金導線と個人ウォレット情報の漏えい/改ざんに直結するためP0。
  - 最小修正: `var-www` 側を本番対象から外すか、全 `/admin/*` と個人情報APIへ `AuthAdmin` を必須化する。リバースプロキシ側でも `/api/admin/*` をIP制限/Basic認証/WAFで二重防御する。PM2の `funky-backend` が起動しているcwd/scriptを必ず取得し、BSC版の `home-ubuntu/disco/backend` 以外なら即停止する。

タスク数の再更新:
- 直前の修正タスク合計: 31件 -> 32件。
- P0: 8件 -> 9件。
- P1: 19件のまま。
- P2: 4件のまま。

監査完了判断:
- 追加の厳格監査で、`var-www` 側の未認証管理APIをP0として追加記録済み。
- これ以上は追加監査ではなく、P0実装、PM2/nginx/deploy参照先確認、secret rotation、build/test/Hardhat compile/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: Docker/実行環境ハードニング

追加P1:
- Docker設定が開発用途のまま本番利用され得る。
  - 対象: `home-ubuntu/disco/backend/docker-compose.yml`, `home-ubuntu/disco/backend/Dockerfile.dev`, `var-www/disco-back-end/docker-compose.yml`, `var-www/disco-back-end/Dockerfile.dev`, backend `Dockerfile`
  - 根拠: `docker-compose.yml` は `Dockerfile.dev` を使い、`./src:/app/src` をmountし、`5000:5000` と `9229:9229` をhost公開している。`Dockerfile.dev` は `start:dev` で起動する。production用 `Dockerfile` も `node:16-alpine` を使う。
  - 危険: 本番でdev composeを使うと `NODE_ENV=development` 起動になり、cookie secure/CORS/CSPなどが開発設定へ寄る。`9229` は現状コマンド上ただちにlisten確定ではないが、Node inspectorを有効にした場合は秘密鍵/RPC/API keyを含むプロセスへ到達され得る。`node:16-alpine` は本番runtimeとして古く、暗号通貨サービスではbase image更新遅れが攻撃面になる。
  - 最小修正: 本番deployでは `docker-compose.yml` / `Dockerfile.dev` を使用禁止にする。production composeを別名で作り、debug portを公開しない、source mountをしない、`NODE_ENV=production` を強制、Node 20/22 LTS系base imageへ更新する。CIでdev composeが本番環境へ使われたらfailさせる。

タスク数の再更新:
- 直前の修正タスク合計: 32件 -> 33件。
- P0: 9件のまま。
- P1: 19件 -> 20件。
- P2: 4件のまま。

監査完了判断:
- 追加の厳格監査で、Docker/実行環境ハードニングをP1として追加記録済み。
- `npm audit --omit=dev` の再実行は、この端末のPowerShellで `npm` がPATH上になく未実行。既存のaudit結果は過去記録のまま残す。
- これ以上は追加監査ではなく、P0/P1実装、PM2/nginx/deploy参照先確認、secret rotation、build/test/Hardhat compile/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: 当選在庫予約と公開ディレクトリ

追加P0:
- ガチャ当選時に賞品トークン残高/在庫が予約されず、支払い不能な当選が積み上がり得る。
  - 対象: `home-ubuntu/disco/backend/src/app/controllers/prize.controller.ts`, `home-ubuntu/disco/backend/prisma/schema.prisma`
  - 根拠: `drawPrize` は `Prize.balance` と `quantity / price` で当選候補を絞るが、`PrizeTransactions.create` の時点で `Prize.balance` / 予約済み量 / 当選上限を減算しない。`PrizeTransactions` に予約量・送金予定量の固定値もない。送金時は最新の `Prize.quantity` / `Prize.price` から再計算するため、管理画面更新や複数当選で当選時の約束量と送金量がずれる可能性がある。
  - 危険: 実残高を超えるREADY当選が発生し、後続の `sendToWallet` で送金失敗する。暗号通貨報酬サービスでは「当選したのに支払えない」状態が信用毀損・資金運用事故に直結する。
  - 最小修正: 当選時に送金予定量を最小単位文字列/Decimalで `PrizeTransactions` に保存する。`Prize` に `reserved_amount` または在庫ledgerを追加し、DB transaction内で `available >= amount` を条件に予約する。送金成功でreservedを消し込み、期限切れ/取消で予約解除する。送金時は管理画面の最新値ではなく当選時に固定した量を使う。

追加P1:
- `var-www` 配下に `.git` / `.vscode` / `.idea` が残っており、Web root設定次第でソース履歴や設定が漏洩し得る。
  - 対象: `funky-export/source-export/var-www/disco.fan/.git`, `funky-export/source-export/var-www/disco-back-end/.git`, `.vscode`, `.idea`
  - 根拠: export内で `var-www/disco.fan/.git` と `var-www/disco-back-end/.git` の実体を確認。PM2 describeはcwd/scriptを確認できず、nginx root/proxy設定もexport内に十分な証跡がない。
  - 危険: `var-www` が直接公開されている場合、`.git/HEAD` やobjectからソース・履歴・過去の秘密情報が復元される。古いSui版や固定API key fallbackが同treeに残るため、漏洩時の影響が大きい。
  - 最小修正: 本番Web rootから `.git`, `.vscode`, `.idea`, `src`, `prisma`, `uploads` の不要公開を排除する。nginxで `location ~ /\. { deny all; }` を入れ、deploy artifactはbuild成果物だけにする。PM2/nginxの実参照先をサーバ上で確認し、公開ディレクトリにソース管理情報がないことをCI/deployで検査する。

タスク数の再更新:
- 直前の修正タスク合計: 33件 -> 35件。
- P0: 9件 -> 10件。
- P1: 20件 -> 21件。
- P2: 4件のまま。

監査完了判断:
- 追加の厳格監査で、当選在庫予約不足をP0、公開ディレクトリのdotfile/source管理情報残存をP1として記録済み。
- これ以上は静的監査を増やすより、P0実装、deploy参照先の実サーバ確認、secret rotation、依存脆弱性対応、build/test/Hardhat compile/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: 認証境界ハードニング

追加P1:
- ウォレット署名ログインの署名文がSIWE/EIP-4361相当ではなく、domain/URI/chainIdへの拘束が弱い。
  - 対象: `home-ubuntu/disco/backend/src/app/controllers/auth.controller.ts`
  - 根拠: `createAuthMessage` は `Sign in to FUNKY RAVE.`, wallet, nonce, issuedAt, expiresAt を含むが、domain、URI、chainId、statement、version を含まない。nonceは5分TTLで一回消費されるが、署名が「どのドメイン/どのチェーン向けか」を標準形式で固定していない。
  - 危険: フィッシングサイトが同じAPIからchallengeを取得し、ユーザーに署名させた場合、攻撃者がその署名でログインできる余地が残る。特に現在は認証済みユーザーがガチャ、当選送金、NFT/ポイント更新導線へ到達するため、ログイン境界の弱さは資産系操作へ波及する。
  - 最小修正: SIWE/EIP-4361形式へ寄せ、domain/URI/chainId/version/nonce/issuedAt/expirationTime を検証する。`FRONTEND_ORIGINS` と許可chainIdをserver側で固定し、nonceはDB/Redisでhash保存、usedAt付き一回消費にする。

追加P1:
- 管理者ログインがMFA/アカウントロック未実装で、存在するadmin emailの列挙もできる。
  - 対象: `home-ubuntu/disco/backend/src/app/controllers/auth.controller.ts`, `home-ubuntu/disco/backend/src/app/routes/auth.routes.ts`
  - 根拠: `/admin/signin` はIP単位rate limitのみで、admin単位の失敗回数、lockUntil、MFA/TOTP/WebAuthnがない。存在しないadminでは `Admin not found or password hash is undefined`、存在してpassword不一致では `Invalid credentials` を返すため、email存在有無を判別できる。
  - 危険: 管理APIは賞品、NFT、ticket、DEX/fee設定へ影響するため、admin認証の弱さは暗号資産サービス運用の直接リスクになる。
  - 最小修正: 失敗レスポンスを統一し、admin別の失敗回数/lockUntilをDBへ保存する。MFAを必須化し、MFA成功後のみadminAuthを発行する。adminAuth発行/失敗/lock解除は監査ログへ記録する。

タスク数の再更新:
- 直前の修正タスク合計: 35件 -> 37件。
- P0: 10件のまま。
- P1: 21件 -> 23件。
- P2: 4件のまま。

監査完了判断:
- 認証境界の追加監査で、SIWE/domain/chainId拘束不足とadmin認証ハードニング不足をP1として記録済み。
- これ以上は静的監査を増やすより、P0実装、P1認証ハードニング、secret rotation、依存脆弱性対応、build/test/Hardhat compile/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: アップロード/一時ファイル

追加P1:
- NFT metadataアップロード時の一時JSONファイル名にExcel由来のNFT名を直接使っている。
  - 対象: `home-ubuntu/disco/backend/src/app/controllers/nft.controller.ts`
  - 根拠: `uploadMetadata()` は `metadata.name.replace("DISCO Genesis #", "")` を `../../../uploads/${...}.json` に埋め込み、`fs.promises.writeFile()` 後にLighthouseへuploadし、成功時だけunlinkする。`metadata.name` はExcel由来の `data.Name` からDB保存される。
  - 危険: 管理者アップロード経由とはいえ、Excel内容に `../` や長大/特殊文字を含めると一時ファイルパス制御が弱くなる。Lighthouse upload失敗時はmetadata JSONが残り得る。uploads公開範囲問題と組み合わさると、metadataや内部生成物の公開・上書き・調査困難化につながる。
  - 最小修正: 一時ファイル名はNFT名ではなく `mkdtemp` + ランダムUUIDで生成し、必ずprivate temp directoryへ置く。`try/finally` で失敗時もunlinkする。metadata.nameはファイル名に使わず、必要なら表示用文字列として長さ/文字種をvalidationする。

タスク数の再更新:
- 直前の修正タスク合計: 37件 -> 38件。
- P0: 10件のまま。
- P1: 23件 -> 24件。
- P2: 4件のまま。

監査完了判断:
- アップロード/一時ファイル追加監査で、NFT metadata一時ファイル名の安全化不足をP1として記録済み。
- これ以上は静的監査を増やすより、P0実装、P1アップロード/認証ハードニング、secret rotation、依存脆弱性対応、build/test/Hardhat compile/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: CI/外部通知/サプライチェーン

追加P1:
- Slither security scan が本番マージをブロックしない設定になっている。
  - 対象: `Funky-Contracts-main/Funky-Contracts-main/.github/workflows/ci.yml`
  - 根拠: `security-scan` job の `crytic/slither-action@v0.4.0` に `continue-on-error: true` が付いており、`fail-on: high` でも workflow 全体の必須チェックとして失敗させる保証が弱い。現状は Slack 報告の警告に寄っている。
  - 危険: 暗号通貨コントラクトでは high severity の静的解析結果を advisory 扱いにすると、資金喪失や権限不備を含む変更が main に入る余地が残る。
  - 最小修正: Slither は `continue-on-error` を外して high 以上でCIをfailさせる。branch protectionで `security-scan` を required にし、許容するfalse positiveは設定ファイルで明示的に抑制する。
- PR差分とセキュリティ文脈を外部AI/Slackへ自動送信している。
  - 対象: `Funky-Contracts-main/Funky-Contracts-main/.github/workflows/ai-summary.yml`, `ci.yml`, `notify-slack.yml`
  - 根拠: `ai-summary.yml` は PR diff 最大8000文字とPR本文を Anthropic API へ送り、要約を Slack webhook へ投稿する。`ci.yml`/`notify-slack.yml` もPRタイトル、変更ファイル、CI/Slither結果をSlackへ投稿する。
  - 危険: 未修正の脆弱性、トークン経済変更、秘密情報を誤commitした差分、監査前のexploit手掛かりが外部サービスや広い通知先に流れる可能性がある。
  - 最小修正: セキュリティ/資金/secret関連PRは外部AI要約を無効化し、手動承認制にする。送信前にsecret scanと差分redactionを通し、Slack通知先も最小権限の監査用channelに限定する。
- GitHub Actions がSHA pinningと最小権限を徹底していない。
  - 対象: `Funky-Contracts-main/Funky-Contracts-main/.github/workflows/*.yml`
  - 根拠: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/github-script@v7`, `slackapi/slack-github-action@v2.0.0`, `crytic/slither-action@v0.4.0` などをtag参照で使い、workflow-level/job-level `permissions` も明示されていない。`notify-slack.yml` は `pull_request_target` でsecret webhookを使う。
  - 危険: action supply-chain侵害や権限過多のworkflowから、Slack webhook等のsecretやPR/issue情報が漏れる余地がある。暗号資産サービスではCI経由のsecret流出も運用資産リスクになる。
  - 最小修正: third-party actionsはcommit SHA固定にする。各workflowに `permissions: contents: read` 等の最小権限を明示し、`pull_request_target` ではcheckoutや未信頼入力の実行を禁止する。Slack webhookは環境保護/ローテーション対象にする。

タスク数の再更新:
- 直前の修正タスク合計: 38件 -> 41件。
- P0: 10件のまま。
- P1: 24件 -> 27件。
- P2: 4件のまま。

監査完了判断:
- コントラクト、deploy設定、CI/通知まで追加確認し、新規P1を上記に記録済み。
- これ以上は静的監査を増やすより、P0/P1実装、secret rotation、依存脆弱性対応、build/test/Hardhat compile/testnet検証、実サーバのPM2/nginx/deploy参照先確認へ進む段階。

## 2026-05-15 厳格セキュリティ監査: backend実行時防御

追加P1:
- 全体API rate limit が定義だけで、Express全体には適用されていない。
  - 対象: `home-ubuntu/disco/backend/src/app/index.ts`, `home-ubuntu/disco/backend/src/app/middlewares/rateLimiter.ts`, `home-ubuntu/disco/backend/src/app/routes/*.ts`
  - 根拠: `apiLimiter` は `rateLimiter.ts` に存在するが、`app.use('/api', apiLimiter, Router)` のような全体適用がない。現在は auth/draw/send/claim など一部routeだけ個別 limiter を使っている。
  - 危険: 公開GET、NFT一覧、transaction/holding説明、monitoring health、静的uploads、Socket.IO接続などが全体的なIP/user単位の上限なしに叩ける。暗号通貨サービスではDB/RPC/外部API消費を狙ったDoSやコスト増につながる。
  - 最小修正: `/api` 全体に `apiLimiter` を適用し、資産操作・外部RPCを伴うrouteは `sensitiveApiLimiter` を重ねる。Nginx/CDN側のrate limitも合わせて設定し、`app.set('trust proxy', <固定値>)` を本番proxy構成に合わせて明示する。
- `express-session` が本番でもデフォルトMemoryStoreのまま有効になっている。
  - 対象: `home-ubuntu/disco/backend/src/app/middlewares/security.ts`
  - 根拠: `session({ secret, resave:false, saveUninitialized:false, cookie:{...} })` を設定しているが、Redis/DB等のproduction storeが指定されていない。`req.session` の利用箇所は現時点で見つからない。
  - 危険: 将来の軽微な変更でsessionを書き始めると、MemoryStoreによるメモリ肥大、再起動時ログアウト、複数プロセス間の不整合が起きる。資産操作APIの前段としては運用事故/DoSの原因になる。
  - 最小修正: sessionを使わないならmiddlewareごと削除する。使うならRedis等のstoreを必須化し、cookie設定、TTL、rolling有無、proxy前提を本番runbookへ固定する。
- controller個別の500応答で内部error messageを返す箇所が広く残っている。
  - 対象: `home-ubuntu/disco/backend/src/app/controllers/*`, `home-ubuntu/disco/backend/src/app/routes/monitoring.routes.ts`
  - 根拠: `error: error instanceof Error ? error.message : 'Unknown error'` が NFT、Trial NFT、Transaction History、DEX/Fee、Illustration、News、Monitoring など複数箇所にある。Global error handlerはproductionで隠すが、controller内応答では隠れていない。
  - 危険: Prisma/RPC/Lighthouse/validation/内部状態の詳細がクライアントへ漏れると、DB構造、外部API障害、未修正脆弱性の手掛かりになる。暗号資産サービスでは攻撃者の探索効率を上げる。
  - 最小修正: クライアント応答は固定文言と correlation id のみに統一する。詳細errorはサーバログ/監視に限定し、RPC URL、API key、wallet、tx詳細はマスクする。既存の個別catchも共通error responderへ寄せる。

タスク数の再更新:
- 直前の修正タスク合計: 41件 -> 44件。
- P0: 10件のまま。
- P1: 27件 -> 30件。
- P2: 4件のまま。

監査完了判断:
- backend実行時防御の追加監査で、全体rate limit/proxy前提、session store、内部error露出をP1として記録済み。
- これ以上は静的監査を増やすより、P0/P1実装、secret rotation、依存脆弱性対応、build/test/Hardhat compile/testnet検証、実サーバのPM2/nginx/deploy参照先確認へ進む段階。

## 2026-05-15 厳格セキュリティ監査: frontend wallet/chain安全性

追加P1:
- フロントエンドのウォレット署名/オンチェーン送信前に、接続walletのchainIdがBSCであることを強制していない。
  - 対象: `home-ubuntu/disco/front-end/utils/walletAuth.ts`, `home-ubuntu/disco/front-end/src/components/OfficalDiscoNFT/index.tsx`, `home-ubuntu/disco/front-end/src/context/appkit.tsx`
  - 根拠: `walletAuth.ts` は `BrowserProvider(walletProvider).getSigner().signMessage(message)` の前に `getNetwork()` / `chainId` 検証をしていない。`OfficalDiscoNFT` も `BrowserProvider(walletProvider)` から直接 `contract.mint(...)` を実行するが、署名前に `chainId === 56` や `wallet_switchEthereumChain` を確認していない。`appkit.tsx` は `networks: [bsc]` を指定しているが、各送信処理側では強制していない。
  - 危険: ユーザーが別チェーンへ切り替えた状態で署名/送信すると、ログイン署名の文脈ずれ、誤ネットワーク送信、stale contract addressへの送信、サポート不能な資産状態が起きる可能性がある。暗号資産サービスでは「ユーザーに署名させる前」のchain固定が必要。
  - 最小修正: wallet署名/tx送信共通helperを作り、`provider.getNetwork().chainId` を `NEXT_PUBLIC_CHAIN_ID || 56` と照合する。不一致時は `wallet_switchEthereumChain` を要求し、切替失敗時は処理を止める。txログには chainId、contract address、txHash を保存し、BSC以外のtxHashはDB更新に使わない。

- 公開フロントエンドRPC/WalletConnect系のkey・endpointが、quota枯渇や監視漏れの運用リスクになり得る。
  - 対象: `home-ubuntu/disco/front-end/utils/getTokens.ts`, `home-ubuntu/disco/front-end/src/context/AuthContext.tsx`, `home-ubuntu/disco/front-end/src/components/User/UserWallet/Wallet.tsx`, `home-ubuntu/disco/front-end/src/components/OfficalDiscoNFT/index.tsx`, `home-ubuntu/disco/front-end/src/context/appkit.tsx`
  - 根拠: `NEXT_PUBLIC_ALCHEMY_RPC_URL` / `NEXT_PUBLIC_RPC_URL` をブラウザ側で直接読み、ERC20 balance、NFT price、holdingDate、mint price等の読み取りに使っている。`appkit.tsx` のReown `projectId` もコード内に固定されている。
  - 危険: `NEXT_PUBLIC_*` は必ずブラウザへ露出するため、QuickNode/Alchemy等の有料RPCやWalletConnect projectがdomain制限なしの場合、第三者の大量利用でquota枯渇、料金増、RPC停止が起きる。RPC停止はbalance表示、NFT価格、mint導線、保有期間表示に波及する。
  - 最小修正: ブラウザ用RPCは本番domain制限・rate limit・read only用途に限定し、管理者/送金/監視用RPCとは分離する。高頻度readはbackend proxy/cacheへ寄せ、CDN/WAFで制限する。Reown/WalletConnect projectもdashboard側で許可originを固定し、`connect-src` CSPに許可endpointだけを入れる。

タスク数の再更新:
- 直前の修正タスク合計: 44件 -> 46件。
- P0: 10件のまま。
- P1: 30件 -> 32件。
- P2: 4件のまま。

監査完了判断:
- frontend wallet/chain/RPCの追加監査で、新規P1を上記に記録済み。
- 実ソース範囲の追加secret候補検索では、`.env`/秘密鍵ファイルの実体は見つからない。コード上の秘密値利用箇所は既存のsecret rotation/運用分離タスクへ含める。
- これ以上は静的監査を増やすより、P0/P1実装、secret rotation、依存脆弱性対応、build/test/Hardhat compile/testnet検証、実サーバのPM2/nginx/deploy参照先確認へ進む段階。

## 2026-05-15 厳格セキュリティ監査: Socket.IO/背景ジョブ運用

追加P1:
- Socket.IOでユーザー別更新情報を全体配信している。
  - 対象: `funky-export/source-export/home-ubuntu/disco/backend/src/app/index.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/realtimeHoldingDateUpdater.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/hourlyHoldingDurationUpdater.ts`, `funky-export/source-export/home-ubuntu/disco/front-end/src/hooks/useWalletDataUpdates.ts`
  - 根拠: `holding-date-updated` が `userId`, `walletAddress`, `averageDays`, `tierChanged`, `newTier` を `io.emit` で全接続へ配信している。`hourly-holding-duration-updated` も `updatedUserIds` を全接続へ配信している。frontendは受信後に `user_id` でclient-side filterしているだけで、socket handshake自体にユーザー認可やユーザー別roomがない。
  - 危険: 接続できるクライアントが他ユーザーのwallet address、保有期間更新、tier変化、更新対象userId一覧を観測できる。暗号資産サービスでは保有行動、wallet、tier、更新タイミングが攻撃者の分析材料になる。
  - 最小修正: Socket.IO接続時にJWT/sessionを検証し、認証済みユーザーだけ `user:{id}` roomへ参加させる。個人イベントは `io.to("user:{id}")` に限定する。全体配信は件数など集計値のみとし、`walletAddress` と `updatedUserIds` を送らない。

- cron/realtime listenerの多重起動を防ぐ分散ロックがない。
  - 対象: `funky-export/source-export/home-ubuntu/disco/backend/src/main.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/index.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/services/trackingService.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/services/cron.service.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/trialNftScheduler.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/realtimeEventListener.ts`
  - 根拠: `trackingService` import時に複数cronと `startRealtimeEventListener()` が起動する。`CronService` やtrial NFT schedulerのguardはprocess内メモリだけで、PM2 cluster、二重起動、旧コピー同時稼働、deploy重複を防げない。realtime event listenerもprocess単位のsingletonで、複数processでは同じTransfer eventを重複処理する。
  - 危険: ticket配布、referral/snapshot、holding tier更新、Trial NFT bonus/expiration、on-chain event処理が重複実行される可能性がある。DB重複、RPC quota消費、送金/nonce競合、tier/point/ticket不整合につながる。
  - 最小修正: backend workerをAPI processとscheduler processに分け、`RUN_BACKGROUND_JOBS=true` の1系統だけでcronを動かす。各jobにDB/Redis分散ロック、`job_name + period_key` のidempotency ledger、実行中/成功/失敗ログを追加する。realtime listenerもleaderのみ起動し、event処理は `chainId + txHash + logIndex` uniqueで冪等化する。

タスク数の再更新:
- 直前の修正タスク合計: 46件 -> 48件。
- P0: 10件のまま。
- P1: 32件 -> 34件。
- P2: 4件のまま。

監査完了判断:
- Socket.IO/realtime/cron/monitoringの追加静的監査で、新規P1を2件記録済み。
- クラッシュゲームは実装予定なしのため、機能完成タスクからは除外済み。ただしroute/socketが残る場合は無効化確認だけ対象。
- 現時点の静的監査はここで停止し、次はP0/P1実装修正、build/test/Hardhat compile、環境変数棚卸し、外部監査へ進む段階。

## 2026-05-15 厳格セキュリティ監査: contract tier reset/governance

追加P0:
- 保有期間tierを下げる/0へ戻すオンチェーン経路が不足しており、売却手数料tierが低いまま残る可能性がある。
  - 対象: `Funky-Contracts-main/Funky-Contracts-main/funky/funky.sol`, `Funky-Contracts-main/Funky-Contracts-main/funky/FunkyTierUpdater.sol`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/holdingDateService.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/tierScheduler.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/services/tokenManagementService.ts`
  - 根拠: `FunkyRave.update_holding_date` は `REGULAR_SYNC` でのdowngradeを拒否する。現行 `FunkyTierUpdater.syncHoldingDate` は常に `REGULAR_SYNC` だけを渡し、例外理由付きdowngrade関数がない。さらに `holdingDateService.updateHoldingDateMilestones()` と `syncAllHoldingDates()` は `holdingDate: { gt: 0 }` のユーザーだけを同期するため、DB側が0へ戻ったユーザーをcontractへ反映しない。
  - 危険: 一度長期tierに到達したwalletが全売却/残高低下/weighted average低下を起こしても、contract側の `holdingDate` が低手数料tierのまま残り得る。BSC版の売却手数料ロジックが「長期保有者だけ低手数料」という前提を満たさず、手数料回避とtokenomics破綻につながる。
  - 最小修正: tier reset/downgradeの仕様を固定する。ゼロ残高やweighted average低下時にcontract tierを0または該当tierへ戻す処理をbackendに追加し、contract側は許可されたreasonCodeでdowngrade可能にする。`FunkyTierUpdater` には `syncHoldingDateWithReason` などを追加し、通常昇格と例外降格を区別して監査ログへ残す。DBが0のユーザーも「contractが0以外なら同期対象」に含める。

追加P1:
- contract管理操作の承認/監査ログが実際の二者承認を強制していない。
  - 対象: `Funky-Contracts-main/Funky-Contracts-main/funky/funky.sol`, `Funky-Contracts-main/Funky-Contracts-main/scripts/configure-funky-governance.js`
  - 根拠: `set_fee_exempt(account, exempt, reasonCode, categoryCode, requestId, proposer, approver)` は `proposer` と `approver` をeventに出すが、署名検証、distinct check、事前申請ID検証、timelockがない。`update_fee_percentage` は最大1000まで即時変更でき、`update_fee_recipient`、`add_factory`、`add_pair`、`add_tier_updater` も単一admin権限で即時実行できる。
  - 危険: admin鍵または運用端末が侵害されると、売却手数料100%、手数料受取先変更、DEX/pair追加、fee exemption付与を即時実行できる。さらに `proposer/approver` は任意入力なので、event上だけ承認済みに見える偽の監査ログを作れる。
  - 最小修正: 本番adminはmultisig + timelockへ移管し、fee変更/recipient変更/pair追加/exemption付与は遅延実行と二者承認を必須にする。`proposer/approver` をeventに残すならEIP-712署名またはオンチェーンrequest registryで検証する。検証しないなら任意の承認者名をeventに出さない。

タスク数の再更新:
- 直前の修正タスク合計: 48件 -> 50件。
- P0: 10件 -> 11件。
- P1: 34件 -> 35件。
- P2: 4件のまま。

監査完了判断:
- contract tier reset/governanceの追加静的監査で、新規P0を1件、新規P1を1件記録済み。
- 暗号資産サービスとして、静的監査でこれ以上広げるより、P0実装、Hardhat compile/test、testnetでのtier reset実機検証、multisig/timelock運用設計へ進む段階。

## 2026-05-15 厳格セキュリティ監査: backend署名鍵/nonce/DEX台帳

追加P0:
- 公開backendの `ADMIN_PRIVATE_KEY` が、当選送金・tier更新・管理系オンチェーン操作で共用され得る。
  - 対象: `funky-export/source-export/home-ubuntu/disco/backend/src/app/utils/tokenHeplers.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/holdingDateService.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/tierScheduler.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/services/tokenManagementService.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/walletBalanceMonitor.ts`
  - 根拠: 当選送金、tier updater呼び出し、fee/DEX管理用service、wallet残高監視が同じ `ADMIN_PRIVATE_KEY` を読む。`sendTokensToWallet()` は `prize.ca` のERC20へ `transfer` を実行するため、operator wallet内の任意ERC20が送金対象になり得る。
  - 危険: 公開APIサーバ、環境変数、ログ、依存脆弱性、RCEのいずれかでbackend鍵が漏れると、賞品token hot walletだけでなくtier updater権限やtoken管理権限まで同時に侵害される可能性がある。暗号資産サービスでは「送金用hot wallet」と「governance/admin鍵」を同じ実行環境・同じ秘密鍵に置くのはローンチブロッカー。
  - 最小修正: 鍵を用途別に分離する。backendには賞品送金用hot walletだけを置き、残高上限・token allowlist・1日送金上限を設ける。tier更新は専用relayer鍵を `FunkyTierUpdater` だけに許可し、token admin/fee recipient/DEX/pair/governance権限はmultisig + timelockへ移してbackendから完全に外す。`Prize.ca` はallowlist済みcontractだけ許可する。

追加P1:
- backend署名txにnonce直列化とtx outboxがない。
  - 対象: `funky-export/source-export/home-ubuntu/disco/backend/src/app/utils/tokenHeplers.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/holdingDateService.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/tierScheduler.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/services/tokenManagementService.ts`
  - 根拠: 各処理が `new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)` から直接 `contract.transfer()` / `syncHoldingDate()` / `update_fee_percentage()` 等を実行している。`NonceManager`、DB nonce lock、per-signer queue、tx outbox tableが見当たらない。`discordAlerts` にはnonce error分類があるが、予防制御ではない。
  - 危険: 当選送金、定期tier更新、手動fee/DEX管理が同時に走ると、同じsignerのnonce競合、replacement underpriced、片方のtx失敗/停滞が起きる。送金済みDB更新失敗の既存P0と重なると、再送・手動復旧・監査不能の範囲が広がる。
  - 最小修正: `chainId + signer + nonce` を管理するDB tx outboxを作り、署名txは必ず1本のqueue/workerから送る。状態は `CREATED/BROADCASTED/CONFIRMED/FAILED/MANUAL_REVIEW` に分け、`to`, `data`, `value`, `nonce`, `txHash`, `receiptStatus` を保存する。複数processではRedis/DB分散ロックを併用する。

- DEX/fee台帳APIがDBだけを更新でき、オンチェーン状態と乖離し得る。
  - 対象: `funky-export/source-export/home-ubuntu/disco/backend/src/app/routes/dexFee.routes.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/controllers/dexFeeController.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/lib/transactionClassifier.ts`, `funky-export/source-export/home-ubuntu/disco/front-end/src/components/admin/TokenManagement/index.tsx`
  - 根拠: `POST /dex/add` と `POST /fee/record` は `AuthAdmin` 後にDBへ `dexList` / `feeChangeHistory` を作るだけで、BSC receipt/log、contract `isDex`、`feePercent`、`feeRecipient` を検証しない。`transactionClassifier` はDBのactive dex listをFIFO分類に使う。frontendはオンチェーンtx後にDB保存へ進むが、DB保存失敗を許容し、逆にAPI直叩きではDBのみ登録できる。
  - 危険: DBだけのDEX追加/削除やfee履歴改ざんで、保有期間FIFO分類・tier算出・管理画面表示がオンチェーン事実とズレる。結果として売却/購入判定、保有期間tier、手数料説明が誤り、BSC版tokenomicsとユーザー説明が破綻する。
  - 最小修正: DB台帳更新APIは `txHash` 必須にし、BSC RPCでreceipt成功、対象contract、event log、chainId、実際の `isDex` / `feePercent` / `feeRecipient` を検証してから保存する。可能ならDB-only手動登録routeは削除し、オンチェーン状態を定期reconcileして差分を `MANUAL_REVIEW` に送る。

タスク数の再更新:
- 直前の修正タスク合計: 50件 -> 53件。
- P0: 11件 -> 12件。
- P1: 35件 -> 37件。
- P2: 4件のまま。

監査完了判断:
- backend署名鍵/nonce/DEX台帳の追加静的監査で、新規P0を1件、新規P1を2件記録済み。
- 追加静的監査はここで停止し、次はP0実装、鍵分離、tx outbox、BSC receipt検証、Hardhat/testnet検証へ進む段階。

## 2026-05-15 厳格セキュリティ監査: 認証/CORS/env再確認

追加P1:
- JWTセッションの用途分離・失効管理が弱い。
  - 対象: `funky-export/source-export/home-ubuntu/disco/backend/src/app/controllers/auth.controller.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/config/passport.ts`, `funky-export/source-export/home-ubuntu/disco/backend/src/app/routes/auth.routes.ts`
  - 根拠: user/admin JWTは同じ `JWT_SECRET` で署名され、`iss`/`aud`/`typ`/`jti`/session versionがない。middlewareはpayload形状とDB存在確認で判定している。logoutはcookie削除のみで、発行済みtokenをserver側で失効できない。`AuthAdmin` / `Authenticate` はBearer fallbackも受け付けるため、漏洩済みtokenは期限切れまで有効になり得る。
  - 危険: 管理者cookie/tokenがXSS、端末侵害、ログ、proxy、Bearer経路で漏れた場合、1時間は賞品、ticket、NFT、DEX/fee台帳、監視batchなどへ到達できる。暗号資産サービスではadmin token漏洩時に即時失効できないことが運用上の封じ込めリスクになる。
  - 最小修正: user/adminで `aud`/`iss`/`typ` を分けて検証し、`jti` と session table または `sessionVersion` をDB/Redisへ保存する。logout、password変更、MFA再設定、緊急時に該当sessionを失効できるようにする。Bearer fallbackを残す場合はmachine token専用の別issuer/audienceへ分離する。

確認のみ:
- `validateEnvs` は `app/index.ts` でimportされており、本番必須envの起動時チェックは存在する。
- 最新ソースの公開状態変更routeを再棚卸しした範囲では、未認証の新規P0は追加発見なし。既存P0は `PATCH /nft/:id`、Illustration、ticket claim、当選送金、Crash無効化確認が中心。
- CORS/CSRF/Bearer fallback、global rate limit、Socket.IO認証、env/secret分離は既存P1/P0に記録済みで、重複追加しない。

タスク数の再更新:
- 直前の修正タスク合計: 53件 -> 54件。
- P0: 12件のまま。
- P1: 37件 -> 38件。
- P2: 4件のまま。

監査完了判断:
- 認証/CORS/env/公開mutationの追加静的監査で、新規P1を1件記録済み。
- 追加静的監査はここで停止し、次はP0実装、admin/session失効設計、CSRF/Bearer方針確定、build/test/Hardhat compile/testnet検証へ進む段階。
## 2026-05-15 厳格セキュリティ監査: 公開API/NFT/contract記録漏れ最終確認

確認したこと:
- 最新backendの state-changing route を再棚卸しした。公開mutationは認証nonce/signup/refresh/admin signin系を除き、`Authenticate` または `AuthAdmin` が付いている。
- Transaction History は `walletAddress` 指定、`txHash` 指定ともに `req.user` の userId とDB側 userId を照合している。
- Trial NFT のユーザー向け `can-claim` / `claim` / `user` / `total` は `requireSameUser` 済み。
- NFT の `nfts/holder/:holderId` は `requireSameUser` 済み。`PATCH /nft/:id` のオンチェーン検証不足と重複ポイント付与リスクは既存P0として記録済み。
- 公開NFT metadata取得、DEX/fee公開GET、Socket.IO、Crash game、global rate limit、error露出、CSRF/Bearer fallback、secret分離は既存P1/P0に記録済み。
- 最新ソース範囲では `.env` 実体や秘密鍵ファイルは見つからない。`ADMIN_PRIVATE_KEY` 利用は既存P0「backend鍵共用」として記録済み。
- token/NFT contract は既存記録の valid tier制約、tier reset/downgrade、緊急停止、admin governance、NFT public mint、price feed/withdraw/owner運用に収まる。

記録漏れ判断:
- 今回の追加確認で、新規の未記録P0/P1は追加発見なし。
- 修正タスク数は既存記録のまま 54件。P0: 12件、P1: 38件、P2: 4件。
- 静的セキュリティ監査はここで停止。次工程は追加監査ではなく、P0実装、secret rotation、依存脆弱性対応、build/test/Hardhat compile、BSC testnet検証、実サーバのPM2/nginx/deploy参照先確認。

## 2026-05-15 P0-03 implementation record

- Task: Stop Illustration draw from creating FanPoint or IllustrationHistory without consuming a ticket.
- Target route: `POST /user/:userId/draw-illustration`
- Changed files:
  - `apps/backend/src/app/controllers/illustration.controller.ts`
  - `apps/backend/src/app/routes/__tests__/illustration.routes.test.ts`
- Fix summary:
  - Wrapped the draw flow in a Prisma transaction.
  - First operation is `user.updateMany({ where: { id, tickets: { gt: 0 } }, data: { tickets: { decrement: 1 } } })`.
  - Draw selection, `PointHistory`, `fan_points`, Trial NFT bonus counter update, latest prize lookup, and `IllustrationHistory` only run after the conditional ticket decrement succeeds.
  - Replaced Illustration draw `Math.random()` with `crypto.randomInt()`.
- Tests added:
  - Successful draw consumes exactly one ticket before point/history updates.
  - Ticketless draw returns 400 and does not reach illustration draw, point update, or history creation.
  - Two competing requests for one ticket produce one success and one 400 in the route-level regression test.
- Verification:
  - `cd apps/backend && npm run build`: pass.
  - `cd apps/backend && npm test -- --runInBand`: pass.

## 2026-05-15 P0-04 implementation record

- Task: Disable arbitrary direct Illustration assignment from `POST /user/illustration`.
- Changed files:
  - `apps/backend/src/app/routes/illustration.routes.ts`
  - `apps/backend/src/app/routes/__tests__/illustration.routes.test.ts`
  - `docs/launch/DISABLED_FEATURES.md`
- Fix summary:
  - `POST /user/illustration` now returns fixed `410 FEATURE_DISABLED`.
  - The route no longer calls `IllustrationController.addIllustrationToUser` for general users.
  - Request body `userId`, `illustrationId`, and wallet address are not trusted.
  - `IllustrationHistory`, `PointHistory`, and `fan_points` updates are not reached from this route.
- Re-enable condition:
  - Use an admin/internal-only path, or verify a signed one-time draw result/claim token that binds authenticated user and illustration id.

## 2026-05-15 P0-05 implementation record

- Task: Make ticket code claim single-use under concurrency and replace ticket code `Math.random` generation.
- Changed files:
  - `apps/backend/src/app/controllers/ticketCodeController.ts`
  - `apps/backend/src/app/utils/ticketCodeGenerator.ts`
  - `apps/backend/src/app/controllers/__tests__/ticketCodeController.test.ts`
  - `apps/backend/src/app/utils/__tests__/ticketCodeGenerator.test.ts`
  - `docs/security/BSC_LAUNCH_P0_FIXES.md`
- Fix summary:
  - `claimTicketCode` now runs inside `prisma.$transaction`.
  - Claim finalization uses `ticketCode.updateMany({ where: { id, status: 'PENDING' } })`.
  - User `tickets` increment only runs when the conditional ticket code update count is exactly 1.
  - Expired pending codes are marked `EXPIRED` inside the same transaction and do not increment user tickets.
  - Ticket code generation now uses `crypto.randomInt` and admin global ticket codes are generated at 10 characters.
- Tests added:
  - Successful claim increments tickets only after conditional code update succeeds.
  - Two competing claims for one code produce one success and one failure.
  - Expired code is marked expired and does not increment tickets.
  - Generator returns a 10-character alphanumeric code without calling `Math.random`.

## 2026-05-15 P0-06 implementation record

- Task: Stop duplicate on-chain prize transfers after a transfer transaction has been broadcast.
- Target route: prize `sendToWallet`.
- Changed files:
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/src/app/controllers/prize.controller.ts`
  - `apps/backend/src/app/utils/tokenHeplers.ts`
  - `apps/backend/src/app/controllers/__tests__/prize.controller.test.ts`
  - `docs/security/BSC_LAUNCH_P0_FIXES.md`
- Fix summary:
  - Added non-resendable `BROADCASTED` and `MANUAL_REVIEW` prize transaction states.
  - Prize transaction lookup and guarded state transitions are scoped to the authenticated user id.
  - `sendToWallet` now starts a new transfer only from `READY` and guards `READY -> SENDING` with `updateMany({ status: READY, tx_hash: null })`.
  - If `tx_hash` already exists, retry resumes receipt status confirmation instead of calling a new token transfer.
  - Transfer failures before any `txHash` is available may return `SENDING -> READY`; failures after broadcast never return to `READY`.
  - Broadcasted-but-unconfirmed or uncertain transfers are moved to `MANUAL_REVIEW` with `tx_hash` saved when available.
  - Client error responses use fixed messages plus a `correlationId` instead of returning raw RPC/DB errors.
  - Prize transfer logs record sanitized metadata (`correlationId`, error name, tx hash presence) instead of raw RPC/DB error objects.
  - `sendTokensToWallet` now preserves `txHash` on receipt wait failure so the controller can store it and block resends.
- Tests added:
  - New transfer starts only after the conditional `READY -> SENDING` update succeeds.
  - Failed conditional update does not call the token transfer helper.
  - Existing `tx_hash` resumes receipt confirmation and does not resend.
  - Broadcast failure with `txHash` stores `MANUAL_REVIEW` and does not return to `READY`.
  - Pre-broadcast failure may return to `READY` and returns a fixed client message.

## 2026-05-15 P0-07A implementation record

- Task: Freeze planned prize transfer token and amount when the prize transaction is created.
- Target routes:
  - `POST /airdrop/prize/draw/:user_id`
  - `POST /airdrop/prize/send/:prize_id`
- Changed files:
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/src/app/controllers/prize.controller.ts`
  - `apps/backend/src/app/controllers/__tests__/prize.controller.test.ts`
  - `docs/security/BSC_LAUNCH_P0_FIXES.md`
- Fix summary:
  - Added optional `PrizeTransactions.transfer_token_address` and `PrizeTransactions.transfer_amount`.
  - `drawPrize` stores the planned ERC-20 token address and smallest-unit amount string at win creation time.
  - The planned amount is calculated without `Math.round(amount * 10 ** decimals)` and is stored as a decimal-free integer string.
  - `sendToWallet` no longer recalculates the transfer amount from latest `Prize.quantity`, `Prize.price`, or `Prize.decimals`.
  - Legacy or invalid prize transactions without a stored token address or positive stored amount are moved to `MANUAL_REVIEW` and do not send a new transfer.
  - This PR does not add prize inventory reservation, `reserved_amount`, or an inventory ledger.
- Tests added:
  - Draw creation stores fixed token address and fixed smallest-unit amount.
  - Send uses the stored amount even if latest `Prize` settings differ.
  - Missing stored amount does not call the transfer helper and moves to `MANUAL_REVIEW`.
  - Zero stored amount does not call the transfer helper and moves to `MANUAL_REVIEW`.
  - Invalid stored token address does not call the transfer helper and moves to `MANUAL_REVIEW`.

## 2026-05-15 P0-07B implementation record

- Task: Reserve prize inventory at win creation time and prevent READY wins beyond available inventory.
- Target routes:
  - `POST /airdrop/prize/draw/:user_id`
  - `POST /airdrop/prize/send/:prize_id`
- Changed files:
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/src/app/controllers/prize.controller.ts`
  - `apps/backend/src/app/controllers/__tests__/prize.controller.test.ts`
  - `apps/backend/src/app/lib/trackingTokensEthereum.ts`
  - `docs/security/BSC_LAUNCH_P0_FIXES.md`
- Fix summary:
  - Added smallest-unit Decimal inventory fields `Prize.balance_amount` and `Prize.reserved_amount`.
  - Added `PrizeTransactions.reservation_released_at` to make reservation release idempotent.
  - Token tracking now stores on-chain operator wallet balance as `balance_amount` string/Decimal.
  - `drawPrize` now runs user check, eligible prize filtering, ticket decrement, inventory reservation, and PrizeTransaction creation inside one Prisma transaction.
  - Eligible prize filtering uses `available = balance_amount - reserved_amount` and excludes prizes whose available inventory is lower than the fixed `transfer_amount`.
  - Reservation update uses an optimistic `reserved_amount` condition so concurrent draws cannot both reserve the same inventory snapshot.
  - `sendToWallet` consumes both `reserved_amount` and `balance_amount` on confirmed send inside the same transaction, guarded by `reservation_released_at` so receipt retries do not double-decrement.
  - Confirmed transfers with insufficient `balance_amount` move to `MANUAL_REVIEW` instead of allowing a negative balance or recreating available inventory.
  - After a confirmed send, available inventory does not reappear before token tracking refreshes the latest on-chain wallet balance.
  - Expired/cancelled/failed reservation release is intentionally left for P0-07C.
- Tests added:
  - Draw stores fixed token/amount and updates `reserved_amount` in the same transaction path.
  - Out-of-stock prizes are excluded from the draw candidate set.
  - Reservation update race does not create a READY PrizeTransaction.
  - Two competing draws against one available reservation create only one READY PrizeTransaction.
  - Inventory reservation uses integer strings beyond JS safe integer range.
  - Successful send consumes reserved and balance inventory once, and receipt retry does not double-consume either amount.
  - Confirmed send without token tracking does not recreate available inventory for another READY win.
  - Already released reservations do not change inventory again on retry.

## 2026-05-15 P0-07C implementation record

- Task: Release Prize reservations when a win is finally unpaid due to expiration, cancellation, or confirmed failure.
- Target routes:
  - `GET /airdrop/prize/transactions/:user_id`
  - `POST /airdrop/prize/send/:prize_id`
  - `POST /admin/airdrop/prize/transaction/:prize_id/cancel`
  - `POST /admin/airdrop/prize/transaction/:prize_id/fail`
- Changed files:
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/src/app/controllers/prize.controller.ts`
  - `apps/backend/src/app/routes/prize.routes.ts`
  - `apps/backend/src/app/controllers/__tests__/prize.controller.test.ts`
  - `docs/security/BSC_LAUNCH_P0_FIXES.md`
- Fix summary:
  - Added Prize transaction statuses `EXPIRED`, `CANCELLED`, and `FAILED`.
  - Added an unpaid reservation finalization path that only runs for tx-hash-free READY or already-final unpaid transactions.
  - Expired READY transactions are finalized during prize transaction fetch or send attempt, and release `reserved_amount` once.
  - Admin-only cancellation and failed-finalization routes release `reserved_amount` once for unpaid transactions.
  - `reservation_released_at` guards expiration, cancellation, and failed finalization so retries do not double-release.
  - Unpaid finalization decrements `reserved_amount` only and does not increase or decrement `balance_amount`.
  - Transactions with `tx_hash`, `SENDING`, or `BROADCASTED` are moved to `MANUAL_REVIEW` instead of auto-release.
  - `RECEIVED` transactions are not auto-released by unpaid finalization.
- Tests added:
  - Expired READY transaction releases `reserved_amount` once.
  - Cancelled READY transaction releases `reserved_amount` once.
  - tx-hash-free FAILED finalization releases `reserved_amount` once.
  - tx-hash-present FAILED finalization does not auto-release and moves to `MANUAL_REVIEW`.
  - Already released reservations do not change `reserved_amount` again.
  - `RECEIVED` transactions do not run unpaid reservation release.

## 2026-05-15 P0-08 implementation record

- Task: Stop unlimited and arbitrary-metadata minting in the official NFT contract.
- Target contract:
  - `contracts/funky-nft/funky-nft.sol`
- Changed files:
  - `contracts/funky-nft/funky-nft.sol`
  - `contracts/scripts/deploy-nft.js`
  - `contracts/test/FunkyNFT.test.js`
  - `docs/launch/NFT_CONTRACT_RUNBOOK.md`
  - `docs/security/BSC_LAUNCH_P0_FIXES.md`
- Fix summary:
  - Added immutable `MAX_SUPPLY` and enforced it for public and owner batch mint.
  - Added `mintEnabled` sale control; minting starts disabled after deployment.
  - Changed public `mint()` so users cannot pass `to` or `tokenURI`; minted NFTs go to `msg.sender`.
  - Replaced per-token user-supplied URI storage with owner-managed base URI metadata.
  - Changed `batchMint` to owner-only `batchMint(address,uint256)` with no token URI input.
  - Updated NFT deploy script to pass and verify `MAX_SUPPLY`, and to instruct multisig ownership transfer before enabling mint.
  - Added launch runbook covering metadata setup, mint enable/disable, and deployer-to-multisig ownership transfer.
- Tests added:
  - Public mint is disabled until owner enables it.
  - Non-owner cannot change mint state or base URI.
  - Public mint ABI has no user-controlled `to` or `tokenURI` inputs.
  - Public mint mints only to `msg.sender` and uses contract-managed metadata.
  - Public and owner batch mint cannot exceed `MAX_SUPPLY`.
  - Non-owner cannot call owner batch mint to arbitrary recipients.
  - Owner batch mint cannot run while mint is disabled.

## 2026-05-15 P0-09 implementation record

- Task: Add explicit holding-tier reset/downgrade path for BSC tokenomics.
- Target files:
  - `contracts/funky/funky.sol`
  - `contracts/funky/FunkyTierUpdater.sol`
  - `contracts/test/FunkyRave.test.js`
  - `apps/backend/src/app/lib/tierSync.ts`
  - `apps/backend/src/app/lib/holdingDateService.ts`
  - `apps/backend/src/app/lib/tierScheduler.ts`
  - `apps/backend/src/app/lib/realtimeHoldingDateUpdater.ts`
  - `apps/backend/src/app/services/tokenManagementService.ts`
  - `apps/backend/src/app/config/env.ts`
  - `apps/backend/src/app/lib/__tests__/tierSync.test.ts`
- Fix summary:
  - Contract tiers are fixed to `0,31,91,181,271,361,541,721`.
  - `FunkyRave.update_holding_date` rejects unknown tiers and rejects arbitrary non-regular downgrade reasons.
  - `REGULAR_SYNC` still cannot downgrade a wallet tier.
  - Explicit reset/downgrade reasons are allowed for FIFO/weighted-average downgrade, zero-balance reset, and full-sell reset.
  - Added `FunkyTierUpdater` with `syncHoldingDate` for regular sync and `syncHoldingDateWithReason` for explicit reset/downgrade sync.
  - Backend tier mapping now uses the same fixed contract tiers.
  - Backend tier writes go through `TIER_UPDATER_CONTRACT_ADDRESS`.
  - Backend sync includes users whose DB tier is `0`, so stale non-zero contract tiers can be reset with an explicit reason.
  - Realtime tier updates pass current token balance/holding context so downgrade/reset calls receive a justified reason.
  - Admin token management requires an explicit downgrade/reset reason for manual tier decreases.
- Tests added:
  - Unknown fee tiers and holding-date tiers are rejected on-chain.
  - `REGULAR_SYNC` downgrade is rejected.
  - Arbitrary non-regular downgrade reasons are rejected.
  - Zero-balance reset and weighted-average downgrade reasons are accepted.
  - `FunkyTierUpdater` separates regular sync from explicit reason sync and enforces relayer authorization.
  - Backend tier helper maps to the fixed tiers and routes downgrade/reset calls through `syncHoldingDateWithReason`.

## 2026-05-15 P0-10A implementation record

- Task: Separate prize payout hot wallet signing from `ADMIN_PRIVATE_KEY`.
- Target files:
  - `apps/backend/src/app/config/env.ts`
  - `apps/backend/src/app/utils/tokenHeplers.ts`
  - `apps/backend/src/app/controllers/prize.controller.ts`
  - `apps/backend/src/app/controllers/__tests__/prize.controller.test.ts`
  - `apps/backend/src/app/utils/__tests__/tokenHeplers.test.ts`
  - `docs/launch/KEY_SEPARATION_RUNBOOK.md`
- Fix summary:
  - Prize token transfers now require `PRIZE_HOT_WALLET_PRIVATE_KEY`.
  - Prize transfers no longer fall back to `ADMIN_PRIVATE_KEY`.
  - Prize transfer token contracts are restricted by `PRIZE_TRANSFER_TOKEN_ALLOWLIST`.
  - Non-allowlisted `Prize.ca` or `PrizeTransactions.transfer_token_address` values are moved to `MANUAL_REVIEW` before `READY -> SENDING`, so no transfer is broadcast.
  - Missing prize hot wallet key fails before wallet/contract transfer setup.
  - Client responses continue to use fixed safe messages and `correlationId`; raw RPC/key/config errors are not returned.
  - Added a launch runbook for prize hot wallet, tier relayer, and governance/multisig separation.
- Tests added:
  - `sendTokensToWallet` uses `PRIZE_HOT_WALLET_PRIVATE_KEY`.
  - `ADMIN_PRIVATE_KEY` alone cannot start a prize transfer.
  - A token outside `PRIZE_TRANSFER_TOKEN_ALLOWLIST` does not call ERC-20 `transfer`.
  - An allowlisted token proceeds through the existing transfer flow.
  - `sendToWallet` moves non-allowlisted prize transactions to `MANUAL_REVIEW` without calling the transfer helper.

## 2026-05-15 P0-10B implementation record

- Task: Separate tier relayer signing from `ADMIN_PRIVATE_KEY`.
- Target files:
  - `apps/backend/src/app/config/env.ts`
  - `apps/backend/src/app/lib/validateEnvs.ts`
  - `apps/backend/src/app/lib/holdingDateService.ts`
  - `apps/backend/src/app/lib/tierScheduler.ts`
  - `apps/backend/src/app/services/tokenManagementService.ts`
  - `apps/backend/src/app/services/__tests__/tokenManagementService.test.ts`
  - `docs/launch/KEY_SEPARATION_RUNBOOK.md`
- Fix summary:
  - Added `TIER_RELAYER_PRIVATE_KEY` for backend tier updater transactions.
  - `holdingDateService` and `tierScheduler` now construct tier updater wallets from `TIER_RELAYER_PRIVATE_KEY`, not `ADMIN_PRIVATE_KEY`.
  - `TokenManagementService.updateUserHoldingDate` uses a dedicated tier relayer signer and `TIER_UPDATER_CONTRACT_ADDRESS`.
  - `ADMIN_PRIVATE_KEY` fallback is not used for tier updater writes.
  - Missing `TIER_RELAYER_PRIVATE_KEY` or `TIER_UPDATER_CONTRACT_ADDRESS` prevents tier transactions from being sent.
  - Tier update error responses and logs use safe fixed messages or error names instead of raw RPC/key/config errors.
  - `KEY_SEPARATION_RUNBOOK.md` now documents tier relayer wallet setup, relayer permission, owner/multisig assumptions, and staging/production checks.
- Tests added:
  - Tier update uses `TIER_RELAYER_PRIVATE_KEY`.
  - `ADMIN_PRIVATE_KEY` alone cannot send a tier update.
  - Missing `TIER_UPDATER_CONTRACT_ADDRESS` prevents tx send.
  - Raw secret-like tier update errors are not returned or logged.

## 2026-05-15 P0-10C implementation record

- Task: Remove backend execution path for governance, fee, DEX, and pair-management on-chain writes.
- Target files:
  - `apps/backend/src/app/controllers/dexFeeController.ts`
  - `apps/backend/src/app/routes/__tests__/dexFee.routes.test.ts`
  - `apps/backend/src/app/services/tokenManagementService.ts`
  - `apps/backend/src/app/services/__tests__/tokenManagementService.test.ts`
  - `docs/launch/KEY_SEPARATION_RUNBOOK.md`
  - `docs/launch/GOVERNANCE_RUNBOOK.md`
- Fix summary:
  - `TokenManagementService` no longer imports or constructs a signer from `ADMIN_PRIVATE_KEY`.
  - Backend methods for DEX registration, DEX removal, fee percentage updates, and fee recipient updates now return `MANUAL_REVIEW_REQUIRED` without initializing a wallet, creating a write contract, broadcasting txs, or writing DB records as on-chain-complete.
  - Token contract ABI in backend service is reduced to read-only calls used by current state display.
  - `POST /dex/add`, `DELETE /dex/remove/:address`, and `POST /fee/record` return fixed `410 MANUAL_REVIEW_REQUIRED` responses before DB mutation.
  - Read-only DEX/fee routes keep DB display behavior but no longer return raw error messages to clients.
  - Governance operations are documented as multisig/timelock/manual-runbook actions, not backend hot-wallet actions.
- Tests added:
  - `ADMIN_PRIVATE_KEY` alone cannot send DEX registration or fee-management txs.
  - Disabled governance service methods do not instantiate wallet/contract send paths.
  - Disabled DEX/fee write routes return `410 MANUAL_REVIEW_REQUIRED`.
  - Disabled DEX/fee write routes do not update DB tables as if on-chain operations completed.

## 2026-05-15 P0-13C implementation record

- Task: Require BSC production environment settings and remove unsafe production fallbacks.
- Target files:
  - `apps/backend/src/app/lib/validateEnvs.ts`
  - `apps/backend/src/app/config/env.ts`
  - `apps/backend/src/app/services/tokenManagementService.ts`
  - `apps/backend/src/app/lib/__tests__/validateEnvs.test.ts`
  - `apps/frontend/env.validation.mjs`
  - `apps/frontend/next.config.mjs`
  - `apps/frontend/utils/imageUtils.ts`
  - `apps/frontend/src/hooks/useWalletDataUpdates.ts`
  - `apps/frontend/src/hooks/useTicketBalanceUpdates.ts`
  - `apps/frontend/src/components/admin/NFTManagement/index.tsx`
  - `apps/frontend/src/components/OfficalDiscoNFT/index.tsx`
  - `docs/launch/ENVIRONMENT_RUNBOOK.md`
  - `docs/launch/P0_CLOSURE_REPORT.md`
- Fix summary:
  - Backend production startup now fails fast when BSC RPC, chain ID, JWT, DB, API URLs, prize hot wallet, prize token allowlist, tier relayer/updater, token/NFT contract, or admin auth env is missing.
  - Production backend rejects localhost/example URLs, placeholder values, zero addresses, known local test keys, non-BSC chain ID, and `NEXT_PUBLIC_*` secret exposure.
  - `ETHERSCAN_API_URL` is required in production and the old Ethereum mainnet `https://api.etherscan.io/api?` fallback is not used for holding/tier data.
  - Backend token contract address no longer falls back to a hardcoded production value.
  - Frontend production config rejects `NEXT_PUBLIC_*PRIVATE_KEY` and unsafe public env values, including optional `NEXT_PUBLIC_ALCHEMY_RPC_URL` if configured. Missing public env leaves API/on-chain dependent features disabled instead of falling back to localhost.
  - Environment runbook records secret-manager requirements and forbidden frontend public secret patterns without real secret values.
- Tests added:
  - Production missing env fails validation.
  - Placeholder/private-key style values are rejected.
  - `NEXT_PUBLIC_*PRIVATE_KEY` exposure is rejected.
  - Development/test env still avoids production validation.
  - Missing prize transfer allowlist and missing tier updater address fail safely.
  - Missing or Ethereum-mainnet `ETHERSCAN_API_URL` fails production validation.
  - Optional `NEXT_PUBLIC_ALCHEMY_RPC_URL` rejects localhost/example/dummy/testnet values.
