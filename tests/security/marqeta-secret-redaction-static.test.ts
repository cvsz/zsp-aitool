import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("marqeta secret redaction static", () => {
  it("keeps marqeta service server-side guarded", () => {
    const source = readFileSync("src/services/MarqetaCoreApiService.ts", "utf8");
    expect(source).toContain("server-only");
  });
});
