import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { toCsv } from "../lib/csv";
import { contentHistoryToMarkdown } from "../lib/markdown";

export interface ExportFilter {
  platform?: string;
  startDate?: string;
  endDate?: string;
}

function buildContentWhereClause(userId: string, filter: ExportFilter): Prisma.Sql {
  const clauses: Prisma.Sql[] = [Prisma.sql`"userId" = ${userId}`, Prisma.sql`"deletedAt" IS NULL`];

  if (filter.platform) {
    clauses.push(Prisma.sql`"platform" = ${filter.platform}`);
  }

  if (filter.startDate) {
    clauses.push(Prisma.sql`"createdAt" >= ${new Date(filter.startDate)}`);
  }

  if (filter.endDate) {
    clauses.push(Prisma.sql`"createdAt" <= ${new Date(filter.endDate)}`);
  }

  return Prisma.join(clauses, " AND ");
}

export class ExportService {
  async exportProductsCsv(userId: string): Promise<string> {
    const rows = await prisma.$queryRaw<Array<Record<string, string | number | null>>>(Prisma.sql`
      SELECT id, title, price, currency, "originalUrl", "affiliateUrl", "shopName", rating, "soldCount", "createdAt"
      FROM "Product"
      WHERE "userId" = ${userId} AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
    `);

    return toCsv(rows, ["id", "title", "price", "currency", "originalUrl", "affiliateUrl", "shopName", "rating", "soldCount", "createdAt"]);
  }

  async exportContentCsv(userId: string, filter: ExportFilter): Promise<string> {
    const whereSql = buildContentWhereClause(userId, filter);
    const rows = await prisma.$queryRaw<Array<Record<string, string | number | null>>>(Prisma.sql`
      SELECT id, platform, tone, language, prompt, output, status, "createdAt"
      FROM "ContentGeneration"
      WHERE ${whereSql}
      ORDER BY "createdAt" DESC
    `);

    return toCsv(rows, ["id", "platform", "tone", "language", "prompt", "output", "status", "createdAt"]);
  }

  async exportContentMarkdown(userId: string, filter: ExportFilter): Promise<string> {
    const whereSql = buildContentWhereClause(userId, filter);
    const rows = await prisma.$queryRaw<Array<Record<string, string | null>>>(Prisma.sql`
      SELECT id, platform, prompt, output, status, "createdAt"
      FROM "ContentGeneration"
      WHERE ${whereSql}
      ORDER BY "createdAt" DESC
    `);

    return contentHistoryToMarkdown(rows.map((row) => ({ id: row.id ?? "", platform: row.platform ?? "", output: row.output ?? "" })));
  }

  async exportSingleContentTxt(userId: string, id: string): Promise<string | null> {
    const rows = await prisma.$queryRaw<Array<{ id: string; platform: string; prompt: string | null; output: string | null; createdAt: Date }>>(Prisma.sql`
      SELECT id, platform, prompt, output, "createdAt"
      FROM "ContentGeneration"
      WHERE id = ${id} AND "userId" = ${userId} AND "deletedAt" IS NULL
      LIMIT 1
    `);

    const item = rows[0];

    if (!item) {
      return null;
    }

    return [
      `Content ID: ${item.id}`,
      `Platform: ${item.platform}`,
      `Created At: ${item.createdAt.toISOString()}`,
      "",
      "Prompt:",
      item.prompt ?? "-",
      "",
      "Output:",
      item.output ?? "-",
      "",
    ].join("\n");
  }
}
