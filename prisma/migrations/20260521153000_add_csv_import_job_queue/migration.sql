-- CreateEnum
CREATE TYPE "CsvImportJobStatus" AS ENUM ('PENDING', 'RUNNING', 'CANCEL_REQUESTED', 'CANCELLED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CsvImportJobKind" AS ENUM ('SHOPEE_PRODUCT_FEED');

-- CreateTable
CREATE TABLE "CsvImportJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "CsvImportJobKind" NOT NULL DEFAULT 'SHOPEE_PRODUCT_FEED',
    "status" "CsvImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "sourceFileName" TEXT NOT NULL,
    "sourceFilePath" TEXT NOT NULL,
    "totalBytes" BIGINT,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "rejectedRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "lastRowNumber" INTEGER NOT NULL DEFAULT 0,
    "retryOfJobId" TEXT,
    "lastError" TEXT,
    "sampleRejected" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CsvImportJob_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CsvImportJob_userId_status_createdAt_idx" ON "CsvImportJob"("userId", "status", "createdAt");
CREATE INDEX "CsvImportJob_status_createdAt_idx" ON "CsvImportJob"("status", "createdAt");
ALTER TABLE "CsvImportJob" ADD CONSTRAINT "CsvImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
