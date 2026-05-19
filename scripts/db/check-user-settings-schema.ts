import { PrismaClient } from "@prisma/client";

const REQUIRED_COLUMNS = [
  "brandColors",
  "fontPreference",
  "logoUrl",
  "watermarkText",
  "defaultAspectRatio",
  "defaultCTA",
] as const;

async function main() {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'UserSetting'
    `;

    const available = new Set(rows.map((row) => row.column_name));
    const missing = REQUIRED_COLUMNS.filter((column) => !available.has(column));

    if (missing.length > 0) {
      console.error("[FAIL] UserSetting schema drift detected.");
      console.error(`[FAIL] Missing columns: ${missing.join(", ")}`);
      process.exitCode = 1;
      return;
    }

    console.log("[PASS] UserSetting schema contains all required columns.");
    console.log(`[PASS] Checked columns: ${REQUIRED_COLUMNS.join(", ")}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[FAIL] Unable to verify UserSetting schema drift: ${message}`);
  process.exit(1);
});
