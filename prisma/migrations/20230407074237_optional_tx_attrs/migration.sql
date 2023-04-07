-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "blockHeight" INTEGER,
    "gasUsed" BIGINT,
    "gasPrice" BIGINT,
    "gasLimit" BIGINT NOT NULL
);
INSERT INTO "new_transaction" ("blockHeight", "from", "gasLimit", "gasPrice", "gasUsed", "hash", "id", "quantity", "to") SELECT "blockHeight", "from", "gasLimit", "gasPrice", "gasUsed", "hash", "id", "quantity", "to" FROM "transaction";
DROP TABLE "transaction";
ALTER TABLE "new_transaction" RENAME TO "transaction";
CREATE UNIQUE INDEX "transaction_hash_key" ON "transaction"("hash");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
