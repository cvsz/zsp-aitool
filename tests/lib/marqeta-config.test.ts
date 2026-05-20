import { describe, expect, it } from "vitest";
import { loadMarqetaConfig, MarqetaConfigError, toMarqetaSafeStatus } from "@/lib/marqeta/config";

describe("marqeta config", () => {
  it("defaults disabled", () => {
    const config = loadMarqetaConfig({});
    expect(config.enabled).toBe(false);
  });
  it("accepts sandbox base", () => {
    const config = loadMarqetaConfig({ MARQETA_BASE_URL: "https://sandbox-api.marqeta.com/v3", MARQETA_ENV: "sandbox" });
    expect(config.baseUrl).toContain("sandbox-api.marqeta.com");
  });
  it("rejects production url", () => {
    expect(() => loadMarqetaConfig({ MARQETA_BASE_URL: "https://programname-api.marqeta.com/v3", MARQETA_ENV: "sandbox" })).toThrow(MarqetaConfigError);
  });
  it("configured false without creds and no leakage", () => {
    const safe = toMarqetaSafeStatus(loadMarqetaConfig({ MARQETA_ENABLED: "true" }));
    expect(safe.configured).toBe(false);
    expect(JSON.stringify(safe)).not.toMatch(/application_token|admin_access_token/i);
  });
});
