-- CreateEnum
CREATE TYPE "ShopeeAffiliateSocialChannel" AS ENUM ('FACEBOOK', 'THREADS', 'X', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE_SHORTS');

-- CreateEnum
CREATE TYPE "ShopeeAffiliateSocialDraftStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'COPIED', 'ARCHIVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ShopeeAffiliateSocialDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ingestionId" TEXT NOT NULL,
    "productId" TEXT,
    "affiliateLinkId" TEXT,
    "channel" "ShopeeAffiliateSocialChannel" NOT NULL,
    "status" "ShopeeAffiliateSocialDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "copiedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShopeeAffiliateSocialDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShopeeAffiliateSocialDraft_userId_ingestionId_channel_createdAt_idx" ON "ShopeeAffiliateSocialDraft"("userId", "ingestionId", "channel", "createdAt");
CREATE INDEX "ShopeeAffiliateSocialDraft_userId_status_createdAt_idx" ON "ShopeeAffiliateSocialDraft"("userId", "status", "createdAt");

ALTER TABLE "ShopeeAffiliateSocialDraft" ADD CONSTRAINT "ShopeeAffiliateSocialDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopeeAffiliateSocialDraft" ADD CONSTRAINT "ShopeeAffiliateSocialDraft_ingestionId_fkey" FOREIGN KEY ("ingestionId") REFERENCES "ShopeeAffiliateIngestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopeeAffiliateSocialDraft" ADD CONSTRAINT "ShopeeAffiliateSocialDraft_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShopeeAffiliateSocialDraft" ADD CONSTRAINT "ShopeeAffiliateSocialDraft_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "AffiliateLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
