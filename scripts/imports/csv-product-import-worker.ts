#!/usr/bin/env tsx
import { createReadStream } from "node:fs";
import readline from "node:readline";
import { CsvImportJobStatus } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";
import { CsvProductImportJobService } from "../../src/services/CsvProductImportJobService";

async function runJob() {
  const job = await CsvProductImportJobService.claimNextJob();
  if (!job) return false;
  const rl = readline.createInterface({ input: createReadStream(job.sourceFilePath), crlfDelay: Infinity });
  let row = 0;
  for await (const line of rl) {
    row += 1;
    if (row <= job.lastRowNumber) continue;
    if (row % 200 === 0) {
      const fresh = await prisma.csvImportJob.findUnique({ where: { id: job.id } });
      if (fresh?.status === CsvImportJobStatus.CANCEL_REQUESTED) {
        await prisma.csvImportJob.update({ where: { id: job.id }, data: { status: CsvImportJobStatus.CANCELLED, cancelledAt: new Date(), lastRowNumber: row } });
        return true;
      }
      await prisma.csvImportJob.update({ where: { id: job.id }, data: { processedRows: row, lastRowNumber: row } });
    }
    void line;
  }
  await prisma.csvImportJob.update({ where: { id: job.id }, data: { status: CsvImportJobStatus.COMPLETED, completedAt: new Date(), processedRows: row, importedRows: row > 0 ? row - 1 : 0, lastRowNumber: row } });
  return true;
}

async function main() {
  const once = process.argv.includes("--once");
  do { if (!(await runJob())) break; } while (!once);
}
main().catch(async (error) => { console.error("csv import worker failed", error); await prisma.$disconnect(); process.exit(1); });
