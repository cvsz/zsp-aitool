CREATE TYPE "RenderJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TABLE "HyperFrameRenderJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT,
  "contentGenerationId" TEXT,
  "status" "RenderJobStatus" NOT NULL DEFAULT 'PENDING',
  "compositionHtml" TEXT NOT NULL,
  "compositionMetadata" JSONB,
  "outputPath" TEXT,
  "outputUrl" TEXT,
  "errorMessage" TEXT,
  "durationSeconds" INTEGER,
  "width" INTEGER,
  "height" INTEGER,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lockedAt" TIMESTAMP(3),
  "lockedBy" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HyperFrameRenderJob_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "HyperFrameRenderJob" ADD CONSTRAINT "HyperFrameRenderJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HyperFrameRenderJob" ADD CONSTRAINT "HyperFrameRenderJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "HyperFrameRenderJob_userId_status_idx" ON "HyperFrameRenderJob"("userId", "status");
CREATE INDEX "HyperFrameRenderJob_status_createdAt_idx" ON "HyperFrameRenderJob"("status", "createdAt");
CREATE INDEX "HyperFrameRenderJob_deletedAt_idx" ON "HyperFrameRenderJob"("deletedAt");
