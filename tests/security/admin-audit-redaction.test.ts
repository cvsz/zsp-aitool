import { describe, expect, it } from "vitest";
import { redactMetadata } from "@/services/AdminAuditLogService";

describe("admin audit redaction", () => {
  it("removes local paths and tokens", () => {
    const out = redactMetadata({ token: "x", path: "/var/lib/private", note: "ok" }) as Record<string, string>;
    expect(out.token).toBe("[REDACTED]");
    expect(out.path).toBe("[REDACTED_PATH]");
  });
});
