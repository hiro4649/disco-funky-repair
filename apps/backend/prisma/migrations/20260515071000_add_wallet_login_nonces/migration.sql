CREATE TABLE "WalletLoginNonce" (
    "id" SERIAL NOT NULL,
    "wallet_address" VARCHAR(255) NOT NULL,
    "nonce_hash" VARCHAR(64) NOT NULL,
    "message" TEXT NOT NULL,
    "issued_at" TIMESTAMP(6) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLoginNonce_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WalletLoginNonce_message_key" ON "WalletLoginNonce"("message");
CREATE INDEX "WalletLoginNonce_wallet_address_expires_at_idx" ON "WalletLoginNonce"("wallet_address", "expires_at");
CREATE INDEX "WalletLoginNonce_used_at_idx" ON "WalletLoginNonce"("used_at");
