import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("hyperframes remediation scripts", () => {
  const rollbackPath = join(process.cwd(), "scripts/hyperframes/safe-rollback.sh");
  const diagPath = join(process.cwd(), "scripts/hyperframes/diag.sh");

  it("safe rollback script has valid bash syntax", () => {
    const result = spawnSync("bash", ["-n", rollbackPath], { encoding: "utf8" });
    expect(result.status).toBe(0);
  });

  it("diag script has valid bash syntax", () => {
    const result = spawnSync("bash", ["-n", diagPath], { encoding: "utf8" });
    expect(result.status).toBe(0);
  });

  it("safe rollback requires explicit confirmation", () => {
    const result = spawnSync("bash", [rollbackPath], { encoding: "utf8", env: { ...process.env } });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain("HYPERFRAMES_SAFE_ROLLBACK_CONFIRM=YES");
  });

  it("safe rollback documents read-only default behavior", () => {
    const source = readFileSync(rollbackPath, "utf8");
    expect(source).toContain("Default mode is read-only preview");
    expect(source).toContain("if [[ \"${CONFIRM}\" != \"YES\" ]]; then");
  });
});
