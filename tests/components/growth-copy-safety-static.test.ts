import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = ["src/app/page.tsx", "src/app/dashboard/page.tsx"];

function source(): string {
  return files.map((file) => readFileSync(file, "utf8")).join("\n");
}

describe("growth copy safety static", () => {
  it("has no risky claim wording and keeps affiliate disclosure reminders", () => {
    const content = source();

    expect(content).not.toMatch(/รวยแน่นอน|รายได้แน่นอน/i);
    expect(content).toMatch(/Affiliate/i);
  });

  it("does not include dangerous html or internal path leaks or raw img", () => {
    const content = source();

    expect(content).not.toContain("dangerouslySetInnerHTML");
    expect(content).not.toContain("outputPath");
    expect(content).not.toContain("/var/lib");
    expect(content).not.toContain("DATABASE_URL");
    expect(content).not.toContain("<img");
    expect(content).not.toMatch(/systemctl\s+(start|stop|restart|enable|disable)/);
  });
});
