# Sakura Cloud Single-Server Staging Plan

Status: STAGE-06 Sakura Cloud single-server staging plan.

This plan defines the first staging architecture for DISCO.fan / FUNKY.fan on Sakura Cloud. It is a planning document only. It does not create a server, create a DB, deploy code, deploy contracts, create secrets, or approve production launch.

Do not commit, paste, print, or store real `.env` files, private keys, seed phrases, API keys, JWT secrets, DB URLs, RPC URLs, production logs, Sakura Cloud credentials, or secret-manager values in this repository, PRs, tickets, chat, or shared logs.

## 1. Scope

This plan covers:

- First staging environment on Sakura Cloud.
- Single-server staging layout.
- Minimum controls required before running STAGE-04 server setup.
- Conditions where production MVP may temporarily use a single-server layout.
- Conditions requiring DB, LB/SSL, worker/cron, monitoring, or secret separation.

This plan does not cover:

- Creating the Sakura Cloud server.
- Creating PostgreSQL.
- Creating secrets.
- Creating wallets.
- Deploying contracts.
- Launching production.

## 2. Sakura Cloud Single-Server Assumption

First staging uses one new Sakura Cloud server.

The server may contain:

- Backend from `apps/backend`.
- Frontend from `apps/frontend`.
- PostgreSQL for staging only.
- nginx reverse proxy.
- PM2 process manager.
- Application logs.
- Staging runtime secret injection mechanism.

The server must not contain:

- Production DB.
- Production `.env`.
- Production wallet private keys.
- Production RPC/API credentials.
- Production contract owner/admin keys.
- Production logs.
- `Rave_bk`, `Rave`, `var-www`, local desktop folders, old zips, or old Sui/DISCO source as deploy source.

## 3. Why Single Server Is Acceptable For Staging

Single-server staging is acceptable because:

- It is cheaper and faster for first BSC MVP verification.
- It is easy for humans to inspect PM2 cwd, nginx proxy targets, DB, logs, and disk usage.
- Staging uses testnet wallets, testnet contracts, and non-production data.
- Production-grade scale is not the purpose of first staging.
- STAGE-01 testnet verification focuses on correctness, safety controls, authorization, secrets, and chain behavior.

Single-server staging is not acceptable if:

- Staging uses production secrets or production DB data.
- The server also hosts production traffic.
- Humans cannot verify source paths, PM2 processes, nginx routes, DB identity, logs, and backups.
- Disk, CPU, or RAM is too small for `npm ci`, frontend build, backend tests, PostgreSQL, and logs.

## 4. Production MVP Single-Server Allowance

Production MVP may temporarily use a single Sakura Cloud server only if all conditions below are met:

- Human launch owner explicitly approves the temporary single-server production risk.
- Production server is not the staging server.
- Production DB is new and not shared with staging.
- Production secrets are separate from staging secrets.
- Production wallets are separate from staging wallets.
- Production hot wallet and tier relayer are separate accounts with minimal funds and roles.
- Backups and snapshots are enabled and tested.
- Log rotation is enabled.
- Disk usage monitoring is enabled.
- CPU/RAM monitoring is enabled.
- PM2 restart policy is configured.
- nginx health checks and external uptime checks are configured.
- Recovery runbook and rollback decision owner are defined.
- Production secret-manager values have been reviewed without exposing values.
- Contract owner/admin roles are moved to multisig/timelock or an approved production governance path.
- No No-Go item remains in `docs/launch/P0_CLOSURE_REPORT.md` or STAGE runbooks.

Production MVP single-server is a temporary operational decision, not the target architecture.

## 5. When Production Must Not Stay Single Server

Do not continue production on one server if any item is true:

- Real user traffic or asset volume increases beyond manual recovery comfort.
- DB backup restore has not been tested.
- Disk usage exceeds safe threshold or grows unpredictably.
- PostgreSQL CPU/RAM competes with backend/frontend during normal usage.
- Cron, scheduler, monitoring, or chain listeners affect API latency.
- Prize payout, tier sync, or token tracking requires stricter worker isolation.
- Logs are too noisy to inspect without secret exposure risk.
- Recovery time objective cannot be met with one server.
- Hot wallet or relayer exposure risk requires stronger isolation.
- Compliance, audit, or investor requirement asks for DB separation.
- Any production incident shows single-server blast radius is too large.

At that point, split DB, workers, monitoring, and SSL/load-balancing according to the future separation sections below.

## 6. Components On The Same Staging Server

The staging single server may run:

| Component | Purpose | Rule |
| --- | --- | --- |
| backend | API, auth, Prize, ticket, NFT admin, tier sync, testnet interactions | Run from GitHub checkout only. |
| frontend | Next.js staging UI | Run from GitHub checkout only. |
| PostgreSQL | staging DB | New empty staging DB only. |
| nginx | TLS and reverse proxy | Staging hostnames only. |
| PM2 | process supervision | One process manager only. |
| logs | PM2/nginx/app logs | Rotate and scan for secrets. |
| staging secret injection | runtime env delivery | Values outside git; no committed `.env`. |

Do not add old source trees or production backup files to this server.

## 7. Backend Policy

Backend must:

- Run from `apps/backend` in the GitHub clone.
- Use a build from the approved commit.
- Use staging DB only.
- Use BSC testnet RPC and BSC testnet contract addresses for staging verification.
- Use `PRIZE_HOT_WALLET_PRIVATE_KEY` only for staging prize test payouts.
- Use `TIER_RELAYER_PRIVATE_KEY` only for staging FunkyTierUpdater calls.
- Keep governance/fee/DEX/pair writes disabled or manual-review only.

Backend must not:

- Use production DB.
- Use production wallets.
- Use `ADMIN_PRIVATE_KEY` for prize payouts or tier updates.
- Broadcast governance writes from backend.
- Log secret values or API-key-bearing URLs.

## 8. Frontend Policy

Frontend must:

- Run from `apps/frontend` in the GitHub clone.
- Use public staging API URL.
- Use public BSC testnet RPC only if it is safe for browser exposure.
- Use public BSC testnet contract addresses.
- Keep browser admin/governance signing disabled.

Frontend must not:

- Use `NEXT_PUBLIC_*PRIVATE_KEY`.
- Use `NEXT_PUBLIC_*SECRET`.
- Use `NEXT_PUBLIC_*ADMIN_KEY`.
- Use `NEXT_PUBLIC_*OWNER_KEY`.
- Use `NEXT_PUBLIC_*RELAYER_KEY`.
- Use `NEXT_PUBLIC_*HOT_WALLET`.
- Use `NEXT_PUBLIC_*JWT`.
- Contain private-key wallet creation or direct admin transaction signing.

## 9. PostgreSQL Policy

For first staging:

- PostgreSQL may run on the same Sakura Cloud server.
- DB must be new and staging-only.
- DB user must be staging-only.
- DB URL must be injected as a secret, never committed.
- Prisma migration uses `migrate:deploy`.
- `prisma db push` is forbidden.
- `migrate:dev` is forbidden on staging.

Production MVP may use same-server PostgreSQL only if:

- Backups are scheduled and restore-tested.
- Server snapshot is scheduled.
- Disk usage monitoring is active.
- Production owner accepts single-server risk.
- There is a written migration path to Sakura Cloud database appliance or another managed DB.

## 10. nginx Policy

nginx must:

- Serve only staging hostnames on staging.
- Proxy frontend hostname to frontend port.
- Proxy API hostname to backend port.
- Use TLS for browser wallet login testing.
- Avoid logging secret-bearing headers or query strings.
- Be verified with `nginx -t`.

nginx must not:

- Route staging to production backend.
- Route production hostname to staging.
- Use `root` or `alias` pointing to `var-www`, `Rave_bk`, local desktop folders, old zips, or old Sui/DISCO source.

## 11. PM2 Policy

PM2 must:

- Run backend and frontend from the GitHub checkout.
- Use process names that include `staging`.
- Restart failed processes.
- Start after environment is injected.
- Be checked with `pm2 list` and `pm2 show`.
- Avoid printing full env values in shared output.

Required PM2 behavior:

- backend restart policy enabled through PM2 defaults or approved ecosystem config.
- frontend restart policy enabled through PM2 defaults or approved ecosystem config.
- PM2 startup persistence configured after humans approve server setup.
- PM2 logs included in log rotation plan.

No-Go if PM2 points to old source or if both PM2 and systemd manage the same process.

## 12. Logs Policy

Logs may be on the same server for first staging if:

- PM2 logs are rotated.
- nginx logs are rotated.
- App logs do not contain secrets.
- Humans run secret log scans before STAGE-01 verification.
- Logs are not copied into git, PRs, tickets, or chat.

Logs must not contain:

- Authorization header.
- JWT.
- Cookie value.
- Private key.
- API key.
- DB URL.
- RPC URL with query string.
- Explorer URL with API key.
- Seed phrase.
- Secret-manager value.

## 13. Staging Secret Policy

For first staging, secrets may be injected on the Sakura Cloud server using the human-approved runtime mechanism.

Rules:

- Do not create committed `.env` files.
- Do not store secret values in docs.
- Do not print full env.
- Do not use production secrets.
- Keep staging secrets separate from production secrets.
- Keep backend secrets out of frontend `NEXT_PUBLIC_*`.
- Rotate any secret accidentally pasted into logs or chat.

Preferred future state:

- Move secrets to a managed secret store or at least a stricter runtime-injection flow before production launch.
- Keep wallet private keys out of shell history and deployment logs.

## 14. Key And Wallet Policy

Staging wallets:

- deployer wallet.
- prize hot wallet.
- tier relayer wallet.
- temporary staging admin or test multisig.

Rules:

- All are BSC testnet wallets.
- All are separate from each other unless a human explicitly approves a limited test admin exception.
- None are production wallets.
- Prize hot wallet has only minimum test gas and test prize token balance.
- Tier relayer has only minimum test gas and relayer permission.
- Owner/admin roles must not be assigned to prize hot wallet or tier relayer.

## 15. Required Mitigations

Single-server staging requires these mitigations before STAGE-01 verification:

- DB backup plan.
- Server snapshot plan.
- Log rotation.
- PM2 restart policy.
- nginx health check or uptime check plan.
- Disk usage monitoring.
- CPU/RAM monitoring.
- Secret log scan.
- Hot wallet balance minimization.
- Staging secret and production secret separation.
- GitHub repo clone only.
- No `Rave_bk`, `Rave`, `var-www`, local copy, old zip, or old server export as deploy source.

## 16. Main Single-Server Risks

| Risk | Impact | Required Control |
| --- | --- | --- |
| DB failure | staging data loss or production outage if reused later | backup, snapshot, restore test, DB separation trigger |
| disk exhaustion | DB corruption, app crash, failed builds, lost logs | disk monitoring, log rotation, storage headroom |
| backup failure | no recovery point | scheduled backup and restore test |
| secret leakage | wallet/API/admin compromise | secret manager, no `.env` commit, log scan, rotation plan |
| CPU/RAM shortage | failed builds, slow API, DB contention | resource monitoring, scale-up threshold |
| single point of failure | all services down together | accepted for staging; production split trigger |
| old source path | P0 fixes bypassed | GitHub clone verification and PM2/nginx cwd checks |

## 17. Backup And Snapshot Requirements

Staging:

- DB backup can be simple, but must be defined before meaningful test data.
- Server snapshot should be taken after clean setup and before risky test changes.
- Backup files must not be stored in the git checkout.
- Backup output must not be pasted into PRs or chat.

Production MVP single-server:

- DB backup schedule is mandatory.
- Server snapshot schedule is mandatory.
- Restore test is mandatory before production traffic.
- Backup owner and retention period must be documented outside git.

## 18. Disk Usage Monitoring

At minimum humans must monitor:

- root filesystem usage.
- PostgreSQL data directory usage.
- PM2 log size.
- nginx log size.
- upload directory size if uploads are enabled.
- build/cache directories.

Suggested non-secret check:

```bash
df -h
du -sh /srv/disco-funky/app/apps/backend/uploads 2>/dev/null || true
pm2 list
```

Do not paste outputs if they contain secrets or private paths beyond approved staging paths.

## 19. Health Check Policy

Required checks:

- backend local health check.
- frontend local HTTP check.
- nginx config check.
- external staging frontend hostname check.
- external staging backend hostname check.
- PM2 process status.

Use `docs/launch/STAGING_SERVER_SETUP_RUNBOOK.md` for exact commands.

No-Go if health checks pass only through production hostname or production backend.

## 20. Future DB Separation Conditions

Move PostgreSQL off the single server to Sakura Cloud database appliance, managed PostgreSQL, or another approved DB service if any item is true:

- Production launch is approved and real users will be onboarded.
- Restore testing is required by launch owner.
- DB size grows beyond comfortable single-server backup/restore.
- DB CPU/RAM competes with backend/frontend.
- Disk usage exceeds safe threshold.
- Any DB incident occurs.
- Audit or operations require DB isolation.
- Backups cannot be reliably automated on the app server.

Target future state:

- App server runs backend/frontend/nginx/PM2.
- DB runs on a separate managed service.
- `DATABASE_URL` is injected only from secret manager.
- Network access is restricted to app server and approved admin access.

## 21. Future LB / SSL Separation Conditions

Separate LB/SSL termination if any item is true:

- Multiple app servers are introduced.
- Zero-downtime deploy is required.
- TLS certificate automation becomes operational risk.
- DDoS/WAF requirement appears.
- Production traffic grows beyond one nginx instance.
- SSL policy must be managed centrally.

Target future state:

- LB terminates TLS.
- app server receives internal traffic only.
- nginx is simplified or used only internally.
- production and staging hostnames remain strictly separate.

## 22. Future Worker / Cron Separation Conditions

Split worker/cron from API if any item is true:

- token tracking affects API latency.
- tier sync affects API latency.
- prize payout retries need strict queue/nonce control.
- scheduled jobs need independent restart/deploy.
- crash or memory leak in worker impacts web API.
- production launch owner requires isolated background jobs.

Target future state:

- API process handles HTTP only.
- worker process handles tracking, tier sync, scheduled jobs, and payout follow-up.
- job locking prevents duplicate execution.
- secrets are scoped to each process.

## 23. Future Monitoring Strengthening Conditions

Strengthen monitoring if any item is true:

- production MVP is approved.
- real users or real asset transfers are enabled.
- hot wallet or relayer balance matters operationally.
- DB backup/restore needs proof.
- logs need retention and alerting.
- uptime SLA is defined.
- security alerting is required.

Target future state:

- external uptime monitoring.
- disk/CPU/RAM alerting.
- DB backup success alert.
- hot wallet gas and token balance alert without exposing private key.
- tier relayer gas alert without exposing private key.
- log redaction and secret scan.
- incident response contact list outside git.

## 24. Production Single-Server No-Go

Do not use a single production server if:

- human launch owner has not accepted risk.
- backups are not enabled.
- restore is not tested.
- server snapshot is not configured.
- log rotation is missing.
- disk monitoring is missing.
- hot wallet balance is excessive.
- secrets are stored in committed `.env`.
- production and staging share secrets.
- production and staging share DB.
- production and staging share wallets.
- PM2/nginx points to old source paths.
- governance owner/admin roles are held by backend hot wallet.
- production contract owner/admin is not controlled by approved multisig/timelock path.

## 25. Proceed To STAGE-04 Conditions

Proceed to `docs/launch/STAGING_SERVER_SETUP_RUNBOOK.md` for Sakura Cloud staging only after:

- Sakura Cloud server plan is approved.
- server size is selected.
- Ubuntu LTS or approved Linux OS is selected.
- staging domain labels are selected.
- same-server PostgreSQL is accepted for staging.
- backup and snapshot plan is defined.
- log rotation plan is defined.
- secret injection method is selected.
- BSC testnet RPC and explorer API access are ready.
- deployer, prize hot wallet, and tier relayer test wallets are created separately.
- testnet BNB funding is ready.
- FUNKY, NFT, and FunkyTierUpdater testnet deploy plan is approved.
- `PRIZE_TRANSFER_TOKEN_ALLOWLIST` staging plan is ready.
- GitHub repository access is ready.

## 26. Production Boundary

Completing this plan means only that a Sakura Cloud single-server staging architecture has been documented.

It does not mean:

- Sakura Cloud server exists.
- PostgreSQL exists.
- secrets exist.
- code is deployed.
- contracts are deployed.
- STAGE-04 server setup is complete.
- STAGE-01 verification is complete.
- production single-server is approved.
- production launch is approved.

Production remains blocked until staging setup, BSC testnet verification, production secret-manager review, deploy source confirmation, backup/restore proof, multisig/timelock readiness, and human launch sign-off are complete.
