-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW', 'RECEIVED', 'EXPIRED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."TicketCodeStatus" AS ENUM ('PENDING', 'CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DiscoTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'BET', 'WIN', 'CASHOUT', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."DiscoTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "wallet_address" VARCHAR(255) NOT NULL,
    "level" INTEGER NOT NULL,
    "fan_points" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tickets" INTEGER NOT NULL DEFAULT 0,
    "claimTickets" INTEGER NOT NULL DEFAULT 0,
    "rarity" INTEGER NOT NULL DEFAULT 1,
    "disco_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "holdingDate" INTEGER NOT NULL DEFAULT 0,
    "held_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "held_updates" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referral_code" VARCHAR(255),
    "referred_by" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prize" (
    "id" SERIAL NOT NULL,
    "ca" VARCHAR(255) NOT NULL,
    "token_name" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "balance_amount" DECIMAL(78,0) NOT NULL DEFAULT 0,
    "reserved_amount" DECIMAL(78,0) NOT NULL DEFAULT 0,
    "default_image" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "listed_DEX" VARCHAR(255) NOT NULL,
    "telegram" VARCHAR(255),
    "twitter" VARCHAR(255),
    "discord" VARCHAR(255),
    "ranking" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "real_probability" DOUBLE PRECISION NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "fake_probability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saved_probability" DOUBLE PRECISION NOT NULL,
    "earned_pts" INTEGER NOT NULL,
    "flag" BOOLEAN NOT NULL DEFAULT false,
    "dance" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TokenDetail" (
    "id" SERIAL NOT NULL,
    "ca" VARCHAR(255) NOT NULL,
    "listed_DEX" VARCHAR(255) NOT NULL,
    "token_symbol" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "fdv" DOUBLE PRECISION NOT NULL,
    "holders" DOUBLE PRECISION NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,
    "circulating_supply" DOUBLE PRECISION NOT NULL,
    "max_supply" DOUBLE PRECISION NOT NULL,
    "total_supply" DOUBLE PRECISION NOT NULL,
    "scarcityScore" DOUBLE PRECISION NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "volume_24h" DOUBLE PRECISION NOT NULL,
    "liquidity" DOUBLE PRECISION NOT NULL,
    "tradeVolumeRatio" DOUBLE PRECISION NOT NULL,
    "tradeVolumeRatio_dex" DOUBLE PRECISION NOT NULL,
    "txns" DOUBLE PRECISION NOT NULL,
    "txns_24h" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrizeTransactions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "prizeId" INTEGER NOT NULL,
    "tx_hash" VARCHAR(255),
    "transfer_token_address" VARCHAR(255),
    "transfer_amount" VARCHAR(255),
    "reservation_released_at" TIMESTAMP(3),
    "probability_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" "public"."Status" NOT NULL DEFAULT 'READY',

    CONSTRAINT "PrizeTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ownedToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sixHourTokenBalance" DOUBLE PRECISION NOT NULL,
    "tallyTokenBalance" DOUBLE PRECISION NOT NULL,
    "weeklyTokenBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyCheckTimes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ownedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LotteryTickets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ticket" INTEGER NOT NULL DEFAULT 0,
    "receivedDate" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "LotteryTickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PointHistory" (
    "id" SERIAL NOT NULL,
    "reason" INTEGER NOT NULL DEFAULT 1,
    "userId" INTEGER NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "receivedDate" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PointHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirdropTokens" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 10000,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AirdropTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nft" (
    "id" SERIAL NOT NULL,
    "holderId" INTEGER,
    "name" TEXT NOT NULL,
    "creator" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "excelImageName" VARCHAR(255),
    "localImagePath" TEXT,
    "royalty" DOUBLE PRECISION NOT NULL,
    "attributes" JSON NOT NULL,
    "collectionId" TEXT NOT NULL,
    "externalUrl" TEXT,
    "ipfsCid" TEXT,
    "mintStatus" BOOLEAN NOT NULL DEFAULT false,
    "excelUploaded" BOOLEAN NOT NULL DEFAULT false,
    "ipfsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "imageMatched" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrialNftTemplate" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxMints" INTEGER NOT NULL DEFAULT 0,
    "mintCount" INTEGER NOT NULL DEFAULT 0,
    "validDays" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialNftTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrialNft" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER,
    "name" VARCHAR(255) NOT NULL DEFAULT 'Trial NFT',
    "description" TEXT NOT NULL DEFAULT 'Free trial NFT that boosts FanPoints for 5 days',
    "image" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(6) NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "bonusApplied" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialNft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SetTicketDistribute" (
    "id" SERIAL NOT NULL,
    "day" INTEGER,
    "hour" INTEGER,
    "minutes" INTEGER,
    "weekly" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetTicketDistribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."News" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Illustration" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT,
    "earned_pts" INTEGER NOT NULL DEFAULT 0,
    "rarity" INTEGER NOT NULL DEFAULT 1,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Illustration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IllustrationHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "illustrationId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllustrationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HoldDateHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tx_hash" VARCHAR(255) NOT NULL,
    "purchase_amount" DECIMAL(38,18) NOT NULL,
    "purchase_date" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HoldDateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransactionCheckpoint" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lastProcessedBlock" INTEGER NOT NULL DEFAULT 0,
    "lastTransactionHash" VARCHAR(255),
    "lastBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastProcessedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingPriority" INTEGER NOT NULL DEFAULT 1,
    "needsFullRecalc" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransactionAudit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tx_hash" VARCHAR(255) NOT NULL,
    "from_address" VARCHAR(255) NOT NULL,
    "to_address" VARCHAR(255) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction_type" VARCHAR(50) NOT NULL,
    "fifo_impact" VARCHAR(20) NOT NULL,
    "classification_reason" TEXT NOT NULL,
    "metadata" JSON,
    "block_number" INTEGER NOT NULL,
    "transaction_date" TIMESTAMP(6) NOT NULL,
    "processed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduledTierUpdate" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(6) NOT NULL,
    "expectedTier" INTEGER NOT NULL,
    "currentTier" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledTierUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TicketCode" (
    "id" SERIAL NOT NULL,
    "wallet_address" VARCHAR(255) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "status" "public"."TicketCodeStatus" NOT NULL DEFAULT 'PENDING',
    "claimed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DexList" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedBy" VARCHAR(255),
    "txHash" VARCHAR(255),
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DexList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeChangeHistory" (
    "id" SERIAL NOT NULL,
    "changeType" VARCHAR(50) NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "changedBy" VARCHAR(255) NOT NULL,
    "txHash" VARCHAR(255),
    "holdingDate" INTEGER,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeChangeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscoTransactions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "public"."DiscoTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "game" VARCHAR(50),
    "game_id" VARCHAR(255),
    "tx_hash" VARCHAR(255),
    "status" "public"."DiscoTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReferralRewards" (
    "id" SERIAL NOT NULL,
    "referrer_wallet" VARCHAR(255) NOT NULL,
    "referred_wallet" VARCHAR(255) NOT NULL,
    "snapshot_verified" BOOLEAN NOT NULL DEFAULT false,
    "rewarded" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralRewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_address_key" ON "public"."User"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "public"."User"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "TokenDetail_ca_key" ON "public"."TokenDetail"("ca");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ownedToken_userId_key" ON "public"."ownedToken"("userId");

-- CreateIndex
CREATE INDEX "ownedToken_userId_idx" ON "public"."ownedToken"("userId");

-- CreateIndex
CREATE INDEX "TrialNftTemplate_isAvailable_idx" ON "public"."TrialNftTemplate"("isAvailable");

-- CreateIndex
CREATE INDEX "TrialNft_userId_idx" ON "public"."TrialNft"("userId");

-- CreateIndex
CREATE INDEX "TrialNft_templateId_idx" ON "public"."TrialNft"("templateId");

-- CreateIndex
CREATE INDEX "TrialNft_expiresAt_idx" ON "public"."TrialNft"("expiresAt");

-- CreateIndex
CREATE INDEX "TrialNft_isActive_idx" ON "public"."TrialNft"("isActive");

-- CreateIndex
CREATE INDEX "HoldDateHistory_userId_idx" ON "public"."HoldDateHistory"("userId");

-- CreateIndex
CREATE INDEX "HoldDateHistory_purchase_date_idx" ON "public"."HoldDateHistory"("purchase_date");

-- CreateIndex
CREATE INDEX "HoldDateHistory_updatedAt_idx" ON "public"."HoldDateHistory"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HoldDateHistory_userId_tx_hash_key" ON "public"."HoldDateHistory"("userId", "tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCheckpoint_userId_key" ON "public"."TransactionCheckpoint"("userId");

-- CreateIndex
CREATE INDEX "TransactionCheckpoint_processingPriority_idx" ON "public"."TransactionCheckpoint"("processingPriority");

-- CreateIndex
CREATE INDEX "TransactionCheckpoint_lastProcessedDate_idx" ON "public"."TransactionCheckpoint"("lastProcessedDate");

-- CreateIndex
CREATE INDEX "TransactionCheckpoint_lastActivityDate_idx" ON "public"."TransactionCheckpoint"("lastActivityDate");

-- CreateIndex
CREATE INDEX "TransactionCheckpoint_needsFullRecalc_idx" ON "public"."TransactionCheckpoint"("needsFullRecalc");

-- CreateIndex
CREATE INDEX "TransactionAudit_userId_idx" ON "public"."TransactionAudit"("userId");

-- CreateIndex
CREATE INDEX "TransactionAudit_transaction_type_idx" ON "public"."TransactionAudit"("transaction_type");

-- CreateIndex
CREATE INDEX "TransactionAudit_fifo_impact_idx" ON "public"."TransactionAudit"("fifo_impact");

-- CreateIndex
CREATE INDEX "TransactionAudit_transaction_date_idx" ON "public"."TransactionAudit"("transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionAudit_userId_tx_hash_key" ON "public"."TransactionAudit"("userId", "tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledTierUpdate_userId_key" ON "public"."ScheduledTierUpdate"("userId");

-- CreateIndex
CREATE INDEX "ScheduledTierUpdate_scheduledAt_processed_idx" ON "public"."ScheduledTierUpdate"("scheduledAt", "processed");

-- CreateIndex
CREATE INDEX "ScheduledTierUpdate_processed_idx" ON "public"."ScheduledTierUpdate"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "TicketCode_code_key" ON "public"."TicketCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DexList_address_key" ON "public"."DexList"("address");

-- CreateIndex
CREATE INDEX "ReferralRewards_snapshot_verified_idx" ON "public"."ReferralRewards"("snapshot_verified");

-- CreateIndex
CREATE INDEX "ReferralRewards_rewarded_idx" ON "public"."ReferralRewards"("rewarded");

-- CreateIndex
CREATE INDEX "ReferralRewards_expires_at_idx" ON "public"."ReferralRewards"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralRewards_referrer_wallet_referred_wallet_key" ON "public"."ReferralRewards"("referrer_wallet", "referred_wallet");

-- AddForeignKey
ALTER TABLE "public"."PrizeTransactions" ADD CONSTRAINT "PrizeTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrizeTransactions" ADD CONSTRAINT "PrizeTransactions_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "public"."Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ownedToken" ADD CONSTRAINT "ownedToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LotteryTickets" ADD CONSTRAINT "LotteryTickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointHistory" ADD CONSTRAINT "PointHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirdropTokens" ADD CONSTRAINT "AirdropTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrialNft" ADD CONSTRAINT "TrialNft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrialNft" ADD CONSTRAINT "TrialNft_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."TrialNftTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IllustrationHistory" ADD CONSTRAINT "IllustrationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IllustrationHistory" ADD CONSTRAINT "IllustrationHistory_illustrationId_fkey" FOREIGN KEY ("illustrationId") REFERENCES "public"."Illustration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HoldDateHistory" ADD CONSTRAINT "HoldDateHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionCheckpoint" ADD CONSTRAINT "TransactionCheckpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionAudit" ADD CONSTRAINT "TransactionAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledTierUpdate" ADD CONSTRAINT "ScheduledTierUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscoTransactions" ADD CONSTRAINT "DiscoTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReferralRewards" ADD CONSTRAINT "ReferralRewards_referred_wallet_fkey" FOREIGN KEY ("referred_wallet") REFERENCES "public"."User"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReferralRewards" ADD CONSTRAINT "ReferralRewards_referrer_wallet_fkey" FOREIGN KEY ("referrer_wallet") REFERENCES "public"."User"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;
