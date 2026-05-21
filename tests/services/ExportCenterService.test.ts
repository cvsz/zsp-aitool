import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("ExportCenterService safety", () => {
  it("escapes CSV formula cells", () => {
    const csv = toCsv([{ id: "1", title: "=cmd", note: "+sum", x: "-x", y: "@y" }], ["id", "title", "note", "x", "y"]);
    expect(csv).toContain("'=cmd");
    expect(csv).toContain("'+sum");
    expect(csv).toContain("'-x");
    expect(csv).toContain("'@y");
  });
});
