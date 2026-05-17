import { NextRequest, NextResponse } from "next/server";
import { SimilarProductService } from "@/services/SimilarProductService";

const service = new SimilarProductService();

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = _request.headers.get("x-user-id") ?? "demo-user";

    const recommendations = await service.getRecommendations(id, userId, false);

    return NextResponse.json({ ok: true, data: recommendations, empty: recommendations.length === 0 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: { code: "SIMILAR_RECOMMENDATION_ERROR", message: error instanceof Error ? error.message : "Unknown error" } },
      { status: 500 }
    );
  }
}
