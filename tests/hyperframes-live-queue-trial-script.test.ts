import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("hyperframes live queue trial script", () => {
  const scriptPath = join(process.cwd(), "scripts/hyperframes/live-queue-trial.sh");
  const packagePath = join(process.cwd(), "package.json");

  it("has valid bash syntax", () => {
    const result = spawnSync("bash", ["-n", scriptPath], { encoding: "utf8" });
    expect(result.status).toBe(0);
  });

  it("refuses without confirmation", () => {
    const result = spawnSync("bash", [scriptPath], { encoding: "utf8", env: { ...process.env } });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain("HYPERFRAMES_LIVE_TRIAL_CONFIRM=YES");
  });

  it("never enables service", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).not.toContain("systemctl enable");
  });

  it("creates and removes trial drop-in", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain('DROPIN_DIR="/etc/systemd/system/${SERVICE_UNIT}.d"');
    expect(source).toContain('DROPIN_FILE="${DROPIN_DIR}/trial.conf"');
    expect(source).toContain("Environment=HYPERFRAMES_RENDER_ENABLED=true");
    expect(source).toContain("rm -f \"${DROPIN_FILE}\"");
  });

  it("contains rollback trap", () => {
    const source = readFileSync(scriptPath, "utf8");
    expect(source).toContain("trap rollback EXIT");
    expect(source).toContain("systemctl stop \"${SERVICE_NAME}\"");
    expect(source).toContain("systemctl daemon-reload");
  });

  it("is wired in package scripts", () => {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.["hyperframes:worker:live-trial"]).toBe("bash scripts/hyperframes/live-queue-trial.sh");
  });
});
