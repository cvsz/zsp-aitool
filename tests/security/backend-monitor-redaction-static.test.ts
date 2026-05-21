import { describe, expect, it } from "vitest";
import { redactSensitiveText } from "@/services/BackendMonitorService";

describe("backend monitor redaction security", () => {
  it("removes token and path leakage", () => {
    const text = "bearer abcd DATABASE_URL=x /home/demo/a /var/lib/a";
    const out = redactSensitiveText(text);
    expect(out).not.toContain("bearer abcd");
    expect(out).not.toContain("/home/demo/a");
    expect(out).not.toContain("/var/lib/a");
  });
});
