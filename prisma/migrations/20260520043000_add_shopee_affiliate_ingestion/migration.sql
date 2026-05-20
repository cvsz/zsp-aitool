-- Phase 034: persistent Shopee Affiliate ingestion queue.
-- Safe production migration for PostgreSQL / Prisma migrate deploy.

CREATE TYPE "ShopeeAffiliateIngestionSource" AS ENUM ('MANUAL', 'CSV', 'EXTENSION', 'OPEN_API_FUTURE');
CREATE TYPE "ShopeeAffiliateIngestionStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'IMPORTED', 'FAILED');

CREATE TABLE "ShopeeAffiliateIngestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "source" "ShopeeAffiliateIngestionSource" NOT NULL,
    "status" "ShopeeAffiliateIngestionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "affiliateUrl" TEXT,
    "productUrl" TEXT,
    "title" TEXT,
    "campaignNote" TEXT,
    "price" DECIMAL(12,2),
    "normalizedPayload" JSONB,
    "errorSummary" TEXT,
    "rowIndex" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopeeAffiliateIngestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShopeeAffiliateIngestion_userId_status_createdAt_idx" ON "ShopeeAffiliateIngestion"("userId", "status", "createdAt");
CREATE INDEX "ShopeeAffiliateIngestion_source_status_idx" ON "ShopeeAffiliateIngestion"("source", "status");
CREATE INDEX "ShopeeAffiliateIngestion_productId_idx" ON "ShopeeAffiliateIngestion"("productId");
CREATE INDEX "ShopeeAffiliateIngestion_deletedAt_idx" ON "ShopeeAffiliateIngestion"("deletedAt");

ALTER TABLE "ShopeeAffiliateIngestion" ADD CONSTRAINT "ShopeeAffiliateIngestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopeeAffiliateIngestion" ADD CONSTRAINT "ShopeeAffiliateIngestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
