# P1-CONTRACT-04 NFT deploy role handoff checklist

Status: no-tx checklist only.

This is not production ready. Staging domain is still pending, and tBNB is not funded. Do not deploy, mint, send prizes, run tier transactions, run governance/config transactions, pull to staging, or restart staging from this document alone.

## Confirmed commit

- Repository: `hiro4649/disco-funky-repair`
- Branch checked for this checklist: `origin/main`
- Commit: `fe5052eb4642537e1fa4162e6b67a46e10b701cf` (`test: add staging bsc env mapping checks (#80)`)

## Checked sources

- `contracts/funky-nft/funky-nft.sol`
- `contracts/scripts/deploy-nft.js`
- `docs/launch/NFT_CONTRACT_RUNBOOK.md`
- `docs/launch/DEPLOY_CONFIG_PREFLIGHT_MANIFEST.md`
- `docs/launch/FUNKY_CONTRACT_NO_TX_READINESS_AUDIT.md`

## Preflight before any NFT deploy tx

Record only PASS/FAIL and public addresses needed for role review. Do not record private keys, API keys, secret-bearing RPC URLs, DB URLs, full env files, cookies, JWTs, or session secrets.

1. Confirm the selected network is BSC testnet with chain ID `97`.
2. Confirm production chain ID `56`, production RPC, production explorer, production owner, and production multisig settings are not used for staging testnet.
3. Confirm tBNB is funded before any deploy/config/mint transaction.
4. Confirm `NFT_MAX_SUPPLY` exists outside git and has launch approval.
5. Confirm the official metadata base URI exists outside git and has launch approval.
6. Confirm the BSC testnet Chainlink BNB/USD feed is the intended constructor `priceFeedAddress`.
7. Confirm the royalty recipient public address is approved for staging testnet.
8. Confirm the deployer public address is approved only as the deployer role.
9. Confirm the final NFT owner public address is approved before deploy.
10. Confirm the deployer and final owner are not treated as the same role unless a human explicitly approves a temporary staging exception.
11. Confirm the frontend public mint path calls `FunkyNFT.mint()` without recipient or token URI arguments.
12. Confirm no backend `PATCH /api/nft/:id` mint-state update path is re-enabled for browser-submitted `holderId`, `mintStatus`, or `txHash`.

## Deploy-time role rule

`FunkyNFT` is deployed with `Ownable(msg.sender)`, so `owner()` is the deployer immediately after deployment. That is only an initial deploy state, not the intended final handoff state.

For staging testnet, the expected final owner is the approved staging NFT owner public address from the deploy/config preflight. It may be a staging multisig, a staging owner wallet, or a temporary test admin address only if that exception is recorded outside git before mint is enabled.

For production, the final owner or multisig must be decided separately before production deploy. Do not reuse the staging owner decision as production approval.

## Immediate post-deploy read checks

Run read-only checks after deploy and before enabling mint. Store results as non-secret evidence outside git unless a later PR explicitly asks for a redacted summary.

Required checks:

- `name()` returns `FUNKY NFT`.
- `symbol()` returns `FUNKY`.
- `owner()` equals the deployer before handoff.
- `MAX_SUPPLY()` equals the approved max supply.
- `mintEnabled()` is `false`.
- `baseURI()` is empty until the approved owner sets metadata.
- `mintUsdPrice()` equals the approved mint price in 8-decimal USD units.
- `nextTokenId()` is `0`.
- `royaltyInfo(tokenId, salePrice)` returns the approved royalty recipient and basis-point amount.
- Chainlink/feed setting is checked from the non-secret deploy constructor evidence and explorer verification inputs, because `priceFeed` is internal and has no public getter.
- Contract address and chain ID match BSC testnet chain ID `97`.

Do not enable mint if any read check fails.

## Ownership handoff checklist

Before public mint is enabled:

1. Confirm the final owner public address is approved for staging testnet.
2. Transfer ownership from the deployer to the approved final owner only after the recipient address is independently checked.
3. Confirm `owner()` equals the approved final owner after handoff.
4. Confirm the deployer can no longer call owner-only functions:
   - `setBaseURI`
   - `setMintEnabled`
   - `setMintUsdPrice`
   - `setDefaultRoyalty`
   - `batchMint`
   - `withdraw`
5. Keep `mintEnabled()` false until base URI, royalty, price, and owner evidence are complete.

If ownership is transferred to the wrong address, do not enable mint. Treat the deployment as invalid unless the current owner can safely transfer ownership to the approved final owner.

## Sale and metadata checklist

After ownership handoff and before public mint:

1. Confirm `baseURI()` is still unset or set only to the approved official metadata base URI.
2. Set `baseURI` only from the approved final owner.
3. Recheck `baseURI()` after the transaction.
4. Confirm `MAX_SUPPLY()` still matches the approved supply.
5. Confirm `mintUsdPrice()` matches the approved mint price.
6. Confirm `getPrice()` returns a positive BNB/USD value from the intended BSC testnet feed.
7. Confirm `royaltyInfo(...)` still points to the approved royalty recipient.
8. Enable mint only after all checks above pass.
9. Recheck `mintEnabled()` is `true` only after launch approval.

If metadata, price, royalty, owner, or feed evidence is incomplete, keep `mintEnabled()` false.

## Non-secret receipt evidence

Allowed evidence:

- Commit SHA and PR number.
- Network name and chain ID `97`.
- Public NFT contract address.
- Public deployer address.
- Public final owner address.
- Public royalty recipient address.
- Public Chainlink/feed address used as constructor input.
- Public constructor numeric inputs such as max supply and royalty basis points.
- Tx hash, block number, receipt status, gas used, and testnet explorer link without API keys.
- PASS/FAIL summary for read checks.
- `owner()` before and after handoff.
- `mintEnabled()`, `baseURI()`, `MAX_SUPPLY()`, `mintUsdPrice()`, `nextTokenId()`, and `royaltyInfo(...)` check results.

Forbidden evidence:

- Private keys.
- API keys.
- Secret-bearing RPC URLs.
- DB URLs.
- JWTs, cookies, session secrets, or full `.env` files.
- Production signer details.
- Production owner or multisig decisions unless a separate production readiness PR explicitly asks for them.

## Forbidden before tBNB funding

Do not run:

- NFT deploy.
- Ownership transfer.
- `setBaseURI`.
- `setMintEnabled`.
- `setMintUsdPrice`.
- `setDefaultRoyalty`.
- `batchMint`.
- Public NFT mint.
- `withdraw`.
- Prize `sendToWallet`.
- Tier transactions.
- Governance/config transactions.
- Staging pull/restart.

Before funding, only static review, local compile/build/test, no-tx validation, and docs updates are allowed.

## Resume order after tBNB funding

1. Confirm staging domain, HTTPS, and staging env are approved.
2. Confirm BSC testnet chain ID `97`.
3. Confirm deployer, final NFT owner, and royalty recipient public addresses are approved and separated as intended.
4. Deploy `FunkyNFT` with the approved max supply, royalty recipient, royalty basis points, and BSC testnet Chainlink/feed input.
5. Save non-secret deploy receipt evidence.
6. Run immediate post-deploy read checks while `mintEnabled()` is false.
7. Transfer ownership to the approved final owner.
8. Save non-secret ownership handoff receipt evidence.
9. Recheck owner-only control from the final owner and lack of deployer owner authority.
10. Set and verify the approved base URI from the final owner.
11. Recheck mint price, royalty recipient, max supply, Chainlink/feed evidence, and `nextTokenId()`.
12. Enable mint only after human sign-off.
13. Run funded NFT mint smoke and save only non-secret receipt evidence.

## Closure note

This checklist fixes the handoff evidence shape only. It does not prove a live deploy, live ownership transfer, live royalty recipient, live metadata, live mint, live staging behavior, or production readiness.
