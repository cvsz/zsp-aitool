import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("dashboard page states static", () => {
  it("dashboard has loading/error/empty", () => {
    const text = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");
    expect(text).toContain("LoadingSpinner");
    expect(text).toContain("AlertBanner");
    expect(text).toContain("EmptyState");
  });

  it("content history has loading/error/empty", () => {
    const text = fs.readFileSync("src/app/dashboard/content-history/page.tsx", "utf8");
    expect(text).toContain("LoadingSpinner");
    expect(text).toContain("AlertBanner");
    expect(text).toContain("EmptyState");
  });
});
