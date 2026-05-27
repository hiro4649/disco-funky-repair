# FUNKY Tracking Service Side Effect Audit

## Purpose

This note records the import side-effect boundary around `trackingService`
before any worker or scheduler implementation changes. It is investigation
evidence only. It does not change runtime behavior and does not claim runtime
readiness.

## Current Main Evidence

- Main SHA investigated: `c2d3efa75ff64f3b671854b06c81129c5f8044a1`
- Active harness: v0.9.2
- Active self-test: `scripts/codex-v092-self-test.mjs`
- Review Policy status: `AGENTS.md` includes a Review Policy section outside
  the harness block. Tracking service, workers, schedulers, and background jobs
  are treated as high-risk boundaries for later implementation review.

## Scope

In scope:

- `apps/backend/src/app/services/trackingService.ts`
- `apps/backend/src/app/index.ts`
- `apps/backend/src/main.ts`
- tracking-related backend libraries imported by `trackingService`
- test, Docker, and CI impact from importing the HTTP app

Out of scope:

- No backend product code changes.
- No worker hookup.
- No scheduler runtime change.
- No JobRun worker hookup.
- No Prize receipt polling.
- No trackingService polling implementation.
- No schema, migration, package, lockfile, frontend, contract, workflow, or
  harness weakening change.

## Import Graph Summary

| Path | Import or call | Effect |
| --- | --- | --- |
| `apps/backend/src/main.ts` | imports `{ server }` from `./app` | Loads the HTTP app module before explicit startup calls. |
| `apps/backend/src/app/index.ts` | bare-imports `./services/trackingService` | Importing the app loads `trackingService` for side effects. |
| `apps/backend/src/app/services/trackingService.ts` | imports cron, Prisma, token balance, token registration, realtime listener, tier scheduler, holding-duration updater, and wallet monitor modules | Registers background jobs at module load and starts the realtime listener. |
| `trackingService.ts` -> `trackingTokenBalanceEthereum.ts` | imports token balance processing | Imports Prisma and the QuickNode token-balance service singleton. |
| `trackingService.ts` -> `realtimeEventListener.ts` | calls `startRealtimeEventListener()` at top level | Starts a websocket listener when the required websocket and token environment is configured. |
| `trackingService.ts` -> `tierScheduler.ts` | schedules tier update processing | Runtime path can send tier updater transactions when the scheduled job runs. |
| `trackingService.ts` -> `walletBalanceMonitor.ts` | schedules wallet balance monitoring | Runtime path can perform RPC balance checks and alerting when the scheduled job runs. |

The current HTTP app import is therefore also a background-worker import.

## Top-Level Side Effects

`trackingService.ts` has import-time side effects:

- registers the six-hour token balance cron job
- registers the daily tracking fallback cron job
- registers prize probability recalculation
- registers token registration / prize discovery
- registers ticket-code expiration
- starts the realtime event listener immediately
- registers scheduled tier updates
- registers scheduled tier cleanup
- registers hourly holding-duration updates
- registers daily admin wallet balance checks

Additional import-time setup happens in imported modules:

- `apps/backend/src/app/db/prisma_client.ts` creates a Prisma client singleton
  on import.
- `apps/backend/src/app/lib/quicknodeRpcService.ts` creates a token-balance
  service singleton. When QuickNode and token environment is configured, it
  constructs provider and contract objects.
- `apps/backend/src/app/lib/walletBalanceMonitor.ts` creates a wallet monitor
  singleton and reads monitoring-related environment at import time.

No direct `sendToWallet`, mint, governance transaction, funded transaction, or
Prize receipt polling execution was found in the `trackingService` import path.
Those actions remain separate from this investigation.

## Worker, Scheduler, and Polling Startup Conditions

Current startup condition:

- any import of `apps/backend/src/app/index.ts` imports `trackingService.ts`
- importing `trackingService.ts` registers cron jobs immediately
- importing `trackingService.ts` calls `startRealtimeEventListener()`

Explicit startup condition that already exists elsewhere:

- `apps/backend/src/main.ts` explicitly calls `CronService.startAllCronJobs()`
- `apps/backend/src/main.ts` explicitly calls `startTrialNFTSchedulers()`

The tracking scheduler is different from those explicit startup paths because
it is currently coupled to HTTP app import rather than an explicit server or
worker entrypoint.

## DB, External API, and Transaction Contact

At import time:

- Prisma client construction occurs through the shared singleton import.
- QuickNode provider and contract objects can be constructed when environment
  is configured.
- A realtime websocket listener can be started immediately when its environment
  is configured.

When scheduled callbacks run:

- six-hour token balance processing performs all-user DB work and external
  token balance reads
- daily tracking fallback performs DB reads/writes and external chain checks
- token registration / prize discovery uses Etherscan, RPC, DexScreener, and DB
  writes
- scheduled tier updates can read RPC state, send a TierUpdater transaction,
  and wait for transaction results
- wallet monitor performs RPC balance checks and alerting
- hourly holding-duration update performs all-user DB writes and websocket
  notifications

Transaction-scoped advisory locks are not a fit for these long-running or
external API/RPC paths. The prior `job_runs` design remains the safer direction
for durable ownership, retry, timeout, checkpoint, and resume behavior.

## Test, Docker, and CI Impact

Tests that build small Express apps around individual routers generally avoid
importing `apps/backend/src/app/index.ts`. Tests or tools that import the full
HTTP app or server can register tracking cron jobs and start the realtime
listener during import.

Docker smoke starts the production entrypoint, which imports the HTTP app. With
non-secret dummy environment and no websocket/RPC values, the realtime listener
should not connect, but cron jobs are still registered. If real websocket or
RPC configuration is present in a runtime environment, importing the HTTP app
can start external background activity before an explicit worker boundary.

The current tests do not appear to assert that importing the HTTP app is free of
tracking scheduler side effects. A later implementation PR should add that
boundary test before or with the import separation.

## Minimal Next PR Scope

Recommended implementation split:

1. Add explicit `startTrackingSchedulers()` and `stopTrackingSchedulers()`
   exports to `trackingService.ts`.
2. Store cron task handles returned by `node-cron` so tests and shutdown paths
   can stop them.
3. Move `startRealtimeEventListener()` inside the explicit start function.
4. Remove the bare `./services/trackingService` import from
   `apps/backend/src/app/index.ts`.
5. Call `startTrackingSchedulers()` from `apps/backend/src/main.ts` beside the
   existing explicit `CronService.startAllCronJobs()` and
   `startTrialNFTSchedulers()` calls.
6. Add a focused test that importing the HTTP app does not call
   `node-cron.schedule` or `startRealtimeEventListener`.

Keep out of that PR:

- no JobRun worker connection
- no Prize receipt polling
- no trackingService worker implementation
- no scheduler redesign beyond explicit startup
- no external API/RPC execution
- no deployment or staging rollout

## Residual Risks

- The import side effect remains in current main because this is documentation
  only.
- Realtime listener and cron registration are still coupled to HTTP app import.
- Full worker separation, JobRun ownership, checkpointing, and retry behavior
  remain future implementation work.
- Docker smoke verifies container startup, but it does not prove that background
  jobs are separated from HTTP import.
- Staging no-tx preflight remains BLOCKED.
- Production readiness is not claimed.
