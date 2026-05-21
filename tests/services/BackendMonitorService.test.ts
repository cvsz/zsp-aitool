import { describe, expect, it } from "vitest";
import { redactSensitiveText } from "@/services/BackendMonitorService";

describe("BackendMonitorService", () => {
  it("redacts secrets and local paths", () => {
    const input = "DATABASE_URL=postgres://x TOKEN=abc /home/user/a /var/lib/z";
    const out = redactSensitiveText(input);
    expect(out).not.toContain("postgres://");
    expect(out).not.toContain("/home/user");
    expect(out).not.toContain("/var/lib/z");
  });
});
