# Production Readiness Zero-Disclosure Audit

This audit records deployment readiness labels without printing production values.

Run it only in the environment that receives the real deployment, hosting, or CI build variables.
Do not copy values into chat, files, PR bodies, or logs.
Do not create `.env` files for this audit.

## Command

```sh
node scripts/codex-production-readiness-audit.mjs
```

The script uses only Node.js standard library APIs and reads `process.env`.
It prints safe JSON only:

- `PASS`
- `FAIL`
- `PENDING`
- `NOT_RUN`
- environment variable names when missing

It does not print secret values, endpoint values, database URLs, private keys, JWT secrets, raw logs, raw payloads, or `NEXT_PUBLIC_*` values.

## Required Frontend Public Names

The frontend production validation requires these names to exist in the frontend deployment or CI build environment:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_NFT_ADDRESS`

Optional public names are validated if present:

- `NEXT_PUBLIC_ALCHEMY_RPC_URL`
- `NEXT_PUBLIC_SOCKET_API_URL`
- `NEXT_PUBLIC_ETHERSCAN_EXPLORER`

Do not set public secret-like names such as `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*JWT`, `NEXT_PUBLIC_*HOT_WALLET`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, or `NEXT_PUBLIC_*ADMIN_KEY`.

## Runtime Evidence Labels

The script does not perform network calls. Runtime evidence is `NOT_RUN` unless the deployment environment supplies a label:

- `CODEX_RUNTIME_EVIDENCE=PASS`
- `CODEX_RUNTIME_EVIDENCE=FAIL`
- `CODEX_RUNTIME_EVIDENCE=NOT_RUN`

Rollback plan evidence is `PENDING` unless the deployment environment supplies:

- `CODEX_ROLLBACK_PLAN_STATUS=PASS`
- `CODEX_ROLLBACK_PLAN_STATUS=FAIL`
- `CODEX_ROLLBACK_PLAN_STATUS=PENDING`

Deployment source is checked from safe commit SHA variables such as `DEPLOYED_SOURCE_SHA`, `GITHUB_SHA`, or provider commit SHA variables.
Only the status is reported.

## Strict Mode

By default the command exits `0` even when the JSON contains `FAIL` or `PENDING`, so CI can collect the safe report.
To fail the process when blockers remain, set:

```sh
CODEX_PRODUCTION_READINESS_AUDIT_STRICT=1 node scripts/codex-production-readiness-audit.mjs
```

## Interpretation

This audit never claims production readiness.
`productionReadyClaim` is always `NO`.
Humans must separately confirm deployment source, runtime evidence, BSC production configuration, and rollback readiness without exposing values.
