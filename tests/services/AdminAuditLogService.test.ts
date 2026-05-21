import { describe, expect, it } from "vitest";
import { redactMetadata } from "@/services/AdminAuditLogService";

describe("AdminAuditLogService", () => {
  it("redacts sensitive keys", () => {
    const out = redactMetadata({ accessToken: "abc", nested: { password: "pw", ok: "x" } }) as Record<string, unknown>;
    expect(out.accessToken).toBe("[REDACTED]");
    expect((out.nested as Record<string, unknown>).password).toBe("[REDACTED]");
  });
});
