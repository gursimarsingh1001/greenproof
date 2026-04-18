-- AlterTable
ALTER TABLE "Product" ADD COLUMN "dataSource" TEXT NOT NULL DEFAULT 'local_seed';
ALTER TABLE "Product" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN "sourceMetadata" JSONB;

-- CreateIndex
CREATE INDEX "Product_dataSource_idx" ON "Product"("dataSource");
