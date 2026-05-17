import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("CSV export safety", () => {
  it("escapes formula injection", () => {
    const csv = toCsv([{ id: "1", title: "=IMPORTXML(A1)", promo: "+SUM(A1)", note: "-danger", user: "@test" }], ["id", "title", "promo", "note", "user"]);
    expect(csv).toContain("'=IMPORTXML(A1)");
    expect(csv).toContain("'+SUM(A1)");
    expect(csv).toContain("'-danger");
    expect(csv).toContain("'@test");
  });
});
