/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transaction_hash_key" ON "transaction"("hash");
