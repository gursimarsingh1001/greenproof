-- CreateTable
CREATE TABLE "VerificationSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "displayId" TEXT NOT NULL,
    "resultHash" TEXT NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "canonicalPayload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VerificationSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationSnapshot_displayId_key" ON "VerificationSnapshot"("displayId");

-- CreateIndex
CREATE INDEX "VerificationSnapshot_productId_idx" ON "VerificationSnapshot"("productId");

-- CreateIndex
CREATE INDEX "VerificationSnapshot_createdAt_idx" ON "VerificationSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "VerificationSnapshot_productId_resultHash_algorithmVersion_idx" ON "VerificationSnapshot"("productId", "resultHash", "algorithmVersion");
