# FUNKY No-Tx Runtime Env Preflight

Checked main commit: `4f7d8a47fd9c5256a3007381c5439dc017f88229`

## Purpose

This checklist defines the environment preflight needed before a future no-tx runtime smoke for DISCO.fan / FUNKY.fan.
It records env names and validation rules only.
Do not record env values.

The staging domain is undecided, so do not reflect changes to real staging.
tBNB is not funded, so do not run deploy, mint, sendToWallet, tier tx, governance tx, or any other tx-based check.
This project is not production ready.

## Output Rules

- Check env names only.
- Report each item as `exists`, `missing`, `invalid`, or `masked`.
- Do not print raw secret values, raw DB URLs, raw RPC credentials, JWTs, cookies, Authorization headers, or raw env dumps.
- Do not treat tx-dependent items as PASS while tBNB is not funded.
- Do not mix staging and production.

## Backend Runtime Env Items

Confirm these backend env names exist and are scoped to staging:

- `BACKEND_APP_ENV=staging`
- `BACKEND_CORS_ORIGINS`
- `SESSION_SECRET`
- `REQUEST_BODY_LIMIT`
- `DATABASE_URL`
- `QUICKNODE_HTTP_RPC_URL`
- `QUICKNODE_WS_RPC_URL`
- `CHAIN_ID=97`
- `ETHERSCAN_API_URL` or BSC testnet explorer/API URL env
- `TOKEN_CONTRACT_ADDRESS`
- `NFT_CONTRACT_ADDRESS`
- `TIER_UPDATER_CONTRACT_ADDRESS`
- `STAGING_DEPLOYER_ADDRESS`
- `PRIZE_HOT_WALLET_ADDRESS`
- `TIER_RELAYER_ADDRESS`

## Frontend Public Env Items

Confirm these frontend public env names exist and are scoped to staging:

- `NEXT_PUBLIC_APP_ENV=staging`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_API_URL`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_ETHERSCAN_EXPLORER`
- `NEXT_PUBLIC_NFT_ADDRESS`
- `NEXT_PUBLIC_TOKEN_ADDRESS`

## Forbidden Env

The following must not exist in frontend public env:

- `NEXT_PUBLIC_PRIVATE_KEY`
- `NEXT_PUBLIC_*SECRET`
- `NEXT_PUBLIC_*JWT`
- `NEXT_PUBLIC_*DATABASE*`
- `NEXT_PUBLIC_*AUTHORIZATION*`
- any public env that contains a private key or seed phrase

Do not display raw `DATABASE_URL`.
Do not display raw secret values.

## Preflight Checks

- Confirm BSC testnet chainId is `97`.
- Confirm production chainId `56` is not used for staging.
- Confirm `BACKEND_CORS_ORIGINS` does not contain `http://IP`, `localhost`, or a raw IP origin.
- Treat `BACKEND_CORS_ORIGINS` as not final until the staging domain is decided.
- Confirm `SESSION_SECRET` exists without printing its value.
- Confirm `DATABASE_URL` exists without printing its value.
- Confirm RPC URL env exists and points to BSC testnet by provider metadata or masked hostname review.
- Confirm frontend public env has no secret-like names.
- Confirm admin auth remains cookie-only and does not require frontend JavaScript to hold an admin token.
- Confirm no general UI path needs an admin Authorization header.
- Before no-tx smoke, confirm pm2, nginx, and runtime env wiring without printing raw env.
- Run runtime secret log scan only after the runtime has been reflected and smoked.

## No-Tx Smoke Preparation Items

Prepare these checks for the future no-tx runtime smoke:

- backend build
- frontend build
- backend env validation
- frontend env validation
- `nginx -t`
- `pm2 status`
- healthcheck
- admin auth cookie-only check
- public catalog/status route check
- Crash game remains not installed
- Excel upload 10MB check
- static asset image-only check
- secret log scan

## BLOCKED Items

These remain BLOCKED or UNKNOWN until real evidence exists:

- staging domain undecided
- HTTPS not configured
- real staging reflection not executed
- runtime smoke not executed
- runtime secret log scan not executed
- tBNB not funded
- deploy tx not executed
- NFT mint tx not executed
- Prize sendToWallet tx not executed
- tier tx not executed
- governance tx not executed

Do not mark these items PASS without the required staging, runtime, funding, or receipt evidence.
