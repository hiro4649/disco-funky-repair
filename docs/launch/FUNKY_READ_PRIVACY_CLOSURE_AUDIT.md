# FUNKY-AUDIT-08 Read/privacy closure regression audit

## Status

- Date: 2026-05-17 JST
- Confirmed commit: `f1ce85d`
- Repository scope: GitHub source tree on `origin/main`
- Result: read/privacy P0 closure is `PASS` by static source audit; read/privacy P1 closure is not complete.
- Code changes in this PR: none
- Staging reflection: not performed because the staging domain is still undecided
- Tx verification: not performed because BNB/tBNB is not funded
- Production ready: no. This audit is not production launch approval.

## Audit scope

- `apps/backend/src/app/routes`
- `apps/backend/src/app/controllers`
- `apps/backend/src/app/middlewares`
- `apps/backend/src/app/config/passport.ts`
- `apps/backend/src/app/index.ts`
- `apps/frontend/src`
- `apps/frontend/utils`
- `docs/launch/FUNKY_READ_PRIVACY_ROUTE_AUDIT.md`
- `docs/launch/FUNKY_FRONTEND_AUTH_INTEGRATION_AUDIT.md`
- `docs/launch/FUNKY_SOURCE_WIDE_FINAL_STATIC_AUDIT.md`

## Static commands

The following commands were used for this source-wide regression audit.

```powershell
git rev-parse --short HEAD
rg -n "router\.(get|post|patch|delete)|AuthAdmin|Authenticate" apps/backend/src/app/routes -g "*.ts"
rg -n "findFirst|findUnique|where: \{|tx_hash|userId|holderId|wallet_address|walletAddress" apps/backend/src/app/controllers apps/backend/src/app/routes -g "*.ts"
rg -n "axios\.(get|post|put|patch|delete)|fetch\(|/admin/seting/tokenbalance|/trial-nfts/can-claim|/referral/|/nfts/holder|/transaction/|/transaction-history|/holding-date|/fifo-snapshot" apps/frontend/src apps/frontend/utils -g "*.ts" -g "*.tsx"
rg -n "getPrize|quantity|probability|fake_probability|transfer_|reserved|balance_amount|admin" apps/backend/src/app/controllers/prize.controller.ts apps/backend/src/app/routes/__tests__/prize.routes.test.ts
```

Targeted file reads were also used for:

- `apps/backend/src/app/routes/user.routes.ts`
- `apps/backend/src/app/controllers/users.controller.ts`
- `apps/backend/src/app/routes/transactionHistory.routes.ts`
- `apps/backend/src/app/controllers/transactionHistoryController.ts`
- `apps/backend/src/app/routes/referral.routes.ts`
- `apps/backend/src/app/controllers/referral.controller.ts`
- `apps/backend/src/app/routes/monitoring.routes.ts`
- `apps/backend/src/app/routes/dexFee.routes.ts`
- `apps/backend/src/app/controllers/dexFeeController.ts`
- `apps/backend/src/app/routes/nft.routes.ts`
- `apps/backend/src/app/controllers/nft.controller.ts`
- `apps/backend/src/app/routes/trialNft.routes.ts`
- `apps/backend/src/app/controllers/trialNft.controller.ts`
- `apps/backend/src/app/routes/illustration.routes.ts`
- `apps/backend/src/app/controllers/illustration.controller.ts`
- `apps/backend/src/app/routes/news.routes.ts`
- `apps/backend/src/app/controllers/news.controller.ts`
- `apps/backend/src/app/index.ts`
- `apps/frontend/src/context/ReferralContext.tsx`
- `apps/frontend/src/components/OfficalDiscoNFT/index.tsx`

## P0 result

Status: `PASS`

No open read/privacy P0 was found in this static source audit.

Closed P0 evidence:

- `GET /admin/user/all`, `GET /user/all`, `GET /admin/user/transaction/:wallet_address`, and `GET /admin/seting/tokenbalance` are behind `AuthAdmin` in `apps/backend/src/app/routes/user.routes.ts`.
- Tests in `apps/backend/src/app/routes/__tests__/user.routes.test.ts` cover unauthenticated rejection, general-user rejection, `adminKey` body rejection, and admin access for the P0 all-user/admin read routes.
- General frontend UI no longer calls `/admin/seting/tokenbalance`. Current matches are limited to admin UI code in `apps/frontend/src/components/admin/Header/index.tsx`.
- `GET /transaction/:txHash` is owner-scoped in `apps/backend/src/app/controllers/transactionHistoryController.ts` with `tx_hash` plus `userId: authenticatedUserId`; it does not read another user's `TransactionAudit` row first and then reject.
- Trial NFT user-specific reads require `Authenticate` and controller-level `req.user.user_id` ownership checks before user-specific DB reads.
- NFT holder reads require `Authenticate` and compare `holderId` to `req.user.user_id`.
- Detailed monitoring routes are behind `AuthAdmin`; public healthcheck is minimal.
- Crash game remains out of MVP scope. Disabled/removed behavior is covered separately; this audit did not find a read/privacy P0 regression from Crash routes.

## P1 result

Status: `P1`

P1 read/privacy cleanup is not fully closed. The remaining items are not classified as P0 by this static audit because they do not show unauthenticated mutation, full-user export, admin secret exposure, or direct cross-user private-history access. They still need follow-up before production launch review.

Remaining P1 items:

1. `GET /admin/illustration` is public in `apps/backend/src/app/routes/illustration.routes.ts`.
   - Evidence: create/update/delete illustration admin routes use `AuthAdmin`, but the admin-named read route does not.
   - Risk: public response can expose full illustration catalog/config fields such as point and probability data. This may be intended as catalog data, but the admin-prefixed route and field policy are unclear.
   - Required follow-up: protect it with `AuthAdmin` or split a safe public catalog endpoint with explicit minimal fields.

2. `GET /admin/news` is public in `apps/backend/src/app/routes/news.routes.ts`.
   - Evidence: news create/update/delete routes use `AuthAdmin`, but the admin-named read route does not.
   - Risk: this may be intended as public news, but the admin-prefixed route and full-record field policy are unclear.
   - Required follow-up: protect it with `AuthAdmin` or split a safe public news endpoint with explicit minimal fields.

3. Public catalog field policy remains partially `UNKNOWN`.
   - Evidence: `GET /airdrop/prize` is public and returns public prize/catalog fields including configuration-like values such as `quantity`, `price`, `probability`, `fake_probability`, `ca`, `listed_DEX`, and token detail fields.
   - Positive evidence: the inspected prize catalog path does not expose `balance_amount`, `reserved_amount`, or fixed transfer fields in the public response.
   - Risk: exact public field policy is product-dependent and should be explicitly fixed in tests/docs.

## P2 result

Status: `P2`

P2 cleanup candidates:

- Public `/fee/current` is minimal and appears intended as tokenomics information, but should remain documented as public.
- Public NFT detail can expose `ipfsCid`; this appears non-secret for mint/display use, but should remain part of an explicit public field policy.
- Public Trial NFT templates appear intended as public campaign/catalog data, but should remain covered by field-minimization tests.
- Public operational/status reads such as lottery update status need product confirmation that no sensitive operational fields are returned.

## UNKNOWN / BLOCKED

Status: `UNKNOWN` / `BLOCKED`

- Runtime proof is `BLOCKED`: staging domain is undecided, so this PR did not pull/restart staging.
- Tx proof is `BLOCKED`: BNB/tBNB is not funded, so tx-related behavior remains unverified.
- Public catalog intent is partly `UNKNOWN`: source code shows public endpoints, but product-approved public fields for Prize, Illustration, News, NFT, Trial NFT, fee, and lottery reference/status data are not fully formalized here.
- Staging browser proof for frontend auth gates is `BLOCKED` until HTTPS staging domain migration is completed.

## Closure confirmed

The following read/privacy hardening items remain closed by this static audit:

- P0-READ-01 all-user/admin read route protection
- P1-READ-02 user/referral/transaction owner gates
- P1-READ-03 detailed monitoring protection and static upload scope reduction
- P1-READ-04 NFT/Trial NFT user-specific read owner gates
- P1-READ-05 frontend auth integration audit findings carried forward
- P0-FE-READ-01 public UI removal of admin tokenbalance calls
- P1-FE-READ-02 admin frontend calls standardized on `apiClient`
- P1-FE-READ-03 private read UI gated by auth state, user id, wallet state, and connection state

## Remaining items

- P1: admin-named public catalog reads remain for illustration and news.
- P1/UNKNOWN: public catalog field policy should be made explicit and tested.
- P2: public reference/status route documentation and field policy cleanup.
- BLOCKED: staging runtime proof and tx proof.

## Next PR candidates

Maximum three follow-up PRs:

1. `P1-READ-06 Protect or split admin-named public catalog reads`
   - Target: `GET /admin/illustration`, `GET /admin/news`
   - Goal: require `AuthAdmin` for admin reads or add separate safe public endpoints with minimal fields.

2. `P1-READ-07 Public catalog field minimization policy`
   - Target: `/airdrop/prize`, public NFT reads, Trial NFT template reads, public illustration/news catalog if split, `/fee/current`
   - Goal: fix explicit public response fields and add regression tests.

3. `P2-READ-08 Public reference/status documentation cleanup`
   - Target: lottery status/reference reads, fee public docs, healthcheck docs
   - Goal: document intended public fields and prevent future confusion between health/catalog/read privacy surfaces.

## Verification commands

```powershell
cd apps/backend && npm run build
cd apps/backend && npm test -- --runInBand
cd apps/frontend && npm run build
git diff --check
```

Observed results:

- Backend build: success
- Backend test: success, 30 test suites passed and 300 tests passed
- Frontend build: success
- `git diff --check`: to be run after this document is staged

## Final note

This is a source-wide no-tx regression audit. It is not a production launch approval, not a staging deployment, and not tx verification.
