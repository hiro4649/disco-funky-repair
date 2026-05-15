# AGENTS.md

## 最重要ルール

このリポジトリは暗号資産サービス DISCO.fan / FUNKY.fan の修繕用リポジトリです。

.env、秘密鍵、seed phrase、API key、DB接続情報、JWT secret、本番ログ、本番DB dumpを表示、作成、保存、コミットしてはいけません。

mainへ直接pushしてはいけません。
すべての修正は小さいPRで行ってください。

## 現在のフェーズ

現在はBSCローンチ前のP0修繕フェーズです。
追加監査を広げすぎず、P0修正を優先してください。

1回の作業では1つの問題だけを扱ってください。
関係ないリファクタリング、命名整理、UI変更、依存更新を混ぜないでください。

## 修正対象

主な修正対象は以下です。

apps/backend
apps/frontend
contracts

docs/server-evidence はサーバ証跡です。
legacy や var-www 系がある場合、それは原則として確認用であり、主修正対象ではありません。

## 必須の考え方

資産、NFT、FanPoint、ticket、tier、送金、admin権限に関わる処理では、所有者確認、認証、認可、transaction、idempotency、二重実行防止を必須にしてください。

on-chain状態に関わる処理では、DB更新だけで完了扱いにしてはいけません。
chainId、contract address、txHash、receipt、event log、owner状態を確認してください。

Math.random を資産系抽選、ticket code、NFT、FanPoint付与に使ってはいけません。
crypto.randomInt または crypto.randomBytes を使ってください。

## PR本文に必ず書くこと

修正した問題
変更ファイル
修正理由
追加したテスト
実行したコマンド
成功した結果
残リスク
人間が確認すべき点

## 禁止

大規模な一括修正
mainへの直接push
秘密情報の表示
本番値の仮定
テストなしのproduction ready宣言
関係ないP1/P2修正の混入
