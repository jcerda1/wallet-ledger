-- CreateEnum
CREATE TYPE "Type" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "ledger_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ledger_user_id" ON "ledger_transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_ledger_user_id_created_at" ON "ledger_transactions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_transaction_id_key" ON "purchases"("transaction_id");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "ledger_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
