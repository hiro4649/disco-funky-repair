# FUNKY Asset Operation Runbook

This runbook defines FUNKY asset operation.
Do not run tx-based operations before tBNB funding and human sign-off.

## Scope

Asset operation includes:

- FUNKY token
- NFT contract
- Prize hot wallet
- Tier relayer
- TierUpdater
- deployer
- staging wallet roles

Public addresses may be recorded.
Private keys, seed phrases, API keys, and DB URLs must never be recorded.

## Codex Permission Boundary

Codex may:

- inspect source, tests, docs, and non-secret configuration names;
- run local no-tx checks, builds, tests, compile checks, secret scans, and quality gates;
- summarize receipt, chainId, contract, role, and idempotency requirements without exposing private values.

Codex must not:

- run sendToWallet, mint, withdraw, contract verification, BSC testnet tx, BSC mainnet tx, or production DB operation;
- operate deployer, Prize hot wallet, Tier relayer, admin wallet, or owner wallet;
- expose production values, private keys, seed phrases, API keys, DB URLs, JWTs, cookies, Authorization headers, raw logs, or raw payloads.

Safe placeholders are not production guarantees.
Verification summaries must be safe summaries only.

## Forbidden Before tBNB Funding

Before tBNB funding, the following are forbidden:

- deploy
- mint
- sendToWallet
- tier tx
- governance tx
- contract verification that requires a funded tx

Before tBNB funding, tx-based items must be recorded as `BLOCKED`.
Do not mark unexecuted tx checks as PASS.

## Order After tBNB Funding

After tBNB funding, use this order:

1. Confirm BSC testnet chainId `97`.
2. Confirm wallet separation.
3. Confirm deployer balance.
4. Confirm Prize hot wallet balance.
5. Confirm Tier relayer balance.
6. Deploy FUNKY token.
7. Deploy NFT contract.
8. Deploy TierUpdater.
9. Update contract address env.
10. Update backend/frontend env.
11. Run no-tx smoke.
12. Run secret log scan.
13. Run NFT mint smoke.
14. Run Prize send receipt smoke.
15. Run TierUpdater tx smoke.
16. Run governance/config receipt smoke.

Do not deploy to real staging while the staging domain is undecided.
Do not use this runbook for production.

## Receipt Evidence

Receipt evidence may contain only non-secret public data:

- txHash
- chainId
- from
- to
- contract address
- block number
- status
- timestamp
- public amount

Do not store private keys, seed phrases, API keys, DB URLs, JWTs, cookies, Authorization headers, raw production logs, or raw payloads.

## No Double Send

Prize sendToWallet must follow no-double-send:

- Before sending, check existing txHash, state, idempotency key, and reservation state.
- If failure occurs after broadcast, preserve txHash and move to manual review.
- Do not resend while receipt is unconfirmed.
- Do not treat DB update alone as transfer completion.
- Retry only after checking receipt, chainId, contract address, and txHash.

## Failure Stop Conditions

Stop operation and move to manual review if:

- chainId is not `97`.
- staging and production env, wallet, domain, or RPC are mixed.
- wallet role separation is not confirmed.
- balance is insufficient or unexpected.
- contract address is undecided or mismatched with env.
- receipt status is not successful.
- txHash exists but receipt is unconfirmed.
- secret-like data appears in logs, artifacts, PR text, or docs.
- no-double-send cannot be proven.

## Rollback Rules

- Treat on-chain tx as non-reversible.
- Track config/env changes in PR and release records so they can be restored.
- Do not resend broadcast tx; confirm receipt or move to manual review.
- After a mistaken deploy or config tx, stop, record evidence, and require human approval before any new tx.
- Confirm receipt, chainId, contract address, role, and idempotency before changing any operational decision.

## Runtime Log Secret Scan

Run runtime logs secret scan after no-tx smoke and funded tx smoke.
No-Go if logs contain secret values, private keys, seed phrases, API keys, DB URLs, JWTs, cookies, Authorization headers, or raw payloads.

## Human Sign-Off

Do not mark GO until:

- role owner confirmed wallet separation.
- release owner confirmed gate results.
- domain owner confirmed staging domain.
- security reviewer confirmed secret scan and runtime log scan.
- asset reviewer confirmed receipt evidence and no-double-send.

Codex must not declare production ready.
