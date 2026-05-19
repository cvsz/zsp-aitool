import { NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth-middleware";
import { ShopeeOpenApiService } from "@/services/ShopeeOpenApiService";

const service = new ShopeeOpenApiService();

export const GET = withAuth(async () => {
  const status = service.getStatus();
  return NextResponse.json({ ok: true, data: status });
});
