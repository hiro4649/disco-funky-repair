# FUNKY JobRun Foundation Post-Merge Audit

## Purpose

Record the post-merge safety state of the JobRun foundation added by PR #165.
This is a docs-only evidence note. It does not connect any runtime worker,
scheduler, Prize receipt polling flow, trackingService flow, wallet monitor, or
tier transaction flow to JobRun.

## Current Main Evidence

- Current main SHA audited: `765d84d8ce87253dbcb48825e56db3e61eb53007`
- PR #165 merge commit: `765d84d8ce87253dbcb48825e56db3e61eb53007`
- Post-merge audit PR: `#169`
- Active harness marker observed: `CODEX_QUALITY_HARNESS_FILE v0.8.9`
- Active self-test script observed: `scripts/codex-v089-self-test.mjs`
- Runtime readiness claimed: no
- staging no-tx preflight remains BLOCKED
- production readiness not claimed

## Scope

In scope:

- confirm JobRun schema, migration, service, and tests exist on main
- confirm current runtime paths are not hooked up to JobRun
- record local verification evidence using non-secret dummy DB env where needed
- record migration and staging evidence gaps
- recommend next PR split

Out of scope:

- backend implementation changes
- Prisma schema changes
- migration changes
- frontend changes
- contract changes
- package or lockfile changes
- harness, workflow, scripts, CODEX policy, or docs/process changes
- Prize receipt polling implementation
- trackingService worker implementation
- scheduler JobRun integration
- wallet monitor worker implementation
- tier transaction worker implementation
- deploy, mint, sendToWallet execution, governance transaction, TierUpdater
  transaction, funded transaction, or staging rollout

## JobRun Schema Summary

PR #165 added `JobRunStatus` and `JobRun` to
`apps/backend/prisma/schema.prisma`.

`JobRunStatus` values:

- `PENDING`
- `RUNNING`
- `SUCCEEDED`
- `FAILED`
- `TIMED_OUT`
- `MANUAL_REVIEW`
- `CANCELED`

`JobRun` is mapped to `job_runs` and includes:

- `jobName`
- `runKey`
- `status`
- `startedAt`
- `finishedAt`
- `heartbeatAt`
- `attempt`
- `maxAttempts`
- `lockedBy`
- `checkpoint`
- `safeErrorKind`
- `safeSummary`
- `createdAt`
- `updatedAt`

Important constraints and indexes:

- unique `jobName + runKey`
- status index
- heartbeatAt index
- jobName index
- createdAt index

## Migration Summary

PR #165 added:

- `apps/backend/prisma/migrations/20260526090000_add_job_runs/migration.sql`

The migration creates:

- PostgreSQL enum `JobRunStatus`
- table `public.job_runs`
- unique index `job_runs_job_name_run_key_key`
- indexes for `status`, `heartbeat_at`, `job_name`, and `created_at`

Repository verification confirms the migration file exists. Staging or
production migration application evidence is not present in this repository.

## Service Helper Summary

PR #165 added:

- `apps/backend/src/app/services/jobRun.service.ts`
- `apps/backend/src/app/services/__tests__/jobRun.service.test.ts`

Service helpers currently present:

- `createOrGetPendingJobRun`
- `claimJobRun`
- `heartbeatJobRun`
- `completeJobRun`
- `failJobRun`
- `markTimedOutJobRuns`
- `cancelJobRun`

The service enforces safe identifiers, bounded attempts, safe error kind values,
worker ownership checks, conditional state transitions, and safe summary
validation for obvious secret-like fields and values.

## Current Runtime Hookup Status

Current audit result: JobRun is not connected to runtime job execution.

Search evidence found JobRun service references in:

- `apps/backend/src/app/services/jobRun.service.ts`
- `apps/backend/src/app/services/__tests__/jobRun.service.test.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/migrations/20260526090000_add_job_runs/migration.sql`

No runtime import or call was found in the audited runtime paths for:

- Prize receipt handling
- trackingService
- tracking token balance processing
- scheduler startup
- wallet monitor
- tier transaction flows

This is intentional for the foundation PR. It means JobRun is available as a
safe base, but it is not yet providing runtime worker coordination.

## Not Connected Paths

The following paths remain intentionally unconnected:

- `apps/backend/src/app/controllers/prize.controller.ts`
- `apps/backend/src/app/utils/tokenHeplers.ts`
- `apps/backend/src/app/services/trackingService.ts`
- `apps/backend/src/app/lib/trackingTokenBalanceEthereum.ts`
- existing scheduler startup paths
- wallet monitor paths
- tier transaction and TierUpdater transaction flows

Prize receipt polling, trackingService worker processing, scheduler JobRun
integration, wallet monitor worker processing, and tier tx worker processing are
not implemented by PR #165 or this audit.

## Verification Evidence

Plain local checks:

- `npm run prisma:validate`: stopped because `DATABASE_URL` was not set
- `node scripts/codex-local-quality-gate.mjs`: stopped because
  `DATABASE_URL` was not set

Non-secret dummy DB env checks:

- `npm run prisma:validate`: pass
- `npm run prisma:generate`: pass
- focused JobRun test: pass, 1 suite / 9 tests
- backend full test: pass, 47 suites / 527 tests
- backend build: pass
- secret safety scan: pass
- local quality gate: pass
- `CODEX_QUALITY_REPORT=json` local quality gate: pass
- `node scripts/codex-v089-self-test.mjs --json`: pass
- `git diff --check`: pass
- `git status --short`: clean before this docs-only audit file was added

The local quality gate also exercised frontend and contract checks as part of
the repository gate. Those checks passed, but this docs-only audit does not make
any frontend, contract, runtime, staging, or production readiness claim.

## Migration And Staging Evidence Status

Migration file presence is verified in the repository.

Migration application evidence is not verified here:

- no staging migration application evidence is included
- no production migration application evidence is included
- no runtime worker has been started against the `job_runs` table
- no non-secret staging JobRun row evidence is included

staging no-tx preflight remains BLOCKED until a future PR supplies non-secret
runtime or migration evidence appropriate to the chosen rollout step.

## Risks Before Connecting Workers

Before any worker is connected to JobRun, the next PR must define:

- exact job family and deterministic `runKey`
- worker identity format
- heartbeat cadence and stale-run timeout
- retry and `maxAttempts` behavior
- checkpoint shape
- safeSummary schema for that job family
- idempotent side-effect boundaries
- manual review boundaries
- staging migration application evidence
- non-secret staging runtime evidence

Long-running external API/RPC jobs should not be wrapped in
transaction-scoped advisory locks. They need short DB transactions, JobRun
claims, heartbeat, checkpoint, retry, and explicit resume behavior.

## Recommended Next PR Split

- PR-A JobRun foundation post-merge audit: this PR
- PR-B Prize receipt polling state machine design-to-implementation, no
  scheduler auto-start
- PR-C Prize polling admin/manual runner or service-level unit only
- PR-D trackingService worker checkpoint contract
- PR-E wallet monitor / realtime worker design
- PR-F staging migration evidence PR only when non-secret evidence exists

## Non-goals

- No backend implementation changes.
- No Prisma schema changes.
- No migration changes.
- No frontend changes.
- No contract changes.
- No package or lockfile changes.
- No harness, workflow, scripts, CODEX policy, or docs/process changes.
- No Prize receipt polling implementation.
- No trackingService worker implementation.
- No scheduler JobRun integration.
- No wallet monitor worker implementation.
- No tier transaction worker implementation.
- No deploy, mint, sendToWallet execution, governance transaction, TierUpdater
  transaction, funded transaction, or staging rollout.
- No secrets or raw payloads.
