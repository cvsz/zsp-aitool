import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("backup/restore/release runbooks (static)", () => {
  it("backup restore runbook documents migrate deploy and no migrate dev", () => {
    const doc = readFileSync("docs/runbooks/production-backup-restore.md", "utf8");
    expect(doc).toContain("npx prisma migrate deploy --schema prisma/schema.prisma");
    expect(doc).toContain("ห้ามใช้ `prisma migrate dev` บน production");
    expect(doc).toContain("Restore rehearsal");
    expect(doc).toContain("roll-forward");
  });

  it("release checklist references required checks and journals", () => {
    const doc = readFileSync("docs/runbooks/release-checklist.md", "utf8");
    expect(doc).toContain("start.sh");
    expect(doc).toContain("npm run db:schema-drift-check");
    expect(doc).toContain("npm run health");
    expect(doc).toContain("npm run hyperframes:queue-status");
    expect(doc).toContain("npm run hyperframes:worker:watchdog");
    expect(doc).toContain("journalctl");
  });
});
