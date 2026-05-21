import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("export center page", () => {
  it("renders Thai heading", () => {
    const source = readFileSync(join(process.cwd(), "src/app/dashboard/export-center/page.tsx"), "utf8");
    expect(source).toContain("ศูนย์ส่งออกข้อมูล v2");
  });
});
