# Public Reference And Status Field Policy

## Status

- Scope: P2-READ-08 public reference/status documentation cleanup
- Confirmed commit: `8f7d28f`
- Staging reflection: not performed because the staging domain is still undecided.
- Tx verification: not performed because BNB/tBNB is not funded.
- Production ready: no. This document is not production launch approval.
- Code changes in this PR: none.

## Purpose

This document separates public catalog, public reference, public status, and public static asset surfaces from authenticated owner/admin reads. It records the current public routes, the intended public use, the allowed response fields, forbidden fields, and whether a follow-up code PR is needed.

## Static Review Commands

```powershell
git rev-parse --short HEAD
rg -n "router\.get\(|express\.static|/icons|/uploads|healthcheck|fee/current|lottery/update-status|airdrop/prize|nfts/mintable|nft/:id|trial-nft-templates|illustration|news" apps/backend/src/app/routes apps/backend/src/app/index.ts -g "*.ts"
rg -n "lottery/update-status|fee/current|airdrop/prize|nfts/mintable|nft/|trial-nft-templates/available|illustration/rarity|news/|/uploads/images|/api/icons|healthcheck" apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx"
git diff --check
```

## Classification

- `PASS`: Current code and docs show a minimal public response for the documented purpose.
- `P2`: No P0/P1 privacy exposure was found, but product approval, naming, docs, or a small hardening PR is still useful.
- `UNKNOWN`: The intended public surface cannot be proven from source alone.
- `BLOCKED`: Runtime or tx evidence is required and is not available in this PR.

## Public Route Inventory

| Route or surface | Public intent | Current status | Notes |
| --- | --- | --- | --- |
| `GET /api/monitoring/healthcheck` | External uptime check | `PASS` | Returns only `status`, `timestamp`, `healthy`. Detailed monitoring routes remain `AuthAdmin`. |
| `GET /api/fee/current` | Public tokenomics reference | `PASS` | Returns current fee percentage/recipient and last-updated timestamps only. Fee history remains `AuthAdmin`. |
| `GET /api/lottery/update-status` | Frontend polling of ticket distribution/update status | `PASS` for fields, `P2` for product approval | Returns only `success` and `isUpdating`. It exposes no user data, wallet data, ticket records, or operational provider details. Product owner should confirm this boolean should stay public. |
| `GET /api/airdrop/prize` | Public Prize catalog | `PASS` | Covered by `PUBLIC_CATALOG_FIELD_POLICY.md` and backend regression tests. |
| `GET /api/nfts/mintable` | Public NFT mintable catalog | `PASS` | Covered by `PUBLIC_CATALOG_FIELD_POLICY.md` and existing backend tests. |
| `GET /api/nft/:id` | Public NFT mint/detail lookup | `PASS` | Uses internal `mintStatus` / `ipfsUploaded` filtering but does not return them. Covered by `PUBLIC_CATALOG_FIELD_POLICY.md`. |
| `GET /api/trial-nft-templates/available` | Public Trial NFT template catalog | `PASS` | Public response is limited to display/claim fields by P1-READ-07 tests. |
| `GET /api/illustration/:id` | Public illustration detail | `PASS` | Public response is limited to display fields by P1-READ-07 tests. |
| `GET /api/illustration/rarity/:rarity` | Public illustration rarity catalog | `PASS` | Public response omits probability/timestamps by P1-READ-07 tests. |
| `GET /api/news/:id` | Public news detail | `PASS` | Public response is limited to display fields by P1-READ-07 tests. |
| `/uploads/images` | Public image asset serving | `P2` | Needed for frontend images, but still serves the shared images directory. Confirm only non-sensitive image assets are stored there. |
| `/api/icons/images` | Public icon/image asset serving | `P2` | Alias to the shared images directory. Confirm whether this alias is still required. |
| `/api/icons` | Public icon/image asset serving | `P2` | Alias to the shared images directory. Confirm whether this should be narrowed to an icons-only directory. |

## Allowed And Forbidden Fields

### Public Healthcheck

Allowed fields:

- `status`
- `timestamp`
- `healthy`

Forbidden fields:

- provider names or roles
- credit usage
- monthly projections
- failure counts
- reconnect attempts
- RPC URLs
- Explorer URLs
- API keys or secret-like values

### Fee Current

Allowed fields:

- `feePercentage`
- `feeRecipient`
- `lastUpdated.percentage`
- `lastUpdated.recipient`

Forbidden fields:

- `changedBy`
- `txHash`
- full fee history
- admin metadata
- raw on-chain transaction payloads

### Lottery Update Status

Allowed fields:

- `success`
- `isUpdating`

Forbidden fields:

- user ids
- wallet addresses
- ticket counts
- claim ticket counts
- lottery ticket records
- scheduler internals beyond a single boolean
- provider/RPC status
- stack traces or raw errors

Current assessment: `PASS` for minimal field shape. `P2` remains for human confirmation that a public boolean update flag is product-approved and not considered operationally sensitive.

### Prize, NFT, Trial NFT Template, Illustration, And News Catalogs

Allowed and forbidden fields are defined in `docs/launch/PUBLIC_CATALOG_FIELD_POLICY.md`.

Current assessment: `PASS` at static/test level after P1-READ-07. Runtime staging proof remains `BLOCKED` until the HTTPS staging domain is decided.

### Static Image/Icon Serving

Allowed content:

- public image assets required by the frontend UI
- public NFT/catalog images
- public icon images

Forbidden content:

- `.env` files
- JSON exports containing user/admin/internal data
- spreadsheets or upload source files
- private user files
- DB dumps
- logs
- API keys, private keys, JWTs, cookies, DB URLs, or secret-like values

Current assessment: `P2`. Source review shows only `imagesPath` is exposed through `/uploads/images`, `/api/icons/images`, and `/api/icons`, but the policy depends on operational discipline: only public-safe assets may be stored in that directory. A future hardening PR may split icons from uploaded images or add static asset extension checks.

## PASS

- Public healthcheck field policy is minimal.
- Public fee current response is minimal.
- Public lottery update status returns only `success` and `isUpdating`.
- Public Prize catalog field policy is documented and tested.
- Public NFT mintable/detail field policy is documented.
- Public Trial NFT template response is minimized and tested.
- Public Illustration detail/rarity response is minimized and tested.
- Public News detail response is minimized and tested.

## P2

- Confirm whether `GET /api/lottery/update-status` should remain public or be moved behind authenticated/admin status.
- Confirm whether `/api/icons` and `/api/icons/images` both need to exist, or whether one canonical public image route is enough.
- Confirm static image upload operational rules: no private source files, spreadsheets, DB dumps, logs, or secret-like files in the public image directory.
- Add runtime smoke checks after HTTPS staging migration to verify public response shapes against this document.

## UNKNOWN

- Product-approved public status semantics for `GET /api/lottery/update-status` are not proven by source alone.
- Runtime contents of the staging public image directory are unknown in this docs-only PR.

## BLOCKED

- Runtime route proof is blocked until the staging HTTPS domain is decided.
- Tx-related catalog behavior is blocked until BNB/tBNB is funded.

## Next Human Decisions

1. Decide whether the public lottery update boolean is acceptable as public product behavior.
2. Decide whether `/api/icons` should continue to alias the same directory as `/uploads/images`.
3. Confirm operational ownership of the public image directory and what file types are allowed there.
4. Confirm whether public field policy tests should be expanded to NFT detail and fee current in a future code PR, even though current static review matches the documented policy.

## Next Small PR Candidates

1. `P2-READ-09 Static asset route narrowing`
   - Goal: split icons from generic uploaded images or add a documented extension allowlist for public static serving.

2. `P2-READ-10 Public status response regression tests`
   - Goal: add explicit tests for `GET /api/lottery/update-status`, `GET /api/fee/current`, and public healthcheck response fields.

3. `STAGE-READ-11 Public reference/status runtime smoke`
   - Goal: after HTTPS staging domain migration, capture non-secret runtime evidence for public reference/status field shapes.

## Final Note

This is a docs-only cleanup. It does not change backend code, frontend code, contracts, schema, package-lock, or environment files. It does not perform staging deployment, tx verification, or production launch approval.
