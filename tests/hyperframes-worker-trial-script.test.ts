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
    expect(source).toContain('if systemctl is-active "${SERVICE_NAME}"');
    expect(source).toContain('systemctl stop "${SERVICE_NAME}" || warn');
  });

  it("checks queue status before service start", () => {
    const source = readFileSync(scriptPath, "utf8");
    const queueIndex = source.indexOf("hyperframes:queue-status");
    const startIndex = source.indexOf('systemctl start "${SERVICE_NAME}"');

    expect(queueIndex).toBeGreaterThan(-1);
    expect(startIndex).toBeGreaterThan(-1);
    expect(queueIndex).toBeLessThan(startIndex);
  });

  it("runs queue status and health after disabled-mode lifecycle check", () => {
    const source = readFileSync(scriptPath, "utf8");
    const lifecycleIndex = source.indexOf("disabled-mode service lifecycle verified");
    const queueIndex = source.indexOf("Queue status after trial");
    const healthIndex = source.indexOf("Health check after trial");

    expect(lifecycleIndex).toBeGreaterThan(-1);
    expect(queueIndex).toBeGreaterThan(-1);
    expect(healthIndex).toBeGreaterThan(-1);
    expect(lifecycleIndex).toBeLessThan(queueIndex);
    expect(queueIndex).toBeLessThan(healthIndex);
  });

  it("disabled mode does not fail on inactive service", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain("running disabled-mode lifecycle check");
    const disabledBranchStart = source.indexOf("if (( enabled_mode == 0 ))");
    const disabledBranchEnd = source.indexOf("else", disabledBranchStart);
    const disabledBranch = source.slice(disabledBranchStart, disabledBranchEnd);
    expect(disabledBranch).not.toContain("Service became inactive during trial");
  });

  it("enabled mode still requires service to remain active", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain('if ! systemctl is-active "${SERVICE_NAME}"');
    expect(source).toContain("Service became inactive during trial");
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
