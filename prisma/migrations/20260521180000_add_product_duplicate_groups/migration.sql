CREATE TABLE "ProductDuplicateGroup" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  "canonicalProductId" TEXT,
  "productIds" TEXT[] NOT NULL,
  "score" DECIMAL(5,2),
  "reason" JSONB,
  "reviewedAt" TIMESTAMP(3),
  "mergedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ProductDuplicateGroup_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProductDuplicateGroup_userId_status_createdAt_idx" ON "ProductDuplicateGroup"("userId","status","createdAt");
ALTER TABLE "ProductDuplicateGroup" ADD CONSTRAINT "ProductDuplicateGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
