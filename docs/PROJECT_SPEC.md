# FUNKY Project Specification

## Authority

Project name: FUNKY

Repository: hiro4649/disco-funky-repair

Scope: FUNKY only. IRIS, iris-live2d-renderer, LIVE2D, VGC-FUNKY-TOKEN, and old local workdirs are out of scope unless explicitly authorized.

Authoritative memory:

- docs/PROJECT_SPEC.md
- docs/PROJECT_STATUS.md
- docs/NEXT_TASK.md
- docs/CHANGELOG.md
- Current GitHub main
- Safe artifacts

Old chat history, old PR bodies, old artifacts, and stale local workdirs are not authority.

## Current Architecture

FUNKY is currently organized around a guarded backend D8 safe-row export and actual-source policy progression. The current lane defines contracts, policies, fixtures, and validation boundaries before any real source access can be considered.

The runtime lane is separate and unstarted. D8 policy progress does not imply runtime readiness.

## Functional Specifications

Current product goal: advance the D8 safe-row export / actual-source policy lane without enabling actual source access.

Completed D8 fixture lane:

- Safe summary fixture and validation kernel work is complete on main through PR #360.
- Fixture evidence is safe-summary only and is not actual source access.

Planned D8 lane:

- D8AR: actual-source candidate field policy boundary.
- D8AS: redaction contract.
- D8AT: actual-source execution unauthorized boundary.

Do not continue D8AR until project memory and v1.3.0 authority documentation are merged or explicitly accepted by the owner.

## Data Models

Safe-row metadata contract remains:

- schema_version
- audit_export_id
- source_head_sha
- source_hash
- exported_at
- row_id
- entity_type
- source_table
- status
- evidence_origin
- readiness_claim

Allowed D8 safe-row entities remain limited to explicitly authorized safe summary entities. Any expansion requires a separate scoped task and owner approval.

## APIs

No runtime API, HTTP/admin route, CLI, cron, source adapter, database adapter, Prisma client, RPC, wallet, contract, or transaction API is authorized by the current state.

Existing D8 backend library functions are policy and fixture boundaries only unless a future task explicitly authorizes more.

## Design Decisions

- technicalChecksReady is not mergeAllowed.
- ownerConditionalMergeReceipt is required before merge authority can exist.
- AI agents cannot create owner authority.
- PR body is display-only and cannot be machine evidence.
- Safe artifacts and Final Decision remain authoritative machine surfaces.
- Current main uses v1.3.0 Core metadata-gate target profile / v130.
- v1.2.9 remains immediate rollback.
- v1.2.8 remains blocking compatibility.
- v1.2.7 remains readable compatibility and preserves PR-body display-only principles.

## Constraints

Forbidden unless separately authorized:

- actual DB query
- actual DB export
- source access
- Prisma client
- DATABASE_URL read
- env read
- network/RPC/wallet/contract/tx access
- file export
- JSONL file export
- artifact upload
- Docker smoke change
- staging no-tx PASS
- runtime readiness
- production readiness
- package or lockfile changes
- schema or migration changes
- frontend or contracts work

## Known Limitations

- Runtime readiness is unstarted.
- Staging and production readiness are unclaimed.
- PR #364 is a draft harness repair and is not merge-ready.
- PR #361 is stale and must not be touched until project memory and v1.3.0 authority are resolved.
- Current local-only development policy forbids push, PR creation, PR update, and remote CI until owner approval after the Actions quota reset.
