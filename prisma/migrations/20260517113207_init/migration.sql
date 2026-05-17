-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'THREADS', 'X');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('CASUAL', 'FRIENDLY', 'PROFESSIONAL', 'SALES', 'REVIEW');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('TH', 'EN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "originalUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT,
    "shopName" TEXT,
    "rating" DECIMAL(3,2),
    "soldCount" INTEGER,
    "description" TEXT,
    "category" TEXT,
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "trackingCode" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "tone" "Tone" NOT NULL,
    "language" "Language" NOT NULL,
    "prompt" TEXT NOT NULL,
    "output" JSONB NOT NULL,
    "tokenUsage" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ContentGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "platform" "Platform" NOT NULL,
    "tone" "Tone",
    "language" "Language" NOT NULL,
    "template" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ContentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform",
    "tone" "Tone",
    "language" "Language",
    "prompt" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PromptPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OCRJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "extractedText" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "rawResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OCRJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarProduct" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "relatedProductId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SimilarProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "contentGenerationId" TEXT,
    "platform" "Platform" NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "postedAt" TIMESTAMP(3),
    "externalPostId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlatformPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultLanguage" "Language" NOT NULL DEFAULT 'TH',
    "defaultTone" "Tone" NOT NULL DEFAULT 'FRIENDLY',
    "defaultPlatform" "Platform",
    "affiliateDisclosure" TEXT,
    "defaultHashtags" TEXT[],
    "ctaStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "model" TEXT,
    "requestToken" INTEGER,
    "responseToken" INTEGER,
    "totalToken" INTEGER,
    "costUsd" DECIMAL(12,6),
    "status" "JobStatus" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "APIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Product_userId_createdAt_idx" ON "Product"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_userId_category_idx" ON "Product"("userId", "category");

-- CreateIndex
CREATE INDEX "Product_userId_deletedAt_idx" ON "Product"("userId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_userId_originalUrl_key" ON "Product"("userId", "originalUrl");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_deletedAt_idx" ON "ProductImage"("deletedAt");

-- CreateIndex
CREATE INDEX "AffiliateLink_userId_platform_idx" ON "AffiliateLink"("userId", "platform");

-- CreateIndex
CREATE INDEX "AffiliateLink_productId_idx" ON "AffiliateLink"("productId");

-- CreateIndex
CREATE INDEX "AffiliateLink_deletedAt_idx" ON "AffiliateLink"("deletedAt");

-- CreateIndex
CREATE INDEX "ContentGeneration_userId_createdAt_idx" ON "ContentGeneration"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentGeneration_productId_idx" ON "ContentGeneration"("productId");

-- CreateIndex
CREATE INDEX "ContentGeneration_platform_status_idx" ON "ContentGeneration"("platform", "status");

-- CreateIndex
CREATE INDEX "ContentGeneration_deletedAt_idx" ON "ContentGeneration"("deletedAt");

-- CreateIndex
CREATE INDEX "ContentTemplate_userId_platform_language_idx" ON "ContentTemplate"("userId", "platform", "language");

-- CreateIndex
CREATE INDEX "ContentTemplate_userId_isActive_idx" ON "ContentTemplate"("userId", "isActive");

-- CreateIndex
CREATE INDEX "ContentTemplate_deletedAt_idx" ON "ContentTemplate"("deletedAt");

-- CreateIndex
CREATE INDEX "PromptPreset_userId_platform_idx" ON "PromptPreset"("userId", "platform");

-- CreateIndex
CREATE INDEX "PromptPreset_deletedAt_idx" ON "PromptPreset"("deletedAt");

-- CreateIndex
CREATE INDEX "OCRJob_userId_status_createdAt_idx" ON "OCRJob"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "OCRJob_deletedAt_idx" ON "OCRJob"("deletedAt");

-- CreateIndex
CREATE INDEX "SimilarProduct_sourceProductId_score_idx" ON "SimilarProduct"("sourceProductId", "score");

-- CreateIndex
CREATE INDEX "SimilarProduct_relatedProductId_idx" ON "SimilarProduct"("relatedProductId");

-- CreateIndex
CREATE INDEX "SimilarProduct_deletedAt_idx" ON "SimilarProduct"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SimilarProduct_sourceProductId_relatedProductId_key" ON "SimilarProduct"("sourceProductId", "relatedProductId");

-- CreateIndex
CREATE INDEX "PlatformPost_userId_platform_createdAt_idx" ON "PlatformPost"("userId", "platform", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformPost_productId_idx" ON "PlatformPost"("productId");

-- CreateIndex
CREATE INDEX "PlatformPost_deletedAt_idx" ON "PlatformPost"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE INDEX "UserSetting_deletedAt_idx" ON "UserSetting"("deletedAt");

-- CreateIndex
CREATE INDEX "APIUsageLog_userId_createdAt_idx" ON "APIUsageLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "APIUsageLog_provider_endpoint_idx" ON "APIUsageLog"("provider", "endpoint");

-- CreateIndex
CREATE INDEX "APIUsageLog_status_idx" ON "APIUsageLog"("status");

-- CreateIndex
CREATE INDEX "APIUsageLog_deletedAt_idx" ON "APIUsageLog"("deletedAt");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentGeneration" ADD CONSTRAINT "ContentGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentGeneration" ADD CONSTRAINT "ContentGeneration_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTemplate" ADD CONSTRAINT "ContentTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptPreset" ADD CONSTRAINT "PromptPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OCRJob" ADD CONSTRAINT "OCRJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OCRJob" ADD CONSTRAINT "OCRJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarProduct" ADD CONSTRAINT "SimilarProduct_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarProduct" ADD CONSTRAINT "SimilarProduct_relatedProductId_fkey" FOREIGN KEY ("relatedProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_contentGenerationId_fkey" FOREIGN KEY ("contentGenerationId") REFERENCES "ContentGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIUsageLog" ADD CONSTRAINT "APIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
