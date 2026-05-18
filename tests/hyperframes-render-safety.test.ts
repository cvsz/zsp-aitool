import { describe, expect, it } from "vitest";
import { ensureOutputWithinDir } from "@/lib/hyperframes/render-safety";

describe("ensureOutputWithinDir", () => {
  it("blocks traversal", () => {
    const p = ensureOutputWithinDir("/tmp/out", "../evil.mp4");
    expect(p.startsWith("/tmp/out/")).toBe(true);
  });
});
