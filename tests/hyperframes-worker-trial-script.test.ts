import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("hyperframes worker trial script", () => {
  const scriptPath = join(process.cwd(), "scripts/hyperframes/worker-trial.sh");
  const packagePath = join(process.cwd(), "package.json");

  it("has valid bash syntax", () => {
    const result = spawnSync("bash", ["-n", scriptPath], { encoding: "utf8" });
    expect(result.status).toBe(0);
  });

  it("refuses without explicit confirmation gate", () => {
    const result = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: { ...process.env },
    });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      "HYPERFRAMES_WORKER_TRIAL_CONFIRM=YES",
    );
  });

  it("never enables service", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).not.toContain("systemctl enable");
  });

  it("contains stop/cleanup trap", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain("trap cleanup EXIT");
    expect(source).toContain('systemctl stop "${SERVICE_NAME}"');
  });

  it("checks queue status before service start", () => {
    const source = readFileSync(scriptPath, "utf8");
    const queueIndex = source.indexOf("hyperframes:queue-status");
    const startIndex = source.indexOf('systemctl start "${SERVICE_NAME}"');

    expect(queueIndex).toBeGreaterThan(-1);
    expect(startIndex).toBeGreaterThan(-1);
    expect(queueIndex).toBeLessThan(startIndex);
  });

  it("runs health after service stop", () => {
    const source = readFileSync(scriptPath, "utf8");
    const stopIndex = source.indexOf('systemctl stop "${SERVICE_NAME}"');
    const healthIndex = source.indexOf("npm run health");

    expect(stopIndex).toBeGreaterThan(-1);
    expect(healthIndex).toBeGreaterThan(-1);
    expect(stopIndex).toBeLessThan(healthIndex);
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
