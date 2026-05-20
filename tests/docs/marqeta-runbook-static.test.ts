import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("marqeta runbook static", () => {
  it("mentions compliance blockers before production", () => {
    const text = readFileSync("docs/runbooks/marqeta-core-api-sandbox-foundation.md", "utf8");
    expect(text).toMatch(/Signed Marqeta program agreement/);
    expect(text).toMatch(/KYC\/AML/);
    expect(text).toMatch(/PCI\/security review/);
  });
});
