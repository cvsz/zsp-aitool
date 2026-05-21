import { describe, expect, it } from "vitest";

import { redactSensitiveText } from "@/lib/observability/logger";

describe("observability redaction", () => {
  it("redacts secrets and paths", () => {
    const input = "DATABASE_URL=postgres://abc token=xyz /home/dev/app /var/lib/data bearer qwerty";
    const output = redactSensitiveText(input);
    expect(output).not.toContain("postgres://abc");
    expect(output).not.toContain("/home/dev/app");
    expect(output).not.toContain("qwerty");
  });
});
