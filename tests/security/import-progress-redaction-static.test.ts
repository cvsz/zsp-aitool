import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("import progress redaction", () => {
  it("redacts sourceFilePath from list route response", () => {
    const route = readFileSync("src/app/api/imports/csv-products/route.ts", "utf8");
    expect(route).toContain("sourceFilePath: undefined");
  });

  it("ui does not render sourceFilePath", () => {
    const panel = readFileSync("src/components/imports/CsvProductImportProgressPanel.tsx", "utf8");
    expect(panel).not.toContain("sourceFilePath");
    expect(panel).not.toContain("/var/lib");
  });
});
