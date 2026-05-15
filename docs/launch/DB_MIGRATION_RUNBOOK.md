# DB Migration Runbook

## Scope

This runbook is for DISCO.fan / FUNKY.fan BSC launch staging and production databases.

Current assumption:

- Staging DB has not been created yet.
- Production DB has not been created yet.
- This is a new-DB baseline, not a migration from an existing production DB.
- No `.env`, private key, API key, RPC URL, JWT secret, or DB connection string should be written into this repository.
- `DATABASE_URL` must be provided only by the approved local shell, CI secret store, staging secret store, or production secret store.

## Baseline

Baseline migration:

- `apps/backend/prisma/migrations/20260515053000_baseline_current_schema/migration.sql`

It was generated from the current `apps/backend/prisma/schema.prisma` using Prisma migrate diff from an empty PostgreSQL database.

This baseline includes the P0 schema fields and statuses needed by the current code, including:

- `Prize.balance_amount`
- `Prize.reserved_amount`
- `PrizeTransactions.transfer_token_address`
- `PrizeTransactions.transfer_amount`
- `PrizeTransactions.reservation_released_at`
- Prize transaction statuses including `BROADCASTED`, `MANUAL_REVIEW`, `EXPIRED`, `CANCELLED`, and `FAILED`

## Backend Scripts

Run from `apps/backend`.

```powershell
npm run prisma:validate
npm run prisma:generate
npm run migrate:status
npm run migrate:deploy
npm run migrate:dev
```

Use `migrate:deploy` for staging and production.

Use `migrate:dev` only on disposable local development databases.

`prisma validate` requires `DATABASE_URL` to be set even when it does not connect to the database. For schema-only local validation, set a non-secret placeholder in the current shell only. Do not write it to `.env`:

```powershell
$env:DATABASE_URL='<non-secret local PostgreSQL URL placeholder>'
npx prisma validate
Remove-Item Env:\DATABASE_URL
```

## Staging DB Creation

1. Create a new empty PostgreSQL database for staging.
2. Store the staging `DATABASE_URL` only in the staging secret manager or approved local shell.
3. Do not commit the staging `DATABASE_URL`.
4. From the backend directory, validate the schema:

```powershell
cd apps/backend
npm run prisma:validate
```

5. Check migration status before deploy:

```powershell
npm run migrate:status
```

Expected for a fresh DB: the baseline migration is pending.

6. Apply migrations:

```powershell
npm run migrate:deploy
```

7. Generate Prisma Client:

```powershell
npm run prisma:generate
```

8. Verify status after deploy:

```powershell
npm run migrate:status
```

Expected after deploy: database schema is up to date.

9. Run backend verification:

```powershell
npm run build
npm test -- --runInBand
```

10. If seed data is required for staging, prepare a separate reviewed seed plan before running `npm run seed`.

## Production DB Creation

1. Create a new empty PostgreSQL database for production.
2. Store the production `DATABASE_URL` only in the production secret manager.
3. Do not print, paste, or commit the production `DATABASE_URL`.
4. Ensure the application is not serving production traffic during first migration deploy.
5. From the backend release artifact or checked-out release commit, validate:

```powershell
cd apps/backend
npm run prisma:validate
```

6. Check migration status:

```powershell
npm run migrate:status
```

Expected for the first production DB: the baseline migration is pending.

7. Apply migrations:

```powershell
npm run migrate:deploy
```

8. Generate Prisma Client:

```powershell
npm run prisma:generate
```

9. Verify migration status:

```powershell
npm run migrate:status
```

Expected after deploy: database schema is up to date.

10. Start the backend only after migration deploy succeeds.

## Rollback Policy

For the initial launch database:

- Prefer rollback by replacing the new empty DB with a freshly created empty DB and redeploying the last known-good migration set.
- Do not manually edit Prisma migration files after they are merged.
- Do not run `prisma migrate reset` against staging or production unless the DB has been explicitly approved for destruction.
- Do not use `prisma db push` against staging or production.

If `migrate:deploy` fails before any production traffic:

1. Stop deployment.
2. Capture only non-secret error metadata.
3. Drop and recreate the empty DB only if approved by the release owner.
4. Fix the migration in a new PR.
5. Re-run `migrate:deploy` on a fresh empty DB.

If the DB already contains real users, tickets, PrizeTransactions, or on-chain reconciliation data:

- Do not drop the DB.
- Do not run destructive rollback.
- Create a forward-only migration or a reviewed manual remediation plan.
- Any existing data migration must be written as a separate reviewed task. It is not executed by this baseline runbook.

## Existing Data Migration

Current production DB is assumed to not exist.

If an older database is later discovered, this baseline must not be applied blindly. Required follow-up:

- Inventory existing tables and row counts without exposing secrets.
- Compare existing schema to `schema.prisma`.
- Write a separate migration/backfill plan for existing rows.
- Backfill `Prize.balance_amount`, `Prize.reserved_amount`, and `PrizeTransactions.reservation_released_at` only through a reviewed plan.

## Pre-Deploy Checklist

Run from `apps/backend`.

```powershell
npm ci
npm run prisma:validate
npm run build
npm test -- --runInBand
npm run migrate:status
```

## Post-Deploy Checklist

Run from `apps/backend`.

```powershell
npm run migrate:status
npm run prisma:generate
npm run build
```

Operational checks after backend starts:

- Confirm backend can connect to the intended staging or production DB.
- Confirm `_prisma_migrations` contains `20260515053000_baseline_current_schema`.
- Confirm no `.env` or DB connection value was added to the repository.
