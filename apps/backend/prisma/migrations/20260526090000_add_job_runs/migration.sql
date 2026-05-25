CREATE TYPE "public"."JobRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMED_OUT', 'MANUAL_REVIEW', 'CANCELED');

CREATE TABLE "public"."job_runs" (
    "id" SERIAL NOT NULL,
    "job_name" VARCHAR(128) NOT NULL,
    "run_key" VARCHAR(255) NOT NULL,
    "status" "public"."JobRunStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(6),
    "finished_at" TIMESTAMP(6),
    "heartbeat_at" TIMESTAMP(6),
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "locked_by" VARCHAR(128),
    "checkpoint" JSON,
    "safe_error_kind" VARCHAR(100),
    "safe_summary" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_runs_job_name_run_key_key" ON "public"."job_runs"("job_name", "run_key");
CREATE INDEX "job_runs_status_idx" ON "public"."job_runs"("status");
CREATE INDEX "job_runs_heartbeat_at_idx" ON "public"."job_runs"("heartbeat_at");
CREATE INDEX "job_runs_job_name_idx" ON "public"."job_runs"("job_name");
CREATE INDEX "job_runs_created_at_idx" ON "public"."job_runs"("created_at");
