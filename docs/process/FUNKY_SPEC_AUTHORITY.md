# FUNKY Spec Authority

This file is the specification authority for DISCO.fan / FUNKY.fan.
FUNKY development, audit, review, fixes, staging, tx verification, and release decisions must use this file as the highest specification source.

If older docs, launch notes, reports, comments, or PR text conflict with this file, this file wins.
Do not resolve conflicts by guessing.
Do not treat older docs as authoritative.
If the authority is wrong or incomplete, propose a dedicated docs update PR.
Do not mix authority changes into implementation PRs.

## Current Purpose

DISCO.fan / FUNKY.fan is in the BSC launch MVP repair phase.
The current purpose is to make asset, NFT, Prize, Trial NFT, tier, admin, wallet-signature login, and staging operation safe enough for a launch decision.

The project is not production ready.
BSC testnet staging is the priority.
Do not confuse staging with production.
Do not deploy to real staging while the staging domain is undecided.
While tBNB is not funded, tx-based verification is not executed and must not be marked PASS.

## Chain Scope

- BSC testnet chainId: `97`
- BSC mainnet chainId: `56`
- Staging uses BSC testnet.
- Production uses BSC mainnet.
- Do not mix chainId, contract address, txHash, receipt, event log, or owner state across environments.

## BSC Launch MVP Scope

The MVP scope is limited to:

- User authentication based on wallet-signature login.
- Admin operations protected by AuthAdmin.
- Staging operation for FUNKY token, NFT contract, TierUpdater, Prize hot wallet, and Tier relayer.
- No-tx smoke, secret log scan, and funded tx smoke with receipt evidence.
- Safe checks for NFT mint, Prize sendToWallet, Trial NFT claim, and tier update.
- Minimal public catalog, uploads/static, and status exposure.

Do not revive MVP-out features through existing routes or disabled routes.
Crash game is not installed.

## Authentication And Authorization

- Wallet-signature login is required.
- Admin routes must require AuthAdmin.
- body adminKey bypass is forbidden.
- General UI must not call admin routes.
- owner-gate must use `req.user.user_id`.
- Do not trust only body `walletAddress` or `userId`.
- Asset, NFT, ticket, tier, wallet, admin, and contract routes require authentication, authorization, and owner checks.
- Asset, wallet, transfer, chain, receipt, and role-safety checks are required before any state is treated as complete.
- Role confirmation is required before admin, withdraw, tier, contract, NFT, or wallet operation.

## NFT Rules

- NFT mint must match `FunkyNFT.mint() public payable returns uint256`.
- Do not revive the disabled `PATCH /api/nft/:id` route.
- Do not treat DB state alone as NFT owner success.
- Mint success requires chainId, contract address, txHash, receipt, event log, and owner state evidence.
- Withdraw, royalty, and owner-only contract operations require role evidence and receipt evidence.

## Prize And Trial NFT Rules

- Prize draw must not use `Math.random`.
- Prize draw must use crypto-safe RNG.
- Prize sendToWallet requires no-double-send, receipt evidence, and retry safety.
- Trial NFT claim requires idempotency.
- Do not treat DB updates alone as success for transfer, mint, claim, or tier tx.
- DB updates and on-chain completion are separate states.
- A txHash alone is not success.
- Receipt confirmation is required before completion.
- chainId mismatch is forbidden.
- Idempotency and double-execution prevention are required for asset-affecting operations.

## Public And Static Data

- Public catalog exposes only minimal fields.
- uploads/static allows images only.
- Status surfaces must not expose secret values, internal payloads, credentials, raw production logs, or raw payloads.

## Secrets And Logs

Do not write the following values into docs, logs, PR text, artifacts, or comments:

- secret values
- private keys
- seed phrases
- API keys
- DB URLs
- JWTs
- cookies
- Authorization headers
- production logs
- raw payloads

`NEXT_PUBLIC` must not contain secret-like values.
tx receipt evidence must contain only non-secret public data.

## Risk Classification

- P0: Stops launch. Examples: asset loss, double send, unauthorized admin mutation, secret exposure, production/staging mixup, false tx success.
- P1: Must be fixed or explicitly accepted before launch. Examples: security, auditability, privacy, or operation risk.
- P2: Improvement or low-risk defect that does not immediately block launch.
- UNKNOWN: Evidence is missing, so safety cannot be judged.
- BLOCKED: Verification cannot proceed because funding, domain, human approval, environment, or external service is missing.

UNKNOWN and BLOCKED are not PASS.

## Production Ready Conditions

Codex must not declare production ready.
Production readiness requires at least:

- GitHub no-tx gate is PASS.
- Harness v0.6.8 gate, secret scan, backend build/test, frontend env validation/build, contracts compile/test, and NFT compile/test are PASS.
- Staging domain, HTTPS, runtime env, CORS, SESSION_SECRET, and BSC testnet chainId `97` are confirmed.
- After tBNB funding: no-tx smoke, secret log scan, funded tx smoke, NFT deploy/mint receipt, Prize send receipt/no-double-send, TierUpdater receipt, and governance/config receipt are confirmed.
- Receipt evidence is stored with non-secret public data only.
- R3 changes have human review and final approval.

If any condition is missing, the project is not production ready.
