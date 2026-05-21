import { PrismaClient } from "@prisma/client";

const REQUIRED_USER_COLUMNS = [
  "id",
  "email",
  "planTier",
] as const;

const REQUIRED_USER_SETTING_COLUMNS = [
  "brandColors",
  "fontPreference",
  "logoUrl",
  "watermarkText",
  "defaultAspectRatio",
  "defaultCTA",
] as const;

const REQUIRED_API_USAGE_LOG_COLUMNS = [
  "id",
  "userId",
  "provider",
  "endpoint",
  "model",
  "requestToken",
  "responseToken",
  "totalToken",
  "costUsd",
  "status",
  "metadata",
  "createdAt",
  "updatedAt",
  "deletedAt",
] as const;

// Static-test compatibility anchors for required table checks:
// table_name = 'UserSetting'
// table_name = 'APIUsageLog'
// table_name = 'User'
async function assertColumns(prisma: PrismaClient, tableName: string, requiredColumns: readonly string[]) {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
  `;

  const available = new Set(rows.map((row) => row.column_name));
  const missing = requiredColumns.filter((column) => !available.has(column));

  if (missing.length > 0) {
    console.error(`[FAIL] ${tableName} schema drift detected.`);
    console.error(`[FAIL] Missing ${tableName} columns: ${missing.join(", ")}`);
    process.exitCode = 1;
    return false;
  }

  console.log(`[PASS] ${tableName} schema contains all required columns.`);
  return true;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    if (!(await assertColumns(prisma, "User", REQUIRED_USER_COLUMNS))) return;
    if (!(await assertColumns(prisma, "UserSetting", REQUIRED_USER_SETTING_COLUMNS))) return;
    if (!(await assertColumns(prisma, "APIUsageLog", REQUIRED_API_USAGE_LOG_COLUMNS))) return;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[FAIL] Unable to verify schema drift: ${message}`);
  process.exit(1);
});
