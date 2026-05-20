import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("backup db script (static)", () => {
  const source = readFileSync("scripts/ops/backup-db.sh", "utf8");

  it("exists and uses safe non-destructive defaults", () => {
    expect(source).toContain("DRY_RUN=0");
    expect(source).toContain("Retention cleanup is NOT automatic");
    expect(source).not.toContain("rm -rf");
    expect(source).not.toContain("dropdb");
    expect(source).not.toContain("prisma migrate dev");
  });

  it("does not print DATABASE_URL or obvious secrets", () => {
    expect(source).not.toContain("echo \"$DATABASE_URL\"");
    expect(source).not.toContain("DATABASE_URL=");
    expect(source).not.toContain("apiKey");
    expect(source).not.toContain("token=");
  });

  it("supports dry-run and timestamped backup filename", () => {
    expect(source).toContain("--dry-run");
    expect(source).toContain("date -u +%Y%m%dT%H%M%SZ");
    expect(source).toContain("zsp-aitool-db-");
    expect(source).toContain("pg_dump");
  });
});
