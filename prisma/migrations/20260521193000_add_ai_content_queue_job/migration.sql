-- CreateTable
CREATE TABLE "AIContentQueueJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "platform" "Platform",
    "tone" "Tone",
    "language" "Language" NOT NULL DEFAULT 'TH',
    "input" JSONB,
    "output" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "errorSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AIContentQueueJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIContentQueueJob" ADD CONSTRAINT "AIContentQueueJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIContentQueueJob" ADD CONSTRAINT "AIContentQueueJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "AIContentQueueJob_userId_status_createdAt_idx" ON "AIContentQueueJob"("userId", "status", "createdAt");
CREATE INDEX "AIContentQueueJob_status_createdAt_idx" ON "AIContentQueueJob"("status", "createdAt");
CREATE INDEX "AIContentQueueJob_productId_createdAt_idx" ON "AIContentQueueJob"("productId", "createdAt");
CREATE INDEX "AIContentQueueJob_deletedAt_idx" ON "AIContentQueueJob"("deletedAt");
