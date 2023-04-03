/*
  Warnings:

  - You are about to alter the column `gasLimit` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `gasPrice` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `gasUsed` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `quantity` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "gasPrice" BIGINT NOT NULL,
    "gasLimit" BIGINT NOT NULL
);
INSERT INTO "new_transaction" ("blockHeight", "from", "gasLimit", "gasPrice", "gasUsed", "hash", "id", "quantity", "to") SELECT "blockHeight", "from", "gasLimit", "gasPrice", "gasUsed", "hash", "id", "quantity", "to" FROM "transaction";
DROP TABLE "transaction";
ALTER TABLE "new_transaction" RENAME TO "transaction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
