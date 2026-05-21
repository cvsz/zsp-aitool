import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("admin observability page", () => {
  it("contains safe state copy", () => {
    const source = readFileSync(path.join(process.cwd(), "src/app/dashboard/admin/observability/page.tsx"), "utf8");
    expect(source).toContain("Recent redacted events");
    expect(source).toContain("ยังไม่มีข้อมูลเหตุการณ์");
  });
});
