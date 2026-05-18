ALTER TABLE "public"."PrizeTransactions"
ADD COLUMN "tx_chain_id" INTEGER,
ADD COLUMN "tx_from" VARCHAR(255),
ADD COLUMN "tx_to" VARCHAR(255),
ADD COLUMN "tx_contract_address" VARCHAR(255),
ADD COLUMN "tx_block_number" BIGINT,
ADD COLUMN "tx_receipt_status" INTEGER,
ADD COLUMN "tx_receipt_timestamp" TIMESTAMP(6),
ADD COLUMN "tx_public_amount" VARCHAR(255),
ADD COLUMN "tx_evidence_updated_at" TIMESTAMP(6);
