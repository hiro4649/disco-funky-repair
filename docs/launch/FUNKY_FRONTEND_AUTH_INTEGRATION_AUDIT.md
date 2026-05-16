# FUNKY Frontend Auth Integration Audit

確認日: 2026-05-17 JST

確認したcommit: `c5dc1fb9c5ae5066222548cf15e605da4765bec1` (`origin/main`)

この監査はP1-READ-05の静的監査です。コード変更、staging反映、tx系検証、production ready宣言はしていません。staging domain未定のため、実stagingへの `git pull` / `pm2 restart` は実施しません。tBNB未入金のため、contract deploy、送金、NFT mint、tier tx、その他tx系検証は未実施です。

## 監査対象

- `apps/frontend/src`
- `apps/frontend/utils`
- `apps/frontend/src/contexts`
- `apps/frontend/src/components`
- `apps/frontend/src/app`
- `apps/backend/src/app/routes`
- `apps/backend/src/app/controllers`
- `docs/launch/FUNKY_READ_PRIVACY_ROUTE_AUDIT.md`
- `docs/launch/FUNKY_SOURCE_WIDE_FINAL_STATIC_AUDIT.md`

## 前提と注意

- P0-READ-01、P1-READ-02、P1-READ-03、P1-READ-04は `origin/main` に反映済みとして確認しました。
- frontend側の `apiClient` は `withCredentials: true` を設定しており、cookieベースの `userAuth` / `adminAuth` を送る設計です。
- `utils/setAuthToken.ts` はAuthorization headerを設定できますが、frontend全体で常に呼ばれる保証は確認できません。admin UIはcookieまたはRedux tokenに依存します。

## Backend側でAuthAdmin / Authenticate化されたread route一覧

| route | backend auth | 根拠/状態 |
| --- | --- | --- |
| `GET /admin/user/all` | `AuthAdmin` | P0-READ-01後のadmin read。未認証/一般ユーザーは拒否前提。 |
| `GET /user/all` | `AuthAdmin` | P0-READ-01後の全ユーザーread。publicではない。 |
| `GET /admin/user/transaction/:wallet_address` | `AuthAdmin` | P0-READ-01後のadmin transaction read。 |
| `GET /admin/seting/tokenbalance` | `AuthAdmin` | P0-READ-01後のadmin/operational token balance read。 |
| `POST /user/info` | `Authenticate` | P1-READ-02後のowner-gated user info read。 |
| user holding / point / daily point read routes | `Authenticate` | P1-READ-02/F系でowner-gated。 |
| referral stats / rewards / debug / referral-code read routes | `Authenticate` or `AuthAdmin` | P1-READ-02後のowner/admin split。 |
| transaction history / FIFO / detail read routes | `Authenticate` | P1-READ-02後のowner-gated read。 |
| monitoring detailed routes | `AuthAdmin` | P1-READ-03後。public healthcheckは最小fieldのみ。 |
| DEX/fee operational read routes | `AuthAdmin` or safe public | P1-READ-03後。`/fee/current` はpublic-safe。 |
| `GET /nfts/holder/:holderId` | `Authenticate` | P1-READ-04後のowner/privacy route。 |
| `GET /trial-nfts/can-claim/:userId` | `Authenticate` | P1-READ-04後のTrial NFT user-specific read。 |
| `GET /trial-nfts/user/:userId` | `Authenticate` | P1-READ-04後のTrial NFT user-specific read。 |
| `GET /trial-nfts/total/:userId` | `Authenticate` | P1-READ-04後のTrial NFT user-specific read。 |

## Frontendからの呼び出し箇所一覧

| frontend file | endpoint / pattern | 判定 | メモ |
| --- | --- | --- | --- |
| `apps/frontend/src/context/AuthContext.tsx` | `/user/auth/nonce`, `/user/signup`, `/user/verify`, `/user/info` | SAFE | nonce署名ログイン後に `apiClient` でverify/infoを呼ぶ。`/user/info` bodyに `user_id` は残るがbackend側owner-gate前提。 |
| `apps/frontend/utils/refreshUserInfo.ts` | `/user/info` | SAFE | `apiClient` 経由。backend側owner-gate前提。 |
| `apps/frontend/src/components/Header/index.tsx` | `/user/verify`, `/lottery/ticket/count/:userId`, `/user/daily/point/:userId` | SAFE | user verify後のuser-specific read。 |
| `apps/frontend/src/components/Lottery/Nfts.tsx` | `/nfts/holder/:user_id`, `/trial-nfts/user/:user_id` | SAFE | frontendはauth state / `user_id` を確認し、`apiClient` 経由でP1-READ-04後のAuthenticate routeを呼ぶ。 |
| `apps/frontend/src/components/OfficalDiscoNFT/index.tsx` | `/trial-nfts/can-claim/:user_id`, `/trial-nft-templates/available`, `/nft/:id` | SAFE | `user_id` gateと `apiClient` を使用。`/trial-nft-templates/available` と `/nft/:id` はpublic catalog/detail扱い。 |
| `apps/frontend/src/context/ReferralContext.tsx` | `/referral/referral-code/:address`, `/referral/referral-stats/:address`, `/referral/rewards/:address`, `/referral/track-referral` | P1 | raw `fetch('/api/...')` でauth state gateが明確でない。same-origin cookie送信は期待できるが、wallet connectedだけで呼ぶと401/403 UIになり得る。 |
| `apps/frontend/src/services/transactionService.ts` | `/transaction-history/:wallet`, `/transaction/:txHash`, FIFO / holding explanation read | P1 | `apiClient` は使うが、呼び出し側のauth state gateを追加確認または統一する必要あり。backend owner-gateは維持。 |
| `apps/frontend/src/components/Dashboard/Dashboard.tsx` | `/admin/seting/tokenbalance` | P0 | 一般ユーザー画面からAuthAdmin routeを呼ぶ。backendは拒否するが、frontend integrationとしてadmin route呼び出しが残る。 |
| `apps/frontend/src/components/Lottery/LotteryTicketCalendar.tsx` | `/admin/seting/tokenbalance` | P0 | 一般ユーザー/lottery UIからAuthAdmin routeを呼ぶ。 |
| `apps/frontend/src/components/Lottery/NotEnoughTicketsModal.tsx` | absolute `/admin/seting/tokenbalance` via plain `axios` | P0 | 一般ユーザーmodalからAuthAdmin routeを呼ぶ。`apiClient` ではない。 |
| `apps/frontend/src/components/admin/Header/index.tsx` | `/admin/seting/tokenbalance` get/post | SAFE | admin layout配下想定で `apiClient` を使う。 |
| `apps/frontend/src/components/admin/UserManage/index.tsx` | `/admin/user/all`, admin lottery ticket routes | SAFE | admin state gateとadmin UI配下。 |
| `apps/frontend/src/components/admin/Monitoring/index.tsx` | absolute `/monitoring/quicknode-status` via raw `fetch` | P1 | AuthAdmin routeだが `apiClient` / explicit credentials / Authorizationがない。HTTPS stagingで401になる可能性。 |
| `apps/frontend/src/components/admin/DailyBatchFallback/index.tsx` | monitoring realtime / batch routes | SAFE | `apiClient` 経由。manual batch AuthAdmin維持前提。 |
| `apps/frontend/src/components/admin/prizeTransaction/index.tsx` | `/api/admin/user/transaction/:wallet` via plain `axios` | P1 | relative same-origin cookieで動く可能性はあるが、`apiClient` へ統一しないとAuthAdmin integrationが不明瞭。 |
| `apps/frontend/src/components/admin/ticketDistribution/index.tsx` | `/api/admin/ticket-distribution` via plain `axios` | P1 | relative same-origin cookieで動く可能性はあるが、Authorization/cookie前提が不明瞭。 |
| admin TokenManagement / TrialNfts / Nfts / ManagePrize系 | admin API via mostly `apiClient` | SAFE / UNKNOWN | 多くはadmin layout配下かつ `apiClient` 使用。upload系や一部raw fetchはread/privacy範囲外として追加確認対象。 |
| public catalog callers | `/fee/current`, `/nfts/mintable`, `/nft/:id`, `/airdrop/prize` | SAFE | publicとして残す意図のあるcatalog系。ただし返却field最小化はP1-READ-04反映後に再確認。 |

## SAFE

- wallet署名ログインはfrontend側で nonce取得、wallet署名、backend検証の順で実装されています。
- `apiClient` は `withCredentials: true` を持つため、cookieベースのuser/admin authと整合します。
- `/user/info` はfrontendにbody `user_id` 前提が残りますが、backend側で `req.user.user_id` によるowner-gateがあるため、現在のintegrationとしては安全寄りです。
- admin layout配下で `apiClient` を使うadmin readは、AuthAdmin前提に概ね合っています。
- publicとして残す `/fee/current`, `/nfts/mintable`, `/nft/:id`, `/airdrop/prize` の通常利用は妥当です。
- NFT holder / Trial NFT user-specific readは、P1-READ-04後のbackend `Authenticate` とfrontendのauth state / `apiClient` 呼び出しが概ね整合しています。

## P0候補

1. 一般ユーザー画面から `GET /admin/seting/tokenbalance` を呼ぶ箇所が残っています。
   - `apps/frontend/src/components/Dashboard/Dashboard.tsx`
   - `apps/frontend/src/components/Lottery/LotteryTicketCalendar.tsx`
   - `apps/frontend/src/components/Lottery/NotEnoughTicketsModal.tsx`
   - 理由: backendはAuthAdmin化済みで、一般ユーザー画面からadmin routeを呼ぶこと自体がfrontend/backend auth contract不一致です。安全なpublic fieldが必要なら別endpointへ分離し、不要ならUI側から削除してください。

## P1候補

1. `apps/frontend/src/context/ReferralContext.tsx` がraw `fetch('/api/referral/...')` を使い、wallet connected状態とbackend Authenticate状態の対応が曖昧です。
2. `apps/frontend/src/services/transactionService.ts` は `apiClient` を使いますが、呼び出し側がログイン済みであることの統一確認が必要です。
3. `apps/frontend/src/components/admin/Monitoring/index.tsx` がAuthAdmin routeをabsolute raw `fetch` で呼びます。HTTPS stagingでadmin cookie / Authorizationが送られない可能性があります。
4. `apps/frontend/src/components/admin/prizeTransaction/index.tsx` と `apps/frontend/src/components/admin/ticketDistribution/index.tsx` がplain `axios` / relative `/api` を使っています。AuthAdmin routeは `apiClient` に統一したほうが安全です。
5. admin UIの一部でRedux token、admin cookie、relative `/api` proxyのどれに依存しているかが画面ごとに分散しています。

## P2候補

- 401/403時のUI表示、login誘導、loading/error handlingが画面ごとに不統一です。
- public catalog routeとprivate owner routeの使い分けをfrontend側のコメントまたはdocsで補足すると、今後の回帰を減らせます。
- staging HTTPS移行後に、cookie送信条件、same-site設定、`NEXT_PUBLIC_API_URL` と `/api` proxyの使い分けをUI smokeで確認する必要があります。

## UNKNOWN

- raw `fetch` / plain `axios` の一部は同一origin `/api` proxy経由ならcookieが送られる可能性がありますが、HTTPS staging domain / frontend public env確定前のため実挙動は未確認です。
- tx系画面の実動作はtBNB未入金のため未検証です。

## 次に作るべき小PR案

1. `P0-FE-READ-01 Remove public UI calls to admin tokenbalance`
   - 一般ユーザー画面から `/admin/seting/tokenbalance` を呼ぶ3箇所を削除またはsafe public endpointへ分離する。
   - 対象: `Dashboard.tsx`, `LotteryTicketCalendar.tsx`, `NotEnoughTicketsModal.tsx`
2. `P1-FE-READ-02 Standardize admin read calls on apiClient`
   - admin monitoring / prize transaction / ticket distributionのraw `fetch` / plain `axios` を `apiClient` と明示的AuthAdmin前提へ統一する。
3. `P1-FE-READ-03 Gate private read UI by authState`
   - referral / transaction / NFT / Trial NFT user-specific readを、wallet connectedだけでなくbackend login済み状態に寄せる。

## 実行したコマンド

```powershell
git fetch origin main --prune
git switch -C codex/p1-read-05-frontend-auth-audit origin/main
git rev-parse origin/main
rg -n "router\.(get|post|patch|delete)" apps/backend/src/app/routes -g "*.ts"
rg -n "apiClient\.(get|post|patch|delete)|axios\.(get|post|patch|delete)|fetch\(" apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx"
rg -n "Authorization|Bearer|userAuth|adminToken|adminAuth|cookie|credentials|withCredentials|setAuthToken|apiClient" apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx"
```

## 最終判定

- P0: 一般ユーザー画面からadmin tokenbalance readを呼ぶfrontend integration不一致が残っています。
- P1: raw fetch / plain axios / auth state gate不明瞭なread呼び出しが残っています。
- P2: error handlingとdocsの補強余地があります。
- UNKNOWN: HTTPS staging実挙動、cookie送信条件、tx系画面の実動作。

このPRは監査docsのみであり、production launch承認ではありません。
