import { PrismaClient } from "@prisma/client";

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

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check UserSetting table
    const userSettingRows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'UserSetting'
    `;

    const userSettingAvailable = new Set(userSettingRows.map((row) => row.column_name));
    const userSettingMissing = REQUIRED_USER_SETTING_COLUMNS.filter((column) => !userSettingAvailable.has(column));

    if (userSettingMissing.length > 0) {
      console.error("[FAIL] UserSetting schema drift detected.");
      console.error(`[FAIL] Missing UserSetting columns: ${userSettingMissing.join(", ")}`);
      process.exitCode = 1;
      return;
    }

    console.log("[PASS] UserSetting schema contains all required columns.");

    // Check APIUsageLog table
    const apiUsageLogRows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'APIUsageLog'
    `;

    const apiUsageLogAvailable = new Set(apiUsageLogRows.map((row) => row.column_name));
    const apiUsageLogMissing = REQUIRED_API_USAGE_LOG_COLUMNS.filter((column) => !apiUsageLogAvailable.has(column));

    if (apiUsageLogMissing.length > 0) {
      console.error("[FAIL] APIUsageLog schema drift detected.");
      console.error(`[FAIL] Missing APIUsageLog columns: ${apiUsageLogMissing.join(", ")}`);
      process.exitCode = 1;
      return;
    }

    console.log("[PASS] APIUsageLog schema contains all required columns.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[FAIL] Unable to verify schema drift: ${message}`);
  process.exit(1);
});
