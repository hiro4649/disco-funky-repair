# P1-CONTRACT-02 Deploy/config preflight manifest

Status: no-tx preflight manifest only.

This is not production ready. Staging domain is still pending, and tBNB is not funded. Do not deploy, mint, send prizes, run tier transactions, run governance/config transactions, pull to staging, or restart staging from this document alone.

## Confirmed commit

- Repository: `hiro4649/disco-funky-repair`
- Branch checked for this manifest: `origin/main`
- Commit: `6bcf8eee9e5f63e27a2c2abe706a850c0ce77b66` (`fix: align nft frontend mint call (#78)`)

## Network guard

- BSC testnet chain ID: `97`
- BSC production chain ID: `56`
- This manifest is for BSC testnet only.
- Do not use production chain ID `56`, production RPC, production explorer, production contract addresses, production wallets, or production multisig settings during BSC testnet deploy/config.
- Do not treat BSC testnet readiness as production readiness.

## Preflight rule

Before any transaction-capable command is run, a human must confirm the required environment entries exist in the approved secret manager or local deploy shell. Record only PASS/FAIL and public addresses. Do not paste or commit actual values.

Run the no-tx env mapping checks before any funded deploy/config work:

- Backend staging must use `BACKEND_APP_ENV=staging` and pass validation for BSC testnet chain ID `97`, BSC testnet RPC, BSC testnet explorer/API URL, contract-address env presence, and private-key shape without printing values.
- Frontend staging must use `NEXT_PUBLIC_APP_ENV=staging` and pass validation for BSC testnet public RPC/explorer values.
- Production/default validation must reject BSC testnet RPC/explorer values and secret-like `NEXT_PUBLIC_*` values.

Existence check only:

```text
STAGING_DEPLOYER_ADDRESS
PRIZE_HOT_WALLET_ADDRESS
TIER_RELAYER_ADDRESS
TOKEN_CONTRACT_ADDRESS
NFT_CONTRACT_ADDRESS
TIER_UPDATER_CONTRACT_ADDRESS
CHAIN_ID
RPC URL
Explorer URL
```

Secret-bearing signer material, API keys, RPC URLs with credentials, and DB URLs must not be copied into git, PR text, chat, terminal logs, runbooks, or evidence files.

## Required deploy/config order

1. Confirm staging domain, HTTPS, and staging environment plan are approved.
2. Confirm `CHAIN_ID` existence and verify it resolves to BSC testnet `97`.
3. Confirm staging deployer public address is approved as `STAGING_DEPLOYER_ADDRESS`.
4. Confirm prize hot wallet public address is approved as `PRIZE_HOT_WALLET_ADDRESS`.
5. Confirm tier relayer public address is approved as `TIER_RELAYER_ADDRESS`.
6. Deploy FUNKY token on BSC testnet.
7. Record the public FUNKY token address as `TOKEN_CONTRACT_ADDRESS`.
8. Deploy NFT contract on BSC testnet with the approved max supply and metadata plan.
9. Record the public NFT contract address as `NFT_CONTRACT_ADDRESS`.
10. Deploy `FunkyTierUpdater` on BSC testnet using the BSC testnet FUNKY token address and approved tier relayer public address.
11. Record the public TierUpdater address as `TIER_UPDATER_CONTRACT_ADDRESS`.
12. Configure token/TierUpdater relationships only after the deployed token and TierUpdater addresses are independently checked against BSC testnet chain ID `97`.
13. Configure approved testnet DEX/factory/pair settings only through the governance runbook or approved temporary staging admin path.
14. Update backend and frontend staging env in the secret manager.
15. Build and restart staging only after staging domain/env are approved.
16. Run no-tx smoke before any tx smoke.
17. Run funded BSC testnet tx smoke only after tBNB is available and preflight evidence is complete.

## FUNKY token preflight

Required before deploy:

- Confirm selected Hardhat network is BSC testnet.
- Confirm chain ID is `97`.
- Confirm deployer public address matches the approved `STAGING_DEPLOYER_ADDRESS`.
- Confirm initial admin public address is a staging-approved admin or multisig address.
- Confirm initial fee recipient public address is staging-approved.
- Confirm no production address is used.

Record after deploy:

- Public FUNKY token contract address.
- Chain ID `97`.
- Tx hash and block number.
- Non-secret constructor arguments.
- Testnet explorer URL without API keys.

## NFT contract preflight

Required before deploy:

- Confirm selected Hardhat network is BSC testnet.
- Confirm chain ID is `97`.
- Confirm approved max supply exists outside git.
- Confirm approved metadata base URI exists outside git.
- Confirm royalty recipient public address is staging-approved.
- Confirm owner transfer plan exists before public mint is enabled.
- Confirm frontend public mint uses `FunkyNFT.mint()` with no recipient or token URI argument.

Record after deploy:

- Public NFT contract address.
- Chain ID `97`.
- Tx hash and block number.
- `MAX_SUPPLY` check result.
- `mintEnabled()` is false immediately after deploy.
- `owner()` before and after approved transfer.
- Testnet explorer URL without API keys.

## TierUpdater preflight

Required before deploy:

- Confirm selected Hardhat network is BSC testnet.
- Confirm chain ID is `97`.
- Confirm `TOKEN_CONTRACT_ADDRESS` points to the BSC testnet FUNKY token.
- Confirm `TIER_RELAYER_ADDRESS` is a dedicated staging relayer public address.
- Confirm relayer is not the prize hot wallet, deployer, token admin, NFT owner, or production signer.
- Confirm TierUpdater owner/admin plan is staging-approved.

Record after deploy/config:

- Public TierUpdater contract address.
- Chain ID `97`.
- Tx hash and block number.
- Owner public address.
- Relayer public address.
- Token registration/config tx hash when executed.
- Testnet explorer URL without API keys.

## Backend env updates after deploy

Update only in the approved staging secret manager. Do not commit values.

Required backend public/non-secret env names:

```text
CHAIN_ID
TOKEN_CONTRACT_ADDRESS
NFT_CONTRACT_ADDRESS
TIER_UPDATER_CONTRACT_ADDRESS
QUICKNODE_HTTP_RPC_URL
QUICKNODE_WS_RPC_URL
ETHERSCAN_API_URL
PRIZE_TRANSFER_TOKEN_ALLOWLIST
BACKEND_CORS_ORIGINS
FRONTEND_APP_URL
BACKEND_API_URL
```

Record only that each required entry exists and points to BSC testnet where applicable. Do not record values.

Backend also requires secret-manager entries for prize signing, tier relaying, app auth/session, and database connectivity. For those entries, record only PASS/FAIL that the secret manager has them; do not record names, values, URLs, or key material.

## Frontend env updates after deploy

Update only in the approved staging environment. Do not commit values.

Required frontend env names:

```text
NEXT_PUBLIC_APP_ENV
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_RPC_URL
NEXT_PUBLIC_TOKEN_ADDRESS
NEXT_PUBLIC_NFT_ADDRESS
NEXT_PUBLIC_ETHERSCAN_EXPLORER
```

Frontend staging must use BSC testnet public RPC/explorer settings and public BSC testnet contract addresses. Do not set any secret-like `NEXT_PUBLIC_*` value.

## Receipt evidence policy

Store non-secret receipt evidence outside git unless a PR explicitly asks for a redacted summary.

Allowed evidence:

- Commit SHA and PR number.
- Network name and chain ID `97`.
- Public contract addresses.
- Public deployer/admin/owner/relayer/hot-wallet addresses when needed for role verification.
- Tx hash.
- Block number.
- Receipt status.
- Gas used.
- Public constructor arguments.
- Testnet explorer URL without API keys.
- PASS/FAIL summary for post-deploy read checks.

Forbidden evidence:

- Private keys.
- API keys.
- Secret-bearing RPC URLs.
- DB URLs.
- JWT/session secrets.
- Full `.env` files.
- Production signer details.
- Production contract addresses unless explicitly part of a production migration review.

## Forbidden before tBNB funding

Do not run:

- FUNKY token deploy.
- NFT deploy.
- TierUpdater deploy.
- Governance/config transactions.
- DEX/factory/pair config transactions.
- `setBaseURI`.
- `setMintEnabled`.
- NFT mint.
- Prize `sendToWallet`.
- Tier sync transactions.
- Contract verification that requires a funded tx or signed write.
- Staging pull/restart.

Before funding, only static review, local compile/build/test, and docs updates are allowed.

## Human execution order after tBNB funding

1. Confirm staging domain and HTTPS are ready.
2. Confirm staging env exists in secret manager without exposing values.
3. Confirm BSC testnet chain ID `97` through the selected RPC.
4. Confirm deployer, prize hot wallet, and tier relayer public addresses are separated and approved.
5. Deploy FUNKY token and save non-secret receipt evidence.
6. Deploy NFT contract and save non-secret receipt evidence.
7. Deploy TierUpdater and save non-secret receipt evidence.
8. Configure token/TierUpdater relationship and approved testnet governance settings.
9. Update backend/frontend staging env with public contract addresses and required secret-manager entries.
10. Build and restart staging.
11. Run no-tx smoke and secret log scan.
12. Run funded tx smoke in this order: NFT mint, Prize send/receipt, TierUpdater sync/downgrade/reset, governance/config receipts.
13. Record only non-secret evidence and keep production launch blocked until separate production readiness work is complete.

## Closure note

This manifest is a preflight checklist. It does not prove deployed contracts, tx receipts, role ownership, hot-wallet balances, live CORS, live logs, or staging behavior. It is not production ready.
