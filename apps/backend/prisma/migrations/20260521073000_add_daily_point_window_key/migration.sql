-- Add a nullable daily window key for idempotent Daily FanPoint claims.
-- Existing rows remain null, so historical non-daily bonuses and legacy rows do not block the migration.
ALTER TABLE "public"."PointHistory"
ADD COLUMN "dailyWindowKey" VARCHAR(16);

CREATE UNIQUE INDEX "PointHistory_userId_reason_dailyWindowKey_key"
ON "public"."PointHistory"("userId", "reason", "dailyWindowKey");

CREATE INDEX "PointHistory_userId_reason_receivedDate_idx"
ON "public"."PointHistory"("userId", "reason", "receivedDate");
