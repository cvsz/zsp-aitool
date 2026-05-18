import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("hyperframes worker trial script", () => {
  const scriptPath = join(process.cwd(), "scripts/hyperframes/worker-trial.sh");
  const packagePath = join(process.cwd(), "package.json");

  it("refuses without explicit confirmation gate", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain('HYPERFRAMES_WORKER_TRIAL_CONFIRM');
    expect(source).toContain('!= "YES"');
  });

  it("never enables service", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).not.toContain("systemctl enable");
  });

  it("contains stop and rollback/failure path", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain('systemctl stop "${SERVICE_NAME}"');
    expect(source).toContain("journalctl -u");
  });

  it("is wired into package scripts", () => {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["hyperframes:worker:trial"]).toBe(
      "bash scripts/hyperframes/worker-trial.sh",
    );
  });
});
