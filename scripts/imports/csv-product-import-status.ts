#!/usr/bin/env tsx
import { prisma } from "../../src/lib/prisma";
const jobs = await prisma.csvImportJob.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
console.table(jobs.map((job) => ({ id: job.id, userId: job.userId, status: job.status, processedRows: job.processedRows, importedRows: job.importedRows, rejectedRows: job.rejectedRows, createdAt: job.createdAt.toISOString() })));
