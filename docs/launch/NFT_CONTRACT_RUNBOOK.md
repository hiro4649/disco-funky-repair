# NFT Contract Runbook

This runbook is for a new BSC staging or production deployment of `contracts/funky-nft/funky-nft.sol`.

Do not paste private keys, API keys, RPC URLs, or production wallet secrets into this document, git, terminal logs, or PR comments.

## Deployment Assumptions

- No production NFT contract is assumed to be already deployed.
- `FunkyNFT` is an official limited collection contract, not a free-form user metadata minter.
- Public user mint is disabled immediately after deployment.
- Metadata is controlled by the contract owner through `setBaseURI`.
- Ownership must be transferred from the deployer wallet to the approved multisig before public mint is enabled.

## Pre-Deploy Checklist

1. Decide and record the official `MAX_SUPPLY` outside git in the launch checklist.
2. Prepare the official metadata base URI outside git.
3. Confirm the BSC network, Chainlink BNB/USD price feed address, royalty recipient, and royalty basis points.
4. Confirm the production multisig address and signer quorum.
5. Run local verification:

```powershell
cd contracts
npm ci
npx hardhat compile
npx hardhat test
npm run compile:nft
npm run test:nft
```

## Deploy

Set deployment environment variables only in the approved local or CI secret environment. Do not commit them.

```powershell
cd contracts
$env:NFT_MAX_SUPPLY="<official max supply>"
npm run deploy:nft:testnet
```

For production, use the approved production deploy workflow and the production signer policy. Do not deploy from an unapproved personal hot wallet.

## Immediate Post-Deploy Checks

Run read-only checks against the deployed contract:

```powershell
npx hardhat console --config hardhat.config.nft.js --network <network>
```

Check:

- `name()` is `FUNKY NFT`.
- `symbol()` is `FUNKY`.
- `MAX_SUPPLY()` equals the approved supply.
- `mintEnabled()` is `false`.
- `nextTokenId()` is `0`.
- `owner()` is the deployer before ownership transfer.

## Transfer Owner To Multisig

Before enabling mint, transfer ownership to the approved multisig:

```solidity
await nft.transferOwnership("<approved multisig address>");
```

Then verify:

- `owner()` equals the approved multisig address.
- The deployer wallet can no longer call `setBaseURI`, `setMintEnabled`, `setMintUsdPrice`, `setDefaultRoyalty`, `batchMint`, or `withdraw`.

## Configure Metadata And Sale State

Use the multisig to configure the official metadata and enable mint:

```solidity
await nft.setBaseURI("<official metadata base URI>");
await nft.setMintEnabled(true);
```

Before enabling mint, verify the base URI points only to official immutable or launch-approved metadata.

If mint must be stopped:

```solidity
await nft.setMintEnabled(false);
```

## Safety Properties To Recheck

- Public `mint()` has no `to` or `tokenURI` parameter.
- Public `mint()` mints only to `msg.sender`.
- `batchMint(address,uint256)` is owner-only and does not accept token URI input.
- Minting is blocked while `mintEnabled` is false.
- Minting is blocked when `nextTokenId() + quantity` would exceed `MAX_SUPPLY`.

## Rollback / Incident Response

- If metadata is wrong before any mint, keep `mintEnabled` false, update `setBaseURI` from the multisig, and recheck.
- If public mint is already enabled and a launch issue is found, call `setMintEnabled(false)` from the multisig immediately.
- If ownership was sent to the wrong address, do not enable mint. Treat the deployment as invalid unless the owner address can safely transfer ownership to the approved multisig.
- If an unexpected mint happens, stop mint, preserve transaction hashes, and investigate before redeploying or reopening sale.

## Human Sign-Off Required

- Approved `MAX_SUPPLY`.
- Approved metadata base URI.
- Approved multisig owner address.
- Testnet deployment and verification result.
- Production deployment transaction hash.
- Post-transfer `owner()` verification.
