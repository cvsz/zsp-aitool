import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("HyperFrames cleanup timer safety", () => {
  it("install script does not auto-enable timer without confirmation", () => {
    const source = readFileSync("scripts/hyperframes/install-cleanup-timer.sh", "utf8");
    expect(source).toContain('if [[ "${HYPERFRAMES_CLEANUP_TIMER_CONFIRM:-}" == "YES" ]]; then');
    expect(source).toContain("Timer not enabled/started");
  });

  it("cleanup defaults to dry-run and path escape protections exist", () => {
    const source = readFileSync("scripts/hyperframes/cleanup-renders.ts", "utf8");
    expect(source).toContain("if (!config.cleanupDryRun) await rm(real, { force: true });");
    expect(source).toContain('if (!real.startsWith(root + path.sep))');
    expect(source).toContain("active running output");
  });

  it("cleanup service/timer contain no inline secrets and execute cleanup command", () => {
    const service = readFileSync("deploy/systemd/zsp-hyperframes-cleanup.service", "utf8");
    const timer = readFileSync("deploy/systemd/zsp-hyperframes-cleanup.timer", "utf8");

    expect(service).toContain("ExecStart=/usr/bin/npm run hyperframes:cleanup-renders");
    expect(service).not.toMatch(/(API_KEY|SECRET|TOKEN|PASSWORD)=/);
    expect(timer).toContain("OnCalendar=daily");
  });
});
