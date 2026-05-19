import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hyperframes operator ux static", () => {
  it("keeps operator pages read-only and points to CLI/runbook flows", () => {
    const ops = readFileSync("src/app/dashboard/hyperframes/ops/page.tsx", "utf8");
    const queue = readFileSync("src/app/dashboard/hyperframes/ops/queue/page.tsx", "utf8");
    expect(ops).toContain("read-only");
    expect(ops).toContain("CLI");
    expect(queue).toContain("ไม่มี systemctl controls ใน UI");
  });

  it("does not add systemd control commands on operator surfaces", () => {
    const all = [
      readFileSync("src/app/dashboard/hyperframes/ops/page.tsx", "utf8"),
      readFileSync("src/app/dashboard/hyperframes/ops/queue/page.tsx", "utf8"),
      readFileSync("src/components/hyperframes/OperatorWarningBanner.tsx", "utf8"),
    ].join("\n");

    expect(all).not.toMatch(/systemctl\s+(start|stop|restart|enable|disable)/);
  });
});
