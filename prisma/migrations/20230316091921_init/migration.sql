-- CreateTable
CREATE TABLE "PKey" (
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PKey_value_key" ON "PKey"("value");
