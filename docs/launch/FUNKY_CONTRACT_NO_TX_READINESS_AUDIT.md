# FUNKY-CONTRACT-AUDIT-01 No-tx contract and deploy readiness audit

Status: static audit only. No code, schema, package-lock, environment value, deploy, mint, transfer, tier, governance, staging pull, or PM2 restart was performed.

This is not production ready. The staging domain is still pending, and tBNB is not funded, so all transaction flows remain unproven.

## Confirmed commit

- Repository: `hiro4649/disco-funky-repair`
- Branch audited before this docs-only change: `origin/main`
- Commit: `34b7dc0251794464b1e4a0ae428a61be9f37eead` (`docs: summarize no-tx github code closure (#76)`)

## Audit scope

- `contracts`
- `contracts/package.json`
- `contracts/hardhat.config.js`
- `contracts/hardhat.config.nft.js`
- `contracts/scripts`
- `apps/backend/src/app/lib`
- `apps/backend/src/app/controllers`
- `apps/backend/src/app/routes`
- `apps/backend/src/app/config`
- `apps/backend/prisma`
- `docs/launch`
- Frontend contract env/call sites only where needed for address mapping and NFT mint readiness

## Static search commands

These commands were static only and did not execute deploy, mint, send, tier, or governance transactions.

```powershell
git status --short --branch
git remote -v
git rev-parse --show-toplevel
git rev-parse HEAD
git log -1 --oneline
rg -n "sendToWallet|sendTokensToWallet|txHash|tx_hash|receipt|Transaction|Prize|reserved|reservation|transfer_amount|transfer_token|no-double|double" apps/backend/src/app/controllers apps/backend/src/app/lib apps/backend/src/app/routes apps/backend/prisma -g "*.ts" -g "*.prisma"
rg -n "PRIVATE_KEY|ADMIN_PRIVATE_KEY|PRIZE_HOT_WALLET|TIER_RELAYER|TOKEN_CONTRACT_ADDRESS|NFT_CONTRACT_ADDRESS|TIER_UPDATER_CONTRACT_ADDRESS|CHAIN_ID|chainId|bscTestnet|bscMainnet|BSCSCAN|ETHERSCAN|RPC" contracts apps/backend/src apps/frontend/src apps/frontend/utils docs/launch -g "*.js" -g "*.ts" -g "*.tsx" -g "*.sol" -g "*.md"
rg -n "mintEnabled|maxSupply|MAX_SUPPLY|baseURI|tokenURI|owner|admin|relayer|TierUpdater|update_holding_date|syncHoldingDate|setMint|withdraw|setDefaultRoyalty" contracts apps/backend/src apps/frontend/src apps/frontend/utils docs/launch -g "*.sol" -g "*.js" -g "*.ts" -g "*.tsx" -g "*.md"
git ls-files "*.env" "*.env.*" "**/.env" "**/.env.*"
rg -n "NEXT_PUBLIC_(NFT_ADDRESS|TOKEN_CONTRACT_ADDRESS|RPC_URL|ETHERSCAN_EXPLORER|APP_ENV)|BSC testnet|CHAIN_ID|prebsc|bsc-testnet|bnb-testnet" apps/frontend/env.validation.mjs apps/frontend/env.validation.test.mjs apps/frontend/src apps/frontend/utils -g "*.mjs" -g "*.ts" -g "*.tsx" -g "*.js"
rg -n "NFT_ABI|NEXT_PUBLIC_TOKEN_ADDRESS|NEXT_PUBLIC_NFT_ADDRESS" apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx" -g "*.js"
rg -n "MANUAL_REVIEW_MESSAGE|contract\.(add|remove|update|set|withdraw|mint)|sendTransaction|new Wallet" apps/frontend/src/components/admin/TokenManagement/index.tsx apps/frontend/src/components/admin/NFTManagement/index.tsx apps/frontend/src/components/OfficalDiscoNFT/index.tsx
```

The tracked `.env` search returned no tracked env files. The secret-pattern scan was reviewed without printing secret values; observed matches were environment variable names, tests, placeholder examples, and public addresses, not committed real private keys or API keys.

## PASS

- FUNKY token deploy script requires explicit `FUNKY_INITIAL_ADMIN` and `FUNKY_INITIAL_FEE_RECIPIENT`, uses the selected Hardhat signer, and does not contain committed secret values.
- Default Hardhat token config separates BSC testnet `chainId: 97` and BSC mainnet `chainId: 56`; signer accounts come only from `PRIVATE_KEY` if provided.
- NFT Hardhat config also separates `bscTestnet` chain ID `97` and `bscMainnet` chain ID `56`; no private key literal was found.
- `FunkyRave` constructor rejects zero initial admin and fee recipient, mints initial supply to the initial admin, and does not auto-grant tier updater authority to the deployer EOA.
- `FunkyRave` admin controls prevent removing the last admin, reject EOA tier updater registration, require registered factories before adding DEX pairs, and keep fee changes/admin changes behind admin role checks.
- `FunkyTierUpdater` has a dedicated owner and relayer model. Only relayers can sync holding dates, and only owner can set relayers or transfer ownership.
- Tier downgrade/reset paths require explicit non-regular reason codes; regular sync cannot silently downgrade.
- `FunkyNFT` starts with `mintEnabled == false`, requires non-empty base URI before minting, enforces immutable `MAX_SUPPLY`, mints public NFTs only to `msg.sender`, and does not accept public arbitrary `to` or `tokenURI` inputs.
- NFT owner-only operations are limited to base URI, mint flag, batch mint, mint price, royalty, and withdraw controls.
- Prize send path uses `PRIZE_HOT_WALLET_PRIVATE_KEY`, not `ADMIN_PRIVATE_KEY`, and requires `PRIZE_TRANSFER_TOKEN_ALLOWLIST`.
- Prize transfer amount/token are snapshotted on draw as `transfer_amount` and `transfer_token_address`; send uses that snapshot instead of recalculating from mutable catalog state.
- Prize send uses `status: READY`, `tx_hash: null`, and an `updateMany` transition to `SENDING` before broadcasting, reducing double-send risk at the DB layer.
- Broadcasted or confirmed prize transactions are stored with `tx_hash`; later receipt checks move them to `RECEIVED`, `BROADCASTED`, or `MANUAL_REVIEW`.
- Expired, cancelled, and failed unpaid prize reservations are released only when no `tx_hash` is present; broadcasted transactions are not auto-released.
- Backend production env validation requires BSC production contract/RPC/explorer/env values, rejects zero addresses and known test private keys, and enforces `CHAIN_ID=56` in production.
- Frontend production/staging env validation rejects secret-like `NEXT_PUBLIC_*` variables; staging public RPC validation requires BSC-testnet-looking RPC URLs and `https://testnet.bscscan.com` explorer.
- Admin token/NFT management components remain manual-review/read-only for governance/owner writes and do not create browser private-key wallets in the searched paths.
- Prisma schema contains tx evidence fields for prize transactions, holding-date history, transaction audit, fee history, and DEX metadata.

## P0 candidates

- None found in this no-tx static pass.

P0 is still possible after tBNB funding if actual deployed addresses, owners, relayers, hot wallets, frontend env values, or receipts differ from the intended BSC testnet plan. That cannot be proven before funding and staging configuration.

## P1 candidates

1. Public NFT mint frontend call appears incompatible with the current BSC `FunkyNFT` contract.
   - `contracts/funky-nft/funky-nft.sol` exposes `mint() payable` with contract-managed metadata and `msg.sender` recipient.
   - `apps/frontend/src/utils/constant.ts` still declares `mint(address owner, string memory uri)`, and `apps/frontend/src/components/OfficalDiscoNFT/index.tsx` calls `contract.mint(address, metadataUri, { value })`.
   - Expected impact: the NFT mint smoke is likely to revert or fail client-side until frontend ABI/call shape is aligned with the contract. This should be fixed before treating NFT mint readiness as complete.

2. Deploy/config scripts do not enforce an explicit approved chain/address manifest before write transactions.
   - Scripts show selected network and public addresses, but governance/configure scripts rely on operator-selected network/env values.
   - Expected impact: a human could run a write script with a wrong `FUNKY_TOKEN_ADDRESS`, wrong network, or wrong signer after tBNB is funded. Add a preflight/manifest confirmation before tx scripts are used.

3. Staging backend chain ID is not code-enforced in the same way production `CHAIN_ID=56` is enforced.
   - Production validation rejects non-56 chain IDs.
   - Staging BSC testnet `97` is currently enforced by runbook/frontend validation and must be human-verified against the RPC.
   - Expected impact: staging tx smoke can be run on a misconfigured backend unless a staging env preflight validates chain ID/address mapping before restart.

4. NFT deploy script defaults royalty recipient and owner authority to the deployer address.
   - The script documents transfer/owner next steps, but it does not enforce transfer to a test multisig or approved temporary test admin before `setMintEnabled`.
   - Expected impact: deployer custody can persist accidentally into staging or production-like verification.

## P2 candidates

1. `contracts/hardhat.config.nft.js` does not call `dotenv.config()` while the default token Hardhat config does. Shell env still works, but config behavior is inconsistent.
2. Hardhat configs contain public RPC fallbacks for BSC testnet/mainnet. These are not secrets, but an explicit RPC env requirement would reduce operator ambiguity for tx PRs.
3. `apps/frontend/src/components/admin/TokenManagement/index.tsx` has stale Sepolia wording and legacy holding-day display options (`0`, `30`, `180`, `360`, `720`) that do not match the current contract tier set (`0`, `31`, `91`, `181`, `271`, `361`, `541`, `721`). The component is read/manual-review oriented, but the display can mislead verification.
4. Some backend tx/monitoring logs print public tx hashes, user IDs, wallet prefixes, or receipt metadata. This is acceptable for non-secret evidence when sanitized, but runtime log smoke must still confirm no API keys, RPC URLs with query strings, private keys, JWTs, cookies, or DB URLs appear.

## UNKNOWN

- Actual staging domain, HTTPS origin, CORS origin list, and backend/frontend env values.
- Actual BSC testnet RPC `eth_chainId` response from the configured staging backend RPC.
- Actual deployed FUNKY token, NFT, and `FunkyTierUpdater` addresses.
- Actual ownership/admin/relayer separation after deployment.
- Whether the deployer, prize hot wallet, tier relayer, NFT owner, token admin, and governance/multisig signer are separate wallets in the real secret manager.
- Whether Chainlink BNB/USD feed addresses are accepted by launch owner for the exact BSC network used.
- Whether contract verification scripts and explorer API values work with the final testnet explorer account.
- Whether prize hot wallet token balance/native gas balance are sufficient after funding.
- Whether tx receipt evidence storage and runtime logs remain non-secret in the live staging environment.

## BLOCKED

- FUNKY token deploy/config tx: blocked by no tBNB and no staging domain.
- NFT contract deploy/config/mint tx: blocked by no tBNB and the P1 frontend mint ABI/call mismatch.
- `FunkyTierUpdater` deploy/config/relayer tx: blocked by no tBNB and no approved chain/address manifest.
- Prize `sendToWallet` tx and receipt retry evidence: blocked by no tBNB and no staging env.
- Governance, fee, DEX, pair, admin, owner, royalty, base URI, mint enable, and withdraw transactions: blocked by no tBNB and must stay manual/governance controlled.
- Production readiness: blocked. This audit is a no-tx static checkpoint only.

## Resume order after tBNB funding

1. Decide staging domain and finish DNS/HTTPS/certbot.
2. Update backend/frontend staging env in the secret manager only; do not commit real values.
3. Run a no-secret env preflight for BSC testnet: chain ID `97`, BSC testnet RPC/explorer, token/NFT/tier address placeholders unset until deploy, CORS strict to staging origin.
4. Pull `main`, build backend/frontend, restart staging only after the domain/env are approved.
5. Deploy FUNKY token to BSC testnet and record non-secret evidence.
6. Deploy `FunkyTierUpdater`, configure only the dedicated relayer, and register the updater with the FUNKY token.
7. Configure approved factories/pairs/DEX settings only through the governance runbook or approved temporary staging admin.
8. Deploy `FunkyNFT` with approved `NFT_MAX_SUPPLY`, confirm `mintEnabled=false`, set base URI, and transfer owner/admin control before enabling mint.
9. Update backend/frontend env names with deployed contract addresses in the secret manager, then rebuild/restart staging.
10. Run no-tx smoke: health/status, auth, admin route protection, static assets, public field policies, and secret log scan.
11. Run tx smoke in this order: NFT mint, prize send/receipt, tier sync/downgrade/reset, governance/configure receipts.
12. Save non-secret tx evidence and keep all secrets outside git, chat, PRs, and logs.

## Required non-secret evidence

- Git commit and PR number used for staging.
- Network name and confirmed chain ID only.
- Contract names and public contract addresses.
- Public deployer/admin/owner/relayer/hot-wallet addresses only when needed for role verification.
- Tx hash, block number, receipt status, and testnet explorer URL without API keys.
- Constructor arguments that are public addresses or public numeric settings.
- Env variable names updated, without values.
- Build/test/smoke command names and PASS/FAIL summaries.
- Secret log scan summary that confirms no private key, API key, JWT, cookie, DB URL, or RPC URL with query string was recorded.

## Next small PR candidates

1. `P1-CONTRACT-01 Align NFT frontend mint with BSC FunkyNFT`
   - Update public NFT ABI/call from `mint(address,string)` to `mint()` payable, remove DB-driven public tokenURI assumptions, and add a no-tx unit/static test that frontend ABI matches the contract public mint shape.

2. `P1-CONTRACT-02 Add deploy/config preflight manifest`
   - Add a no-tx preflight that validates network name, chain ID, required env names, target contract address format, and operator confirmation before deploy/config scripts can send transactions.

3. `P1-CONTRACT-03 Add staging BSC testnet env mapping check`
   - Add backend/frontend validation or a script that checks staging `CHAIN_ID=97`, BSC testnet RPC/explorer shape, and matching token/NFT/tier env address names before staging restart or tx smoke.

## Command results

```text
cd contracts && npx hardhat compile
Result: success. Nothing to compile.

cd contracts && npx hardhat test
Result: success. 34 passing, 16 pending.

cd contracts && npm run compile:nft
Result: success. Nothing to compile.

cd contracts && npm run test:nft
Result: success. 16 passing.

cd apps/backend && npm run build
Result: success. Prisma generate and TypeScript build completed.

cd apps/backend && npm test -- --runInBand
Result: success. 32 suites passed, 315 tests passed.

git diff --check
Result: success.
```

## Closure notes

- Code changes: none.
- Backend changes: none.
- Frontend changes: none.
- Contract changes: none.
- Schema changes: none.
- `package-lock` changes: none.
- `.env` real values: none.
- Secret/API/private key/DB connection values: none added.
- Staging reflection: not performed because staging domain is pending.
- Tx/deploy/mint/send/tier/governance verification: not performed because tBNB is not funded.
- Production ready: no.
