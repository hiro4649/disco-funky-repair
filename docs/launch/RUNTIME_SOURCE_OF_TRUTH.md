# P0-00 Runtime Source of Truth

作成日: 2026-05-15

## 結論

現在、DISCO.fan / FUNKY.fan の本番サーバはまだ用意されていません。

そのため、既存本番サーバ上の PM2 cwd、script、nginx root、proxy_pass を確認する工程は現時点では不要です。

今後のBSC版 DISCO.fan / FUNKY.fan の唯一の正本は、このGitHubリポジトリです。

Repository:

hiro4649/disco-funky-repair

## 正本として扱う修正対象

apps/backend
BSC版backend修繕対象

apps/frontend
BSC版frontend修繕対象

contracts
FUNKY token / NFT contract修繕対象

docs/security/BSC_LAUNCH_P0_FIXES.md
P0/P1/P2修繕台帳

docs/server-evidence
旧サーバ/旧PM2証跡の参考資料

## 本番参照禁止

C:\Users\HIRO-001\Documents\Rave
原本保管のみ。Git管理外のためdeploy元にしない。

C:\Users\HIRO-001\Documents\Rave_bk
旧作業/参考のみ。Git管理外のためdeploy元にしない。

var-www/disco-back-end
古いSui/DISCO由来コードが混在する可能性があるためdeploy禁止。

var-www/disco.fan
古いSui/DISCO由来frontendが混在する可能性があるためdeploy禁止。

var-www/html
旧Next.js build artifactの可能性があるためdeploy禁止。

## 今後の本番/ステージング構築ルール

新しいステージングサーバまたは本番サーバを作る場合は、必ずこのGitHub repositoryからcloneします。

deploy対象は以下に固定します。

apps/backend
apps/frontend
contracts

Rave_bk、var-www、ローカルPC上の手作業コピーからdeployしてはいけません。

## P0-00の判定

既存本番サーバが存在しないため、PM2/nginxの既存参照先確認は不要です。

P0-00は「既存本番なし、GitHub repositoryを正本にする」という条件で完了扱いにできます。

## 将来サーバ作成後に確認するコマンド

サーバ作成後は、サーバ上で以下を確認します。

pwd
git remote -v
git rev-parse --show-toplevel
git rev-parse HEAD
pm2 list
pm2 show funky-backend
pm2 show funky-frontend
sudo nginx -T

.env、秘密鍵、API key、JWT secret、DB接続情報は表示・共有しないでください。

## 次に進めるP0

次は実装P0へ進みます。

最初の候補は、Crash game と user-manage一般導線を本番MVPから無効化するタスクです。

理由は、資産送金やcontractを直接変更せず、安全に最初の実装PRとして扱いやすいためです。
