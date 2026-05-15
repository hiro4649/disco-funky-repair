# P0-00 Runtime Source of Truth

作成日: 2026-05-15

この文書は、DISCO.fan / FUNKY.fan のBSCローンチ前修繕で「本番で動く想定のソースコード」を固定するための静的確認メモです。コード修正、機能実装、build/test/compile、ローカル起動は行っていません。.env、秘密鍵、API key、JWT secret、DB接続情報は確認・保存していません。

## 確認したファイル

指定パスのうち、現在の作業ディレクトリ `C:\Users\HIRO-001\Documents\New project` には対象ファイルがありませんでした。実ソースと既存P0記録は `C:\Users\HIRO-001\Documents\Rave_bk` 配下にあり、以下を確認しました。

| 指定された資料 | 確認結果 |
|---|---|
| `AGENTS.md` | `C:\Users\HIRO-001\Documents\Rave_bk\AGENTS.md` は未検出。会話内AGENTS指示のみ参照。 |
| `docs/security/BSC_LAUNCH_P0_FIXES.md` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\BSC_LAUNCH_P0_FIXES.md` を確認。 |
| `docs/server-evidence/pm2/pm2-list.txt` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\pm2\pm2-list.txt` を確認。 |
| `docs/server-evidence/pm2/pm2-describe-all.txt` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\pm2\pm2-describe-all.txt` を確認。 |
| `apps/backend/package.json` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\backend\package.json` を確認。 |
| `apps/frontend/package.json` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\front-end\package.json` を確認。 |
| `contracts/package.json` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\Funky-Contracts-main\Funky-Contracts-main\package.json` を確認。 |
| `apps/backend/Dockerfile` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\backend\Dockerfile` を確認。 |
| `apps/backend/docker-compose.yml` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\backend\docker-compose.yml` を確認。 |
| `apps/frontend/server.js` | 指定パスは未検出。代替として `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\front-end\server.js` を確認。 |
| backend `main.ts` / `index.ts` | `C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\backend\src\main.ts` と `src\app\index.ts` を確認。 |

## PM2上のプロセス名

`pm2-list.txt` で以下のプロセス名を確認しました。

| プロセス名 | id | status | mode | user | PM2上のcwd/script |
|---|---:|---|---|---|---|
| `funky-backend` | 1 | online | fork | ubuntu | UNKNOWN |
| `funky-frontend` | 0 | online | fork | ubuntu | UNKNOWN |

`pm2-describe-all.txt` は `[PM2][WARN] all doesn't exist` のみで、各プロセスの `cwd`、`script`、`args`、`exec_interpreter` を証明できません。したがって、PM2上で実際に `/home/ubuntu/disco` 側が起動していたか、`/var/www` 側が起動していたかはUNKNOWNです。

## 本番backend候補

### 候補A: `/home/ubuntu/disco/backend`

ローカル証跡の対応パス:
`C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\backend`

確認した証拠:

- `package.json` の `main` は `dist/main.js`。
- `package.json` の `build` は `rimraf ./dist && tsc -p tsconfig.build.json`。
- `package.json` の `prod` は `NODE_ENV=production` で `node ./dist/src/main.js` を起動する定義。
- `src\main.ts` は `process.env.PORT || 5000` でHTTPサーバをlistenし、`CronService.startAllCronJobs()` と `startAppBackgroundJobs()` を呼び出す。
- `src\app\index.ts` は Express、Socket.IO、CORS、security middleware、passport、`/api` routes、trial NFT scheduler を初期化する。
- `Dockerfile` は `CMD ["yarn","run","start:prod"]` だが、この候補Aの `package.json` には `start:prod` がなく、Dockerfileとpackage scriptsが不一致。
- `docker-compose.yml` は `container_name: express-ts-debug`、`Dockerfile.dev`、`./src:/app/src`、`5000:5000`、`9229:9229` を使うため、production確定証拠ではなくdev/debug寄り。

判定:
PM2の `funky-backend` がこの候補Aを実行している証拠は、現状のPM2証跡からは確認できません。BSC版の主修正対象としては妥当な候補ですが、サーバ上でPM2のcwd/script確認が必要です。

### 候補B: `/var/www/disco-back-end`

ローカル証跡の対応パス:
`C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\var-www\disco-back-end`

確認した証拠:

- `package.json` の `start:prod` は `NODE_ENV=production` で `node ./dist/src/main.js` を起動する定義。
- `Dockerfile` は `CMD ["yarn","run","start:prod"]` で、候補Bのpackage scriptsとは一致。
- `package.json` には `@mysten/sui` が含まれ、BSC版としては古いSui/DISCO由来の候補に見える。

判定:
PM2のcwd/scriptがUNKNOWNのため、候補Bが本番稼働していた可能性を証拠上は排除できません。候補Bが稼働中の場合、`apps/backend` または `/home/ubuntu/disco/backend` 側を修正しても本番には反映されないリスクがあります。

## 本番frontend候補

### 候補A: `/home/ubuntu/disco/front-end`

ローカル証跡の対応パス:
`C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\home-ubuntu\disco\front-end`

確認した証拠:

- `package.json` の `start` は `next start`。
- `package.json` には `ethers` と `@reown/appkit` があり、BSC版フロントエンド候補として妥当。
- `server.js` は Express + Next のカスタムサーバで、`/.well-known/pki-validation/:id` を返し、`server.listen(3000)` で起動する。
- ただし `package.json` の `start` は `node server.js` ではなく `next start`。PM2のscriptがUNKNOWNのため、本番で `server.js` が使われているかは未確認。

判定:
PM2の `funky-frontend` がこの候補Aを実行している証拠は、現状のPM2証跡からは確認できません。BSC版の主修正対象としては妥当な候補ですが、サーバ上でPM2のcwd/script確認が必要です。

### 候補B: `/var/www/disco.fan`

ローカル証跡の対応パス:
`C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\var-www\disco.fan`

確認した証拠:

- `package.json` の `start` は `next start`。
- `server.js` は Express + Next のカスタムサーバで、`server.listen(3000)`。
- `package.json` には `@mysten/sui` と `@suiet/wallet-kit` があり、古いSui/DISCO由来のフロントエンド候補に見える。

判定:
PM2のcwd/scriptがUNKNOWNのため、候補Bが本番稼働していた可能性を証拠上は排除できません。

### 候補C: `/var/www/html`

ローカル証跡の対応パス:
`C:\Users\HIRO-001\Documents\Rave_bk\funky-export\source-export\var-www\html`

確認した証拠:

- `BUILD_ID`、`server`、`static`、`required-server-files.json`、`routes-manifest.json` などNext.jsビルド成果物らしきファイルが存在。
- `package.json` は `{"type":"commonjs"}` のみ。

判定:
nginx設定が不足しているため、`/var/www/html` が静的配信またはNext成果物として本番参照されているかはUNKNOWNです。

## nginx/deploy情報

UNKNOWNです。

今回の証跡には、nginxの `server_name`、`root`、`alias`、`proxy_pass`、deploy script、systemd unit、CI/CD設定が含まれていません。PM2のcwd/scriptも取得できていないため、PM2とnginxの接続先を確定できません。

## 主修正対象の判定

| 対象 | 判定 | 理由 |
|---|---|---|
| `apps/backend` | CONDITIONAL YES | このアーカイブ内に `apps/backend` は存在しない。対応候補の `/home/ubuntu/disco/backend` はBSC版backend候補として妥当だが、PM2 `funky-backend` のcwd/script確認までは本番対象と断定不可。 |
| `apps/frontend` | CONDITIONAL YES | このアーカイブ内に `apps/frontend` は存在しない。対応候補の `/home/ubuntu/disco/front-end` はBSC版frontend候補として妥当だが、PM2 `funky-frontend` のcwd/script確認までは本番対象と断定不可。 |
| `contracts` | YES | `Funky-Contracts-main\Funky-Contracts-main\package.json` に `deploy:funky:*`、`deploy:tier-updater:*`、`deploy:nft:*`、`bscTestnet`、`bscMainnet` 向けscriptsがあり、BSC版コントラクト修正対象として妥当。 |

## var-www側を本番対象から外す必要性

`/var/www` 側は、本番対象から外すか、本番参照されていないことを証拠で確認する必要があります。

理由:

- PM2証跡だけでは `/home/ubuntu/disco` 側と `/var/www` 側のどちらが起動元か不明。
- `/var/www/disco-back-end` は `start:prod` とDockerfileが一致しており、古い稼働系として残っていても不自然ではない。
- `/var/www/disco.fan` には `@mysten/sui` と `@suiet/wallet-kit` があり、BSC版ではなく古いSui/DISCO導線が残る可能性がある。
- nginxが `/var/www/html` または `/var/www/disco.fan` を参照している場合、frontend P0修正が `/home/ubuntu/disco/front-end` または `apps/frontend` に入っても本番へ反映されない。
- backendが `/var/www/disco-back-end` を参照している場合、署名ログイン、API認可、当選送金、秘密鍵露出、tier連携などのP0修正が新側に入っても本番へ反映されない。

## 次に進めるP0タスク

1. サーバ上でPM2の `cwd`、`script`、`args`、`exec_interpreter` を確認し、`funky-backend` と `funky-frontend` の実起動元を確定する。
2. サーバ上でnginxの `server_name`、`root`、`alias`、`proxy_pass` を確認し、frontend配信元とbackend upstreamを確定する。
3. `apps/backend`、`apps/frontend`、`contracts` が本番参照先と一致することを確認してから、P0修正に進む。
4. `/var/www` 側が本番参照されている場合は、P0修正対象を切り替えるか、deploy/PM2/nginxを新側へ向ける作業を先にP0化する。

## 人間がサーバ上で確認すべきコマンド

秘密情報を出さないため、`.env`、秘密鍵、API key、JWT secret、DB接続情報は表示・共有しないでください。

```bash
pwd
pm2 list
pm2 describe funky-backend
pm2 describe funky-frontend
pm2 show funky-backend
pm2 show funky-frontend
pm2 jlist | jq '.[] | {name, pm_cwd: .pm2_env.pm_cwd, pm_exec_path: .pm2_env.pm_exec_path, script: .pm2_env.script, args: .pm2_env.args, interpreter: .pm2_env.exec_interpreter, node_env: .pm2_env.env.NODE_ENV, port: .pm2_env.env.PORT}'
sudo nginx -T 2>/dev/null | grep -E 'server_name|listen |root |alias |proxy_pass'
ls -la /etc/nginx/sites-enabled /etc/nginx/conf.d
readlink -f /home/ubuntu/disco/backend /home/ubuntu/disco/front-end /var/www/disco-back-end /var/www/disco.fan /var/www/html
systemctl status nginx --no-pager
```

## PR本文に書くこと

作成したファイル:

- `docs/launch/RUNTIME_SOURCE_OF_TRUTH.md`

確認した証拠:

- PM2 list上に `funky-backend` と `funky-frontend` がonlineで存在。
- `pm2-describe-all.txt` は `[PM2][WARN] all doesn't exist` のため、PM2のcwd/scriptは未確定。
- `/home/ubuntu/disco/backend` 候補は `prod -> node ./dist/src/main.js`、`src/main.ts -> PORT 5000`。
- `/home/ubuntu/disco/backend` 候補のDockerfileは `yarn run start:prod` だが、package scriptsに `start:prod` がなく不一致。
- `/home/ubuntu/disco/front-end` 候補は `start -> next start`、`server.js -> listen(3000)`。
- `/var/www/disco-back-end` 候補は `start:prod -> node ./dist/src/main.js` で、Dockerfileと一致。
- `/var/www/disco.fan` 候補は `@mysten/sui` と `@suiet/wallet-kit` を含む古いSui/DISCO由来の可能性。
- `Funky-Contracts-main` はBSC mainnet/testnet向けHardhat scriptsを持つ。

判定:

- backend/frontendは、PM2 cwd/scriptがUNKNOWNのため、本番参照先をまだ断定できない。
- `apps/backend` と `apps/frontend` はBSC版の主修正対象として妥当な候補だが、サーバ上のPM2/nginx確認が完了するまではCONDITIONAL YES。
- `contracts` はBSC版コントラクトの主修正対象としてYES。
- `/var/www` 側は本番対象から外す、または本番参照されていないことを証拠で確認する必要がある。

UNKNOWN:

- PM2 `funky-backend` の実cwd、script、args、interpreter。
- PM2 `funky-frontend` の実cwd、script、args、interpreter。
- nginxの `root`、`alias`、`proxy_pass`。
- deploy元、deploy手順、CI/CD。
- `apps/backend`、`apps/frontend`、`contracts` がサーバ上のどの絶対パスへ配置されるか。

次アクション:

- 人間がサーバ上で上記コマンドを実行し、秘密情報を除外したPM2/nginx証跡を追加する。
- PM2/nginx参照先が確定した後、P0修正対象を `apps/backend`、`apps/frontend`、`contracts` に固定する。
- `/var/www` 側が参照されている場合は、P0修正前に本番参照先の切替または修正対象の再定義を行う。
