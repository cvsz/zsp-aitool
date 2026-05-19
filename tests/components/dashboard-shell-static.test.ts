import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sidebar = readFileSync(path.join(process.cwd(), "src/components/layout/Sidebar.tsx"), "utf8");
const dashboard = readFileSync(path.join(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");

describe("dashboard shell static", () => {
  it("contains main modules in sidebar", () => {
    ["ภาพรวม", "คลังสินค้า", "AI Generator", "Prompt Templates", "OCR Tools", "สินค้าที่คล้ายกัน"].forEach((label) => {
      expect(sidebar).toContain(label);
    });
  });

  it("contains hyperframes navigation group", () => {
    ["HyperFrames", "HyperFrames Studio", "ประวัติเรนเดอร์", "Batch Render", "Operator Queue"].forEach((label) => {
      expect(sidebar).toContain(label);
    });
  });

  it("dashboard no longer renders raw JSON", () => {
    expect(dashboard).not.toContain("JSON.stringify");
    expect(dashboard).not.toContain("<pre");
  });

  it("dashboard source does not contain sensitive/internal markers", () => {
    ["outputPath", "/var/lib", "DATABASE_URL", "dangerouslySetInnerHTML"].forEach((token) => {
      expect(dashboard).not.toContain(token);
    });
  });
});
