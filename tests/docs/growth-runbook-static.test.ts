import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runbooks = [
  "docs/runbooks/first-100-users-growth-loop.md",
  "docs/runbooks/user-feedback-playbook.md",
  "docs/runbooks/onboarding-activation-checklist.md",
];

describe("growth runbook static coverage", () => {
  it("documents required first-100 growth areas with compliance-safe language", () => {
    const content = runbooks.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(content).toContain("First 7 days launch plan");
    expect(content).toContain("First 30 days growth loop");
    expect(content).toContain("First 100 users acquisition channels");
    expect(content).toContain("Affiliate compliance checklist");
    expect(content).toContain("Privacy boundaries");
    expect(content).not.toMatch(/รวยแน่นอน|รายได้แน่นอน/i);
  });
});
