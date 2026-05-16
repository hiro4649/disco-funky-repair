# Staging No-Tx Smoke Runbook

Status: P1-02 staging no-tx smoke documentation.

This runbook covers checks that can be repeated before BNB/tBNB funding. It does not send BSC testnet transactions and does not approve production launch.

Do not paste, commit, or store raw `.env` files, private keys, API keys, JWTs, cookies, Authorization headers, DB URLs, RPC URLs, nginx full configs, PM2 full env output, or DB dumps in this repository, PRs, tickets, or chat.

## 1. Preconditions

- staging backend and frontend are running from the GitHub clone.
- PM2 process names include `staging`.
- nginx is active.
- staging DB migration has already been applied.
- BNB/tBNB has not been funded, so tx-based checks are out of scope.
- Use only staging hostnames or the approved staging API base URL.

Use placeholders in notes:

- `<staging-api-base>` means the public staging API origin that routes to backend `/api`.
- `<nft-id>` means a non-secret test NFT id value.
- Do not record cookies, bearer tokens, or real secret-manager values.

## 2. nginx `/api` Proxy Rule

The staging reverse proxy must preserve the backend `/api` prefix.

Correct pattern when frontend and API share one hostname:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:<backend-port>/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

The proxy must not strip `/api` and forward `/nft/:id`, `/referral/...`, or `/admin/...` directly to backend root.

No-Go:

- `location /api/` forwards to backend without preserving `/api` and causes route mismatch.
- smoke tests return `404` because nginx stripped or rewrote the prefix.
- nginx points to production backend, old `var-www`, `Rave_bk`, local desktop folders, downloaded zips, or old Sui/DISCO source.

Validate nginx with sudo:

```bash
sudo nginx -t
sudo nginx -T | grep -E "server_name|location /api|proxy_pass|root|alias"
```

Do not paste full nginx config if it includes private hostnames or sensitive operational details. Record only PASS/FAIL and sanitized snippets if needed.

## 3. Status Code Interpretation

Treat status codes consistently:

| Status | Meaning in no-tx smoke | Evidence use |
| --- | --- | --- |
| `410 FEATURE_DISABLED` | The intended MVP-disabled route was reached and refused by application code. | Valid evidence for disabled direct routes. |
| `401 Unauthenticated` | Auth middleware rejected missing credentials before protected handler. | Valid evidence for admin/auth protected routes in no-auth smoke. |
| `403 Forbidden` | Authenticated user exists but lacks ownership or admin rights. | Valid evidence for normal-user negative smoke. |
| `404 Not Found` | Route was not found by nginx or backend. | Do not treat as protection success unless the expected behavior for that exact route is documented as unreachable. |

For P0/P1 protected routes, a `404` can mean the wrong path, stripped `/api` prefix, wrong hostname, wrong HTTP method, old source, or missing deploy. Recheck nginx and route path before marking the control as passed.

## 4. No-Auth Smoke Targets

Run with no cookie and no Authorization header. Record status code and sanitized response code/message only.

```bash
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X PATCH "<staging-api-base>/api/nft/<nft-id>"
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X POST "<staging-api-base>/api/user/illustration" -H "Content-Type: application/json" --data '{}'
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X POST "<staging-api-base>/api/referral/admin/run-snapshot"
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X POST "<staging-api-base>/api/referral/admin/distribute-rewards"
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X POST "<staging-api-base>/api/alluser/distribute/ticket" -H "Content-Type: application/json" --data '{}'
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X GET "<staging-api-base>/api/admin/nfts"
curl -sS -o /tmp/no-tx-response.json -w "%{http_code}\n" -X GET "<staging-api-base>/api/admin/ticket-distribution"
rm -f /tmp/no-tx-response.json
```

Expected results:

| Target | Method | Expected |
| --- | --- | --- |
| disabled direct NFT status update | `PATCH /api/nft/<nft-id>` | `410` with `FEATURE_DISABLED`. |
| disabled direct user illustration assignment | `POST /api/user/illustration` | `410` with `FEATURE_DISABLED`. |
| referral admin snapshot | `POST /api/referral/admin/run-snapshot` | `401 Unauthenticated` without admin credentials. |
| referral admin distribution | `POST /api/referral/admin/distribute-rewards` | `401 Unauthenticated` without admin credentials. |
| all-user ticket distribution | `POST /api/alluser/distribute/ticket` | `401 Unauthenticated` without admin credentials. |
| admin NFT listing | `GET /api/admin/nfts` | `401 Unauthenticated` without admin credentials. |
| admin ticket distribution listing | `GET /api/admin/ticket-distribution` | `401 Unauthenticated` without admin credentials. |

Confirmed staging no-tx evidence has observed:

- disabled direct NFT status update: `410 FEATURE_DISABLED`.
- disabled direct user illustration: `410 FEATURE_DISABLED`.
- referral admin routes: `401 Unauthenticated`.
- all-user ticket distribution: `401 Unauthenticated`.
- admin NFTs: `401 Unauthenticated`.
- admin ticket distribution: `401 Unauthenticated`.

## 5. Non-Tx Operational Evidence

Record PASS/FAIL only:

- Prisma migrations are applied.
- PM2 backend is online.
- PM2 frontend is online.
- nginx is active.
- `sudo nginx -t` passes.
- BSC testnet RPC reports chain ID `97`.
- frontend build succeeds.
- backend build/test succeeds.
- frontend env validation succeeds with `NEXT_PUBLIC_APP_ENV=staging`.

Do not paste raw command output if it includes env, headers, cookies, DB URLs, RPC URLs, API keys, private hostnames, or log lines with secrets.

## 6. Secret Log Scan After Flush And Restart

For a clean no-tx log scan, flush PM2 logs after the intended restart and before running smoke checks.

```bash
pm2 flush
pm2 restart disco-funky-backend-staging --update-env
pm2 restart disco-funky-frontend-staging --update-env
```

After smoke checks:

```bash
pm2 logs disco-funky-backend-staging --lines 500 --nostream > /tmp/backend-staging-last500.log
pm2 logs disco-funky-frontend-staging --lines 500 --nostream > /tmp/frontend-staging-last500.log
grep -E -i "Authorization:|Bearer |JWT_SECRET|DATABASE_URL|PRIVATE_KEY|api.?key|apikey=|secret=|password=|postgres|mysql|mongodb|seed phrase|mnemonic|rpc" /tmp/backend-staging-last500.log /tmp/frontend-staging-last500.log > /tmp/staging-secret-scan.txt
wc -l /tmp/staging-secret-scan.txt
rm -f /tmp/backend-staging-last500.log /tmp/frontend-staging-last500.log /tmp/staging-secret-scan.txt
```

Expected:

- `wc -l` is `0`.
- If non-zero, inspect privately and open a redaction task.
- Do not paste matching lines into git, PRs, tickets, or chat.

Forbidden log or response content:

- raw JWT.
- Authorization header.
- cookie value.
- private key.
- API key.
- DB URL.
- RPC URL with query string.
- explorer URL with API key.
- seed phrase or mnemonic.
- secret-manager value.

## 7. Frontend `MISSING_MESSAGE` Check

After frontend restart, check whether staging-only message keys are still missing.

```bash
pm2 logs disco-funky-frontend-staging --lines 300 --nostream > /tmp/frontend-staging-last300.log
grep -F "MISSING_MESSAGE" /tmp/frontend-staging-last300.log > /tmp/frontend-missing-message.txt || true
wc -l /tmp/frontend-missing-message.txt
rm -f /tmp/frontend-staging-last300.log /tmp/frontend-missing-message.txt
```

Expected:

- `wc -l` is `0` for the known staging keys fixed in P1-01:
  - `Menu.Explore FUNKY Staging RAVE`.
  - `Home.Hold FUNKY Staging Get Ticket`.
  - `Home.Explore FUNKY Staging RAVE`.

If new `MISSING_MESSAGE` keys appear, record only the key namespace/name and locale. Do not paste full logs if they contain request data or env details.

## 8. Out Of Scope Until tBNB Funding

Do not run tx-based checks before BNB/tBNB funding:

- FUNKY token deploy or write calls.
- NFT contract deploy, mint enable, mint, owner transfer, or metadata write calls.
- FunkyTierUpdater deploy or reason-coded tier sync calls.
- Prize sendToWallet or receipt retry.
- Governance, fee, DEX, pair, factory, or fee-recipient transactions.
- Any command that signs or broadcasts a transaction.

These checks require the tx receipt evidence process in `docs/launch/STAGING_TESTNET_VERIFICATION_RUNBOOK.md`.

## 9. Production Boundary

Passing this no-tx smoke means only that selected staging routes and operational controls behaved as expected without funded blockchain transactions.

It is not:

- BSC testnet verification completion.
- production secret-manager approval.
- production deploy approval.
- production launch approval.

Production remains blocked until no-tx evidence, tx receipt evidence, production secret-manager review, deploy source confirmation, backup/restore proof, monitoring/log rotation checks, and human launch-owner sign-off are complete.
