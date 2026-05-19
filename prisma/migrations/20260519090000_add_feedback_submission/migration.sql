-- CreateTable
CREATE TABLE "FeedbackSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackSubmission_userId_createdAt_idx" ON "FeedbackSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_createdAt_idx" ON "FeedbackSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_deletedAt_idx" ON "FeedbackSubmission"("deletedAt");

-- AddForeignKey
ALTER TABLE "FeedbackSubmission" ADD CONSTRAINT "FeedbackSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
