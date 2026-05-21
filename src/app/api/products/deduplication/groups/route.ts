import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";
import { productDeduplicationService } from "@/services/ProductDeduplicationService";
export const GET = withAuth(async (request) => NextResponse.json({ ok: true, data: await productDeduplicationService.listGroups(request.auth.userId) }));
