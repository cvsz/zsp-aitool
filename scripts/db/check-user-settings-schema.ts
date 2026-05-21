import { PrismaClient } from "@prisma/client";

type ColumnSpec = {
  name: string;
  expectedDataType?: string;
  expectedUdtName?: string;
};

type IndexSpec = {
  indexName: string;
  columns: readonly string[];
  unique: boolean;
};

type TableSpec = {
  requiredColumns: readonly ColumnSpec[];
  requiredIndexes?: readonly IndexSpec[];
};

const CRITICAL_TABLE_SPECS: Record<string, TableSpec> = {
  User: {
    requiredColumns: [
      { name: "id" },
      { name: "email" },
      { name: "planTier", expectedDataType: "USER-DEFINED", expectedUdtName: "PlanTier" },
      { name: "createdAt" },
      { name: "updatedAt" },
    ],
    requiredIndexes: [{ indexName: "User_email_key", columns: ["email"], unique: true }],
  },
  Product: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "title" }, { name: "price" }, { name: "originalUrl" }, { name: "createdAt" }],
    requiredIndexes: [{ indexName: "Product_userId_originalUrl_key", columns: ["userId", "originalUrl"], unique: true }],
  },
  AffiliateLink: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "productId" }, { name: "platform" }, { name: "affiliateUrl" }, { name: "createdAt" }],
  },
  UserSetting: {
    requiredColumns: [
      { name: "brandColors" },
      { name: "fontPreference" },
      { name: "logoUrl" },
      { name: "watermarkText" },
      { name: "defaultAspectRatio" },
      { name: "defaultCTA" },
    ],
  },
  APIUsageLog: {
    requiredColumns: [
      { name: "id" }, { name: "userId" }, { name: "provider" }, { name: "endpoint" }, { name: "model" }, { name: "requestToken" },
      { name: "responseToken" }, { name: "totalToken" }, { name: "costUsd" }, { name: "status" }, { name: "metadata" },
      { name: "createdAt" }, { name: "updatedAt" }, { name: "deletedAt" },
    ],
  },
  ShopeeAffiliateIngestion: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "source" }, { name: "status" }, { name: "createdAt" }],
  },
  ShopeeAffiliateSocialDraft: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "ingestionId" }, { name: "channel" }, { name: "status" }, { name: "createdAt" }],
  },
  HyperFrameRenderJob: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "status" }, { name: "createdAt" }],
  },
  ContentTemplate: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "name" }, { name: "createdAt" }],
  },
  OCRJob: {
    requiredColumns: [{ name: "id" }, { name: "userId" }, { name: "status" }, { name: "createdAt" }],
  },
};

type ColumnMeta = { column_name: string; data_type: string; udt_name: string };
type IndexMeta = { indexname: string; indexdef: string };

// Static-test compatibility anchors for required table checks:
// table_name = 'UserSetting'
// table_name = 'APIUsageLog'
// table_name = 'User'
// table_name = 'Product'
// table_name = 'AffiliateLink'
// table_name = 'ShopeeAffiliateIngestion'
// table_name = 'ShopeeAffiliateSocialDraft'
// table_name = 'HyperFrameRenderJob'
// table_name = 'ContentTemplate'
// table_name = 'OCRJob'

function parseIndexColumns(indexDef: string): string[] {
  const match = indexDef.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1].split(",").map((c) => c.trim().replace(/"/g, ""));
}

async function assertTable(prisma: PrismaClient, tableName: string, spec: TableSpec): Promise<boolean> {
  const columnRows = await prisma.$queryRaw<ColumnMeta[]>`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
  `;

  const availableColumns = new Map(columnRows.map((row) => [row.column_name, row]));
  const missingColumns = spec.requiredColumns.filter((column) => !availableColumns.has(column.name));

  if (missingColumns.length > 0) {
    console.error(`[FAIL] ${tableName} schema drift detected.`);
    console.error(`[FAIL] Missing ${tableName} columns: ${missingColumns.map((column) => column.name).join(", ")}`);
    process.exitCode = 1;
    return false;
  }

  const typeMismatches = spec.requiredColumns.flatMap((column) => {
    const meta = availableColumns.get(column.name);
    if (!meta) return [];
    const mismatches: string[] = [];
    if (column.expectedDataType && meta.data_type !== column.expectedDataType) mismatches.push(`data_type=${meta.data_type}`);
    if (column.expectedUdtName && meta.udt_name !== column.expectedUdtName) mismatches.push(`udt_name=${meta.udt_name}`);
    return mismatches.length > 0 ? [`${column.name} (${mismatches.join(", ")})`] : [];
  });

  if (typeMismatches.length > 0) {
    console.error(`[FAIL] ${tableName} critical type drift detected: ${typeMismatches.join("; ")}`);
    process.exitCode = 1;
    return false;
  }

  if (spec.requiredIndexes && spec.requiredIndexes.length > 0) {
    const indexRows = await prisma.$queryRaw<IndexMeta[]>`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = ${tableName}
    `;

    for (const requiredIndex of spec.requiredIndexes) {
      const found = indexRows.find((row) => {
        if (row.indexname !== requiredIndex.indexName) return false;
        const parsedColumns = parseIndexColumns(row.indexdef);
        const columnsMatch = parsedColumns.join(",") === requiredIndex.columns.join(",");
        const uniqueMatch = requiredIndex.unique ? row.indexdef.startsWith("CREATE UNIQUE INDEX") : true;
        return columnsMatch && uniqueMatch;
      });

      if (!found) {
        console.error(`[FAIL] ${tableName} index drift detected for ${requiredIndex.indexName}`);
        process.exitCode = 1;
        return false;
      }
    }
  }

  console.log(`[PASS] ${tableName} schema contains required columns and constraints.`);
  return true;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    for (const [tableName, spec] of Object.entries(CRITICAL_TABLE_SPECS)) {
      const ok = await assertTable(prisma, tableName, spec);
      if (!ok) return;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[FAIL] Unable to verify schema drift: ${message}`);
  process.exit(1);
});
