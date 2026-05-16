# STAGE-10B Domain Pending Staging Operation Freeze Note

Status: staging operation freeze while the HTTPS staging domain is not decided.

This note defines what must stop and what may continue until a staging HTTPS domain is selected and configured. It is documentation-only. It does not approve production launch, does not complete transaction-based verification, and does not store secrets.

Do not paste, commit, or store raw `.env` output, secret-manager values, API keys, private keys, DB connection strings, JWT/session secrets, cookies, Authorization headers, production logs, or DB dumps in this repository, PRs, tickets, chat, or shared notes.

## 1. Current State

The current staging state is:

- PR #56 introduced backend runtime hardening:
  - `BACKEND_CORS_ORIGINS` controls browser CORS origins.
  - strict staging/production runtime requires HTTPS origins.
  - `SESSION_SECRET` must be present without relying on a hardcoded fallback.
  - global request body limit is reduced from the old 1GB behavior.
- PR #57 reduced admin Excel upload limit to 10MB.
- PR #58 added the HTTPS staging domain migration runbook.
- A staging HTTPS domain is not decided yet.
- HTTPS staging migration is not completed yet.
- The existing `http://<server-ip>` staging access is temporary no-tx verification only.
- BNB/tBNB is not funded, so transaction-based checks remain stopped.
- PR #59 was a pending evidence template, not actual HTTPS migration evidence, and must not be treated as proof that migration happened.

## 2. Freeze Reason

After PR #56, casually pulling latest `main` and restarting staging can break the running backend if the staging server is still using temporary `http://<server-ip>` access.

The strict runtime expects a real HTTPS staging origin in `BACKEND_CORS_ORIGINS`. If a domain is not ready and the server is restarted with incomplete env, the backend can fail fast or reject browser traffic as designed.

This is expected security behavior, not something to bypass by weakening staging env.

## 3. Hard Stop Until Domain Decision

Do not do the following until the staging HTTPS domain is decided and STAGE-10 can be followed:

- Do not casually run `git pull` and `pm2 restart` on staging for PR #56 or later `main`.
- Do not add `http://<server-ip>` to `BACKEND_CORS_ORIGINS`.
- Do not add `localhost`, `127.0.0.1`, raw IP origins, or HTTP origins to `BACKEND_CORS_ORIGINS`.
- Do not remove or downgrade `BACKEND_APP_ENV=staging` to avoid strict CORS behavior.
- Do not bypass strict CORS by switching staging into a loose development-like runtime.
- Do not print or record `SESSION_SECRET`; confirm presence only.
- Do not run contract deploys, token transfers, NFT minting, tier relayer transactions, or governance transactions.
- Do not mark tx verification as PASS while tBNB is unfunded.
- Do not declare production ready.

## 4. Temporary HTTP Staging Rules

The current `http://<server-ip>` staging access is only a temporary no-tx inspection environment.

It is not production-equivalent and must not be used as proof for:

- production CORS readiness;
- HTTPS frontend/backend readiness;
- cookie security;
- browser mixed-content safety;
- production launch approval;
- tx readiness;
- on-chain contract behavior.

Do not normalize `http://<server-ip>` into staging config just to keep the old temporary view working.

## 5. Env Rules During Freeze

### Backend

Required rule:

- `BACKEND_APP_ENV=staging` must stay the intended staging mode after PR #56.

Do not use these as CORS origins:

- `http://<server-ip>`
- `http://localhost`
- `http://127.0.0.1`
- raw IP origins
- production domains
- any non-HTTPS browser origin

`BACKEND_CORS_ORIGINS` must wait for the real HTTPS staging origin.

`SESSION_SECRET`:

- confirm presence only;
- never show the value;
- never store the value in docs, PRs, tickets, chat, logs, or shell history.

### Frontend

Do not set frontend public env to permanent `http://<server-ip>` values after PR #56.

After the domain is selected, frontend public env must use HTTPS staging URLs for:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_API_URL`

Do not add any `NEXT_PUBLIC_*PRIVATE_KEY`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*ADMIN_KEY`, `NEXT_PUBLIC_*OWNER_KEY`, `NEXT_PUBLIC_*RELAYER_KEY`, `NEXT_PUBLIC_*HOT_WALLET`, or `NEXT_PUBLIC_*JWT`.

## 6. Excel Upload Check Timing

PR #57 reduced admin Excel upload limit to 10MB.

The human Excel upload check should be done after HTTPS staging migration, because the admin browser path should be validated through the final HTTPS staging origin.

Do not use this check as proof of:

- NFT minting;
- IPFS upload completion;
- on-chain metadata behavior;
- production readiness.

## 7. Tx Freeze

BNB/tBNB is not funded. Until funding and explicit tx verification resumes, do not perform:

- FUNKY token deploy;
- NFT contract deploy;
- FunkyTierUpdater deploy;
- Prize `sendToWallet`;
- real token transfer;
- NFT mint;
- tier downgrade/reset tx;
- governance, fee, DEX, pair, factory, or fee exemption tx;
- any action that spends gas or mutates BSC testnet/mainnet state.

These items remain BLOCKED and must not be marked PASS.

## 8. Work Allowed During Freeze

The following work may continue:

- docs cleanup;
- GitHub static audit;
- runbook improvements;
- staging domain candidate discussion;
- DNS planning;
- secret-manager checklist updates without values;
- tBNB preparation planning without sending tx;
- review of PRs that are docs-only or no-tx static hardening.

## 9. Work Not Allowed During Freeze

The following work is not allowed:

- casual staging `git pull` plus `pm2 restart` for PR #56+ `main`;
- adding raw IP, localhost, or HTTP origins to `BACKEND_CORS_ORIGINS`;
- disabling or weakening strict staging CORS;
- removing `BACKEND_APP_ENV=staging` to force startup;
- printing raw env values;
- creating or committing `.env` files;
- storing API keys, private keys, DB URLs, JWT/session secrets, or Authorization headers;
- tx verification;
- production ready declarations.

## 10. Resume Conditions

Resume staging migration only after all of the following are true:

1. A staging HTTPS domain is selected.
2. DNS can point the staging hostname to the staging server.
3. The operator is ready to follow `docs/launch/STAGING_HTTPS_DOMAIN_MIGRATION_RUNBOOK.md`.
4. Backend secret manager or deployment wrapper has a non-printed `SESSION_SECRET`.
5. `BACKEND_CORS_ORIGINS` can be set to the HTTPS staging origin only.
6. Frontend public env can be updated to HTTPS staging URLs.
7. nginx can be updated with the staging `server_name`.
8. certbot / certificate issuance can be performed for staging hostname only.
9. PM2 restart and no-tx smoke can be rerun immediately after migration.
10. secret log scan can be rerun after PM2 flush/restart.

After these are ready, return to:

- `docs/launch/STAGING_HTTPS_DOMAIN_MIGRATION_RUNBOOK.md`
- `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md`

Do not use PR #59 as completed evidence. Create a real evidence report only after the HTTPS migration has actually been performed and sanitized PASS/FAIL results are available.

## 11. No-Go Conditions

Do not proceed if any of the following are true:

- staging domain is still undecided;
- HTTPS certificate cannot be issued;
- `BACKEND_CORS_ORIGINS` would require raw IP, localhost, HTTP, or production origin;
- `SESSION_SECRET` cannot be confirmed present without printing it;
- frontend public env would still point to `http://<server-ip>`;
- no-tx smoke cannot be rerun after migration;
- secret log scan cannot be rerun after migration;
- tBNB is still unfunded but tx verification is being requested;
- anyone asks to call this production ready.

## 12. Production Launch Status

Production launch approval: NO.

This freeze note only prevents unsafe staging operations while the HTTPS staging domain is pending. It does not prove HTTPS migration, no-tx smoke success, tx behavior, contract behavior, or production readiness.
