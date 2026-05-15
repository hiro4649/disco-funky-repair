# Staging Server Setup Runbook

Status: STAGE-04 server setup runbook.

This runbook is for a human operator creating a new staging server for DISCO.fan / FUNKY.fan. It documents the path from GitHub clone through backend/frontend startup checks. It does not create a server, create a DB, deploy contracts, create secrets, or approve production launch.

Do not commit, paste, print, or store real `.env` files, private keys, seed phrases, API keys, JWT secrets, DB URLs, RPC URLs, production logs, or secret-manager values in this repository, PRs, tickets, chat, or shared logs.

## 1. Staging Server Preconditions

Before starting, confirm:

- STAGE-02 prep checklist is complete.
- STAGE-03 architecture plan is approved.
- Server is staging-only and separate from production.
- DB is a new isolated staging PostgreSQL DB.
- Secret manager is ready and contains staging-only values.
- BSC testnet RPC and explorer access are ready.
- BSC testnet wallets are separate for deployer, prize hot wallet, and tier relayer.
- Staging hostname and TLS plan are approved.
- No production secret, wallet, DB, RPC, or contract address will be used.

No-Go if the server was built from old `var-www`, `Rave_bk`, desktop folders, downloaded zips, or any source other than GitHub.

## 2. OS Preconditions

Recommended OS baseline:

- Ubuntu LTS or another approved Linux server OS.
- Non-root deploy user with least-privilege SSH access.
- Firewall allowing only required SSH, HTTP, and HTTPS access.
- System time sync enabled.
- nginx installed or approved for install.
- PM2 installed or approved for install.
- Git, curl, and build tools available.

Human-only setup examples:

```bash
whoami
hostname
timedatectl status
git --version
nginx -v
pm2 -v
```

Do not paste full environment dumps or secret-manager output into PRs or chat.

## 3. Node.js Preconditions

Use an approved Node.js runtime that satisfies the repository:

- Backend package requires Node `>=16.x.x`.
- Frontend and current tooling should be run on the team-approved LTS Node version.
- Use the same major Node version for backend and frontend unless humans approve otherwise.

Verification:

```bash
node -v
npm -v
```

No-Go if Node/npm versions differ from the approved staging runtime or if `npm ci` is expected to change lockfiles.

## 4. Source Repository

Target repository:

- `https://github.com/hiro4649/disco-funky-repair.git`

Target branch:

- `main`, unless humans approve a specific reviewed staging branch.

Target runtime source:

- `apps/backend`
- `apps/frontend`
- `contracts`

Forbidden deploy sources:

- `Rave_bk`
- `Rave`
- `var-www`
- local desktop folders
- downloaded zip exports
- copied server directories
- old Sui/DISCO source trees

## 5. Git Clone

Run as the deploy user on the staging server.

```bash
sudo mkdir -p /srv/disco-funky
sudo chown "$USER":"$USER" /srv/disco-funky
cd /srv/disco-funky
git clone https://github.com/hiro4649/disco-funky-repair.git app
cd app
git fetch origin --prune
git switch main
git pull --ff-only origin main
```

Do not copy any source tree from local desktop folders or old server paths.

## 6. Commit Confirmation

Record only non-secret source evidence.

```bash
cd /srv/disco-funky/app
git remote -v
git branch --show-current
git rev-parse HEAD
git log --oneline -5
git status --short
```

Expected:

- Remote is GitHub `hiro4649/disco-funky-repair`.
- Branch is the approved branch.
- Commit SHA matches the approved release candidate.
- `git status --short` is empty.

No-Go if there are local edits, unknown branch, wrong remote, or old commit.

## 7. Do Not Create `.env`

Rules:

- Do not create `.env` in backend, frontend, contracts, repo root, PM2 home, or nginx folders.
- Do not commit env files.
- Do not paste secret values into docs or PR text.
- Inject runtime env from the approved secret manager or approved process manager integration.
- Secret names may be documented. Secret values must not be documented.

If a tool requires env at runtime, use the human-approved secret injection wrapper. In examples below, replace `<secret-manager-run>` with that approved wrapper. Do not print the resolved values.

## 8. Backend Install

```bash
cd /srv/disco-funky/app/apps/backend
npm ci
```

Expected:

- Install completes without editing `package-lock.json`.
- No `.env` file is created.

No-Go if `npm ci` requires lockfile changes or prints secret-bearing env output.

## 9. Frontend Install

```bash
cd /srv/disco-funky/app/apps/frontend
npm ci
```

Expected:

- Install completes without editing `package-lock.json`.
- No private key or secret is added to frontend env.

## 10. Contracts Install

```bash
cd /srv/disco-funky/app/contracts
npm ci
```

Expected:

- Install completes without editing `package-lock.json`.
- No deploy secret or RPC value is written into the repository.

## 11. Backend Env Presence Check

Run only inside the approved secret-injected shell. This command prints missing env names only, not values.

```bash
cd /srv/disco-funky/app/apps/backend
<secret-manager-run> node - <<'NODE'
const required = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_WALLET_ADDRESS',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'BACKEND_API_URL',
  'FRONTEND_APP_URL',
  'QUICKNODE_HTTP_RPC_URL',
  'ETHERSCAN_API_URL',
  'CHAIN_ID',
  'TOKEN_CONTRACT_ADDRESS',
  'NFT_CONTRACT_ADDRESS',
  'PRIZE_HOT_WALLET_PRIVATE_KEY',
  'PRIZE_TRANSFER_TOKEN_ALLOWLIST',
  'TIER_RELAYER_PRIVATE_KEY',
  'TIER_UPDATER_CONTRACT_ADDRESS'
];
const either = [['ETHERSCAN_API_KEY', 'BSCSCAN_API_KEY']];
const missing = required.filter((key) => !process.env[key]);
for (const group of either) {
  if (!group.some((key) => process.env[key])) {
    missing.push(group.join(' or '));
  }
}
console.log(JSON.stringify({ checked: required.length + either.length, missing }, null, 2));
process.exit(missing.length ? 1 : 0);
NODE
```

Notes:

- `QUICKNODE_WS_RPC_URL` is required if realtime WebSocket monitoring is enabled.
- `ADMIN_PRIVATE_KEY` should not be configured unless humans explicitly accept the P1 monitoring-only residual risk.
- This check does not prove values are correct; it only checks presence without printing values.

## 12. Frontend Env Presence And Forbidden Env Check

Run from the frontend directory with approved staging public env injected.

```bash
cd /srv/disco-funky/app/apps/frontend
<secret-manager-run> node env.validation.test.mjs
<secret-manager-run> node - <<'NODE'
const forbidden = Object.keys(process.env).filter((key) =>
  /^NEXT_PUBLIC_.*(PRIVATE_KEY|SECRET|ADMIN_KEY|OWNER_KEY|RELAYER_KEY|HOT_WALLET|JWT|API_KEY)$/i.test(key)
);
const requiredPublic = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_TOKEN_ADDRESS',
  'NEXT_PUBLIC_NFT_ADDRESS'
];
const missing = requiredPublic.filter((key) => !process.env[key]);
console.log(JSON.stringify({ forbidden, missing }, null, 2));
process.exit(forbidden.length ? 1 : 0);
NODE
```

Rules:

- `NEXT_PUBLIC_ALCHEMY_RPC_URL` is optional, but if set it must be a safe public staging RPC.
- `NEXT_PUBLIC_*` values are browser-visible and must never contain secrets.
- Public env may include public staging URLs and public testnet contract addresses.

## 13. Prisma Generate And Migration Deploy

Run only after the staging DB exists and `DATABASE_URL` is injected from secret manager.

```bash
cd /srv/disco-funky/app/apps/backend
<secret-manager-run> npm run prisma:validate
<secret-manager-run> npm run migrate:status
<secret-manager-run> npm run migrate:deploy
<secret-manager-run> npm run prisma:generate
<secret-manager-run> npm run migrate:status
```

Expected:

- Fresh staging DB shows baseline migration pending before deploy.
- After deploy, migration status is up to date.
- Prisma Client generation succeeds.

No-Go:

- Do not use `prisma db push`.
- Do not use `migrate:dev` on staging.
- Do not run destructive reset after real staging data exists.
- Stop if the DB appears to contain old production or legacy data.

## 14. Backend Build And Test

```bash
cd /srv/disco-funky/app/apps/backend
<secret-manager-run> npm run build
<secret-manager-run> npm test -- --runInBand
```

Record PASS/FAIL only. Do not paste logs that contain secret values.

## 15. Frontend Build

```bash
cd /srv/disco-funky/app/apps/frontend
<secret-manager-run> npm run build
```

Expected:

- Build succeeds with approved public staging env.
- Build does not use `NEXT_PUBLIC_*` secret names.
- Build does not fall back to production or localhost unexpectedly.

## 16. Contracts Compile/Test

Contracts are installed and tested on the staging server only as verification. Contract deploy is handled by the STAGE-01 testnet runbook and human-approved signing flow.

```bash
cd /srv/disco-funky/app/contracts
npx hardhat compile
npx hardhat test
npm run compile:nft
npm run test:nft
```

Do not write deploy private keys or RPC secrets into files.

## 17. PM2 Backend Startup

Use PM2 only if PM2 is the selected process manager.

Run from a shell where staging env is injected without printing values.

```bash
cd /srv/disco-funky/app/apps/backend
<secret-manager-run> pm2 start dist/src/main.js \
  --name disco-funky-backend-staging \
  --cwd /srv/disco-funky/app/apps/backend \
  --time \
  --update-env
pm2 save
pm2 list
pm2 show disco-funky-backend-staging
```

Expected:

- cwd points to `/srv/disco-funky/app/apps/backend`.
- script is `dist/src/main.js`.
- backend listens on the approved staging backend port, default `5000` unless non-secret `PORT` is set.
- PM2 output does not print secret values.

No-Go if PM2 points to `var-www`, `Rave_bk`, local folders, old zips, or old server exports.

## 18. PM2 Frontend Startup

Run from a shell where approved public frontend env is injected.

```bash
cd /srv/disco-funky/app/apps/frontend
<secret-manager-run> pm2 start npm \
  --name disco-funky-frontend-staging \
  --cwd /srv/disco-funky/app/apps/frontend \
  --time \
  -- start
pm2 save
pm2 list
pm2 show disco-funky-frontend-staging
```

Expected:

- cwd points to `/srv/disco-funky/app/apps/frontend`.
- command runs the Next.js `start` script.
- frontend listens on approved staging frontend port, default `3000` unless non-secret `PORT` is set.
- PM2 output does not print secret values.

## 19. PM2 Runtime Checks

```bash
pm2 list
pm2 show disco-funky-backend-staging | grep -E "name|status|script path|exec cwd"
pm2 show disco-funky-frontend-staging | grep -E "name|status|script path|exec cwd"
```

Expected:

- Both services are online.
- Names include `staging`.
- cwd values point to the GitHub checkout.
- No process points to old source paths.

Do not run commands that print full env values in shared output.

## 20. nginx Reverse Proxy Policy

Recommended pattern:

- Use one staging frontend hostname proxying to frontend port.
- Use one staging API hostname proxying to backend port.
- Keep backend and frontend hostnames visibly staging.
- Use TLS.
- Do not route staging to production services.

Template with placeholders only:

```nginx
server {
    listen 443 ssl;
    server_name <staging-frontend-hostname>;

    location / {
        proxy_pass http://127.0.0.1:<frontend-port>;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 443 ssl;
    server_name <staging-backend-hostname>;

    location / {
        proxy_pass http://127.0.0.1:<backend-port>;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Do not commit real hostname, TLS key path, or provider-specific secret into this repo.

## 21. nginx Verification Commands

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo nginx -T | grep -E "server_name|proxy_pass|root|alias"
```

Expected:

- `server_name` values are staging hostnames.
- `proxy_pass` points to local staging ports.
- No `root` or `alias` points to `var-www`, `Rave_bk`, local desktop folders, old zips, or old Sui/DISCO source.
- No production hostname or production backend appears.

Do not paste full nginx config if it contains secrets or private internal details.

## 22. Health Check

Local process checks:

```bash
curl -fsS http://127.0.0.1:5000/api/monitoring/healthcheck
curl -fsSI http://127.0.0.1:3000
```

Reverse proxy checks with placeholders:

```bash
curl -fsS https://<staging-backend-hostname>/api/monitoring/healthcheck
curl -fsSI https://<staging-frontend-hostname>
```

Expected:

- Backend healthcheck returns HTTP 200 or documented healthy response.
- Frontend returns HTTP 200 or expected redirect.
- The browser URL and API URL are staging URLs.
- No production DB, production contract, production wallet, or production user data is visible.

## 23. Secret Log Scan

Run locally on the staging server. Do not paste matching log lines into PRs or chat.

```bash
pm2 logs disco-funky-backend-staging --lines 500 --nostream > /tmp/backend-staging-last500.log
pm2 logs disco-funky-frontend-staging --lines 500 --nostream > /tmp/frontend-staging-last500.log
grep -E -i "Authorization:|Bearer |JWT_SECRET|DATABASE_URL|PRIVATE_KEY|api.?key|secret|password|postgres|mysql|mongodb|seed phrase|mnemonic" /tmp/backend-staging-last500.log /tmp/frontend-staging-last500.log > /tmp/staging-secret-scan.txt
wc -l /tmp/staging-secret-scan.txt
rm -f /tmp/backend-staging-last500.log /tmp/frontend-staging-last500.log /tmp/staging-secret-scan.txt
```

Expected:

- `wc -l` result is `0`.
- If non-zero, inspect privately and open a sanitization task with redacted evidence only.

No-Go if logs expose raw JWT, Authorization header, cookie value, private key, API key, DB URL, RPC URL with query string, explorer URL with API key, or seed phrase.

## 24. Confirm Staging Is Not Production

Confirm:

- Hostnames include staging.
- PM2 process names include staging.
- DB name or secret-manager entry name visibly identifies staging.
- Contract addresses are BSC testnet addresses.
- Wallet network is BSC testnet.
- Prize hot wallet and tier relayer are staging/test wallets.
- Frontend public API URL points to staging backend.
- nginx does not route to production.
- No production user data appears in the UI or DB.

No-Go if any staging runtime points to production values.

## 25. Staging Creation Post-No-Go

Stop and do not proceed to STAGE-01 verification if:

- Source branch or commit is not approved.
- `git status --short` is not empty.
- `npm ci`, build, tests, Prisma validate, or migration deploy fails.
- PM2 cwd or nginx target points outside GitHub checkout.
- Backend connects to production DB or production contracts.
- Frontend calls production backend unintentionally.
- Secret values appear in logs.
- `.env` files were created or committed.
- `NEXT_PUBLIC_*` contains private keys, secrets, admin keys, owner keys, relayer keys, hot wallet keys, JWT, or API keys.
- Wallet address alone can login.
- Disabled MVP routes become reachable.
- Normal user can mutate admin state or another user's asset state.

## 26. Next Conditions

Proceed to `docs/launch/STAGING_TESTNET_VERIFICATION_RUNBOOK.md` only after:

- GitHub clone and commit verification pass.
- Backend install, Prisma migration, build, and tests pass.
- Frontend install, env validation, and build pass.
- Contracts install and compile/test pass.
- PM2 backend and frontend are online from the GitHub checkout.
- nginx points to staging ports and staging hostnames.
- Health checks pass.
- Secret log scan passes.
- Humans confirm staging is not production.

## 27. Human Confirmation Points

Humans must confirm:

- Server, DNS, TLS, firewall, and deploy user are correct.
- Secret manager injection works without printing values.
- DB is a new isolated staging DB.
- Runtime branch and commit are approved.
- BSC testnet RPC and explorer are configured safely.
- Prize hot wallet and tier relayer are separate.
- Frontend public env contains no secret.
- nginx and PM2 use only staging source and staging ports.
- No production secret or production user data is used.

## 28. Codex Must Not Do

Codex must not:

- Operate the real staging server.
- Create `.env` files.
- Create, view, display, store, or commit secrets.
- Access raw secret-manager values.
- Create wallets or private keys.
- Fund wallets.
- Sign blockchain transactions.
- Deploy contracts or production services.
- Handle production DB dumps or production logs.
- Copy source from `Rave_bk`, `var-www`, local folders, old zips, or old server exports.
- Modify code, schema, package-lock files, dependencies, or business logic during STAGE-04.

## 29. Production Boundary

Completing this runbook means only that the staging server can start from the approved GitHub source. It does not mean:

- STAGE-01 verification has passed.
- BSC testnet tx receipts have been collected.
- Production secrets are valid.
- Production multisig/timelock is ready.
- Production deploy is approved.
- Production launch is approved.

Production planning remains blocked until all STAGE-01 checks, BSC testnet checks, production secret-manager review, deploy source confirmation, and human launch sign-off are complete.
