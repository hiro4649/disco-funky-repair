# FUNKY GitHub No-Tx Code Closure Summary Before Staging Domain

## Status

- Date: 2026-05-17 JST
- Confirmed main commit: `c845dfeb08ac5cfd4985616b8bcbff6b1d977816` (`test: lock public status response shapes (#75)`)
- Repository scope: `hiro4649/disco-funky-repair`
- Scope of this document: GitHub source and docs closure for the no-tx hardening line before staging domain setup
- Staging reflection: not performed because the staging domain is still undecided.
- Tx verification: not performed because tBNB is not funded.
- Production ready: no. This document is not production launch approval.

## Merged PR Range

Main contains the no-tx hardening sequence from PR #52 through PR #75, with PR #59 excluded because it was closed without merge and is not part of current `main`.

Merged PRs confirmed on `main`:

| PR | Main commit | Summary |
| --- | --- | --- |
| #52 | `c1b6502` | FUNKY no-tx final audit |
| #53 | `9622675` | Explorer failure log sanitization |
| #54 | `47b36c0` | Runtime log sanitize evidence |
| #55 | `f66260d` | Source-wide no-tx final audit |
| #56 | `ef915cc` | Backend runtime startup hardening |
| #57 | `4645b24` | Admin Excel upload limit reduction |
| #58 | `63350c1` | Staging HTTPS domain migration runbook |
| #60 | `10eb615` | Staging domain pending freeze note |
| #61 | `f653b12` | Read privacy route exposure audit |
| #62 | `8d00438` | Admin read route protection |
| #63 | `002a1f0` | User/referral/transaction owner gates |
| #64 | `5172599` | Monitoring and static read exposure reduction |
| #65 | `c5dc1fb` | NFT and Trial NFT read hardening |
| #66 | `e31c646` | Frontend auth integration audit |
| #67 | `6bdbf95` | Public admin tokenbalance read removal |
| #68 | `f4bb463` | Admin frontend calls standardized on `apiClient` |
| #69 | `f1ce85d` | Private read UI gated by auth state |
| #70 | `2ccb7aa` | Read/privacy closure regression audit |
| #71 | `29adc25` | Admin catalog reads protected |
| #72 | `8f7d28f` | Public catalog field minimization |
| #73 | `c1cd240` | Public reference/status field documentation |
| #74 | `f7db30f` | Static asset route narrowing |
| #75 | `c845dfe` | Public status response regression tests |

## Closed GitHub No-Tx Areas

### Runtime Hardening

- Backend startup was split so runtime entrypoint and app construction are testable without starting a server.
- Runtime env handling was tightened:
  - `BACKEND_CORS_ORIGINS` is intended to be strict and environment-driven.
  - `SESSION_SECRET` is required instead of relying on a hardcoded fallback.
  - Request body limits are bounded and environment-driven.
- Explorer/API failure logging was sanitized at source/test level so secret-like request details are not intentionally logged.
- These are source-level closures only; final runtime proof still requires the actual staging environment.

### Upload Limit

- Admin Excel metadata upload was reduced from the legacy large limit to a 10MB cap.
- Excel metadata upload remains behind `AuthAdmin`.
- The human HTTPS staging check still needs to confirm:
  - normal Excel upload at or below 10MB is accepted,
  - oversized Excel upload is rejected,
  - no secret-like file contents or raw server logs are pasted into evidence.

### Read/Privacy Backend

- Admin read routes for user, token balance, NFT, Prize, ticket distribution, monitoring detail, DEX/fee history, Trial NFT template admin, Illustration admin, and News admin remain protected with `AuthAdmin`.
- User-specific reads for transaction history, referral state, NFT holder state, Trial NFT state, point history, holding history, and lottery state are owner-gated through authenticated user identity.
- Detailed monitoring routes remain admin-only; public healthcheck is minimal.
- Crash gameplay is not installed for MVP, and no-tx smoke policy avoids treating generic `404` as universal protection evidence.

### Read/Privacy Frontend

- Public UI no longer calls admin tokenbalance reads.
- Admin frontend calls are standardized through `apiClient`.
- Private read UI is gated by auth state, user id, wallet state, and connection state.
- Frontend auth integration was audited at source level, but browser/runtime proof still waits for HTTPS staging.

### Public Catalog Field Policy

- Public Prize, NFT, Trial NFT template, Illustration, News, fee current, and public healthcheck field policies are documented.
- Public catalog responses were minimized and regression-tested where covered by the P1/P2 work.
- Admin-only fields, internal inventory/reservation fields, transaction fields, ownership-specific fields, and audit metadata are not intended to be public catalog fields.

### Static Asset Route Narrowing

- Public static asset routes are narrowed to image/icon intent:
  - `/uploads/images`
  - `/api/icons/images`
  - `/api/icons`
- These routes point to `uploads/images` through `imagesPath`.
- The root `uploadsPath` directory is not exposed through `express.static`.
- Public static serving has an image filename extension allowlist:
  - `.png`
  - `.jpg`
  - `.jpeg`
  - `.gif`
  - `.webp`
  - `.svg`
- Non-image filenames such as `.xlsx`, `.xls`, `.csv`, `.json`, `.sql`, `.env`, `.log`, `.txt`, `.tmp`, and other non-image extensions are not intended to be publicly served.

### Public Status Response Regression Tests

- `GET /api/monitoring/healthcheck` is locked to:
  - `status`
  - `timestamp`
  - `healthy`
- `GET /api/fee/current` is locked to:
  - `success`
  - `data.feePercentage`
  - `data.feeRecipient`
  - `data.lastUpdated.percentage`
  - `data.lastUpdated.recipient`
- `GET /api/lottery/update-status` is locked to:
  - `success`
  - `isUpdating`
- Regression tests reject public leakage of QuickNode credit usage, failure counts, service details, `txHash`, `changedBy`, admin metadata, user-specific fields, and internal history fields.

## Why Staging Is Still Not Reflected

The GitHub hardening line is closed at source/test/docs level only. It has not been reflected to the real staging server for these reasons:

1. Staging domain is still undecided.
2. DNS, HTTPS, nginx `server_name`, and certbot cannot be finalized without the staging domain.
3. `BACKEND_CORS_ORIGINS` strict runtime value cannot be finalized until the HTTPS staging origin is known.
4. `SESSION_SECRET` is required, but the actual runtime value must be provisioned by a human and must not be committed or pasted into docs.
5. Backend/frontend staging env values still need human update after domain decision.
6. tBNB is not funded, so tx-related verification remains blocked.

## Next Human Tasks

1. Decide the staging domain.
2. Configure DNS for the staging domain.
3. Configure HTTPS and certbot on the staging server.
4. Update nginx `server_name` and HTTPS routing.
5. Update backend env for strict `BACKEND_CORS_ORIGINS` using the final HTTPS staging origin.
6. Provision required runtime secrets such as `SESSION_SECRET` without committing or pasting their values.
7. Update frontend public env for the final staging API/app origins and BSC testnet configuration.
8. Pull current `main` on the staging server.
9. Build and restart backend/frontend processes.
10. Run no-tx smoke checks through the final HTTPS staging origin.
11. Run secret log scan using non-secret evidence only.
12. Confirm Excel upload behavior after PR #57:
    - normal admin Excel metadata upload at or below 10MB,
    - oversized upload rejection above 10MB.
13. After tBNB funding, run tx-related testnet verification:
    - contract deploy and verification evidence,
    - Prize transfer/receipt/no-double-send behavior,
    - NFT mint behavior,
    - tier relayer/reset/downgrade behavior,
    - governance/multisig or approved temporary staging admin flow,
    - non-secret tx receipt evidence capture.

## Not Completed Because tBNB Is Unfunded

The following must not be marked PASS from this GitHub no-tx closure alone:

- FUNKY token testnet deploy/verification
- NFT contract testnet deploy/verification
- Tier updater or tier relayer tx behavior
- Prize send/receipt/retry/no-double-send behavior
- NFT mint enable/disable/public mint behavior
- Governance or multisig transaction flow
- Any production launch tx readiness claim

## Verification

Command required for this docs-only PR:

```powershell
git diff --check
```

Result:

- `git diff --check`: success

## Final Note

This is a GitHub no-tx source/test/docs closure summary before staging domain setup. It does not deploy to staging, does not restart PM2, does not run tx verification, does not add secrets, and is not production ready.
