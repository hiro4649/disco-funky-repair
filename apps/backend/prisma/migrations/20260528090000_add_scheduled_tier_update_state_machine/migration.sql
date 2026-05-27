-- Adds durable state fields for ScheduledTierUpdate without changing runtime processing.
-- Existing rows default to PENDING. processed remains unchanged for backward compatibility.

CREATE TYPE "public"."ScheduledTierUpdateStatus" AS ENUM (
    'PENDING',
    'CLAIMED',
    'TX_SENT',
    'CONFIRMED',
    'FAILED',
    'TIMED_OUT',
    'MANUAL_REVIEW',
    'CANCELED'
);

ALTER TABLE "public"."ScheduledTierUpdate"
ADD COLUMN "status" "public"."ScheduledTierUpdateStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "attempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "lockedBy" VARCHAR(128),
ADD COLUMN "lockedAt" TIMESTAMP(6),
ADD COLUMN "heartbeatAt" TIMESTAMP(6),
ADD COLUMN "lockExpiresAt" TIMESTAMP(6),
ADD COLUMN "batchId" VARCHAR(255),
ADD COLUMN "txHash" VARCHAR(255),
ADD COLUMN "txChainId" INTEGER,
ADD COLUMN "txContractAddress" VARCHAR(255),
ADD COLUMN "txFrom" VARCHAR(255),
ADD COLUMN "txTo" VARCHAR(255),
ADD COLUMN "txBlockNumber" BIGINT,
ADD COLUMN "txReceiptStatus" INTEGER,
ADD COLUMN "txReceiptTimestamp" TIMESTAMP(6),
ADD COLUMN "txGasUsed" VARCHAR(255),
ADD COLUMN "sentAt" TIMESTAMP(6),
ADD COLUMN "confirmedAt" TIMESTAMP(6),
ADD COLUMN "failedAt" TIMESTAMP(6),
ADD COLUMN "safeErrorKind" VARCHAR(100),
ADD COLUMN "safeSummary" JSON;

CREATE INDEX "ScheduledTierUpdate_status_scheduledAt_idx" ON "public"."ScheduledTierUpdate"("status", "scheduledAt");
CREATE INDEX "ScheduledTierUpdate_lockExpiresAt_idx" ON "public"."ScheduledTierUpdate"("lockExpiresAt");
CREATE INDEX "ScheduledTierUpdate_txHash_idx" ON "public"."ScheduledTierUpdate"("txHash");
CREATE INDEX "ScheduledTierUpdate_batchId_idx" ON "public"."ScheduledTierUpdate"("batchId");
CREATE INDEX "ScheduledTierUpdate_status_heartbeatAt_idx" ON "public"."ScheduledTierUpdate"("status", "heartbeatAt");
