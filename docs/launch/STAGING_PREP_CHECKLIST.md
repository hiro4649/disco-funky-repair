# Staging Prep Checklist

Status: STAGE-02 pre-staging resource checklist.

This checklist is for preparing a new staging server and BSC testnet environment before running `docs/launch/STAGING_TESTNET_VERIFICATION_RUNBOOK.md`. It is not a production deploy approval and does not authorize production launch.

Do not write real `.env` files, private keys, seed phrases, API keys, JWT secrets, DB URLs, RPC URLs, production logs, or secret-manager values into this repository, PRs, tickets, or chat. Record only PASS/FAIL and non-secret evidence.

## 1. Source And Scope Rules

- Deploy source must be GitHub repository `hiro4649/disco-funky-repair`.
- Staging must be created from an approved GitHub branch and commit, normally `main`.
- Do not deploy from `Rave_bk`, `Rave`, `var-www`, downloaded zip exports, local desktop folders, or copied server directories.
- Do not edit code, schema, package-lock files, or env files as part of staging preparation.
- Staging must be separate from production infrastructure, production DB, production wallets, production RPC, production contracts, and production secrets.
- This checklist prepares external resources only. Actual staging verification is performed by the STAGE-01 runbook.

## 2. Staging Server Requirements

Human must prepare a server with:

- Non-production hostname that clearly includes staging.
- Deploy user with least-privilege SSH access.
- Git access to `hiro4649/disco-funky-repair`.
- Node.js and npm version approved for the repository.
- PostgreSQL client tools if DB commands are run from the app server.
- PM2 or systemd selected as the single process manager.
- nginx or another approved reverse proxy.
- TLS certificate for the staging hostname.
- Firewall rules that expose only required HTTP/HTTPS and SSH access.
- Log retention configured so logs can be inspected without exposing secrets in tickets or PRs.
- No old `var-www`, `Rave_bk`, Sui/DISCO copy, or manual local source tree in the runtime path.

No-Go before staging creation if the planned service cwd, nginx root, deploy script, or PM2/systemd unit points outside the GitHub clone.

## 3. Staging DB Requirements

Human must prepare:

- A new empty staging PostgreSQL database.
- A staging-only DB user with least privileges needed by the app.
- A staging-only `DATABASE_URL` stored only in the approved secret manager.
- DB backups or snapshots appropriate for staging testing.
- Approval that destructive reset is allowed only before real staging data exists.

Required migration policy:

- Use `npm run migrate:deploy` for staging.
- Use `npm run prisma:generate` after migration deploy.
- Do not use `prisma db push` for staging.
- Do not run `prisma migrate reset` unless the staging DB is explicitly approved for destruction.
- If an old DB is discovered, stop and write a separate migration/backfill plan.

## 4. BSC Testnet External Resources

Human must prepare:

- BSC testnet RPC endpoint for backend/server-side chain reads and writes.
- BSC testnet WebSocket RPC endpoint if realtime chain monitoring is enabled.
- BSC testnet explorer API endpoint.
- BSC testnet explorer API key.
- Test BNB for deployer, prize hot wallet, and tier relayer wallets.
- External evidence store for tx hashes, receipts, screenshots, and PASS/FAIL notes.

Do not paste RPC URLs or explorer API keys into git, docs, PRs, tickets, or chat. If screenshots include secrets or URLs with query strings, redact them before storing.

## 5. Staging Secret Manager Items

Create these as staging-only secret-manager entries. Do not write their values into `.env` or docs.

Backend secrets and sensitive runtime config:

- `DATABASE_URL`
- `JWT_SECRET`
- Admin auth setting used by the backend, such as admin email/password and admin wallet address.
- BSC testnet RPC URL.
- BSC testnet WebSocket RPC URL if used.
- BSC testnet explorer API URL.
- `ETHERSCAN_API_KEY` or `BSCSCAN_API_KEY`
- `PRIZE_HOT_WALLET_PRIVATE_KEY`
- `TIER_RELAYER_PRIVATE_KEY`

Backend non-secret or address config, still managed carefully:

- Chain ID for the approved staging/testnet mode.
- Backend API URL.
- Frontend app URL.
- FUNKY token testnet contract address.
- NFT contract testnet address.
- FunkyTierUpdater testnet contract address.
- Prize token testnet contract addresses.
- `PRIZE_TRANSFER_TOKEN_ALLOWLIST`

Production validation note:

- BSC testnet staging may require an approved staging mode if production validation requires BSC mainnet chain ID.
- Do not claim production env readiness from BSC testnet settings.
- Production secret-manager validation must be performed separately before launch.

## 6. Staging JWT And Admin Auth

Human must prepare:

- A new staging-only JWT secret generated in the approved secret manager.
- Staging-only admin credentials.
- Staging-only admin wallet address if admin wallet checks are enabled.
- A clear rule for who can access the staging admin panel.

Do not reuse:

- Production JWT secret.
- Production admin password.
- Production admin wallet private key.
- Production admin auth cookie or token.

No-Go if a normal user account can access admin routes, or if admin auth depends on a body `adminKey` value instead of backend `AuthAdmin`.

## 7. Staging Wallet Preparation

Human must create separate BSC testnet wallets:

- Deployer wallet for testnet contract deployment.
- Prize hot wallet for `PRIZE_HOT_WALLET_PRIVATE_KEY`.
- Tier relayer wallet for `TIER_RELAYER_PRIVATE_KEY`.
- Temporary staging admin or test multisig owner.

Rules:

- Prize hot wallet must not be the deployer, token owner, NFT owner, tier updater owner, tier relayer, governance wallet, or multisig signer.
- Tier relayer wallet must not be the deployer, prize hot wallet, token owner, NFT owner, tier updater owner, governance wallet, or multisig signer.
- Each wallet receives only the minimum BSC testnet gas and test tokens needed for verification.
- No production wallet, production signer, or production private key may be used in staging.

## 8. Testnet Contract Prerequisites

Before staging app verification, humans must approve or prepare:

- FUNKY token testnet deploy plan.
- NFT contract testnet deploy plan.
- FunkyTierUpdater testnet deploy plan.
- Approved staging `MAX_SUPPLY` for NFT tests.
- Approved staging metadata base URI for NFT tests.
- Approved staging tier relayer address.
- Approved staging prize token contract addresses.
- Tx receipt evidence format and storage location.

After deploy, record only non-secret evidence:

- Chain ID.
- Contract name.
- Contract address.
- Tx hash.
- Block number.
- Deployer wallet address.
- Owner or admin wallet address.
- Commit SHA.

## 9. Multisig Or Temporary Admin Policy

Production must use multisig or timelock for owner/governance authority.

If staging multisig is not yet available, temporary staging admin use is allowed only when:

- The wallet is staging-only.
- The wallet is not reused as prize hot wallet or tier relayer.
- The wallet does not contain production funds.
- The exception is recorded in the external staging evidence store.
- Humans accept that this is staging-only and does not satisfy production governance requirements.

No-Go for production rehearsal if owner/admin roles have not been transferred to test multisig or explicitly approved temporary staging admin.

## 10. Prize Allowlist Preparation

Human must prepare `PRIZE_TRANSFER_TOKEN_ALLOWLIST` with:

- Only BSC testnet ERC-20 token addresses intended for prize payout tests.
- No production token address.
- No zero address.
- No placeholder, dummy, example, or localhost-derived value.
- Entries matching the prize token contracts used by staging `Prize` records.

Expected behavior for staging:

- Allowlisted token can proceed through prize payout flow.
- Non-allowlisted token does not broadcast transfer and requires safe failure or manual review.
- Missing or malformed allowlist is No-Go for prize send verification.

## 11. Frontend Public Env

Values allowed in `NEXT_PUBLIC_*` because they are public:

- Public staging backend API origin.
- Public staging frontend app origin.
- Public app display name.
- Public BSC testnet RPC URL if the staging mode intentionally uses testnet.
- Optional public BSC testnet RPC override.
- Public testnet FUNKY token contract address.
- Public testnet NFT contract address.
- Public staging Socket.IO origin if used.
- Public explorer base URL without API key.

Values never allowed in `NEXT_PUBLIC_*`:

- Private key.
- Seed phrase.
- JWT secret.
- Admin key.
- Owner key.
- Relayer key.
- Hot wallet key.
- API key.
- DB connection string.
- RPC URL containing embedded credentials or query-string secret.
- Cookie, bearer token, or session secret.

No-Go if any env name matches `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*ADMIN_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*HOT_WALLET`, or `NEXT_PUBLIC_*JWT`.

## 12. Secrets Never Shared Between Staging And Production

Never share these between staging and production:

- `DATABASE_URL`
- `JWT_SECRET`
- Admin password or admin token.
- Admin wallet private key.
- Prize hot wallet private key.
- Tier relayer private key.
- Deployer private key.
- Multisig signer key.
- Explorer API key.
- RPC provider credentials.
- NFT storage or upload provider API key.
- Any webhook signing secret.

Staging may share public code and public contract ABIs, but not secrets, private keys, production DB contents, production logs, or production user data.

## 13. GitHub Clone Preconditions

Before the staging server is created, humans should decide:

- Staging path, for example `/srv/disco-funky/app`.
- Deploy user name.
- Branch, normally `main`.
- Release candidate commit SHA.
- Whether GitHub deploy key or GitHub App access is used.

First clone must be from GitHub:

```bash
mkdir -p /srv/disco-funky
cd /srv/disco-funky
git clone https://github.com/hiro4649/disco-funky-repair.git app
cd app
git fetch origin --prune
git switch main
git pull --ff-only origin main
```

Do not copy files from desktop `Rave`, `Rave_bk`, `var-www`, old server exports, or zip archives.

## 14. Staging Creation Pre-Go Checklist

Humans must confirm all items before asking Codex to help run staging verification:

- [ ] Staging server exists and is separate from production.
- [ ] Staging hostname and TLS are ready.
- [ ] Staging deploy user is ready.
- [ ] GitHub repository access is ready.
- [ ] New empty staging DB exists.
- [ ] Staging secret manager exists.
- [ ] Staging JWT secret is generated and stored only in secret manager.
- [ ] Staging admin auth settings are created.
- [ ] BSC testnet RPC endpoint is available.
- [ ] BSC testnet explorer API key is available.
- [ ] Deployer, prize hot wallet, and tier relayer testnet wallets are created separately.
- [ ] Test BNB is available for all required staging wallets.
- [ ] FUNKY token testnet deploy is planned or completed.
- [ ] NFT contract testnet deploy is planned or completed.
- [ ] FunkyTierUpdater testnet deploy is planned or completed.
- [ ] `PRIZE_TRANSFER_TOKEN_ALLOWLIST` staging values are approved.
- [ ] Temporary staging admin or test multisig policy is approved.
- [ ] External staging evidence store is ready.
- [ ] No production secret, DB, wallet, RPC, contract, or admin credential will be used.

## 15. Staging Creation No-Go

Do not create or start staging if any item is true:

- The deploy source is not GitHub `hiro4649/disco-funky-repair`.
- The planned deploy path references `Rave_bk`, `var-www`, local desktop folders, or old Sui/DISCO source.
- Staging DB is copied from production without explicit migration/privacy approval.
- Staging secret manager is missing.
- Any required value is planned to be stored in `.env` committed to git.
- Production private key, production API key, production DB URL, or production JWT secret would be reused.
- `NEXT_PUBLIC_*` contains a secret, private key, admin key, relayer key, hot wallet key, JWT, or API key.
- Prize hot wallet and tier relayer are the same wallet.
- A backend hot wallet would hold owner, governance, multisig signer, fee manager, DEX manager, pair manager, or NFT owner authority.
- BSC testnet contract addresses are unknown but staging verification is expected to test chain flows.
- Humans have not decided how staging tx receipts and evidence will be stored without secrets.

## 16. First Commands After Staging Creation

Run after the server exists and the GitHub repo is cloned. These commands must not print secrets.

Source identity:

```bash
cd /srv/disco-funky/app
git remote -v
git branch --show-current
git rev-parse HEAD
git log --oneline -5
git status --short
```

Backend local verification:

```bash
cd /srv/disco-funky/app/apps/backend
npm ci
npm run prisma:validate
npm run migrate:status
npm run migrate:deploy
npm run prisma:generate
npm run build
npm test -- --runInBand
```

Frontend local verification:

```bash
cd /srv/disco-funky/app/apps/frontend
npm ci
node env.validation.test.mjs
npm run build
```

Contracts local verification:

```bash
cd /srv/disco-funky/app/contracts
npm ci
npx hardhat compile
npx hardhat test
npm run compile:nft
npm run test:nft
```

Process and proxy checks:

```bash
pm2 list
sudo nginx -t
```

Record PASS/FAIL only. Do not paste secret-bearing logs or full env output.

## 17. Human Prepares

Humans must prepare:

- Server, DNS, TLS, firewall, SSH access, and deploy user.
- Staging DB and DB user.
- Secret manager and all secret values.
- Test wallets and test BNB.
- BSC testnet RPC and explorer API access.
- Testnet contract deployment approvals and parameters.
- Temporary staging admin or test multisig policy.
- Staging admin account ownership.
- Prize test token inventory and allowlist decisions.
- External evidence store.
- Final approval to run staging verification.

## 18. Codex May Handle

Codex may help with:

- Reviewing non-secret config names and checklist completeness.
- Writing or updating docs and runbooks.
- Preparing non-secret command templates.
- Reviewing redacted PASS/FAIL outputs.
- Interpreting build/test/migration errors after humans redact secrets.
- Drafting staging smoke-test steps.
- Checking that GitHub branch, commit, and working tree are clean.

## 19. Codex Must Not Handle

Codex must not:

- Generate, receive, store, display, or commit secret values.
- Create or edit `.env` files.
- Access secret manager raw values.
- Choose or hold private keys.
- Sign blockchain transactions.
- Fund wallets.
- Act as multisig signer.
- Handle production DB dumps or production logs.
- Deploy production.
- Copy source from `Rave_bk`, `var-www`, local desktop folders, old server exports, or zip archives.
- Run destructive DB commands unless a human explicitly approves in a separate staging operation.
- Change code, schema, dependencies, package-lock files, or business logic during this STAGE-02 task.

## 20. Handoff To STAGE-01

After every pre-Go item is complete, proceed to `docs/launch/STAGING_TESTNET_VERIFICATION_RUNBOOK.md`.

Production launch remains No-Go until:

- STAGE-01 staging checks pass.
- BSC testnet contract and tx receipt checks pass.
- Production secret-manager values are reviewed without exposing values.
- Production deploy source is confirmed as the GitHub release commit.
- Human launch owner signs off that no No-Go condition remains.
