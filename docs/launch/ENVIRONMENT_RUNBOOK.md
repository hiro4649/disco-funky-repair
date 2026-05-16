# Environment Runbook

Purpose: BSC production must not boot or run with localhost, dummy, example, zero address, test private key, wrong-chain RPC, or hardcoded explorer fallback values. Store real values only in the deployment secret manager. Do not commit `.env` files.

## Backend Production Required Env

Set these for `NODE_ENV=production` before starting `apps/backend`.

| Env | Secret manager | Notes |
| --- | --- | --- |
| `JWT_SECRET` | yes | JWT signing secret. Do not reuse frontend or admin passwords. |
| `SESSION_SECRET` | yes | Express session secret. Required in production/staging runtime. There is no hardcoded fallback. |
| `DATABASE_URL` | yes | Production PostgreSQL URL. Must not be localhost/example. |
| `ADMIN_WALLET_ADDRESS` | yes | Admin wallet address used for admin identity checks. Must be non-zero EVM address. |
| `ADMIN_EMAIL` | yes | Admin login email. |
| `ADMIN_PASSWORD` | yes | Admin login password/credential. |
| `BACKEND_CORS_ORIGINS` | no | Comma-separated backend browser origins. Production/staging values must be HTTPS origins without paths, localhost, raw IPs, dummy/example hosts, or old hardcoded origins. |
| `BACKEND_API_URL` | no | Public backend API origin. Must not be localhost/example. |
| `FRONTEND_APP_URL` | no | Public frontend origin. Must not be localhost/example. |
| `QUICKNODE_HTTP_RPC_URL` | yes | BSC mainnet HTTP RPC URL. |
| `QUICKNODE_WS_RPC_URL` | yes | BSC mainnet WebSocket RPC URL. |
| `ETHERSCAN_API_URL` | yes | BSC explorer API. Use Etherscan V2 with `chainid=56` or a BSCScan mainnet endpoint. Do not use Ethereum mainnet `/api?` fallback. |
| `ETHERSCAN_API_KEY` or `BSCSCAN_API_KEY` | yes | Primary explorer API key. Never log request URLs containing this key. Optional rotation keys may use `ETHERSCAN_API_KEY1`, `ETHERSCAN_API_KEY2`, `BSCSCAN_API_KEY1`, and `BSCSCAN_API_KEY2`. |
| `CHAIN_ID` | no | Must be `56` for BSC production. |
| `TOKEN_CONTRACT_ADDRESS` | no | FUNKY token contract address. Must be non-zero EVM address. |
| `NFT_CONTRACT_ADDRESS` | no | Official NFT contract address. Must be non-zero EVM address. |
| `PRIZE_HOT_WALLET_PRIVATE_KEY` | yes | Prize transfer hot wallet only. No `ADMIN_PRIVATE_KEY` fallback. |
| `PRIZE_TRANSFER_TOKEN_ALLOWLIST` | no | Comma-separated token contract allowlist for prize transfers. Must contain at least one non-zero EVM address. |
| `TIER_RELAYER_PRIVATE_KEY` | yes | Tier relayer only. No `ADMIN_PRIVATE_KEY` fallback. |
| `TIER_UPDATER_CONTRACT_ADDRESS` | no | FunkyTierUpdater contract address. Must be non-zero EVM address. |

`validateEnvs()` runs at backend startup. In production it fails fast if a required value is missing or unsafe. It does not log secret values.

Explorer API key resolution uses this runtime order: `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, `ETHERSCAN_API_KEY1`, `ETHERSCAN_API_KEY2`, `BSCSCAN_API_KEY1`, `BSCSCAN_API_KEY2`. The same order is used by production validation and runtime request builders.

Backend CORS is controlled only by `BACKEND_CORS_ORIGINS` in production/staging. Staging should set `BACKEND_APP_ENV=staging` so the runtime also rejects missing or unsafe CORS origins when BSC testnet values are used. Do not rely on code-hardcoded production domains, local desktop hosts, or raw IP origins. The backend request body parser defaults to `5mb`; `REQUEST_BODY_LIMIT` may be set lower or up to `5mb`, but larger values are rejected in production.

`BACKEND_APP_ENV` is not a secret. Use `BACKEND_APP_ENV=staging` only for staging; leave it unset for production unless a future runbook explicitly defines another value.

## Frontend Production Public Env

Only non-secret public values may use `NEXT_PUBLIC_`.

| Env | Secret manager | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | no | Public backend API origin. Must not be localhost/example. |
| `NEXT_PUBLIC_APP_URL` | no | Public frontend origin. Must not be localhost/example. |
| `NEXT_PUBLIC_APP_NAME` | no | Display token/app name. |
| `NEXT_PUBLIC_APP_ENV` | no | Optional frontend validation mode. Leave unset or set to `production` for production. Set to `staging` only for staging. |
| `NEXT_PUBLIC_RPC_URL` | no | Required public BSC mainnet RPC endpoint for read-only browser calls. |
| `NEXT_PUBLIC_ALCHEMY_RPC_URL` | no | Optional public BSC RPC override. If set, it is used before `NEXT_PUBLIC_RPC_URL` and must pass the same production validation. If unset, `NEXT_PUBLIC_RPC_URL` is required and used. |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | no | FUNKY token contract address. |
| `NEXT_PUBLIC_NFT_ADDRESS` | no | Official NFT contract address. |
| `NEXT_PUBLIC_SOCKET_API_URL` | no | Optional public Socket.IO endpoint. If unset in production, realtime browser updates stay disabled. |
| `NEXT_PUBLIC_ETHERSCAN_EXPLORER` | no | Optional public explorer base URL. |

Frontend production build rejects configured unsafe public values such as localhost/example/dummy/testnet hosts, zero contract addresses, invalid URLs, and any `NEXT_PUBLIC_*PRIVATE_KEY` / `NEXT_PUBLIC_*SECRET` style env. If required public env is missing, the build remains safe and API/on-chain dependent features stay disabled until deployment config is fixed. Missing app metadata uses a non-local disabled sentinel URL only so static metadata generation does not point to localhost.

Production and default frontend validation also reject BSC testnet markers such as `prebsc`, `bsc-testnet`, and `bnb-testnet`, plus Ethereum mainnet-looking RPC URLs such as `eth.llamarpc.com` or `mainnet.infura.io`.

## Frontend Staging Public Env

Next.js build runs with `NODE_ENV=production`, so staging must opt in explicitly:

- Set `NEXT_PUBLIC_APP_ENV=staging` for staging frontend builds.
- Leave `NEXT_PUBLIC_APP_ENV` unset or set it to `production` for production builds.
- Any other value is invalid when `NODE_ENV=production`.

Staging mode allows BSC testnet browser values only where they are expected:

- `NEXT_PUBLIC_RPC_URL` may point to a public BSC testnet RPC.
- `NEXT_PUBLIC_ALCHEMY_RPC_URL` may point to a public BSC testnet RPC and, if set, is used before `NEXT_PUBLIC_RPC_URL`.
- `NEXT_PUBLIC_ETHERSCAN_EXPLORER` must be `https://testnet.bscscan.com`.

Staging RPC URL validation is static. It allows only URLs that clearly look like BSC testnet, such as `prebsc`, `bsc-testnet`, or `bnb-testnet` hosts/paths, and rejects BSC mainnet-looking, Ethereum mainnet, Sepolia, Goerli, localhost, dummy, example, empty, and invalid URLs. This does not cryptographically prove chain ID; humans must still confirm the configured RPC reports BSC testnet chain ID `97` during STAGE verification.

Staging mode still rejects unsafe browser public values:

- `NEXT_PUBLIC_API_URL` must be a public staging API URL, not localhost or `127.0.0.1`.
- `NEXT_PUBLIC_SOCKET_API_URL` must be a public staging Socket.IO/API URL when set, not localhost or `127.0.0.1`.
- `NEXT_PUBLIC_APP_URL` must be a public staging frontend URL, not localhost or `127.0.0.1`.
- `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*ADMIN_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*HOT_WALLET`, and `NEXT_PUBLIC_*JWT` are forbidden in every mode.

Staging public URLs should use the staging domain or a temporary public IP URL approved for staging. Do not use browser-facing `NEXT_PUBLIC_*` values that point to the server's loopback address.

## Forbidden Env And Fallbacks

Never set these in frontend, hosting, CI, Docker, PM2, or static build settings:

- `NEXT_PUBLIC_ADMIN_PRIVATE_KEY`
- `NEXT_PUBLIC_*PRIVATE_KEY`
- `NEXT_PUBLIC_*SECRET`
- `NEXT_PUBLIC_*ADMIN_KEY`
- `NEXT_PUBLIC_*OWNER_KEY`
- `NEXT_PUBLIC_*RELAYER_KEY`
- `NEXT_PUBLIC_*HOT_WALLET`
- `NEXT_PUBLIC_*JWT`

Never use these in production backend or frontend values:

- localhost / `127.0.0.1` / `0.0.0.0` / `::1`
- dummy / example / placeholder / changeme / todo
- zero EVM address
- zero private key
- known local test private keys
- BSC testnet `CHAIN_ID=97`
- BSC testnet markers such as `prebsc`, `bsc-testnet`, `bnb-testnet`, Sepolia, Goerli, Ethereum mainnet, dummy, example, or localhost RPC/explorer URLs
- Ethereum mainnet explorer fallback `https://api.etherscan.io/api?`
- raw explorer/RPC request URLs in logs when they include query strings or API keys

## Deployment Checks

Backend:

```bash
cd apps/backend
NODE_ENV=production npm run build
NODE_ENV=production node dist/src/main.js
```

The backend runtime listen entrypoint is `dist/src/main.js`. `apps/backend/src/app/index.ts` builds and exports the Express app, HTTP server, and Socket.IO instance, but does not call `listen`. The production start must fail if required env is missing or unsafe. Run this only with secrets injected by the deployment secret manager.

Frontend:

```bash
cd apps/frontend
npm run build
node env.validation.test.mjs
```

Then verify the host/CI settings contain no forbidden `NEXT_PUBLIC_*` secret env and that public URLs/contract addresses match BSC production.

## Human Verification Before Launch

- Confirm PM2/Docker/nginx uses GitHub `apps/backend` and `apps/frontend`, not `var-www`, `Rave_bk`, or older Sui/DISCO copies.
- Confirm backend production env is injected from the secret manager and no `.env` file is committed or copied from development.
- Confirm the explorer endpoint is BSC mainnet and explorer request logs do not include query strings or API keys.
- Confirm hot wallet and tier relayer keys are separate accounts with only the minimum required funds/roles.
- Confirm governance/fee/DEX/pair operations are handled by `docs/launch/GOVERNANCE_RUNBOOK.md`, multisig, and timelock, not backend or frontend direct signing.
