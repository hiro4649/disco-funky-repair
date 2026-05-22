# Staging External Resources Checklist

Status: STAGE-05 external resource decision checklist.

This checklist is for humans to decide and prepare the external resources required before creating a DISCO.fan / FUNKY.fan staging environment. It does not create servers, databases, wallets, secrets, deployments, or production approval.

Do not commit, paste, print, or store real `.env` files, private keys, seed phrases, API keys, JWT secrets, DB URLs, RPC URLs, production logs, or secret-manager values in this repository, PRs, tickets, chat, or shared logs.

## 1. Required Decisions

Humans must decide these before server setup begins:

- Where to create the staging server.
- Which staging domain to use.
- Where the staging DB lives.
- Which secret manager or runtime-secret injection method is used.
- Which BSC testnet RPC provider is used.
- Which BSC testnet explorer API key is used.
- Which staging wallets are created for deployer, prize hot wallet, tier relayer, and temporary admin or test multisig.
- Whether GitHub Actions participates in install/build/deploy, or the first staging setup is manual.

No decision may use production secrets, production wallets, production DB, production RPC credentials, production contract addresses, or old source directories.

## 2. Staging Server Candidates

| Candidate | Use When | Pros | Risks / No-Go |
| --- | --- | --- | --- |
| New Sakura Cloud server | First staging and likely production provider are Sakura Cloud. | Matches planned hosting provider, simple single-server setup, easy PM2/nginx/PostgreSQL inspection. | Single-server risk. No-Go if production secrets, production DB, or old source paths are reused. |
| New AWS EC2 instance | Team already uses AWS or wants future migration toward managed services. | Easy path to AWS Secrets Manager, RDS, security groups, IAM, snapshots. | More setup complexity. No-Go if production IAM roles or production VPC secrets are reused. |
| New VPS | Fastest low-cost staging setup. | Simple, cheap, easy to inspect PM2/nginx manually. | Secrets and backups need stronger manual discipline. No-Go if `.env` files are committed or copied around. |
| Existing non-production server | Only if the server is already isolated and trusted. | Fastest if already provisioned. | No-Go if it hosts production, old `var-www`, `Rave_bk`, old Sui/DISCO source, production logs, or production secrets. |
| Existing production server | Avoid for staging. | None for safe staging. | No-Go unless humans explicitly accept isolation risk and remove all production sharing. Not recommended. |

Recommended default for first staging:

- Use a new isolated Sakura Cloud server if Sakura Cloud is the planned production provider.
- If Sakura Cloud is not ready, use a new isolated VPS or new AWS EC2 instance.
- Do not use the existing production server.
- Do not deploy from `Rave_bk`, `Rave`, `var-www`, local desktop folders, downloaded zips, or copied server directories.
- If using Sakura Cloud single-server staging, follow `docs/launch/STAGING_SAKURA_SINGLE_SERVER_PLAN.md`.

## 3. Recommended OS

Recommended:

- Ubuntu LTS.
- Non-root deploy user.
- SSH key login.
- Firewall allowing only required SSH, HTTP, and HTTPS.
- System time sync enabled.
- nginx.
- PM2, unless humans choose systemd instead.
- Git, curl, Node.js, npm, and basic build tools.

No-Go:

- Unsupported OS.
- Unknown root-only deployment model.
- Server where humans cannot verify PM2/nginx cwd and process commands.
- Server that contains production secrets or production DB dumps.

## 4. CPU / RAM / Storage Estimate

Minimum for functional staging:

- CPU: 2 vCPU.
- RAM: 4 GB.
- Storage: 60 GB SSD.

Preferred for smoother build/test and Next.js production build:

- CPU: 2 to 4 vCPU.
- RAM: 8 GB.
- Storage: 80 to 100 GB SSD.

Storage should have room for:

- Git checkout.
- `node_modules` for backend, frontend, and contracts.
- backend build output.
- frontend build output.
- PM2 logs.
- nginx logs.
- upload test files if upload tests are enabled.

No-Go:

- Disk pressure during `npm ci` or frontend build.
- Swap-only survival under normal build/test.
- Logs growing without rotation.

## 5. Staging Domain Proposal

Possible staging domain patterns:

- `staging.disco.fan`
- `api-staging.disco.fan`
- `staging-api.disco.fan`
- `staging.funky.fan`
- `api-staging.funky.fan`

Recommended pattern:

- One frontend hostname, for example `staging.disco.fan`.
- One backend/API hostname, for example `api-staging.disco.fan`.

Rules:

- Hostnames must visibly include staging.
- Hostnames must not be production hostnames.
- TLS must be configured before browser wallet login smoke tests.
- Cookie/domain behavior must be verified against staging hostnames.

No-Go:

- Production hostname points to staging.
- Staging hostname points to production.
- Frontend public API URL points to production backend.

## 6. DNS Setup Preconditions

Humans must prepare:

- DNS zone access.
- A or CNAME records for staging frontend and staging backend.
- TLS certificate plan for both hostnames.
- Confirmation that DNS does not override production records.

Record only:

- Chosen hostname labels.
- PASS/FAIL for DNS resolution.
- PASS/FAIL for TLS.

Do not record DNS provider credentials or API tokens.

## 7. DB Candidates

| Candidate | Use When | Pros | Risks / No-Go |
| --- | --- | --- | --- |
| Same Sakura Cloud server PostgreSQL | First Sakura Cloud staging only. | Cheapest and simplest single-server staging. | Single point of failure. Requires backup, snapshot, disk monitoring, log rotation, and future DB split triggers. |
| Same staging server PostgreSQL | Fast first staging and low cost. | Simple network and setup. | Requires manual backup, disk, and access discipline. No-Go if production data is copied. |
| Sakura Cloud database appliance | Production-like Sakura Cloud DB separation is needed. | DB isolation, clearer backup/restore path, reduced app-server blast radius. | More cost and setup. Required when production single-server conditions are no longer acceptable. |
| AWS RDS / managed PostgreSQL | Team wants cleaner separation and backups. | Snapshots, managed backups, clearer separation from app server. | More setup and cost. No-Go if production instance or production user is reused. |
| External managed PostgreSQL | Existing vendor is approved for staging. | Quick if already approved. | Need secret manager integration and access controls. No-Go if shared with production DB. |

Recommended default:

- For Sakura Cloud first staging: same-server PostgreSQL is acceptable if isolated, backed up, snapshotted, monitored, and covered by the single-server split triggers.
- For cheapest first staging outside Sakura Cloud: same server PostgreSQL is acceptable if isolated and backed up.
- For production-like staging: managed PostgreSQL or RDS is preferred.
- For production MVP on Sakura Cloud: same-server PostgreSQL is temporary only; move to Sakura Cloud database appliance or another approved DB when documented split conditions are met.

Required DB properties:

- New empty staging DB.
- Staging-only DB user.
- Staging-only `DATABASE_URL` stored only in secret manager.
- No production data.
- No old legacy DB unless separately reviewed.

## 8. DB Backup Policy

Before real staging test data:

- Recreate DB if setup fails and humans approve destruction.
- Backups are optional but useful.

After real staging test data:

- Enable scheduled backup or snapshots.
- Do not run destructive reset without approval.
- Use forward-only remediation for migration mistakes after meaningful test data exists.

No-Go:

- No one knows whether data can be destroyed.
- Backup contains production user data.
- Backup files are stored in the git checkout.

## 9. Secret Management Options

| Option | Use When | Notes |
| --- | --- | --- |
| Sakura Cloud server-side runtime injection | First Sakura Cloud single-server staging. | Acceptable if humans control file permissions, shell history, PM2 startup, and log redaction. Do not commit `.env`. |
| AWS Secrets Manager | Best if staging is on AWS. | Strong default for EC2/RDS setups. Use IAM with least privilege. |
| VPS provider secret feature | Use if provider supports runtime secrets. | Confirm values are not printed into logs. |
| Server process manager env injection | Acceptable for first VPS staging if tightly controlled. | Do not create committed `.env`; avoid printing full env. |
| GitHub Secrets | Use for CI jobs only. | Not a runtime secret manager by itself unless GitHub Actions deploy is the approved path. |
| Manual shell export | Avoid except short-lived human troubleshooting. | No-Go if pasted into docs, shell history, PR, or chat. |

Recommended default:

- Sakura Cloud first staging: Sakura Cloud server-side runtime injection is acceptable only with strict no-commit, no-print, and log-scan rules.
- AWS: AWS Secrets Manager.
- VPS first staging: server-side secret injection managed by humans, with no committed `.env`.
- GitHub Actions: use only after a deploy workflow is explicitly approved.

## 10. Required Staging Secret Categories

Humans must prepare staging-only values for:

- DB connection.
- JWT secret.
- Admin auth setting.
- Backend public URL.
- Frontend public URL.
- BSC testnet RPC.
- BSC testnet explorer API URL.
- BSC testnet explorer API key.
- Prize hot wallet private key.
- Tier relayer private key.
- FUNKY token testnet address after deploy.
- NFT contract testnet address after deploy.
- FunkyTierUpdater testnet address after deploy.
- Prize test token addresses after deploy.
- Prize transfer token allowlist.

Do not write values into this checklist. Only names and readiness state are allowed.

## 11. BSC Testnet RPC Candidates

Candidate categories:

- Paid provider testnet endpoint from the team's existing RPC provider.
- Dedicated BSC testnet endpoint from a reputable RPC provider.
- Public BSC testnet RPC only as a temporary fallback for manual checks.

Recommended default:

- Use a dedicated provider endpoint for backend.
- Use a public-safe endpoint for frontend only if it contains no embedded credential and is approved for browser exposure.
- Keep backend RPC credentials out of `NEXT_PUBLIC_*`.

No-Go:

- RPC is Ethereum mainnet, Sepolia, Goerli, dummy, example, localhost, or production mainnet when testing BSC testnet contracts.
- Frontend public RPC contains query-string secrets or embedded credentials.
- RPC provider value is pasted into git, PRs, tickets, or chat.

## 12. BSC Testnet Explorer API Key

Humans must prepare:

- BSC testnet explorer API access.
- API key stored only in secret manager.
- Approved env name according to runtime validation, such as `ETHERSCAN_API_KEY` or `BSCSCAN_API_KEY`.

Rules:

- Runtime key resolution must match `ENVIRONMENT_RUNBOOK.md`.
- Explorer request URLs with query strings or API keys must not be logged.
- Evidence may record tx hashes and receipt metadata, not API-key-bearing URLs.

No-Go:

- No explorer API key for holding/tier verification.
- API key is stored in git or frontend public env.
- Logs expose explorer URL with API key.

## 13. Staging Hot Wallet Preparation

Humans must create a staging-only prize hot wallet for `PRIZE_HOT_WALLET_PRIVATE_KEY`.

Requirements:

- Fresh BSC testnet wallet.
- Stored only in staging secret manager.
- Holds limited test BNB and test prize tokens only.
- Not deployer.
- Not token owner.
- Not NFT owner.
- Not FunkyTierUpdater owner.
- Not tier relayer.
- Not governance wallet.
- Not multisig signer.
- Not production wallet.

No-Go:

- Prize hot wallet and tier relayer are the same wallet.
- Prize hot wallet has owner/governance authority.
- Prize hot wallet uses production funds or production private key.

## 14. Staging Tier Relayer Wallet Preparation

Humans must create a staging-only tier relayer wallet for `TIER_RELAYER_PRIVATE_KEY`.

Requirements:

- Fresh BSC testnet wallet.
- Stored only in staging secret manager.
- Holds limited test BNB for tier update transactions.
- Granted minimum relayer permission on staging FunkyTierUpdater only.
- Not deployer.
- Not prize hot wallet.
- Not token owner.
- Not NFT owner.
- Not FunkyTierUpdater owner.
- Not governance wallet.
- Not multisig signer.
- Not production wallet.

No-Go:

- Tier relayer can use `ADMIN_PRIVATE_KEY`.
- Tier relayer is missing but tier verification is planned.
- Tier relayer has owner/governance authority.

## 15. Testnet BNB Preparation

Humans must prepare limited BSC testnet BNB for:

- Contract deployer wallet.
- Prize hot wallet.
- Tier relayer wallet.
- Temporary staging admin or test multisig if it sends transactions.

Rules:

- Use only testnet funds.
- Keep balances minimal.
- Record PASS/FAIL that wallets are funded, not private keys.

No-Go:

- Production wallet is funded or used for staging.
- Wallet cannot pay gas for required testnet tx.
- Testnet BNB source requires exposing seed phrases or private keys.

## 16. Testnet Contract Deploy Prerequisites

Humans must prepare deployment approval for:

- FUNKY token on BSC testnet.
- NFT contract on BSC testnet.
- FunkyTierUpdater on BSC testnet.

Required decisions:

- Deployer wallet.
- Temporary staging admin or test multisig.
- NFT staging max supply.
- NFT staging metadata base URI.
- Tier relayer address.
- Prize test token addresses.
- Receipt evidence storage location.

No-Go:

- Contract owner/admin role would be assigned to prize hot wallet or tier relayer.
- Contract addresses are unknown but backend/frontend verification is expected.
- Deploy secret or RPC secret would be written to git.

## 17. PRIZE_TRANSFER_TOKEN_ALLOWLIST Preparation

Humans must prepare:

- BSC testnet ERC-20 prize token addresses.
- Decision on which test prize tokens are allowed.
- Staging allowlist value stored in runtime config or secret manager as approved.

Rules:

- Use only testnet token addresses.
- Do not include production token address.
- Do not include zero address, dummy, example, or placeholder.
- Allowlist must include the token used by staging Prize records.

No-Go:

- Missing allowlist.
- Production address in staging allowlist.
- Prize send is tested with non-allowlisted token as if successful.

## 18. Staging Admin JWT / Cookie Operation

Humans must prepare:

- Staging-only admin account.
- Staging-only JWT secret.
- Staging-only admin auth values.
- Browser testing policy that separates staging cookies from production cookies.
- Confirmation that admin routes require `AuthAdmin`.

Rules:

- Do not reuse production admin password, cookie, JWT secret, or wallet private key.
- Use staging hostnames so cookie domain does not collide with production.
- Clear browser cookies or use a dedicated browser profile for staging tests.

No-Go:

- Admin cookie from production works on staging.
- Staging cookie works on production.
- Body `adminKey` alone can perform admin work.
- Normal user JWT can reach admin mutations.

## 19. GitHub Repo Access

Humans must prepare:

- Read access to `hiro4649/disco-funky-repair`.
- Deploy key, GitHub App, or approved SSH/HTTPS access for the staging server.
- Policy for which branch is allowed, normally `main`.
- Human-approved release candidate commit SHA.

No-Go:

- Server cannot clone GitHub.
- Server clones a fork or old repo by mistake.
- Server runs a dirty working tree.
- Server deploys local desktop files or old server exports.

## 20. GitHub Actions Decision

Decision required:

- Use GitHub Actions for build/test only.
- Use GitHub Actions for deployment.
- Do not use GitHub Actions for first staging setup.

Recommended default:

- For first staging setup, use manual server setup from `STAGING_SERVER_SETUP_RUNBOOK.md`.
- Use GitHub Actions only for local-style build/test or later deployment automation after secrets and rollback are reviewed.

If GitHub Actions is used:

- Store only CI/deploy secrets in GitHub Secrets.
- Do not store production keys in staging workflows.
- Do not print secrets in logs.
- Require manual approval for deploy jobs.
- Confirm deploy target is staging, not production.

No-Go:

- GitHub Actions deploys to production from a staging workflow.
- GitHub Actions stores wallet private keys without human approval.
- Workflow logs print secrets or full env.

## 21. Human-Managed Secrets

Humans must manage these outside git:

- Staging DB URL.
- Staging JWT secret.
- Staging admin password or admin auth secret.
- Staging admin wallet private key if one is used.
- Staging deployer private key.
- Staging prize hot wallet private key.
- Staging tier relayer private key.
- BSC testnet RPC credentials.
- BSC testnet explorer API key.
- NFT/upload provider API key if upload tests require it.
- SSH deploy key.
- TLS private key if manually managed.

Preferred storage:

- Approved secret manager.
- Approved password manager for human-held keys.
- Hardware wallet or multisig flow where possible for owner/admin authority.

## 22. Secrets Forbidden In GitHub

Do not put these in the repository, PR text, issues, comments, docs, screenshots, or normal logs:

- `.env` files.
- Private keys.
- Seed phrases.
- DB connection strings.
- JWT secrets.
- Admin passwords.
- Admin cookies or JWTs.
- API keys.
- RPC URLs containing credentials.
- Explorer URLs containing API keys.
- Production logs.
- Production DB dumps.
- Wallet keystores.
- TLS private keys.

GitHub Secrets may hold staging CI/deploy secrets only if humans approve GitHub Actions for that purpose.

## 23. Codex May Handle

Codex may help with:

- Docs and checklist edits.
- Non-secret architecture comparison.
- Non-secret command templates.
- Reviewing redacted PASS/FAIL outputs.
- Checking git branch, commit, and docs-only diffs.
- Drafting smoke-test plans.
- Explaining errors after humans remove secrets.

## 24. Codex Must Not Handle

Codex must not:

- Create servers.
- Create databases.
- Create, receive, display, store, or commit secrets.
- Create `.env` files.
- Access raw secret-manager values.
- Create wallets or choose private keys.
- Fund wallets.
- Sign blockchain transactions.
- Deploy contracts or production services.
- Act as multisig signer.
- Handle production DB dumps or production logs.
- Copy source from `Rave_bk`, `var-www`, local folders, old zips, or old server exports.
- Modify code, schema, package-lock files, dependencies, or business logic during STAGE-05.

## 25. External Resource Decision Table

Fill this outside git or in a redacted ticket without secret values.

| Resource | Decision Needed | Allowed Evidence | Owner |
| --- | --- | --- | --- |
| Staging server provider | AWS / VPS / existing isolated non-production server | provider name only | Human |
| Staging OS | approved OS and version | OS name/version | Human |
| Staging domain | frontend and API hostname labels | hostname labels only | Human |
| Staging DB | same server / managed / external | service name only | Human |
| Secret manager | AWS / provider / process manager / CI | tool name only | Human |
| BSC testnet RPC | provider category | provider name only | Human |
| Explorer API | provider category | provider name only | Human |
| Prize hot wallet | staging wallet created | public address only if approved | Human |
| Tier relayer wallet | staging wallet created | public address only if approved | Human |
| Deployer wallet | staging wallet created | public address only if approved | Human |
| GitHub Actions | use / do not use | workflow name only | Human |

Do not fill secret values in this repository.

## 26. Staging Creation Pre-No-Go

Do not create staging if:

- Server provider is undecided.
- Staging domain is undecided.
- DB location is undecided.
- Secret management method is undecided.
- BSC testnet RPC is missing.
- BSC testnet explorer API access is missing.
- Prize hot wallet is not prepared.
- Tier relayer wallet is not prepared.
- Testnet BNB is not available.
- FUNKY/NFT/FunkyTierUpdater testnet deploy plan is not approved.
- `PRIZE_TRANSFER_TOKEN_ALLOWLIST` staging plan is missing.
- GitHub repo access is not ready.
- Humans plan to use production secrets or production wallets.
- Humans plan to deploy from `Rave_bk`, `var-www`, local copies, old zips, or old exports.

## 27. Conditions To Proceed To STAGE-04

Proceed to `docs/launch/STAGING_SERVER_SETUP_RUNBOOK.md` only after:

- Staging server provider and OS are chosen.
- CPU/RAM/storage are sufficient.
- Staging frontend/API domain labels are chosen.
- DNS and TLS plan is ready.
- Staging DB option is chosen.
- DB backup/destruction policy is agreed.
- Secret manager method is chosen.
- BSC testnet RPC and explorer API access are ready.
- Staging deployer, prize hot wallet, and tier relayer wallets are created separately.
- Testnet BNB funding is ready.
- Testnet contract deploy order is approved.
- Prize token allowlist plan is approved.
- GitHub repo access is ready.
- GitHub Actions decision is documented.
- Human owner accepts all No-Go conditions.

## 28. Production Boundary

Completing this checklist means only that external staging resources are ready to be created or configured.

It does not mean:

- Staging server exists.
- Staging DB exists.
- Secrets have been created.
- Contracts have been deployed.
- STAGE-04 server setup has been completed.
- STAGE-01 verification has passed.
- Production deploy is approved.
- Production launch is approved.

Production planning remains blocked until staging setup, BSC testnet verification, production secret-manager review, production deploy-source confirmation, and human launch sign-off are complete.
