<!-- CODEX_QUALITY_HARNESS_FILE v0.9.7 -->
# Codex Staging Evidence Policy

This policy defines the FUNKY staging evidence gate for Codex Harness v0.8.2.

The gate validates the shape and safety of staging evidence. It does not create staging evidence, does not claim runtime readiness, and does not convert `BLOCKED` or `UNKNOWN` into `PASS`.

## Scope

Accepted evidence is non-secret, safe-summary-only staging evidence for FUNKY.

The gate covers:

- staging domain and HTTPS evidence
- backend runtime env presence evidence without values
- CORS and cookie domain summaries without secret or cookie values
- frontend public env summary
- deployed main SHA evidence
- no-tx smoke evidence
- runtime log inspection summary without logs
- funded transaction execution flags

## Status Values

Allowed evidence status values are:

- `PASS`
- `FAIL`
- `BLOCKED`
- `UNKNOWN`

`BLOCKED` and `UNKNOWN` are valid evidence states, but they are not readiness pass states.

## Required Safety Rules

Evidence must not include:

- secrets or secret-like values
- DB URLs or connection strings
- JWTs or auth tokens
- cookie values
- private keys
- raw logs
- raw request or response bodies
- live runtime payloads
- private local paths

Evidence must set:

- `secretsIncluded: false`
- `rawLogsIncluded: false`

No-tx evidence must also set:

- `txExecuted: false`
- `fundedTxExecuted: false`

## PASS Rules

`overallStatus: PASS` is valid only when all required staging no-tx fields are also `PASS` and include non-secret evidence references or summaries.

Required no-tx fields are:

- `stagingFrontendUrlStatus`
- `stagingBackendUrlStatus`
- `httpsStatus`
- `dnsStatus`
- `nginxStatus`
- `backendRuntimeEnvPresence`
- `corsOriginSummary`
- `cookieDomainSummary`
- `frontendPublicEnvSummary`
- `deployedMainSha`
- `noTxSmokeSummary`
- `runtimeLogInspectionSummary`

For `PASS`, `checkedByRole` must be one of:

- `operator`
- `release-manager`
- `asset-security-reviewer`

The `headSha` must match the current PR head SHA or current main SHA for the evidence context.

## Gate Trigger Rules

The staging evidence gate is strict when any of the following are true:

- PR text claims staging readiness, no-tx readiness, runtime readiness, release readiness, or a GO decision
- `docs/process/FUNKY_STAGING_*` evidence files are changed
- `docs/process/CODEX_STAGING_EVIDENCE_*` files are changed
- staging evidence JSON is added or updated

If no readiness is claimed and no staging evidence file is changed, the gate is `not_applicable`.

If only schema, policy, or example files are changed and no readiness is claimed, the gate validates those files but does not require live staging evidence.

## Non-Goals

This policy does not:

- perform deploys
- run minting
- run sendToWallet
- run governance transactions
- run TierUpdater transactions
- run funded transactions
- perform staging rollout
- certify release readiness
