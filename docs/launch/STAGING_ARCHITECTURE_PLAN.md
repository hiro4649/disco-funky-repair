# Staging Architecture Plan

Status: STAGE-03 pre-staging architecture plan.

This document defines the minimum staging architecture for DISCO.fan / FUNKY.fan before any server creation, DB creation, deploy, or secret creation. It does not authorize staging creation by itself and does not authorize production launch.

Do not commit, paste, print, or store real `.env` files, private keys, seed phrases, API keys, JWT secrets, DB URLs, RPC URLs, production logs, or secret-manager values in this repository, PRs, tickets, or chat.

## 1. Staging Purpose

Staging exists to verify that the latest GitHub `main` release candidate can run as a BSC-version service before production.

Staging must prove:

- Runtime source comes from GitHub `hiro4649/disco-funky-repair`.
- Backend, frontend, Prisma migration, and contracts can be built and verified from the same commit.
- Wallet signature login and API authorization work against non-production users.
- Prize, ticket, illustration, NFT, and tier flows work only against staging DB and BSC testnet contracts.
- Governance, fee, DEX, and pair writes remain disabled in backend/frontend and are handled only by runbook/manual governance paths.
- Logs and screenshots do not expose tokens, API keys, DB URLs, private keys, or API-key-bearing URLs.

Staging is not production readiness by itself. Production still requires production secret-manager review, production deploy source confirmation, production multisig/timelock readiness, and human launch sign-off.

## 2. Minimum Architecture

Minimum staging components:

- One staging app server for nginx, backend, frontend, and one selected process manager.
- One isolated staging PostgreSQL database.
- One approved staging secret manager or secure runtime-secret injection system outside the repository.
- GitHub repository `hiro4649/disco-funky-repair` as the only source.
- BSC testnet RPC and explorer API access.
- BSC testnet FUNKY token, NFT contract, and FunkyTierUpdater contract.
- Separate BSC testnet wallets for deployer, prize hot wallet, tier relayer, and temporary staging admin or test multisig.
- External staging evidence store for tx receipts, PASS/FAIL records, and redacted screenshots.

Preferred separation:

- DB should be managed or isolated from the app server where practical.
- Secrets should be injected by the process manager or platform, not committed into the repo.
- Contract deployment should be executed from an approved staging deploy environment, not from a production signer.

Sakura Cloud single-server staging variant:

- For first staging, a single new Sakura Cloud server may run backend, frontend, PostgreSQL, nginx, PM2, logs, and staging runtime secret injection.
- This is acceptable for staging because it uses BSC testnet contracts, staging-only wallets, staging-only DB, and non-production hostnames.
- Follow `docs/launch/STAGING_SAKURA_SINGLE_SERVER_PLAN.md` for one-server risks, required mitigations, and future split triggers.
- Production MVP may temporarily use a single-server layout only if backup, snapshot, monitoring, log rotation, secret separation, hot wallet minimization, and multisig/timelock governance requirements are satisfied.
- Production must not continue as a single server when DB load, backup/restore risk, worker/cron load, monitoring requirements, traffic, or audit requirements exceed the documented thresholds.

## 3. Never Shared With Production

Staging and production must not share:

- DB or DB user.
- `DATABASE_URL`.
- JWT secret.
- Admin password, admin token, or admin auth cookie.
- Wallet private key.
- Prize hot wallet.
- Tier relayer.
- Contract deployer.
- Multisig signer key.
- RPC credentials.
- Explorer API key.
- NFT upload provider API key.
- Production user data.
- Production logs.
- Production contract owner/admin authority.
- Production token or prize inventory.

Public source code and public contract ABI may be shared. Secrets, credentials, funds, production data, and owner authority must not be shared.

## 4. Staging Server Role

The staging server should run only:

- nginx reverse proxy.
- Backend Node.js process from `apps/backend`.
- Frontend Next.js process from `apps/frontend`.
- PM2 or systemd, but not both for the same app.
- Minimal OS services required for secure operation.

The staging server must not:

- Host production traffic.
- Store committed `.env` files in the repository.
- Contain copied source from `Rave_bk`, `Rave`, `var-www`, local desktop folders, downloaded zips, or old Sui/DISCO exports.
- Hold production private keys or production DB dumps.
- Execute production contract deployment.

## 5. Backend Placement

Backend placement policy:

- Backend source path must be the GitHub clone, normally `/srv/disco-funky/app/apps/backend`.
- Backend build output must be generated from the checked-out commit.
- Backend process must run the built application from the staging checkout.
- Backend env must be injected from the staging secret manager or approved runtime environment outside git.
- Backend must connect only to the staging DB.
- Backend must use only BSC testnet contracts and testnet wallets during staging verification.

No-Go if backend cwd, script, Docker context, PM2 config, or systemd unit points to `var-www`, `Rave_bk`, local downloads, or any unreviewed source copy.

## 6. Frontend Placement

Frontend placement policy:

- Frontend source path must be the GitHub clone, normally `/srv/disco-funky/app/apps/frontend`.
- Frontend build must use only approved public staging values.
- Frontend must call the staging backend URL.
- Frontend must use BSC testnet public RPC values only when the staging mode intentionally tests BSC testnet.
- Frontend must not contain private-key signers, browser admin signing, or governance write paths.

No-Go if frontend hosting, build settings, or bundle contain `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*ADMIN_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*HOT_WALLET`, or `NEXT_PUBLIC_*JWT`.

## 7. DB Placement

DB placement policy:

- Use a new empty PostgreSQL database for staging.
- Use a staging-only DB user.
- Store the staging DB connection string only in secret manager or approved runtime-secret injection.
- Keep production DB and production user data out of staging.
- Do not run staging against an old copied database without a separate reviewed migration/backfill plan.

No-Go if staging DB is production DB, a production clone without explicit privacy approval, or an unknown legacy DB.

## 8. Prisma Migration Policy

Use the DB migration baseline already documented in `docs/launch/DB_MIGRATION_RUNBOOK.md`.

Order:

1. Confirm the staging DB is empty and intended for staging.
2. Run schema validation from `apps/backend`.
3. Check migration status.
4. Run `npm run migrate:deploy`.
5. Run `npm run prisma:generate`.
6. Check migration status again.
7. Run backend build and tests.

Rules:

- Use `migrate:deploy` for staging.
- Do not use `prisma db push` for staging.
- Do not use `migrate:dev` except disposable local development DBs.
- Do not run destructive reset after real staging data exists.
- If seed data is needed, create a separate reviewed seed plan.

## 9. Secret Manager Policy

All staging secrets must be stored outside git.

Required secret categories:

- DB connection.
- JWT secret.
- Admin auth settings.
- BSC testnet RPC credentials.
- BSC testnet explorer API key.
- Prize hot wallet private key.
- Tier relayer private key.
- Upload provider keys if staging upload tests require them.

Required non-secret or address configuration still managed carefully:

- Backend API URL.
- Frontend app URL.
- Chain ID for the approved staging/testnet mode.
- FUNKY token testnet address.
- NFT contract testnet address.
- FunkyTierUpdater testnet address.
- Prize token testnet addresses.
- Prize transfer token allowlist.

Rules:

- No real value is written to `.env` in the repository.
- No secret is pasted into logs, PRs, tickets, docs, or chat.
- Secret names may be documented; secret values must not be documented.
- Production env validation must be checked separately before launch and must not be inferred from BSC testnet staging values.

## 10. PM2 Or systemd Startup Policy

Select exactly one process manager for staging.

PM2 is acceptable if:

- Process names visibly include `staging`.
- Backend cwd is the GitHub checkout under `apps/backend`.
- Frontend cwd is the GitHub checkout under `apps/frontend`.
- Secrets are injected by approved runtime mechanism.
- `pm2 show` confirms the expected cwd and script without exposing secrets.

systemd is acceptable if:

- Service names visibly include `staging`.
- WorkingDirectory points to the GitHub checkout.
- Environment injection does not print or store secrets in git.
- Journal review is done with redaction and PASS/FAIL reporting only.

No-Go if both PM2 and systemd control the same process or if either points to old source paths.

## 11. nginx Reverse Proxy Policy

nginx should:

- Terminate TLS for staging hostname.
- Proxy frontend traffic to the staging frontend process.
- Proxy backend API traffic to the staging backend process.
- Use staging server names and staging ports.
- Avoid printing secret-bearing headers or request URLs in shared logs.

nginx must not:

- Serve production hostname.
- Route staging traffic to production backend or production frontend.
- Use `root` or `alias` pointing to `var-www`, `Rave_bk`, local desktop folders, old zips, or old Sui/DISCO source.
- Expose internal admin ports directly to the public internet.

## 12. GitHub Source Rule

Staging source must be cloned from GitHub:

```bash
mkdir -p /srv/disco-funky
cd /srv/disco-funky
git clone https://github.com/hiro4649/disco-funky-repair.git app
cd app
git fetch origin --prune
git switch main
git pull --ff-only origin main
```

Record only non-secret source evidence:

- Remote URL.
- Branch name.
- Commit SHA.
- Short git log.
- Clean `git status --short`.

Do not deploy from `Rave_bk`, `Rave`, `var-www`, downloaded zips, manually copied folders, or old server exports.

## 13. BSC Testnet RPC Policy

Staging chain-interaction tests must use BSC testnet RPC values.

Rules:

- RPC values are stored only in staging secret manager or approved public frontend env when the value is intentionally public.
- Backend RPC may contain provider credentials and must be treated as secret.
- Frontend RPC must be public and must not contain embedded credentials or query-string secrets.
- Staging must not use production BSC mainnet RPC for testnet contract tests.
- Production validation must later reject BSC testnet values in production mode.

No-Go if RPC points to localhost, dummy, example, Ethereum testnets, Ethereum mainnet explorer fallback, or a production value not approved for staging.

## 14. BSC Testnet Explorer API Key Policy

Explorer access is required for holding/tier and verification flows.

Rules:

- Explorer API key is stored only in staging secret manager.
- Runtime key resolution must match the environment runbook: `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, and approved rotation key names.
- Request URLs containing query strings or API keys must not be logged.
- Evidence should record tx hashes and receipt metadata, not API keys or API-key-bearing URLs.

No-Go if logs or screenshots expose an API-key query parameter, raw explorer URLs with query strings, or provider credentials.

## 15. Staging Hot Wallet Policy

Prize hot wallet policy:

- Use a fresh BSC testnet wallet.
- Store only `PRIZE_HOT_WALLET_PRIVATE_KEY` in staging secret manager.
- Fund with limited test gas and test prize tokens.
- Allow transfers only for tokens in `PRIZE_TRANSFER_TOKEN_ALLOWLIST`.
- Do not reuse as deployer, owner, admin, tier relayer, governance wallet, or multisig signer.
- Do not use `ADMIN_PRIVATE_KEY` fallback.

No-Go if prize hot wallet has owner/governance authority or shares a key with the tier relayer.

## 16. Staging Tier Relayer Policy

Tier relayer policy:

- Use a fresh BSC testnet wallet separate from prize hot wallet.
- Store only `TIER_RELAYER_PRIVATE_KEY` in staging secret manager.
- Grant only the minimum relayer permission on staging FunkyTierUpdater.
- Configure `TIER_UPDATER_CONTRACT_ADDRESS` to the staging FunkyTierUpdater address.
- Do not reuse as deployer, owner, admin, prize hot wallet, governance wallet, or multisig signer.

No-Go if tier sync can send with `ADMIN_PRIVATE_KEY`, if relayer key is missing, or if the updater address is missing or points to production.

## 17. Testnet Contract Deploy Order

Recommended order:

1. Confirm local contract checks pass from the approved commit.
2. Prepare staging deployer wallet and test BNB.
3. Deploy FUNKY token to BSC testnet.
4. Verify FUNKY token name, symbol, decimals, fee tiers, and tier downgrade protections.
5. Deploy NFT contract to BSC testnet with approved staging max supply and metadata plan.
6. Verify NFT `mintEnabled` is false, max supply is enforced, and arbitrary metadata mint is impossible.
7. Deploy or configure FunkyTierUpdater on BSC testnet.
8. Grant relayer permission only to the staging tier relayer wallet.
9. Transfer owner/admin authority to test multisig or explicitly approved temporary staging admin.
10. Record non-secret tx receipt evidence outside git.
11. Put contract addresses into staging runtime config.
12. Run STAGE-01 BSC testnet verification.

No-Go if any contract owner/admin role is accidentally assigned to prize hot wallet, tier relayer, public backend hot wallet, or production wallet.

## 18. Frontend `NEXT_PUBLIC` Env Policy

Allowed public staging values:

- Public staging backend URL.
- Public staging frontend URL.
- Public app name.
- Public BSC testnet RPC if intentionally public.
- Public optional BSC testnet RPC override.
- Public testnet token address.
- Public testnet NFT address.
- Public staging Socket.IO URL.
- Public explorer base URL without API key.

Forbidden public values:

- Private key.
- Seed phrase.
- JWT secret.
- Admin key.
- Owner key.
- Relayer key.
- Hot wallet key.
- API key.
- DB connection string.
- RPC URL with embedded credentials or query-string secret.
- Cookie or bearer token.

If the frontend is built without required public values, it must fail safely or leave dependent features disabled rather than falling back to localhost or unsafe defaults.

## 19. Staging Log Policy

Staging logs may be inspected only for PASS/FAIL and safe metadata.

Logs must not include:

- Authorization header.
- JWT.
- Cookie value.
- Private key.
- API key.
- DB URL.
- RPC URL with query string.
- Explorer URL with API key.
- Seed phrase.
- Secret-manager values.

If a possible secret appears in logs, do not paste the line into a PR or chat. Inspect privately, redact, and open a sanitization task.

## 20. Staging Work Order

Recommended sequence:

1. Human approves this architecture plan.
2. Human prepares staging server, DNS, TLS, DB, secret manager, and wallets.
3. Human confirms STAGE-02 pre-Go checklist is complete.
4. Clone GitHub repo to staging server.
5. Record branch, commit, and clean working tree.
6. Install dependencies with `npm ci` in backend, frontend, and contracts.
7. Prepare empty staging DB and run Prisma migration deploy.
8. Build and test backend.
9. Build frontend and run frontend env validation.
10. Compile/test contracts and NFT suite.
11. Deploy FUNKY, NFT, and FunkyTierUpdater to BSC testnet.
12. Configure staging secret manager with testnet addresses and separated keys.
13. Start backend and frontend with one process manager.
14. Configure nginx reverse proxy.
15. Run STAGE-01 smoke tests and BSC testnet verification.
16. Store non-secret evidence outside git.
17. Review No-Go list before any production planning.

## 21. Human-Only Work

Humans must perform or approve:

- Server creation.
- DB creation.
- Secret creation and secret manager entry.
- Wallet creation.
- Funding testnet wallets.
- Choosing admin operators.
- Contract deployment signing.
- Multisig or temporary staging admin approval.
- Production/staging separation decisions.
- Any destructive DB operation.
- Production launch sign-off.

## 22. Codex-Allowed Work

Codex may help with:

- Docs and runbook edits.
- Non-secret architecture review.
- Non-secret command templates.
- Reviewing redacted PASS/FAIL output.
- Explaining migration/build/test errors after secrets are removed.
- Checking git branch, commit, and docs-only diffs.
- Drafting smoke-test checklists.

## 23. Codex-Forbidden Work

Codex must not:

- Create, receive, store, display, or commit secrets.
- Create `.env` files.
- Access raw secret-manager values.
- Create wallets or choose private keys.
- Sign blockchain transactions.
- Fund wallets.
- Act as multisig signer.
- Deploy production.
- Handle production DB dumps or production logs.
- Copy source from `Rave_bk`, `var-www`, local folders, old zips, or old server exports.
- Modify code, schema, package-lock files, dependencies, or business logic during STAGE-03.

## 24. Staging Creation Pre-No-Go

Do not create or configure staging if:

- Source is not GitHub `hiro4649/disco-funky-repair`.
- Required docs are not reviewed.
- Staging server plan references production infrastructure.
- Staging DB is not new and isolated.
- Secret manager is missing.
- Any production secret would be reused.
- Any `NEXT_PUBLIC_*` secret is planned.
- BSC testnet RPC or explorer API access is missing.
- Prize hot wallet and tier relayer are not separate.
- Contract deploy order and owner/admin policy are not approved.
- Evidence storage for tx receipts is not defined.

## 25. Staging Creation Post-No-Go

After staging is created, stop verification and do not continue if:

- Git branch is not approved or working tree is dirty.
- PM2/systemd cwd points outside the GitHub checkout.
- nginx points to production or old source.
- Backend connects to production DB or production contracts.
- Frontend calls production backend unintentionally.
- Prisma migration deploy fails.
- Backend or frontend build fails.
- Contract compile/test fails.
- Secrets appear in logs.
- Disabled MVP routes become reachable.
- Wallet address alone can login.
- Normal user can mutate admin state or another user's asset state.
- Prize payout can send non-allowlisted token or double-send.
- Governance writes can be sent from backend or browser frontend.

## 26. Conditions Blocking Production Progress

Do not move from staging toward production if:

- STAGE-01 verification is incomplete.
- BSC testnet tx receipts are missing.
- Production secret-manager values have not been reviewed without exposing values.
- Production deploy source is not confirmed as GitHub release commit.
- Production DB migration dry plan is not approved.
- Production multisig/timelock owner plan is incomplete.
- Production hot wallet and tier relayer are not separated.
- Any production env would use localhost, dummy, example, BSC testnet, wrong chain, or unsafe fallback.
- Frontend hosting contains `NEXT_PUBLIC_*` secrets.
- Logs expose JWT, Authorization header, cookie, private key, API key, DB URL, RPC URL with query string, or explorer API-key URL.
- Human launch owner has not signed off that all No-Go conditions are closed.
