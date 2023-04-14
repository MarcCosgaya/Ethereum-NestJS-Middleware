/*
  Warnings:

  - Added the required column `verified` to the `contract` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contract" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abi" TEXT NOT NULL,
    "bytecode" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "tx" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL
);
INSERT INTO "new_contract" ("abi", "address", "bytecode", "id", "source", "tx") SELECT "abi", "address", "bytecode", "id", "source", "tx" FROM "contract";
DROP TABLE "contract";
ALTER TABLE "new_contract" RENAME TO "contract";
CREATE UNIQUE INDEX "contract_address_key" ON "contract"("address");
CREATE UNIQUE INDEX "contract_tx_key" ON "contract"("tx");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
