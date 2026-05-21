import { describe, expect, it } from "vitest";

import { redactSensitiveText } from "@/lib/observability/logger";

describe("observability secret redaction", () => {
  it("removes authorization and cookie", () => {
    const text = "Authorization=Bearer abc Cookie=session=123";
    const result = redactSensitiveText(text);
    expect(result).not.toMatch(/abc|session=123/i);
  });
});
