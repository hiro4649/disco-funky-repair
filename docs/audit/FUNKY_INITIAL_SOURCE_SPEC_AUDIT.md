# FUNKY Initial Source Baseline Spec Audit

## Summary

This report compares the sanitized initial human-written FUNKY source baseline with current `main` at a semantic level.
It is a safe summary for human review, not a raw diff, not an implementation change, and not a release-readiness claim.

PR #121 is a separate backend safe-logging PR and is intentionally excluded from this audit report.

## Baseline Evidence

- Baseline branch: `audit/funky-initial-human-source-baseline`
- Baseline branch head: `9ff3ead48a97ee396a597fd74aa34ce222c94f53`
- Current main SHA used for comparison: `48790d92b98ddc7a420006219691aba04e1b2bec`
- Source: user-provided initial human-written FUNKY source archives
- Baseline location: `initial-source/` on the baseline branch
- Baseline file count: 2235 files
- Baseline secret scan result: PASS after sanitized baseline scan
- Baseline manifest repair: completed on the baseline branch before this report
- Raw diff: not included
- Secret-like values: not included

The initial source is treated as an audit baseline only. It is not treated as the only authoritative current FUNKY specification without human confirmation.

## Comparison Method

The comparison focused on behavior and ownership boundaries rather than line-by-line text. The reviewed categories were:

- backend routes
- auth, admin gates, and owner gates
- users and FanPoint
- Prize, ticket, lottery, and `sendToWallet`
- NFT controller, image upload, and IPFS handling
- Trial NFT
- frontend NFT mint UI
- contracts
- environment, runtime, security, CORS, cookie, and session behavior
- logging and `safeLogger`
- upload and public static handling
- Prisma schema and migrations
- staging readiness docs
- harness docs relationship

## A. Initial Behavior Preserved With Safety Hardening

- Core FUNKY domains remain present: users, FanPoint, Prize, ticket/lottery, NFT, Trial NFT, admin routes, wallet login, and contracts.
- Daily FanPoint behavior remains, with added AM/PM idempotency through a DB-backed `dailyWindowKey` uniqueness rule.
- Prize transfer remains a user-facing asset flow, but current main requires receipt evidence and manual-review handling rather than accepting txHash alone.
- NFT admin upload/IPFS behavior remains, with stricter local-file boundary checks, public field minimization, partial-success handling, and local path non-exposure.
- Trial NFT claim behavior remains, with stronger authentication, owner gate, admin gate, transaction safety, and safe logging.
- Public NFT mint UI remains, but current main derives availability from contract state instead of a hardcoded supply value.
- Image and Excel upload flows remain, with extension, content signature, UUID filename, size limit, and cleanup hardening.

## B. Intentional Specification Changes Or Safety Changes

- Virtual-balance user-manage API is now intentionally disabled with `FEATURE_DISABLED`.
- `PATCH /api/nft/:id` is now intentionally disabled with `FEATURE_DISABLED`.
- NFT admin upload/list/delete routes now require `AuthAdmin`.
- Prize admin routes now require `AuthAdmin` more consistently.
- User admin routes now require `AuthAdmin`.
- Trial NFT user routes now require `Authenticate`, and Trial NFT admin routes require `AuthAdmin`.
- Staging runtime is treated as strict runtime for CORS, session cookie, and security middleware behavior.
- Frontend admin contract-write screens now point to manual review instead of direct browser-side writes.
- The current NFT contract adds `MAX_SUPPLY`, `mintEnabled`, and `baseURI` state used by the frontend mint flow.

## C. Suspected Divergence From Initial Behavior

These are not automatically bugs, but they need human review because they can change user-visible behavior:

- Virtual-balance user management was present in the initial backend/admin flow but is disabled in current main.
- Initial NFT mint status update used a backend PATCH route after mint; current main disables that route and keeps the browser flow away from that mutation.
- Initial admin token/NFT management included direct frontend contract operations; current main blocks those with manual-review messaging.
- Some current frontend admin navigation still points to user-management views while the corresponding virtual-balance backend routes are disabled.
- Initial source contains older chain/ecosystem remnants in places; current main is BSC-oriented. Human review should confirm no stale user-visible chain assumptions remain.

## D. Removed Or Disabled Functions

- Virtual-balance user-manage backend route is disabled.
- NFT mint-status PATCH route is disabled.
- Browser-side admin contract-write workflows are disabled or redirected to manual review.
- Some initial permissive admin route behaviors are removed by requiring `AuthAdmin`.

These disabled paths appear explainable as asset-safety hardening for the current launch scope, but the long-term product decision must be confirmed by a human owner.

## E. Functionality Added After The Initial Source

- `safeLogger` and safe logging tests.
- Strict runtime handling for staging.
- Public static image-only middleware.
- Image magic-byte upload checks and SVG rejection.
- Excel `.xlsx`/`.xls` signature validation.
- NFT IPFS batch boundary checks and 207-style partial-success reporting.
- Prize chainId and receipt evidence handling.
- Daily FanPoint duplicate prevention by AM/PM window.
- Trial NFT safe logging and route-gate tests.
- Frontend NFT mint availability from `MAX_SUPPLY`, `mintEnabled`, `baseURI`, and `nextTokenId`.
- Staging readiness, no-tx, funded-tx, and evidence checklist docs.
- Codex quality gate and manual confirmation process docs.

## F. Not Determinable From Initial Code Alone

- Which duplicated initial source tree should be treated as the canonical human baseline.
- Whether virtual-balance user-manage should remain disabled, be hidden from UI, or return under a separate safety plan.
- Whether initial frontend admin pages that depended on direct contract writes should have replacement operational flows.
- Whether all current frontend navigation matches disabled backend behavior.
- Whether staging domain, runtime env, CORS, cookie domain, and runtime log evidence exist outside the repo.
- Whether current funded transaction behavior is acceptable in a live staging environment; this report performs no funded transaction checks.

## G. Human Review Decisions Needed

- Confirm whether disabled virtual-balance user management is an accepted safety reduction or a product gap.
- Confirm whether disabling `PATCH /api/nft/:id` is the intended current NFT mint-state policy.
- Confirm whether frontend admin user-management navigation should remain visible when virtual-balance APIs are disabled.
- Confirm whether direct browser-side contract writes should remain manual-review only.
- Confirm whether current Prize receipt/manual-review semantics are the intended replacement for initial txHash-based completion.
- Confirm whether Daily FanPoint AM/PM idempotency matches the expected user reward semantics.
- Confirm whether BSC-only launch behavior fully replaces initial chain/ecosystem remnants.

## H. Out-Of-Scope Initial-Code Contamination

- Crash game appears in the initial source but is not part of the formal FUNKY scope.
- Crash game is treated as a developer-added out-of-scope feature in the initial source, not as current FUNKY specification.
- Current disabled Crash game behavior is not classified as suspected specification divergence.
- Crash game is not a revival candidate.
- If Crash game UI or backend references remain visible, they should be removed or kept disabled as cleanup candidates.

## Current Safety Notes

- Current main does not appear to treat DB update alone as sufficient on-chain success for Prize `sendToWallet`.
- Current main does not appear to treat txHash alone as receipt-confirmed Prize completion.
- Current NFT upload/IPFS/public catalog behavior is more restrictive than the initial source and appears safety-oriented.
- Current staging no-tx preflight remains `BLOCKED`; this report does not change that state.
- Current main still has follow-up safe-logging work outside this docs-only audit scope. PR #121 is not included in this report.

## Scope Boundaries

This report does not:

- merge the initial baseline into `main`;
- create an implementation PR;
- modify backend, frontend, or contract code;
- modify workflow, harness, CODEX policy, package, or lock files;
- execute deploy, mint, `sendToWallet`, governance tx, TierUpdater tx, funded tx, or staging rollout;
- include raw diff, long source quotations, secret values, private paths, raw payloads, or runtime logs.

## Residual Risks

- The canonical initial source tree needs human confirmation because the baseline contains duplicated source/export trees.
- Disabled formal-feature candidates other than Crash game still need product/security decisions: keep disabled, hide from UI, or re-enable through a separate safety plan.
- Any remaining Crash game references should be removed or kept disabled because Crash game is out of FUNKY scope.
- Staging domain, staging runtime env, no-tx evidence, and runtime log inspection remain blocked or unknown.
- tBNB funding and real receipt checks remain unverified by this report.
- This is a docs-only audit report; it does not fix any suspected divergence.

## Recommended Next PR Candidates

- Docs-only decision record for virtual-balance user-manage scope.
- Frontend/backend cleanup PR if any Crash game references remain visible despite being out of FUNKY scope.
- Frontend-only cleanup if disabled formal backend flows remain visible in admin navigation.
- Backend-only or frontend-only follow-up for any human-confirmed specification divergence.
- Separate safe-logging PRs for remaining direct console/raw-ish error handling, without mixing them into this audit report.

## Human Review Checklist

- Confirm the canonical initial baseline interpretation.
- Confirm Crash game remains excluded from FUNKY scope and any remaining references are cleanup-only candidates.
- Review each disabled formal-feature path and decide whether it is accepted safety hardening or a required future feature.
- Confirm current Prize, NFT, FanPoint, ticket, wallet, and admin-route semantics.
- Confirm no initial user-facing flow required for launch has disappeared without an accepted safety reason.
- Keep staging no-tx preflight blocked until non-secret runtime evidence exists.
