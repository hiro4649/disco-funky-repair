# Disabled Features for BSC Launch MVP

## P0-02 Disabled NFT Mint Status Update

`PATCH /api/nft/:id` is disabled for the BSC launch MVP and returns `410 FEATURE_DISABLED`.

Reason:
- The old route accepted `holderId` and `mintStatus` from the request body.
- The old controller path could update NFT ownership state and increment FanPoint without on-chain receipt verification.
- Re-enabling this endpoint requires server-side verification of `chainId`, NFT contract address, transaction receipt status, Transfer event logs, token owner, idempotency, and authenticated user/admin authorization.

Disabled behavior:
- `PATCH /api/nft/:id` does not call `NftController.updateNFT`.
- It does not update `holderId`.
- It does not update `mintStatus`.
- It does not create `PointHistory`.
- It does not increment `fan_points`.

Human verification:
- `PATCH /api/nft/:id` returns `410 FEATURE_DISABLED`.
- Backend route tests confirm the controller is not called.

作成日: 2026-05-15

この文書は、BSCローンチ前P0-01として本番MVPから外した機能の記録です。Crash gameは実装予定なしのため、今回はゲーム修理、乱数改善、残高連携修正、資産送金、NFT、ticket、tier、contract修正は行っていません。

## 無効化したfrontend導線

| 導線 | 変更後の挙動 |
|---|---|
| `/fan-games` | `notFound()` を返す。`CrashGame` componentはimportしない。 |
| SidebarのFan Games項目 | 通常メニューから項目を削除し、ユーザーが通常UIから到達できないようにする。 |

## 無効化したbackend route

| route | 変更後の挙動 | 状態更新 |
|---|---|---|
| `GET /api/crash/games` | `410 FEATURE_DISABLED` を返す | なし |
| `GET /api/user-manage/balance/:wallet_address` | `410 FEATURE_DISABLED` を返す | なし |
| `POST /api/user-manage/deposit` | `410 FEATURE_DISABLED` を返す | なし |
| `POST /api/user-manage/withdraw` | `410 FEATURE_DISABLED` を返す | なし |
| `POST /api/user-manage/bet` | `410 FEATURE_DISABLED` を返す | なし |
| `POST /api/user-manage/cashout` | `410 FEATURE_DISABLED` を返す | なし |
| `GET /api/user-manage/transactions/:wallet_address` | `410 FEATURE_DISABLED` を返す | なし |

これらのrouteでは、CrashGameController、UserManageController、DB更新、残高更新、ticket更新、FanPoint更新、on-chain処理を呼びません。

## 無効化したsocket

| socket namespace | 変更後の挙動 | 状態更新 |
|---|---|---|
| `/crashx` | `FEATURE_DISABLED` errorで接続を拒否する | なし |

`ENABLE_CRASH_GAME` や `NODE_ENV` で再有効化できる分岐は置いていません。`initCrashServer(io)` は呼びません。

## 無効化理由

Crash gameは本番MVPの実装予定がありません。現状のままではSocket認証未使用、任意wallet address受け取り、privateSeed露出、Math.random、mock tx hash、user-manage導線不整合などのリスクがあるため、修理ではなく本番MVPから完全に外します。

## 将来復活させる場合の条件

将来Crash gameやvirtual balanceを復活させる場合は、別PRで以下を満たす必要があります。

- 署名済みwallet本人確認とSocket認証を実装する。
- server-side ledgerを設計し、DB transactionとidempotencyを入れる。
- on-chain deposit/withdrawをreceipt/event logで検証する。
- CSPRNGまたはcommit-revealなど、監査可能な乱数設計にする。
- privateSeedなど未公開情報を進行中ゲームで返さない。
- bet/cashout/refundの残高更新を同一ユーザー確認つきで行う。
- 本番用のrate limit、監査ログ、運用手順、テストを用意する。

## 人間が確認すべき点

- `/fan-games` が404になること。
- SidebarにFan Games項目が表示されないこと。
- `/api/crash/games` が `410 FEATURE_DISABLED` を返すこと。
- `/api/user-manage/*` 対象routeが `410 FEATURE_DISABLED` を返すこと。
- `/crashx` が接続拒否され、Crash engineが起動しないこと。
