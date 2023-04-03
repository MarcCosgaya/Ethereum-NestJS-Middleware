-- CreateTable
CREATE TABLE "transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "gasUsed" REAL NOT NULL,
    "gasPrice" REAL NOT NULL,
    "gasLimit" REAL NOT NULL
);
