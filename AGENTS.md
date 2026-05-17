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

<!-- CODEX_QUALITY_HARNESS_BEGIN -->
## Codex Quality Harness

縺吶∋縺ｦ縺ｮCodex菴懈･ｭ縺ｯ縲∵怙蟆丞ｷｮ蛻・∬ｨｼ諡繝吶・繧ｹ縲￣R蜑肴､懆ｨｼ繧貞ｿ・医→縺吶ｋ縲・
螳溯｣・燕縺ｫ縲∫岼逧・・撼逶ｮ逧・∝女縺大・繧梧擅莉ｶ縲√ユ繧ｹ繝郁ｨ育判縲∵ｮ九Μ繧ｹ繧ｯ繧堤洒縺冗｢ｺ隱阪☆繧九・
莉墓ｧ倥√ユ繧ｹ繝医∝ｮ溯｣・√Μ繝ｪ繝ｼ繧ｹ縺ｮ繝ｬ繝薙Η繝ｼ隕ｳ轤ｹ縺ｯ docs/process/skills 繧貞盾辣ｧ縺吶ｋ縲・
PR蜑阪↓ scripts/codex-local-quality-gate.sh 繧貞ｮ溯｡後☆繧九ょ､ｱ謨励∵悴螳溯｡後√せ繧ｭ繝・・縺ｯPR譛ｬ譁・↓譏手ｨ倥☆繧九・
secret縲｝rivate key縲》oken縲．B URL縲〉aw production log縲〉aw payload繧貞・蜉帙∽ｿ晏ｭ倥…ommit縺励↑縺・・
辟｡髢｢菫ゅ↑繝ｪ繝輔ぃ繧ｯ繧ｿ縲∽ｾ晏ｭ倩ｿｽ蜉縲∝多蜷肴紛逅・∝ｺ・ｯ・峇螟画峩繧呈ｷｷ縺懊↑縺・・

## Funky Asset Safety Rule

雉・肇縲¨FT縲：anPoint縲》icket縲》ier縲・・≡縲『allet縲∥dmin讓ｩ髯舌…ontract縲《taging env縺ｫ隗ｦ繧後ｋ螟画峩縺ｯR3謇ｱ縺・↓縺吶ｋ縲・
R3螟画峩縺ｧ縺ｯ縲∬ｪ崎ｨｼ縲∬ｪ榊庄縲∵園譛芽・｢ｺ隱阪…hainId縲…ontract address縲》xHash縲〉eceipt縲‘vent log縲（dempotency縲∽ｺ碁㍾螳溯｡碁亟豁｢縲〉ollback繧貞ｿ・★遒ｺ隱阪☆繧九・
DB譖ｴ譁ｰ縺縺代〒on-chain謌仙粥謇ｱ縺・↓縺励↑縺・・
tBNB譛ｪ蜈･驥代《taging譛ｪ蜿肴丐縲〉eceipt譛ｪ遒ｺ隱阪・迥ｶ諷九ｒproduction ready縺ｨ譖ｸ縺九↑縺・・
<!-- CODEX_QUALITY_HARNESS_END -->
