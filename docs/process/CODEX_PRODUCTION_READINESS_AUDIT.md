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

## Backend CORS Origin Labels

The auditor validates `BACKEND_CORS_ORIGINS` as production CORS origins.
Entries are comma-separated origins and must be HTTPS origins only.

The auditor fails unsafe CORS origin shapes:

- localhost or loopback hosts
- raw IP hosts
- example or invalid hosts
- path, query, or hash components
- malformed URL origins

The auditor does not print CORS values.
It reports safe labels only, such as `cors_origin_invalid`, `cors_origin_not_https`, `cors_origin_localhost_or_ip`, `cors_origin_example_or_invalid`, or `cors_origin_has_path_query_or_hash`.
The audit does not prove the production value itself; it only returns `PASS`, `FAIL`, or `PENDING` when run inside the deployment environment.

## Runtime Evidence Labels

The script does not perform network calls. Runtime evidence is `NOT_RUN` unless the deployment environment supplies a label:

- `CODEX_RUNTIME_EVIDENCE=PASS`
- `CODEX_RUNTIME_EVIDENCE=FAIL`
- `CODEX_RUNTIME_EVIDENCE=NOT_RUN`

Rollback plan evidence is `PENDING` unless the deployment environment supplies:

- `CODEX_ROLLBACK_PLAN_STATUS=PASS`
- `CODEX_ROLLBACK_PLAN_STATUS=FAIL`
- `CODEX_ROLLBACK_PLAN_STATUS=PENDING`

## Deployment Source Labels

Deployment source is checked by comparing an expected source SHA with an observed deployed SHA.
The expected SHA must be supplied with one of:

- `CODEX_EXPECTED_SOURCE_SHA`
- `EXPECTED_DEPLOYED_SOURCE_SHA`

The expected SHA is a commit SHA only and is not a secret, but the auditor still does not print it.
Observed deployed SHA values are also never printed.

Deployment source status rules:

- expected SHA missing: `deploymentSourceCheck` is `PENDING`
- observed SHA missing: `deploymentSourceCheck` is `PENDING`
- expected and observed SHA match: `deploymentSourceCheck` is `PASS`
- expected and observed SHA mismatch: `deploymentSourceCheck` is `FAIL`

The auditor may emit only safe deployment source labels:

- `expected_source_sha_missing`
- `observed_source_sha_missing`
- `deployed_source_sha_matched`
- `deployed_source_sha_mismatch`

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
