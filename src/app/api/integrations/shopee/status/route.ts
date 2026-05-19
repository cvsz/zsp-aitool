import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { ShopeeOpenApiService } from "@/services/ShopeeOpenApiService";

const service = new ShopeeOpenApiService({
  httpClient: {
    async request<T>() {
      return { status: 501, data: { ok: false } as T };
    }
  }
});

export const GET = withAuth(async () => {
  const result = await service.getStatus();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: { code: result.code, message: result.message, details: result.details } }, { status: result.code === "CONFIG_ERROR" ? 422 : 503 });
  }

  return NextResponse.json({ ok: true, data: result.data, mode: result.code });
});
