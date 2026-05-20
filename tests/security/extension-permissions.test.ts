import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("extension manifest permissions hardening", () => {
  const manifest = JSON.parse(readFileSync("extension/manifest.json", "utf8")) as {
    permissions?: string[];
    host_permissions?: string[];
  };

  it("uses minimal MV3 permissions", () => {
    expect(manifest.permissions ?? []).toEqual(["storage", "activeTab"]);
    expect(manifest.permissions ?? []).not.toContain("tabs");
    expect(manifest.permissions ?? []).not.toContain("cookies");
    expect(manifest.permissions ?? []).not.toContain("webRequest");
    expect(manifest.permissions ?? []).not.toContain("scripting");
  });

  it("does not use broad host permissions", () => {
    expect(manifest.host_permissions ?? []).toContain("https://shopee.co.th/*");
    expect(manifest.host_permissions ?? []).not.toContain("https://*/*");
    expect(JSON.stringify(manifest.host_permissions ?? [])).not.toContain("<all_urls>");
  });
});
