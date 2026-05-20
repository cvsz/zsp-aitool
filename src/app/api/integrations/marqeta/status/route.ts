import { NextResponse } from "next/server";
import { loadMarqetaConfig, MarqetaConfigError, toMarqetaSafeStatus } from "@/lib/marqeta/config";
import { withAuth } from "@/middleware/auth-middleware";
import { MarqetaCoreApiService } from "@/services/MarqetaCoreApiService";

export const GET = withAuth(async () => {
  try {
    const config = loadMarqetaConfig();
    const data = toMarqetaSafeStatus(config);
    let connectivity: "unknown" | "ok" | "error" = "unknown";
    if (config.enabled && config.connectivityCheckEnabled && data.configured) {
      const result = await new MarqetaCoreApiService().connectivityCheck();
      connectivity = result.ok ? "ok" : "error";
    }
    return NextResponse.json({ ok: true, data: { ...data, connectivity } });
  } catch (error) {
    if (error instanceof MarqetaConfigError) return NextResponse.json({ ok: false, error: { code: "CONFIG_ERROR", message: error.message } }, { status: 422 });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unable to load Marqeta status" } }, { status: 500 });
  }
});
