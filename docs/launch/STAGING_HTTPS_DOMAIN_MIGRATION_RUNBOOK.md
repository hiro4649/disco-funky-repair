# STAGE-10 HTTPS Staging Domain Migration Runbook

Status: staging HTTPS migration runbook after PR #56 and PR #57.

This runbook documents how to move the existing staging server from temporary `http://<server-ip>` access to HTTPS staging domains without changing code, committing env files, exposing secrets, or approving production launch.

Do not paste, commit, or store real `.env` files, private keys, API keys, DB URLs, JWT/session secrets, cert private keys, production logs, or secret-manager values in this repository, PRs, tickets, chat, or shared logs.

This is not production launch approval. tBNB is still unfunded, so tx flows, contract deploys, Prize transfers, NFT minting, and tier relayer transactions remain unverified.

## 1. Preconditions After PR #56

PR #56 changed backend runtime behavior:

- backend `listen` entrypoint is `apps/backend/src/main.ts`, built as `dist/src/main.js`.
- `apps/backend/src/app/index.ts` must not be started directly.
- `SESSION_SECRET` has no hardcoded fallback.
- `BACKEND_CORS_ORIGINS` controls browser CORS origins.
- staging strict runtime should set `BACKEND_APP_ENV=staging`.
- strict runtime rejects missing, localhost, raw IP, malformed, path/query/hash, and non-HTTPS CORS origins.
- global JSON and URL-encoded request body limit defaults to `5mb`.

No-Go if staging still depends on browser access through `http://<server-ip>`, `http://localhost`, `http://127.0.0.1`, raw IP CORS origins, or old hardcoded production origins.

## 2. Preconditions After PR #57

PR #57 changed admin Excel upload behavior:

- `apps/backend/src/app/middlewares/excelMulter.ts` defines `EXCEL_UPLOAD_MAX_BYTES = 10 * 1024 * 1024`.
- `/admin/nft/upload/metadata` remains behind `AuthAdmin` before `uploadExcel`.
- Excel metadata upload should accept normal admin files at or below 10MB and reject files above 10MB.

This runbook includes a human no-tx check for Excel upload size. Do not treat this as NFT mint, IPFS, or on-chain verification.

## 3. Domain Plan

Use visibly staging-only domains. Choose one of these patterns:

- frontend: `staging.disco.fan`
- backend API: `api-staging.disco.fan`
- alternate backend API: `staging-api.disco.fan`

If using one shared host, use a staging hostname and preserve the `/api` prefix when proxying. Do not use the production hostname.

No-Go:

- `http://<server-ip>` as frontend public URL.
- raw IP in `BACKEND_CORS_ORIGINS`.
- `localhost` or `127.0.0.1` in any browser-facing public env.
- production domain in staging CORS or frontend env.

## 4. DNS Setup

Human operator steps:

1. In DNS, create staging-only records for the selected hostnames.
2. Point records to the staging server public address.
3. Keep TTL low during migration if permitted by the DNS provider.
4. Wait for DNS propagation before requesting certificates.

Check without printing secrets:

```bash
dig +short <staging-frontend-hostname>
dig +short <staging-backend-hostname>
```

Expected:

- returned address is the staging server.
- no production server address is returned.
- no `var-www`, `Rave_bk`, old server, or local desktop source is involved.

## 5. nginx Server Name Update

Update nginx only on the staging server. Do not commit real hostnames or certificate paths to git.

Two-host model:

```nginx
server {
    listen 80;
    server_name <staging-frontend-hostname>;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    server_name <staging-backend-hostname>;
    return 301 https://$host$request_uri;
}

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

Single-host model with `/api` prefix preserved:

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

    location /api/ {
        proxy_pass http://127.0.0.1:<backend-port>/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Do not strip `/api`. A stripped `/api` prefix can turn disabled/protected route smoke tests into false `404` results.

## 6. Let's Encrypt / certbot

Install and run certbot only on the staging server. Do not commit cert files or private keys.

Example commands, with placeholders only:

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <staging-frontend-hostname> -d <staging-backend-hostname>
sudo certbot renew --dry-run
```

Expected:

- certificate issuance succeeds for staging hostnames.
- nginx config is updated for HTTPS.
- HTTP redirects to HTTPS.
- no production hostname is included.

No-Go if certbot attempts to issue for production hostnames or writes certificate material into the repository.

## 7. Frontend Staging Public Env Update

Update the approved frontend staging public env source, for example the secret manager entry or deployment wrapper named `frontend-staging-public.env`. Do not commit this file.

Required public values after HTTPS migration:

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://<staging-frontend-hostname>
NEXT_PUBLIC_API_URL=https://<staging-backend-hostname>
NEXT_PUBLIC_SOCKET_API_URL=https://<staging-backend-hostname>
```

If frontend and API share one hostname:

```bash
NEXT_PUBLIC_API_URL=https://<staging-frontend-hostname>
NEXT_PUBLIC_SOCKET_API_URL=https://<staging-frontend-hostname>
```

Keep existing BSC testnet public values from the approved staging env:

- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_ALCHEMY_RPC_URL`, if used
- `NEXT_PUBLIC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_NFT_ADDRESS`
- `NEXT_PUBLIC_ETHERSCAN_EXPLORER=https://testnet.bscscan.com`

No-Go:

- `NEXT_PUBLIC_API_URL=http://<server-ip>`
- `NEXT_PUBLIC_APP_URL=http://<server-ip>`
- `NEXT_PUBLIC_SOCKET_API_URL=http://<server-ip>`
- localhost or `127.0.0.1` in any browser-facing `NEXT_PUBLIC_*` URL
- any `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*ADMIN_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*HOT_WALLET`, or `NEXT_PUBLIC_*JWT`

Validate:

```bash
cd /srv/disco-funky/app/apps/frontend
<secret-manager-run> node env.validation.test.mjs
<secret-manager-run> npm run build
```

Record PASS/FAIL only. Do not paste env values.

## 8. Backend Staging Env Update

Update the approved backend staging env source, for example the secret manager entry or deployment wrapper named `backend-staging-public.env`. Do not commit this file.

Required values after HTTPS migration:

```bash
BACKEND_APP_ENV=staging
BACKEND_CORS_ORIGINS=https://<staging-frontend-hostname>
REQUEST_BODY_LIMIT=5mb
```

`SESSION_SECRET` must also be present in the secret manager, but its value must not be printed in examples, docs, PRs, tickets, chat, shell history, or logs.

If frontend and API use multiple staging browser origins, use a comma-separated list:

```bash
BACKEND_CORS_ORIGINS=https://<staging-frontend-hostname>,https://<alternate-staging-frontend-hostname>
```

Rules:

- `BACKEND_CORS_ORIGINS` must contain only HTTPS origins.
- Do not include paths, query strings, or hashes.
- Do not include `http://<server-ip>`.
- Do not include raw IP origins.
- Do not include `localhost`, `127.0.0.1`, `0.0.0.0`, or `::1`.
- Do not include production hostnames.
- `SESSION_SECRET` must come from the secret manager and must not be printed.
- `REQUEST_BODY_LIMIT` should remain `5mb` or lower.

Keep existing staging-only backend values from the approved secret manager, including BSC testnet RPC/explorer settings, staging DB, prize hot wallet, tier relayer, and testnet contract addresses. Do not paste those values into docs.

Presence check without printing values:

```bash
cd /srv/disco-funky/app/apps/backend
<secret-manager-run> node - <<'NODE'
const required = [
  'BACKEND_APP_ENV',
  'BACKEND_CORS_ORIGINS',
  'SESSION_SECRET',
  'REQUEST_BODY_LIMIT'
];
const missing = required.filter((key) => !process.env[key]);
console.log(JSON.stringify({ checked: required.length, missing }, null, 2));
process.exit(missing.length ? 1 : 0);
NODE
```

## 9. PM2 Restart

Run from the staging server after env and nginx changes are ready:

```bash
pm2 restart disco-funky-backend-staging --update-env
pm2 restart disco-funky-frontend-staging --update-env
pm2 list
pm2 show disco-funky-backend-staging | grep -E "name|status|script path|exec cwd"
pm2 show disco-funky-frontend-staging | grep -E "name|status|script path|exec cwd"
```

Expected:

- both processes are online.
- backend script path is `dist/src/main.js`.
- cwd values point to `/srv/disco-funky/app/apps/backend` and `/srv/disco-funky/app/apps/frontend`.
- no process points to `var-www`, `Rave_bk`, local desktop folders, old zips, or old Sui/DISCO source.
- PM2 output does not print secret values.

## 10. nginx Verification

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo nginx -T | grep -E "server_name|location /api|proxy_pass|root|alias"
```

Expected:

- `sudo nginx -t` passes.
- `server_name` values are staging hostnames.
- `proxy_pass` points to local staging ports.
- `/api` proxying preserves the `/api` prefix.
- no `root` or `alias` points to old source paths.
- no production hostname appears.

Do not paste full nginx config if it contains private infrastructure details.

## 11. curl Checks

Use HTTPS URLs only:

```bash
curl -fsSI https://<staging-frontend-hostname>
curl -fsS https://<staging-backend-hostname>/api/monitoring/healthcheck
```

If using one shared hostname:

```bash
curl -fsSI https://<staging-frontend-hostname>
curl -fsS https://<staging-frontend-hostname>/api/monitoring/healthcheck
```

Expected:

- frontend responds over HTTPS.
- backend healthcheck responds over HTTPS.
- HTTP requests redirect to HTTPS or are intentionally closed.
- no smoke result relies on `http://<server-ip>`.

## 12. Browser Checks

Open the staging frontend in a browser:

- URL is `https://<staging-frontend-hostname>`.
- browser console does not show CORS errors.
- network requests call the staging HTTPS API URL.
- Socket.IO, if enabled, uses the staging HTTPS/WSS endpoint.
- frontend still uses BSC testnet public RPC.
- no `NEXT_PUBLIC_*` secret names or values appear in built assets or browser logs.

Do not perform tx flows while tBNB remains unfunded.

## 13. No-Tx Smoke Re-Run

After HTTPS migration, re-run no-tx smoke from `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md`.

Minimum expected checks:

- `GET /api/crash/games` returns `410 FEATURE_DISABLED`.
- direct NFT status update remains `410 FEATURE_DISABLED`.
- direct user illustration remains `410 FEATURE_DISABLED`.
- admin protected routes return `401` or `403` without admin auth.
- all-user ticket distribution is not reachable by unauthenticated or general users.
- generic `404` is not treated as protection evidence.
- `/api` prefix is preserved through nginx.

Record only sanitized PASS/FAIL evidence. Do not paste raw cookies, JWTs, Authorization headers, DB URLs, API keys, or private keys.

## 14. Secret Log Scan Re-Run

Flush and restart before scanning current-window logs:

```bash
pm2 flush
pm2 restart disco-funky-backend-staging --update-env
pm2 restart disco-funky-frontend-staging --update-env
pm2 logs disco-funky-backend-staging --lines 500 --nostream > /tmp/backend-staging-last500.log
pm2 logs disco-funky-frontend-staging --lines 500 --nostream > /tmp/frontend-staging-last500.log
grep -E -i "Authorization:|Bearer |JWT_SECRET|SESSION_SECRET|DATABASE_URL|PRIVATE_KEY|api.?key|secret|password|postgres|mysql|mongodb|seed phrase|mnemonic|0x[a-fA-F0-9]{64}" /tmp/backend-staging-last500.log /tmp/frontend-staging-last500.log > /tmp/staging-secret-scan.txt || true
wc -l /tmp/staging-secret-scan.txt
rm -f /tmp/backend-staging-last500.log /tmp/frontend-staging-last500.log /tmp/staging-secret-scan.txt
```

Expected:

- `wc -l` is `0`, or any match is reviewed locally by humans and summarized without raw values.
- no raw secret-like lines are copied into git, PRs, tickets, or chat.

## 15. Excel Upload Human Check

After PR #57 is deployed and the admin route is available:

1. Use an admin-authenticated staging session.
2. Upload a normal Excel metadata file at or below 10MB to `/api/admin/nft/upload/metadata`.
3. Confirm the route works as expected for the valid test file.
4. Upload a test file larger than 10MB.
5. Confirm the upload is rejected by the multer limit.

Do not use production NFT metadata, production user data, or production secrets. Do not treat this check as NFT mint, IPFS, or on-chain verification.

## 16. Rollback Plan

Rollback should restore service without weakening the strict CORS/runtime rules.

Preferred rollback:

1. Revert nginx to the previous known-good staging config.
2. Keep HTTPS domains if certificates are valid.
3. Revert only staging public URLs in the secret manager to the last approved staging HTTPS values.
4. Restart PM2 with `--update-env`.
5. Re-run `sudo nginx -t`, curl checks, and no-tx smoke.

Emergency rollback if HTTPS domain is broken:

- temporarily stop frontend exposure rather than adding raw IP, localhost, or HTTP origins to `BACKEND_CORS_ORIGINS`.
- do not add `http://<server-ip>` to frontend public env.
- do not remove `BACKEND_APP_ENV=staging` to bypass strict CORS.
- do not commit temporary env values.

No-Go if rollback requires allowing raw IP or localhost CORS origins.

## 17. Completion Criteria

STAGE-10 is complete only when humans have recorded sanitized evidence that:

- DNS points staging hostnames to the staging server.
- HTTPS certificates are active for staging hostnames.
- frontend and backend respond over HTTPS.
- frontend public env uses HTTPS staging URLs.
- backend CORS uses only HTTPS staging origins.
- `BACKEND_APP_ENV=staging`, `SESSION_SECRET`, and `REQUEST_BODY_LIMIT` are present without printing values.
- PM2 uses GitHub checkout and `dist/src/main.js` for backend.
- nginx preserves `/api`.
- no-tx smoke still passes.
- secret log scan is clean.
- Excel upload <=10MB works and >10MB is rejected.

This runbook does not approve production launch. tBNB-funded tx verification, contract deploy evidence, Prize transfer evidence, NFT mint evidence, tier tx evidence, post-tx log scan, backup/restore evidence, and production secret-manager verification remain separate gates.
