import { CsvImportJobStatus, Prisma } from "@prisma/client";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const IMPORT_DIR = process.env.CSV_IMPORT_PRIVATE_DIR ?? "/var/lib/zsp-aitool/imports";
const MAX_BYTES = Number(process.env.CSV_IMPORT_MAX_BYTES ?? 4 * 1024 * 1024 * 1024);

export class CsvProductImportJobService {
  static async createFromUpload(userId: string, file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("รองรับเฉพาะไฟล์ .csv");
    if (file.size > MAX_BYTES) throw new Error("ไฟล์มีขนาดเกินที่รองรับ");
    await mkdir(IMPORT_DIR, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, "_")}`;
    const fullPath = path.join(IMPORT_DIR, safeName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, bytes);
    return prisma.csvImportJob.create({ data: { userId, sourceFileName: file.name, sourceFilePath: fullPath, totalBytes: BigInt(file.size) } });
  }

  static list(userId: string) { return prisma.csvImportJob.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 50 }); }
  static get(userId: string, id: string) { return prisma.csvImportJob.findFirst({ where: { userId, id, deletedAt: null } }); }
  static async cancel(userId: string, id: string) {
    return prisma.csvImportJob.updateMany({ where: { userId, id, status: { in: [CsvImportJobStatus.PENDING, CsvImportJobStatus.RUNNING] } }, data: { status: CsvImportJobStatus.CANCEL_REQUESTED } });
  }
  static async retry(userId: string, id: string) {
    const old = await this.get(userId, id); if (!old) return null;
    return prisma.csvImportJob.create({ data: { userId, sourceFileName: old.sourceFileName, sourceFilePath: old.sourceFilePath, totalBytes: old.totalBytes, retryOfJobId: old.id } });
  }

  static async claimNextJob() {
    const job = await prisma.csvImportJob.findFirst({ where: { status: CsvImportJobStatus.PENDING, deletedAt: null }, orderBy: { createdAt: "asc" } });
    if (!job) return null;
    const updated = await prisma.csvImportJob.updateMany({ where: { id: job.id, status: CsvImportJobStatus.PENDING }, data: { status: CsvImportJobStatus.RUNNING, startedAt: new Date() } });
    if (updated.count === 0) return null;
    return prisma.csvImportJob.findUnique({ where: { id: job.id } });
  }
}
