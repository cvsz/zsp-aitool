import { describe, expect, it } from "vitest";
import { CsvProductImportJobService } from "@/services/CsvProductImportJobService";

describe("CsvProductImportJobService", () => {
  it("exports service", () => {
    expect(typeof CsvProductImportJobService.createFromUpload).toBe("function");
  });
});
