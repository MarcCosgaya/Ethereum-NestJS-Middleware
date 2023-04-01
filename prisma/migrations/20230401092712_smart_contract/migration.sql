-- CreateTable
CREATE TABLE "contract" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abi" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_address_key" ON "contract"("address");
