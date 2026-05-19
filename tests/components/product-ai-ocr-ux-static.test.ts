import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("product/ai/ocr/export static UX safeguards", () => {
  it("does not use dangerouslySetInnerHTML in target UX surfaces", () => {
    const files = [
      "src/components/products/ProductImportForm.tsx",
      "src/components/ai/ContentGeneratorForm.tsx",
      "src/components/ocr/OCRUploadBox.tsx",
      "src/app/dashboard/similar/page.tsx",
    ];
    for (const file of files) expect(read(file)).not.toContain("dangerouslySetInnerHTML");
  });

  it("contains compliance/review/disclosure language", () => {
    expect(read("src/components/products/ProductImportForm.tsx")).toContain("Review before save");
    expect(read("src/components/products/ProductImportForm.tsx")).toContain("bypass CAPTCHA");
    expect(read("src/components/ai/ContentGeneratorForm.tsx")).toContain("affiliate");
    expect(read("src/components/ocr/OCRUploadBox.tsx")).toContain("ผล OCR อาจคลาดเคลื่อน");
    expect(read("src/components/export/ExportPanel.tsx")).toContain("CSV / TXT / Markdown");
  });

  it("does not render raw JSON in similar normal page", () => {
    const similar = read("src/app/dashboard/similar/page.tsx");
    expect(similar).not.toContain("JSON.stringify");
    expect(similar).not.toContain("<pre");
  });

  it("does not include sensitive local path references in polished ux files", () => {
    const files = [
      "src/components/products/ProductImportForm.tsx",
      "src/components/ai/ContentGeneratorForm.tsx",
      "src/components/ocr/OCRUploadBox.tsx",
      "src/components/export/ExportPanel.tsx",
    ];
    for (const file of files) {
      const content = read(file);
      expect(content).not.toContain("DATABASE_URL");
      expect(content).not.toContain("/var/lib");
      expect(content).not.toContain("outputPath");
    }
  });
});
