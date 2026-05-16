# Staging And BSC Testnet Verification Runbook

Status: STAGE-01 pre-production verification plan.

This runbook fixes the manual steps required before DISCO.fan / FUNKY.fan can move from static P0 closure to a production launch decision.

Do not commit, paste, print, or store real `.env` files, private keys, seed phrases, API keys, JWT secrets, DB URLs, RPC URLs, or production logs in this repository, PRs, tickets, or chat. Use the approved secret manager and record only PASS/FAIL plus non-secret evidence.

## 1. Staging Server Preconditions

Before creating or configuring staging, confirm:

- Staging is separate from production infrastructure.
- Staging uses a fresh DB, test wallets, BSC testnet contracts, and non-production DNS.
- Staging is allowed to hold test private keys only in the staging secret manager.
- Staging does not use `var-www`, `Rave_bk`, old Sui/DISCO copies, or manually copied source trees.
- Staging deploy source is only GitHub repository `hiro4649/disco-funky-repair`.
- Staging DNS, nginx, PM2/systemd service names, database name, and secret names visibly include `staging`.
- No production contract address, production hot wallet, production API key, or production DB URL is used.

No-Go if any staging value points to production, mainnet, localhost in production-like mode, dummy/example placeholders, or old source folders.

## 2. Clone From GitHub

Run on the staging server with a deploy user.

```bash
mkdir -p /srv/disco-funky
cd /srv/disco-funky
git clone https://github.com/hiro4649/disco-funky-repair.git app
cd app
git fetch origin --prune
git switch main
git pull --ff-only origin main
```

Do not copy local `Rave`, `Rave_bk`, `var-www`, or downloaded zip contents onto the staging server.

## 3. Branch And Commit Confirmation

Record these non-secret values in the staging evidence log:

```bash
git remote -v
git branch --show-current
git rev-parse HEAD
git log --oneline -5
git status --short
```

Expected:

- Branch is `main`, unless a specific reviewed staging branch is approved.
- Commit matches the release candidate commit approved by humans.
- `git status --short` is empty.

No-Go if staging runs an unreviewed branch, local edits, or an old commit.

## 4. Install Dependencies

```bash
cd /srv/disco-funky/app/apps/backend
npm ci

cd /srv/disco-funky/app/apps/frontend
npm ci

cd /srv/disco-funky/app/contracts
npm ci
```

No lockfile or package changes are made on the server.

## 5. Staging DB Creation And Migration

Create a new empty PostgreSQL staging DB outside this repository. Store `DATABASE_URL` only in the staging secret manager or approved runtime environment.

From backend:

```bash
cd /srv/disco-funky/app/apps/backend
npm run prisma:validate
npm run migrate:status
npm run migrate:deploy
npm run prisma:generate
npm run migrate:status
npm run build
npm test -- --runInBand
```

Expected:

- Baseline migration is pending before deploy on a fresh DB.
- `_prisma_migrations` is up to date after deploy.
- Prisma Client generation succeeds.
- Build and test pass.

Rollback before real staging data:

- Stop deployment.
- Drop and recreate the empty staging DB only after approval.
- Re-run `migrate:deploy` from the same commit.

Rollback after real staging data:

- Do not run destructive reset.
- Write a forward-only migration or manual remediation plan.

## 6. Backend Secret Manager Checklist

Set these in the staging secret manager, not in `.env` committed to git:

- `NODE_ENV=production` or an approved staging mode that still exercises production env validation.
- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_WALLET_ADDRESS`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `BACKEND_API_URL`
- `FRONTEND_APP_URL`
- `QUICKNODE_HTTP_RPC_URL`
- `QUICKNODE_WS_RPC_URL`
- `ETHERSCAN_API_URL`
- `ETHERSCAN_API_KEY` or `BSCSCAN_API_KEY`
- `CHAIN_ID`
- `TOKEN_CONTRACT_ADDRESS`
- `NFT_CONTRACT_ADDRESS`
- `PRIZE_HOT_WALLET_PRIVATE_KEY`
- `PRIZE_TRANSFER_TOKEN_ALLOWLIST`
- `TIER_RELAYER_PRIVATE_KEY`
- `TIER_UPDATER_CONTRACT_ADDRESS`

Staging values must point to BSC testnet equivalents where chain interaction is tested. If the backend production validator requires BSC mainnet `CHAIN_ID=56`, use a separate approved staging mode for testnet contract tests and document that production env validation is still checked separately with non-secret placeholders.

Do not set `ADMIN_PRIVATE_KEY` unless a human explicitly accepts the current P1 monitoring-only risk. If set, it must not be a production admin key and must not hold owner/governance authority.

## 7. Frontend Public Env Checklist

Public values allowed in frontend hosting/build settings:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_ALCHEMY_RPC_URL` if it is a public BSC RPC override
- `NEXT_PUBLIC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_NFT_ADDRESS`
- `NEXT_PUBLIC_SOCKET_API_URL`
- `NEXT_PUBLIC_ETHERSCAN_EXPLORER`

Never set these or equivalent names:

- `NEXT_PUBLIC_ADMIN_PRIVATE_KEY`
- `NEXT_PUBLIC_*PRIVATE_KEY`
- `NEXT_PUBLIC_*SECRET`
- `NEXT_PUBLIC_*ADMIN_KEY`
- `NEXT_PUBLIC_*OWNER_KEY`
- `NEXT_PUBLIC_*RELAYER_KEY`
- `NEXT_PUBLIC_*HOT_WALLET`
- `NEXT_PUBLIC_*JWT`

Run:

```bash
cd /srv/disco-funky/app/apps/frontend
node env.validation.test.mjs
npm run build
```

No-Go if the frontend build reads a private key, creates a private-key wallet, or directly signs governance/admin transactions in the browser.

## 8. Backend And Frontend Build

```bash
cd /srv/disco-funky/app/apps/backend
npm run build

cd /srv/disco-funky/app/apps/frontend
npm run build
```

Record PASS/FAIL only. Do not paste secret-bearing logs.

## 9. PM2 Or systemd Startup

Choose one process manager. Do not run both for the same app.

PM2 example:

```bash
cd /srv/disco-funky/app/apps/backend
pm2 start dist/src/main.js --name disco-funky-backend-staging --update-env

cd /srv/disco-funky/app/apps/frontend
pm2 start npm --name disco-funky-frontend-staging -- start

pm2 list
pm2 show disco-funky-backend-staging
pm2 show disco-funky-frontend-staging
```

systemd example:

```bash
sudo systemctl status disco-funky-backend-staging
sudo systemctl status disco-funky-frontend-staging
sudo journalctl -u disco-funky-backend-staging --since "15 minutes ago" --no-pager
sudo journalctl -u disco-funky-frontend-staging --since "15 minutes ago" --no-pager
```

Confirm:

- Working directory is `/srv/disco-funky/app/apps/backend` for backend.
- Working directory is `/srv/disco-funky/app/apps/frontend` for frontend.
- Backend command runs built `dist/src/main.js`.
- Frontend command runs Next.js from the checked-out app.
- No process references `var-www`, `Rave_bk`, old zip exports, or old Sui/DISCO source.

## 10. nginx Reverse Proxy

Check nginx config without printing secrets:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo nginx -T | grep -E "server_name|proxy_pass|root|alias"
```

Confirm:

- Staging hostnames are not production hostnames.
- Backend proxy points to the staging backend port.
- Frontend proxy points to the staging frontend port.
- If `/api` is proxied on the frontend hostname, nginx preserves the `/api` prefix when forwarding to backend.
- No `root` or `alias` points to `var-www`, `Rave_bk`, old Sui/DISCO copies, or local user download folders.
- HTTPS certificates are staging-approved and do not imply production traffic is live.

Do not treat `404` from smoke endpoints as proof that a route is protected. A `404` can mean the wrong URL, stripped `/api` prefix, wrong method, wrong hostname, old source, or missing deploy. Recheck nginx and route path before recording PASS.

## 11. Confirm This Is Staging, Not Production

Open the staging site and admin panel. Confirm:

- Browser URL is staging DNS.
- Wallet network is BSC testnet for testnet flow.
- API calls target staging backend.
- DB writes appear in staging DB only.
- Prize/token/NFT/tier contract addresses are testnet addresses.
- No production user data is visible.
- No production hot wallet, relayer, owner, or multisig signer is used.

## 12. BSC Testnet Contract Deploy

Use only test wallets and test secrets in the approved shell or CI environment. Do not commit deployment env.

Compile first:

```bash
cd /srv/disco-funky/app/contracts
npx hardhat compile
npx hardhat test
npm run compile:nft
npm run test:nft
```

Deploy FUNKY token to BSC testnet:

```bash
cd /srv/disco-funky/app/contracts
npm run deploy:funky:testnet
```

Deploy NFT contract to BSC testnet:

```bash
cd /srv/disco-funky/app/contracts
npm run deploy:nft:testnet
```

Deploy or configure `FunkyTierUpdater` according to the contracts deploy scripts and `GOVERNANCE_RUNBOOK.md`. If the deploy script emits addresses, record only:

- Chain ID
- Contract name
- Contract address
- Tx hash
- Deployer wallet address
- Commit SHA

Do not record private keys or RPC/API URLs.

## 13. FUNKY Token Verification

On BSC testnet, verify:

- Token name/symbol/decimals.
- Initial supply and intended holder.
- Valid fee tiers are `0,31,91,181,271,361,541,721`.
- Unknown tier updates revert.
- `REGULAR_SYNC` cannot downgrade.
- Explicit reason-coded reset/downgrade can reset to `0` or the justified tier.
- Backend governance/fee/DEX/pair routes cannot directly execute token admin writes.

Record tx hashes and receipts in the external staging evidence store.

## 14. NFT Contract Verification

Verify on BSC testnet:

- `MAX_SUPPLY` equals the approved staging value.
- `mintEnabled()` is false immediately after deploy.
- Public mint is blocked while disabled.
- Users cannot provide arbitrary `to` or `tokenURI`.
- Public mint mints only to `msg.sender`.
- Owner/admin can set base URI only through approved owner path.
- Batch mint cannot exceed `MAX_SUPPLY`.
- Ownership is transferred to test multisig or explicitly approved temporary test admin before enabling mint.

Follow `docs/launch/NFT_CONTRACT_RUNBOOK.md` for exact NFT checks.

## 15. FunkyTierUpdater Verification

Verify:

- `FunkyTierUpdater` is deployed on BSC testnet.
- Owner is test multisig or approved temporary test admin.
- Only the dedicated tier relayer has relayer permission.
- `TIER_RELAYER_PRIVATE_KEY` belongs to a wallet that is not prize hot wallet, token owner, NFT owner, governance wallet, or multisig signer.
- Backend tier sync uses `TIER_UPDATER_CONTRACT_ADDRESS`.
- Missing `TIER_RELAYER_PRIVATE_KEY` or missing `TIER_UPDATER_CONTRACT_ADDRESS` prevents tx send.

## 16. Multisig Or Temporary Admin Policy

Staging may use an approved temporary test admin only if:

- It is not a production wallet.
- It is not reused as prize hot wallet or tier relayer.
- It is documented in the external staging evidence store.
- It is replaced by multisig before any production-like launch rehearsal.

Production must use multisig/timelock for owner/governance authority.

## 17. Prize Hot Wallet And Allowlist

Confirm:

- `PRIZE_HOT_WALLET_PRIVATE_KEY` is stored only in staging secret manager.
- Prize hot wallet is a staging/test wallet.
- Prize hot wallet holds only limited test gas and test prize tokens.
- Prize hot wallet is not token owner, NFT owner, tier updater owner, governance wallet, multisig signer, or tier relayer.
- `PRIZE_TRANSFER_TOKEN_ALLOWLIST` contains only approved BSC testnet prize token addresses.
- Non-allowlisted token sends move to safe failure or manual review and do not broadcast.

## 18. Wallet Signature Login Smoke Test

From the staging frontend:

1. Connect a test wallet on BSC testnet.
2. Start login.
3. Confirm frontend calls `/user/auth/nonce`.
4. Confirm wallet signs the returned message.
5. Confirm `/user/signup` verifies signature and sets auth cookie/JWT.
6. Attempt to reuse the same nonce and confirm it fails.
7. Attempt to sign with a different wallet and confirm it fails.
8. Confirm `/user/verify` returns the authenticated user.

No-Go if wallet address alone can issue JWT.

## 19. API Authorization Smoke Test

Use staging-only users and admin accounts.

For no-tx route checks before BNB/tBNB funding, follow `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md`.

For each P0 mutation group, run three checks:

- No auth: rejected.
- Normal user auth: allowed only for own user-owned action, rejected for admin actions.
- Admin auth: allowed only for admin actions.

Status code expectations:

- `410 FEATURE_DISABLED`: expected for MVP-disabled routes such as direct NFT status update and direct user illustration assignment.
- `401 Unauthenticated`: expected for protected admin routes when no cookie or Authorization header is sent.
- `403 Forbidden`: expected when a signed-in normal user is authenticated but lacks owner/admin rights.
- `404 Not Found`: not valid protection evidence unless the route is intentionally unreachable and documented as such.

Crash game exception: Crash game is intentionally not installed for the MVP. `/api/crash/games` may return `404` if the route is not mounted, but only after confirming `initCrashServer` is not imported/called, `/crashx` is not running the Crash engine, frontend `/fan-games` is `notFound()`, Sidebar has no Fan Games/Crash navigation, and Crash controller/DB update paths are unreachable. Do not use this Crash-only exception for other disabled or protected routes.

Groups:

- Prize draw/history/send/withdraw.
- Prize admin create/update/delete/cancel/fail.
- Illustration draw/history and disabled `POST /user/illustration`.
- Daily point mutation.
- Ticket code claim.
- Lottery/ticket claim.
- All-user ticket distribution and ticket distribution admin.
- NFT admin upload/delete/update/read.
- Trial NFT claim and Trial NFT admin/template.
- Referral normal and referral admin.
- Monitoring batch routes.
- Governance/fee/DEX/pair writes.
- Crash game and user-manage disabled routes.

No-Go if unauthenticated or normal user auth can mutate admin state, another user's assets, tickets, points, NFTs, prizes, referrals, or governance state.

Current no-tx unauthenticated smoke targets and expected status:

| Target | Method and path | Expected |
| --- | --- | --- |
| Direct NFT status update disabled | `PATCH /api/nft/<nft-id>` | `410 FEATURE_DISABLED` |
| Direct user illustration disabled | `POST /api/user/illustration` | `410 FEATURE_DISABLED` |
| Referral admin snapshot | `POST /api/referral/admin/run-snapshot` | `401 Unauthenticated` |
| Referral admin reward distribution | `POST /api/referral/admin/distribute-rewards` | `401 Unauthenticated` |
| All-user ticket distribution | `POST /api/alluser/distribute/ticket` | `401 Unauthenticated` |
| Admin NFT listing | `GET /api/admin/nfts` | `401 Unauthenticated` |
| Admin ticket distribution listing | `GET /api/admin/ticket-distribution` | `401 Unauthenticated` |
| Crash game API intentionally not installed | `GET /api/crash/games` | `404 Not Found` only if Crash absence checks pass; otherwise `410 FEATURE_DISABLED` if mounted disabled |

## 20. Admin Route Smoke Test

Confirm:

- Admin login uses admin auth cookie/JWT.
- Admin token or Authorization header is not logged.
- Admin Prize routes require `AuthAdmin`.
- Admin NFT and Trial NFT upload routes reject before file persistence when unauthenticated.
- Ticket distribution and referral admin routes reject normal user JWT.
- Governance write routes return `410` or `MANUAL_REVIEW_REQUIRED` and do not broadcast or mark DB as on-chain complete.

## 21. Prize Draw Smoke Test

With a staging user:

1. Grant or claim enough test tickets through approved staging path.
2. Configure a test prize with allowlisted test token and known test inventory.
3. Run draw.
4. Confirm one ticket is consumed.
5. Confirm `PrizeTransactions.transfer_token_address` and `transfer_amount` are fixed at win creation.
6. Confirm `reserved_amount` increases in the same draw transaction.
7. Attempt concurrent or repeated draw beyond inventory.
8. Confirm no READY win is created beyond available inventory.

## 22. Prize sendToWallet BSC Testnet Tx

1. Use a READY prize transaction owned by the authenticated user.
2. Call send to wallet.
3. Confirm only the prize hot wallet signs.
4. Confirm tx hash is saved.
5. Confirm receipt status on BSC testnet.
6. Retry send with existing tx hash.
7. Confirm retry checks receipt and does not broadcast a second transfer.
8. Confirm successful send consumes reservation once.
9. Confirm missing/invalid amount, token address, or allowlist moves to safe failure/manual review and does not transfer.

## 23. Ticket Code Claim

1. Generate a staging ticket code through admin path.
2. Claim it once as the intended user.
3. Confirm ticket increment.
4. Attempt duplicate claim and parallel duplicate claim.
5. Confirm only one claim succeeds.
6. Claim expired code and confirm failure.
7. Confirm unauthenticated claim is rejected.

## 24. Lottery And Ticket Claim

Confirm:

- User routes require auth.
- Route/body `userId` not matching `req.user.user_id` returns 403.
- Another user's ticket or claim state cannot be changed.
- All-user distribution requires admin.

## 25. Illustration Draw

Confirm:

- User route requires auth.
- Other user ID returns 403.
- Ticket is decremented before draw result is committed.
- Ticket zero rejects draw.
- One ticket with parallel requests creates only one success.
- FanPoint and IllustrationHistory are created only for authenticated user.
- Direct `POST /user/illustration` remains disabled.

## 26. NFT Mint

Contract-level BSC testnet checks:

- Public mint disabled by default.
- Enabling mint requires owner/multisig or approved test admin.
- Public mint has no arbitrary `to` or `tokenURI`.
- `MAX_SUPPLY` cannot be exceeded.

Backend/frontend checks:

- `PATCH /nft/:id` remains disabled.
- NFT admin upload/update/delete requires admin.
- Frontend does not create private-key signer.

## 27. Tier Downgrade And Reset

On BSC testnet:

1. Set a wallet to a higher tier through approved regular sync path.
2. Attempt lower tier with `REGULAR_SYNC`; expect revert.
3. Trigger zero-balance reset or weighted-average downgrade reason through approved path.
4. Confirm reason-coded sync succeeds.
5. Confirm unknown tier is rejected.
6. Confirm DB tier and contract tier reconcile after backend sync.

## 28. Governance Route Disabled Check

Confirm backend routes for fee, DEX, pair, factory, fee recipient, and fee exemption:

- Return `410` or `MANUAL_REVIEW_REQUIRED`.
- Do not broadcast tx.
- Do not update DB as if on-chain write completed.
- Direct governance action is possible only through `GOVERNANCE_RUNBOOK.md` and multisig/timelock or approved test admin on testnet.

## 29. Frontend Secret Scan

Run from repository root:

```bash
rg -n "NEXT_PUBLIC_.*PRIVATE_KEY|NEXT_PUBLIC_.*SECRET|NEXT_PUBLIC_.*ADMIN_KEY|NEXT_PUBLIC_.*OWNER_KEY|NEXT_PUBLIC_.*RELAYER_KEY|NEXT_PUBLIC_.*HOT_WALLET|NEXT_PUBLIC_.*JWT" apps/frontend
rg -n "new ethers\\.Wallet|ethers\\.Wallet|new Wallet|sendTransaction|writeContract" apps/frontend/src apps/frontend/utils
rg -n "add_admin|remove_admin|add_dex|remove_dex|update_fee_percentage|update_fee_recipient|setMintUsdPrice|setDefaultRoyalty|withdraw\\(" apps/frontend/src apps/frontend/utils
```

Expected:

- Only validation tests or forbidden-env documentation mention private key patterns.
- No browser private-key signer or admin/governance signing path exists.

## 30. Log Secret Scan

Run in a restricted server terminal after PM2 flush/restart and the relevant smoke checks. Do not paste log output into PRs or chat. Record PASS/FAIL only.

Before collecting scan logs:

```bash
pm2 flush
pm2 restart disco-funky-backend-staging --update-env
pm2 restart disco-funky-frontend-staging --update-env
```

Suggested checks:

```bash
pm2 logs disco-funky-backend-staging --lines 500 --nostream > /tmp/backend-staging-last500.log
grep -E -i "Authorization:|Bearer |JWT_SECRET|DATABASE_URL|PRIVATE_KEY|apikey=|apiKey|secret=|password=|postgres://" /tmp/backend-staging-last500.log >/tmp/backend-secret-scan.txt
wc -l /tmp/backend-secret-scan.txt
rm -f /tmp/backend-staging-last500.log /tmp/backend-secret-scan.txt
```

Expected `wc -l` result is `0`. If non-zero, do not paste the lines; inspect privately and open a sanitization task.

No-Go if raw JWT, Authorization header, cookie value, private key, API key, DB URL, RPC URL with query string, or explorer API-key URL appears in logs.

## 31. BSC Testnet Tx Receipt Evidence

Store receipts outside this repository in the approved staging evidence store.

For each tx, save:

- Environment: staging.
- Chain: BSC testnet.
- Chain ID.
- Contract name.
- Contract address.
- Function name.
- Tx hash.
- Block number.
- Status.
- From address.
- To address.
- Event names and decoded non-secret args.
- Commit SHA.
- Operator or approver name.

Do not save private keys, API keys, RPC URLs, DB URLs, JWTs, cookies, or raw server logs.

Read receipt example:

```bash
npx hardhat console --network bscTestnet
```

```javascript
const receipt = await ethers.provider.getTransactionReceipt("<txHash>");
console.log({
  hash: receipt.hash,
  blockNumber: receipt.blockNumber,
  status: receipt.status,
  from: receipt.from,
  to: receipt.to
});
```

Use only placeholder tx hashes in documentation.

## 32. Rollback Policy

Staging app rollback:

1. Stop PM2/systemd service.
2. `git fetch origin --prune`.
3. `git switch main`.
4. `git reset --hard <approved_previous_commit>` only on the staging checkout after human approval.
5. Rebuild backend/frontend.
6. Restart services.
7. Record old/new commit SHA.

Staging DB rollback:

- Before real staging data: recreate empty DB and run `migrate:deploy`.
- After real staging data: no destructive reset; use forward-only migration/remediation.

BSC testnet contract rollback:

- If pre-launch config is wrong, pause/disable mint or relevant feature.
- If ownership or immutable constructor values are wrong, redeploy testnet contract and update staging env.
- Record old and new contract addresses and tx hashes.

Production rollback must be written separately before production deploy.

## 33. No-Go Conditions

Do not proceed to production launch decision if any item is true:

- Staging source is not GitHub `main` approved commit.
- Staging points to production DB, production RPC, production contracts, or production wallets.
- Any `.env` or secret file is committed or copied into repo.
- Wallet address alone can login without signature verification.
- Unauthenticated or normal user can mutate admin/user-owned assets outside their authorization.
- Frontend contains any private key or browser admin signer.
- Backend can directly execute governance/fee/DEX/pair writes.
- Prize send can double-send, send non-allowlisted token, or send without fixed transfer amount.
- Prize inventory can create READY wins beyond available reserved inventory.
- Ticket/illustration/lottery flows can mutate another user or avoid required ticket consumption.
- NFT contract permits arbitrary user metadata mint or exceeds max supply.
- Tier downgrade/reset can be abused through `REGULAR_SYNC`.
- Logs expose JWT, Authorization header, cookie value, private key, API key, DB URL, or API-key-bearing URL.
- Production secret manager values are not reviewed.
- Contract owner/admin roles are not transferred to multisig/timelock for production.

## 34. Go Decision Conditions

Production launch decision may proceed only when:

- All local build/test/compile checks pass from the release commit.
- Staging backend/frontend deploy from the approved GitHub commit.
- DB migration deploy and Prisma generate succeed on fresh staging DB.
- Backend and frontend env validation pass with staging values.
- PM2/systemd and nginx point to staging source and staging ports.
- Wallet login, API authorization smoke, admin route smoke, disabled route checks, and log redaction checks pass.
- BSC testnet FUNKY, NFT, and FunkyTierUpdater deploy and verification pass.
- Prize draw/send/reservation, ticket code claim, lottery/ticket claim, illustration draw, NFT mint, and tier reset/downgrade pass on staging/testnet.
- Governance routes remain backend-disabled and are verified through runbook/multisig path.
- Staging/testnet tx receipts are saved outside git.
- Production secret manager checklist is reviewed without exposing values.
- Human launch owner signs off that no No-Go condition remains.
