# Staging No-Tx Evidence Report

Status: FUNKY-STAGE-08 no-tx staging evidence consolidation.

This report consolidates staging checks that can be completed before BNB/tBNB funding. It records only non-secret status and references. It does not include raw `.env` files, private keys, API keys, JWTs, DB connection strings, RPC URLs with keys, PM2 raw logs, nginx full configs, DB dumps, or secret-manager output.

Repeatable smoke steps and route expectations are documented in `docs/launch/STAGING_NO_TX_SMOKE_RUNBOOK.md`.

This report is not a production launch approval.

## 1. Confirmed Commit

Repository: `hiro4649/disco-funky-repair`

Checked commit for this consolidation:

- `69a41252fae51a94a759e0600d4396bf5630c6d1`
- Short SHA: `69a4125`
- Subject: `fix: add staging frontend message keys (#46)`

Human operators must confirm the running staging server is on this same commit, or record the exact running commit in the external staging evidence store before continuing to tx-based checks.

## 2. Staging Server Configuration

The current staging evidence is treated as a Sakura Cloud single-server staging layout, consistent with `docs/launch/STAGING_SAKURA_SINGLE_SERVER_PLAN.md`.

Expected staging components on the single server:

- GitHub clone of `hiro4649/disco-funky-repair`.
- `apps/backend` running under PM2.
- `apps/frontend` running under PM2.
- PostgreSQL staging DB.
- nginx reverse proxy.
- PM2/nginx/application logs.
- staging-only secret injection outside git.

Rules that remain required:

- Deploy source must be the GitHub clone, not `Rave_bk`, `Rave`, `var-www`, downloaded zips, local desktop folders, or old Sui/DISCO source trees.
- Staging must use staging-only DB, staging-only secrets, staging-only wallets, and BSC testnet settings.
- No production secret, production DB, production wallet, production contract, or production user data may be used.

## 3. No-Tx Evidence Completed

The following no-tx checks are recorded as completed from the current staging evidence. Raw logs and secret-bearing outputs are intentionally not stored in this repository.

| Check | Status | Non-secret evidence expectation |
| --- | --- | --- |
| PM2 backend online | PASS | PM2 shows the backend staging process online from the GitHub checkout. |
| PM2 frontend online | PASS | PM2 shows the frontend staging process online from the GitHub checkout. |
| nginx active | PASS | nginx service is active and `sudo nginx -t` passes. |
| nginx `/api` prefix preserved | PASS | no-tx smoke routes reached backend `/api` handlers; `/api` was not stripped by proxying. |
| frontend build | PASS | `apps/frontend` build completed on staging. |
| backend build | PASS | `apps/backend` build completed on staging. |
| backend tests | PASS | `apps/backend` tests completed on staging. |
| Prisma migration deploy | PASS | Baseline migration deployed successfully to the staging DB. |
| Prisma Client generation | PASS | Prisma Client generated after migration deploy. |
| frontend env validation | PASS | staging frontend env validation completed with `NEXT_PUBLIC_APP_ENV=staging`. |
| BSC testnet RPC chain ID | PASS | RPC returned chain ID `97`. |
| secret log scan | PASS | No raw JWT, Authorization header, cookie value, private key, API key, DB URL, RPC URL with query string, explorer API-key URL, or seed phrase was reported in scanned logs. |
| DB schema dump | PASS | DB schema dump evidence is saved outside git; no dump content is committed here. |

## 3A. No-Tx Smoke Route Evidence

The current no-tx smoke verified these route outcomes without cookies, bearer tokens, or funded blockchain transactions:

| Target | Method and path | Expected | Observed |
| --- | --- | --- | --- |
| disabled direct NFT status update | `PATCH /api/nft/<nft-id>` | `410 FEATURE_DISABLED` | PASS |
| disabled direct user illustration | `POST /api/user/illustration` | `410 FEATURE_DISABLED` | PASS |
| referral admin snapshot | `POST /api/referral/admin/run-snapshot` | `401 Unauthenticated` | PASS |
| referral admin reward distribution | `POST /api/referral/admin/distribute-rewards` | `401 Unauthenticated` | PASS |
| all-user ticket distribution | `POST /api/alluser/distribute/ticket` | `401 Unauthenticated` | PASS |
| admin NFTs | `GET /api/admin/nfts` | `401 Unauthenticated` | PASS |
| admin ticket distribution | `GET /api/admin/ticket-distribution` | `401 Unauthenticated` | PASS |
| Crash game API not installed | `GET /api/crash/games` | `404 Not Found` because the Crash route is not mounted. | PASS with Crash-specific conditions |

Status interpretation:

- `410 FEATURE_DISABLED` proves the disabled application handler was reached and refused the route.
- `401 Unauthenticated` proves auth middleware rejected the no-auth request before the protected handler.
- `403 Forbidden` is expected for authenticated users lacking ownership or admin rights.
- `404 Not Found` is not protection evidence for these routes. It usually means wrong path, stripped `/api` prefix, wrong HTTP method, wrong hostname, old source, or missing deploy.
- Exception: Crash game is intentionally not installed. `/api/crash/games` returning `404` is expected only if `initCrashServer` is absent from startup/source, `/crashx` is not registered, frontend has no Fan Games/Crash navigation or Crash component source, and Crash DB update paths are unreachable.

## 4. No-Tx Smoke Scope Confirmed

The no-tx smoke evidence can support only checks that do not require a funded wallet or on-chain transaction.

Confirmed no-tx scope:

- Source, branch, commit, and clean working tree can be verified.
- Backend and frontend can build from the checked-out source.
- Backend tests can run without sending chain transactions.
- Prisma baseline migration can apply to the staging DB.
- PM2 process state and working directories can be inspected.
- nginx service and reverse proxy wiring can be checked.
- nginx `/api` prefix preservation can be checked.
- Frontend public env validation can confirm staging mode and reject unsafe public env.
- BSC testnet RPC can be queried for chain ID `97`.
- Secret log scan can verify no known secret patterns appear in recent logs.
- frontend `MISSING_MESSAGE` logs can be checked after PM2 frontend restart.
- Crash game non-installation can be checked without starting gameplay or funding wallets.
- Disabled/no-tx routes can be smoke-tested if they do not require funded tx execution.

This no-tx scope does not prove prize transfers, NFT minting, tier updater transactions, contract ownership changes, or BSC testnet receipt handling.

## 5. BNB/tBNB Funding Not Yet Available

BNB/tBNB has not been funded for staging/testnet transaction checks.

Because of that, these tx-based checks are intentionally not executed yet:

- FUNKY token testnet deploy transaction.
- NFT contract testnet deploy transaction.
- FunkyTierUpdater testnet deploy or relayer setup transaction.
- NFT mint enable/disable or public mint transaction.
- Tier downgrade/reset transaction through FunkyTierUpdater.
- Prize hot wallet funded sendToWallet transaction.
- Prize receipt retry and double-send prevention on a real testnet tx.
- Prize reservation consumption after successful transfer.
- Governance/manual multisig or temporary staging admin transactions.
- BSC testnet tx receipt capture and storage.

Do not mark these as passed until tBNB is funded and receipts are saved outside git.

## 6. Secret Log Scan Result

Status: PASS from no-tx staging evidence.

Required scan policy:

- Flush PM2 logs and restart the staging processes before collecting the current smoke window.
- Scan PM2 backend and frontend logs.
- Inspect privately if there are matches.
- Do not paste matching raw lines into git, PRs, tickets, or chat.
- Record only PASS/FAIL and sanitized metadata.

The scan must remain No-Go if logs expose:

- Raw JWT.
- Authorization header.
- Cookie value.
- Private key.
- API key.
- DB URL.
- RPC URL with query string.
- Explorer URL with API key.
- Seed phrase or mnemonic.

## 7. DB Schema Dump Evidence

Status: PASS from no-tx staging evidence.

The DB schema dump must be stored outside this repository. This repo must not contain:

- DB dump files.
- `DATABASE_URL`.
- table row exports containing user, wallet, ticket, NFT, PrizeTransaction, or secret data.
- migration output with secret-bearing connection details.

For future audits, record only:

- dump creation timestamp.
- staging DB identifier without credentials.
- commit SHA.
- migration name applied.
- hash or filename in the external evidence store.

## 8. Remaining No-Go

Production launch remains No-Go because:

- tBNB funding has not been completed.
- BSC testnet tx receipts have not been collected.
- FUNKY token, NFT, and FunkyTierUpdater testnet deploy/verification are not complete in this report.
- Prize sendToWallet has not been verified with a real BSC testnet tx.
- NFT mint and tier reset/downgrade have not been verified with real BSC testnet txs.
- Contract ownership, relayer permissions, and multisig or approved temporary staging admin setup still need tx evidence.
- Production secret-manager values have not been reviewed.
- Production deploy source, PM2/nginx targets, backups, restore, monitoring, and log rotation still need production-specific human confirmation.

## 9. Next Checks After tBNB Funding

After staging wallets receive limited tBNB, run the tx-based section of `docs/launch/STAGING_TESTNET_VERIFICATION_RUNBOOK.md`.

Minimum next checks:

1. Deploy or confirm BSC testnet FUNKY token and save receipt evidence outside git.
2. Deploy or confirm BSC testnet NFT contract and save receipt evidence outside git.
3. Deploy or configure FunkyTierUpdater and save receipt evidence outside git.
4. Confirm prize hot wallet and tier relayer are separate staging wallets with minimum funds.
5. Confirm `PRIZE_TRANSFER_TOKEN_ALLOWLIST` contains only approved BSC testnet token addresses.
6. Run wallet signature login smoke test.
7. Run API authorization smoke test with unauthenticated, normal user, and admin identities.
8. Run Prize draw and inventory reservation checks.
9. Run Prize sendToWallet on BSC testnet and verify receipt retry does not double-send.
10. Run ticket code claim, lottery/ticket claim, and Illustration draw smoke tests.
11. Run NFT mint checks and confirm `PATCH /nft/:id` remains disabled.
12. Run tier downgrade/reset checks with reason-coded sync.
13. Confirm governance routes stay backend-disabled and do not broadcast tx.
14. Save tx receipts outside git with commit SHA and non-secret decoded metadata.

## 10. Production Boundary

This report only consolidates no-tx staging evidence.

It does not mean:

- BSC testnet verification is complete.
- tx-based receipt evidence exists.
- production secrets are ready.
- production deploy is approved.
- production launch is approved.

Production launch can be considered only after all staging no-tx checks, BSC testnet tx checks, production secret-manager review, deploy source confirmation, backup/restore proof, monitoring/log rotation checks, and human launch-owner sign-off are complete.

## 11. Command Executed For This Report

| Command | Result |
| --- | --- |
| `git diff --check` | PASS. |
