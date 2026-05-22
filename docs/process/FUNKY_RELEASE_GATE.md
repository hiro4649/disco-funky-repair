# FUNKY Release Gate

This gate defines safe merge, staging, tx verification, and release decisions for DISCO.fan / FUNKY.fan.
Codex must not declare production ready.
Final GO requires human approval.

## Decision Labels

- GO: Required gates passed and residual risk is accepted by a human.
- NO-GO: Secret exposure, unauthorized operation, chain mixup, missing receipt, double-send risk, or required check failure exists.
- BLOCKED: tBNB funding, domain, human approval, environment, or external service is missing.
- UNKNOWN: Evidence is missing, so safety cannot be judged.

UNKNOWN and BLOCKED must not be treated as GO.

## GitHub No-Tx Gate

At PR time, confirm:

- No unnecessary changes to backend code, frontend code, contracts, schema, lockfiles, or real `.env` values.
- No staging deploy, deploy, mint, sendToWallet, tier tx, or governance tx was executed.
- Unexecuted tx checks are not marked PASS.
- PR text contains no secret values.

## Local Harness Gates

Run these commands and record results in the PR body:

- Harness v0.6.8 gate: `node scripts/codex-local-quality-gate.mjs`
- secret scan gate: `node scripts/codex-secret-safety-scan.mjs`
- profile required checks: `CODEX_RUN_PROFILE_REQUIRED_CHECKS=1 node scripts/codex-local-quality-gate.mjs`
- JSON report: `CODEX_QUALITY_REPORT=json node scripts/codex-local-quality-gate.mjs`
- diff check: `git diff --check`

If Harness reports R3 or humanReviewRequired, human review is required.
If `mergeReady=false`, report the reason before creating a PR.
Do not use policy exception.

## Build And Test Gates

GO requires:

- backend build/test gate PASS.
- frontend env validation/build gate PASS.
- contracts compile/test gate PASS.
- NFT compile/test gate PASS.
- JSON quality report has `mergeReady=true`.
- Manual confirmation is recorded for current head when R3 or human review is required.

Report failures, skipped checks, and environment blockers.
Do not hide failed checks.

## Security And Privacy Gates

GO requires:

- read/privacy gate: user, wallet, transaction, holding, and admin read exposure is minimal.
- frontend auth gate: general UI does not call admin routes.
- public catalog/static/status gate: public catalog has minimal fields, uploads/static is images only, status exposes no secret values.
- runtime env gate: staging and production are not mixed.
- BACKEND_CORS_ORIGINS gate: staging origin is explicit and not mixed with production origin.
- SESSION_SECRET gate: runtime value exists and the value is not written to docs or logs.
- secret log scan gate: runtime logs contain no secret values.

## Contract And Staging Gates

GO requires:

- contract readiness gate: deploy target, constructor/config, role owner, and verification plan are confirmed.
- staging domain gate: staging domain is decided.
- staging HTTPS gate: HTTPS is enabled.
- BSC testnet chainId `97` gate: staging runtime and wallets use chainId `97`.
- tBNB funding gate: deployer, Prize hot wallet, and Tier relayer funding are confirmed.
- no-tx smoke gate: startup, auth, admin protection, and public read pass without tx.
- manual branch protection gate: if branch protection is unavailable, the PR must record remote check status, required human review, and merge order.

Domain decision is the final staging gate.
Do not deploy to real staging while the staging domain is undecided.

## Funded Tx Smoke Gates

Run only after tBNB funding:

- funded tx smoke gate PASS.
- NFT deploy/mint receipt gate PASS.
- Prize send receipt/no-double-send gate PASS.
- TierUpdater receipt gate PASS.
- governance/config receipt smoke PASS.

Receipt evidence may store only txHash, chainId, from, to, contract address, block number, status, timestamp, and public amount.
Do not store secret values.

## Production Readiness Gate

Production readiness is judged by humans.
Codex must not write that the project is production ready.

GO conditions:

- GitHub no-tx gate, local harness gates, build/test gates, security/privacy gates, contract/staging gates, and funded tx smoke gates are PASS.
- R3 human review is complete.
- Asset-security reviewer confirms asset, wallet, transfer, chain, receipt, and role-safety evidence.
- Rollback/stop conditions are documented.
- Post-merge verify is planned and executed after merge where applicable.
- No production operation is performed by Codex.
- Residual risk is accepted by a human.

NO-GO conditions:

- Secret exposure exists.
- AuthAdmin, owner-gate, wallet-signature login, no-double-send, or receipt evidence is missing.
- staging and production are mixed.
- chainId, contract address, txHash, or receipt evidence conflicts.
- A required check failed without an approved response plan.

BLOCKED conditions:

- tBNB funding incomplete.
- staging domain undecided.
- human approval incomplete.
- required env, wallet role, RPC, or contract address undecided.

UNKNOWN conditions:

- Evidence is missing.
- Only old docs support the claim.
- Runtime behavior is not checked.
- Receipt or log verification is not executed.

## Review Ownership

- Codex: diff, local checks, PR text without secret values, residual risk record.
- Project owner: scope, priority, and residual risk acceptance.
- Security reviewer: secret scan, auth, admin, and privacy.
- Asset reviewer: wallet role, receipt evidence, and no-double-send.
- Release owner: go/no-go/BLOCKED/UNKNOWN decision and final approval.
- Domain owner: staging domain and HTTPS.

## Stop Or Rollback

Stop before merge or release if any required gate fails, any secret exposure is suspected, staging and production are mixed, receipt evidence is missing, or role ownership cannot be confirmed.
Rollback config changes only through reviewed PRs.
On-chain actions are treated as non-reversible and require human asset review.
