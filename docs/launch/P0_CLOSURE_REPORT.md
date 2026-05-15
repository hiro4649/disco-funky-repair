# P0 Closure Report

## 確認日

2026-05-15

## 対象commit

`17258967f1df99d65207fe1b7d68248a3e99f665` (`1725896 P0-10C disable backend governance txs (#17)`)

## 監査範囲

`docs/security/BSC_LAUNCH_P0_FIXES.md` に記録されたP0と、main最新コードを照合した。確認は静的確認とローカル build/test/compile であり、staging / testnet / production の実機確認は未実行。

主に確認した根拠ファイル:

- `docs/security/BSC_LAUNCH_P0_FIXES.md`
- `docs/launch/RUNTIME_SOURCE_OF_TRUTH.md`
- `docs/launch/LOCAL_VERIFICATION.md`
- `docs/launch/DB_MIGRATION_RUNBOOK.md`
- `docs/launch/KEY_SEPARATION_RUNBOOK.md`
- `docs/launch/GOVERNANCE_RUNBOOK.md`
- `docs/launch/NFT_CONTRACT_RUNBOOK.md`
- `docs/launch/DISABLED_FEATURES.md`
- `apps/backend/src/app/routes/*.ts`
- `apps/backend/src/app/controllers/*.ts`
- `apps/backend/src/app/lib/*.ts`
- `apps/backend/src/app/services/*.ts`
- `apps/backend/src/app/utils/*.ts`
- `apps/frontend/src/app/(home)/fan-games/page.tsx`
- `apps/frontend/src/components/Sidebar/index.tsx`
- `apps/frontend/src/components/admin/TokenManagement/index.tsx`
- `apps/frontend/src/components/admin/NFTManagement/index.tsx`
- `contracts/funky/funky.sol`
- `contracts/funky/FunkyTierUpdater.sol`
- `contracts/funky-nft/funky-nft.sol`

## P0完了一覧

| P0 | 判定 | main最新コードで確認した根拠 |
| --- | --- | --- |
| P0-00 本番で動くソース参照先固定 | 完了。ただしサーバ実機確認待ち | `docs/launch/RUNTIME_SOURCE_OF_TRUTH.md` が `apps/backend`, `apps/frontend`, `contracts` を主対象とし、`Rave_bk` / `var-www` をdeploy元から外す方針を明記。 |
| P0-01 Crash game / user-manage一般導線無効化 | 完了 | `apps/frontend/src/app/(home)/fan-games/page.tsx` は `notFound()`。`apps/backend/src/app/index.ts` は `/crashx` を `FEATURE_DISABLED` で拒否。`crashGame.routes.ts` と `userManage.routes.ts` は対象routeを `410 FEATURE_DISABLED` に固定。 |
| P0-02 `PATCH /nft/:id` 自己mint/ポイント付与停止 | 完了 | `apps/backend/src/app/routes/nft.routes.ts` は `router.patch('/nft/:id', nftMintStatusUpdateDisabled)`。route testで `FEATURE_DISABLED` を確認。危険なcontroller処理は残るが一般routeから到達不能。 |
| P0-03 Illustration draw チケット消費 | 完了 | `apps/backend/src/app/controllers/illustration.controller.ts` は transaction内で `tickets > 0` 条件付き `decrement` 後に抽選/PointHistory/IllustrationHistoryへ進む。乱数は `crypto.randomInt`。並列1枚チケットのroute testあり。 |
| P0-04 `POST /user/illustration` 任意追加API停止 | 完了 | `apps/backend/src/app/routes/illustration.routes.ts` は `POST /user/illustration` を `410 FEATURE_DISABLED` に固定。testでcontroller未到達を確認。 |
| P0-05 ticket code claim transaction化/CSPRNG化 | 完了 | `ticketCodeController.ts` は `prisma.$transaction` 内で `ticketCode.updateMany({ id, status: 'PENDING' })` を使い、更新件数1件のみ `user.tickets` increment。`ticketCodeGenerator.ts` は `crypto.randomInt`。 |
| P0-06 当選送金の二重送金防止 | 完了 | `prize.controller.ts` は `READY` かつ `tx_hash: null` の条件付き `READY -> SENDING`。`tx_hash` あり再実行はreceipt確認へ進み、新規transferしない。tx発行後の失敗は `MANUAL_REVIEW` へ寄せ、`READY` に戻さない。 |
| P0-07A 当選時の送金予定量固定 | 完了 | `drawPrize` は `PrizeTransactions.transfer_token_address` と `transfer_amount` を保存。`sendToWallet` は保存済みamount/tokenを使用し、欠落/不正/0以下は `MANUAL_REVIEW`。 |
| P0-07B Prize在庫予約 | 完了 | `drawPrize` は transaction内で `available = balance_amount - reserved_amount` を判定し、当選作成と `reserved_amount` 更新を同一transactionで実行。送金成功時は `reservation_released_at` で一度だけ在庫消込。 |
| P0-07C 未払いPrize予約解除 | 完了 | `finalizeUnpaidPrizeReservation` は期限切れ/取消/tx_hashなしFAILEDだけ `reserved_amount` を一度だけ解除。`tx_hash` あり、`SENDING`、`BROADCASTED` は `MANUAL_REVIEW`。`balance_amount` は戻さない。 |
| P0-08 NFT contract 無制限/任意metadata mint停止 | 完了 | `contracts/funky-nft/funky-nft.sol` は `MAX_SUPPLY`, `mintEnabled`, owner-only `setBaseURI` を持つ。public `mint()` は `msg.sender` 宛てで tokenURI入力なし。`batchMint` は owner-only かつtokenURI入力なし。Hardhat NFT testあり。 |
| P0-09 tier reset/downgrade | 完了 | `contracts/funky/funky.sol` は有効tierを `0,31,91,181,271,361,541,721` に制限し、`REGULAR_SYNC` downgradeを拒否。`FunkyTierUpdater.sol` は `syncHoldingDateWithReason` を追加。backend `tierSync.ts` / service testあり。 |
| P0-10A 賞品送金hot wallet鍵分離 | 完了 | `tokenHeplers.ts` は賞品送金に `PRIZE_HOT_WALLET_PRIVATE_KEY` を使用し、`ADMIN_PRIVATE_KEY` fallbackなし。`PRIZE_TRANSFER_TOKEN_ALLOWLIST` 外はtransferしない。 |
| P0-10B tier relayer鍵分離 | 完了 | `holdingDateService.ts`, `tierScheduler.ts`, `tokenManagementService.ts` は `TIER_RELAYER_PRIVATE_KEY` と `TIER_UPDATER_CONTRACT_ADDRESS` を使う。未設定時はtx送信しない。 |
| P0-10C backend governance / fee / DEX / pair 直接tx停止 | 完了。ただしfrontend側は未完了 | backend `TokenManagementService` は governance write を `MANUAL_REVIEW_REQUIRED` にし、`DexFeeController` は `POST /dex/add`, `DELETE /dex/remove/:address`, `POST /fee/record` を `410` に固定。 |
| DB migration baseline | 完了 | `apps/backend/prisma/migrations/20260515053000_baseline_current_schema/migration.sql` が存在し、`DB_MIGRATION_RUNBOOK.md` は新規staging / production DB前提、`migrate:deploy` / `prisma:generate` 手順を明記。 |

## P0未完了一覧

| P0未完了 | 判定理由 | 根拠ファイル |
| --- | --- | --- |
| wallet署名ログイン未実装 | `POST /user/signup` は `wallet_address` の形式検証だけでJWTを発行する経路が残る。nonce発行、署名検証、`ethers.verifyMessage` / SIWE相当の確認が見当たらない。第三者が任意wallet addressでuserAuthを取得できるためNo-Go。 | `apps/backend/src/app/routes/auth.routes.ts`, `apps/backend/src/app/controllers/auth.controller.ts`, `apps/backend/src/app/validation/walletAddressValidate.ts` |
| API認可不足 | admin/内部系の状態変更routeに `AuthAdmin` / `Authenticate` が無い箇所が残る。NFT upload/delete、ticket配布、referral admin実行、Trial NFT template作成/更新/削除などが該当。暗号資産サービスではticket、NFT metadata、reward配布に影響するためNo-Go。 | `apps/backend/src/app/routes/nft.routes.ts`, `apps/backend/src/app/routes/lottery.routes.ts`, `apps/backend/src/app/routes/referral.routes.ts`, `apps/backend/src/app/routes/trialNftTemplate.routes.ts`, `apps/backend/src/app/routes/prize.routes.ts`, `apps/backend/src/app/routes/routes.ts` |
| frontend秘密鍵露出/ブラウザ直接署名 | P0-13Bで完了。frontendは `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` を参照せず、`ethers.Wallet` をブラウザ側で生成しない。TokenManagement / NFTManagement のadmin・owner・governance直接writeはmanual-review/read-onlyへ停止済み。 | `apps/frontend/src/components/admin/TokenManagement/index.tsx`, `apps/frontend/src/components/admin/NFTManagement/index.tsx`, `apps/frontend/src/utils/constant.ts` |
| backend停止済みgovernanceをfrontendから迂回できる | P0-13Bで完了。frontend admin画面から `add_admin`, `remove_admin`, `add_dex`, `remove_dex`, `update_fee_percentage`, `update_fee_recipient`, `setMintUsdPrice`, `setDefaultRoyalty`, `withdraw` へ直接到達しない。 | `apps/frontend/src/components/admin/TokenManagement/index.tsx`, `apps/frontend/src/components/admin/NFTManagement/index.tsx` |
| BSC本番env必須設定が未固定 | `validateEnvs.ts` の必須envは `JWT_SECRET`, admin情報, tier relayer系のみ。`PRIZE_HOT_WALLET_PRIVATE_KEY`, `PRIZE_TRANSFER_TOKEN_ALLOWLIST`, `TOKEN_CONTRACT_ADDRESS`, `NFT_CONTRACT_ADDRESS`, `QUICKNODE_HTTP_RPC_URL`, `QUICKNODE_WS_RPC_URL`, explorer/API設定などが起動時必須ではない。`TOKEN_CONTRACT_ADDRESS` には固定fallbackが残る。誤chain/誤contractで起動できるためNo-Go。 | `apps/backend/src/app/lib/validateEnvs.ts`, `apps/backend/src/app/config/env.ts` |

## P1へ降格できる残リスク

以下はP0未完了を閉じた後、staging/testnetで制限付き運用を確認できればP1として扱える候補。ただし、未確認のままproductionへ進めない。

- `walletBalanceMonitor.ts` が `ADMIN_PRIVATE_KEY` を読む。現時点では監視用途だが、production backendにadmin鍵を置く運用は避けるべき。frontend秘密鍵/署名ログイン/API認可を閉じた後、read-only監視へ変更するか、admin鍵をproduction backendに設定しない運用確認へ落とす。
- `nft.controller.ts` が `NFT_STORAGE_API_KEY` の先頭部分をログ出力する。全値ではないが、秘密値の一部表示は本番ログ方針として削除対象。
- `DexFeeController` の read-only DB表示は残る。直接txは止まっているが、on-chain stateとDB表示の乖離監査はP1で必要。
- JWTはuser/adminで同じ `JWT_SECRET` を使い、server-side失効や`jti`がない。署名ログインとadmin認可を閉じた後、セッション失効/role token分離をP1で扱う。
- CSRF token、Bearer fallback方針、global rate limit、Socket.IOのユーザー別room、cron/PM2多重起動防止、tx outbox/nonce queueはproduction負荷・運用設計としてP1で整理する。
- `npm audit` の依存脆弱性はmajor upgrade判断が必要。P0修繕とは分離し、依存更新PRで扱う。

## staging / testnet / productionで人間確認が必要な項目

- GitHub repository `hiro4649/disco-funky-repair` の `apps/backend`, `apps/frontend`, `contracts` だけがdeploy元であること。`Rave_bk`, `var-www`, 手作業コピーからdeployしないこと。
- サーバ上で `pm2 list`, `pm2 show <backend>`, `pm2 show <frontend>`, nginx site config, deploy scriptを確認し、cwd/scriptがGitHub正本を指すこと。
- production frontend envに `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` や `NEXT_PUBLIC_*PRIVATE_KEY` を絶対に設定しないこと。P0-13Bで危険コードは停止済みだが、hosting/CI/PM2/Docker設定の人間確認は必要。
- backend production envに誤chain/誤contract fallbackで起動できないこと。BSC mainnet/testnetのchain ID、RPC、token/NFT/tier updater/prize allowlistをsecret managerで固定すること。
- 新規staging DBで `migrate deploy`、`prisma generate`、`_prisma_migrations` のbaseline適用を確認すること。
- BSC testnetでNFT mint停止/開始、MAX_SUPPLY、owner multisig移管、baseURI、withdraw権限を確認すること。
- BSC testnetでtier updater登録、relayer address、reason付きdowngrade/reset、REGULAR_SYNC downgrade拒否を実機確認すること。
- BSC testnetでPrize draw、在庫予約、sendToWallet、receipt retry、期限切れ/取消/FAILED予約解除を少額tokenで通すこと。
- Crash game `/fan-games`, `/api/crash/games`, `/api/user-manage/*`, `/crashx` が本番経路で無効であること。

## 本番前No-Go条件

以下のいずれかが残る場合、BSC production launch不可。

1. `POST /user/signup` がwallet署名検証なしでJWTを発行できる。
2. admin/内部/資産系APIに `AuthAdmin` / `Authenticate` / 本人確認が無い状態変更routeが残る。
3. frontend bundleが `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` または `NEXT_PUBLIC_*PRIVATE_KEY` を読む。
4. frontendから governance / fee / DEX / pair / NFT owner操作を直接送信できる。
5. BSC必須env未設定でもfallback contract/RPCでbackendやfrontendが起動できる。
6. production PM2/nginx/deploy元がGitHub正本ではなく、`var-www` / `Rave_bk` / 古いSui/DISCOコピーを指す。
7. production owner/admin鍵がEOAのまま、multisig/timelock移管前にmintやfee/governanceを有効化する。

## 次に進むべきP1候補

P0未完了を先に閉じる。P0完了後のP1候補は以下。

1. JWT/session hardening: `iss` / `aud` / `jti` / server-side revocation / user-admin secret分離。
2. CSRF token導入、Bearer fallback方針固定、logoutのPOST化。
3. tx outbox / nonce queue / signer単位lock。
4. Socket.IOの認可とユーザー別room化。
5. cron / scheduler / event listenerのDB lock化。
6. NFT/IPFS uploadの本番ログ/secret sanitization。
7. on-chain stateとDB台帳の監査ジョブ。
8. npm audit対応と依存更新計画。

## 実行したコマンド

| コマンド | 結果 |
| --- | --- |
| `cd apps/backend && npm run build` | 成功。Prisma generateとTypeScript buildが完了。 |
| `cd apps/backend && npm test -- --runInBand` | 成功。10 test suites / 57 tests passed。 |
| `cd apps/frontend && npm run build` | 成功。Next.js production build完了。lintはbuild設定上skip。 |
| `cd contracts && npx hardhat compile` | 成功。Nothing to compile。 |
| `cd contracts && npx hardhat test` | 成功。34 passing / 16 pending。 |
| `cd contracts && npm run compile:nft` | 成功。Nothing to compile。 |
| `cd contracts && npm run test:nft` | 成功。16 passing。 |
| `git diff --check` | 成功。空出力。 |

## 成功/失敗結果

- build/test/compile はすべて成功。
- ただし、成功した検証は「コンパイル・既存テスト通過」を示すだけで、P0完了を保証しない。
- main最新コード照合では、BSC env必須化などの残No-Goは別PRで確認が必要。frontend秘密鍵/直接署名はP0-13Bでcode-level close。

## P0-13B update

P0-13B closes the frontend `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` / browser admin signer No-Go at code level.

- `apps/frontend/src/components/admin/TokenManagement/index.tsx` no longer reads `NEXT_PUBLIC_ADMIN_PRIVATE_KEY`, no longer creates `ethers.Wallet`, and no longer directly calls `add_admin`, `remove_admin`, `add_dex`, `remove_dex`, `update_fee_percentage`, or `update_fee_recipient`.
- `apps/frontend/src/components/admin/NFTManagement/index.tsx` no longer reads `NEXT_PUBLIC_ADMIN_PRIVATE_KEY`, no longer creates `ethers.Wallet`, and no longer directly calls owner/admin NFT writes such as `setMintUsdPrice`, `setDefaultRoyalty`, or `withdraw`.
- `apps/frontend/src/utils/constant.ts` no longer exposes token governance/admin write ABI entries used by frontend admin screens.
- Frontend admin write actions are manual-review/read-only and must be executed through `docs/launch/GOVERNANCE_RUNBOOK.md` plus multisig/timelock procedures.
- Production frontend env must still be checked by humans: no `NEXT_PUBLIC_*PRIVATE_KEY` value may be configured in hosting, CI, PM2, Docker, or deployment settings.

## P0-13C update

P0-13C closes the BSC production env fallback No-Go at code level.

- `apps/backend/src/app/lib/validateEnvs.ts` now requires BSC production env for backend API URL, frontend URL, JWT, database, RPC, chain ID, FUNKY token, NFT contract, prize hot wallet, prize token allowlist, tier relayer, tier updater, and admin auth settings.
- Production backend startup now rejects missing values, localhost/example URLs, placeholder values, zero addresses, known test private keys, non-BSC `CHAIN_ID`, and `NEXT_PUBLIC_*` secret exposure.
- `apps/backend/src/app/config/env.ts` no longer provides a production fallback token contract address.
- `apps/frontend/env.validation.mjs` rejects frontend public secret env and unsafe production public values. Missing production public env leaves frontend API/on-chain dependent features disabled instead of falling back to localhost.
- `NEXT_PUBLIC_ALCHEMY_RPC_URL` is optional, but if configured it is validated as a BSC mainnet public RPC and is used before `NEXT_PUBLIC_RPC_URL`; if unset, `NEXT_PUBLIC_RPC_URL` remains required.
- `ETHERSCAN_API_URL` is required in production and must not fall back to the Ethereum mainnet `https://api.etherscan.io/api?` endpoint.
- `docs/launch/ENVIRONMENT_RUNBOOK.md` records required backend/frontend env and forbidden `NEXT_PUBLIC_*` secret patterns.
- Human deployment check remains required: verify secret manager values on staging/production without printing or committing secrets.
