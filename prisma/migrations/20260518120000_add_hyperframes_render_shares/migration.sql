-- CreateTable
CREATE TABLE "HyperFrameRenderShare" (
    "id" TEXT NOT NULL,
    "renderJobId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HyperFrameRenderShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HyperFrameRenderShare_tokenHash_key" ON "HyperFrameRenderShare"("tokenHash");

-- CreateIndex
CREATE INDEX "HyperFrameRenderShare_renderJobId_idx" ON "HyperFrameRenderShare"("renderJobId");

-- CreateIndex
CREATE INDEX "HyperFrameRenderShare_ownerUserId_createdAt_idx" ON "HyperFrameRenderShare"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "HyperFrameRenderShare_expiresAt_idx" ON "HyperFrameRenderShare"("expiresAt");

-- AddForeignKey
ALTER TABLE "HyperFrameRenderShare" ADD CONSTRAINT "HyperFrameRenderShare_renderJobId_fkey" FOREIGN KEY ("renderJobId") REFERENCES "HyperFrameRenderJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HyperFrameRenderShare" ADD CONSTRAINT "HyperFrameRenderShare_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
