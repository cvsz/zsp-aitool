import { NextResponse } from "next/server";
import { SimilarProductService } from "@/services/SimilarProductService";
import { withAuth } from "@/middleware/auth-middleware";

const service = new SimilarProductService();

export const POST = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const recommendations = await service.getRecommendations(id, request.auth.userId, true);
    return NextResponse.json({ ok: true, data: recommendations, empty: recommendations.length === 0 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: { code: "SIMILAR_REFRESH_ERROR", message: error instanceof Error ? error.message : "Unknown error" } }, { status: 500 });
  }
});
