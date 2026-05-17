import { NextRequest, NextResponse } from "next/server";
import { SimilarProductService } from "@/services/SimilarProductService";

const service = new SimilarProductService();

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = request.headers.get("x-user-id") ?? "demo-user";

    const recommendations = await service.getRecommendations(id, userId, true);

    return NextResponse.json({ ok: true, data: recommendations, empty: recommendations.length === 0 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: { code: "SIMILAR_REFRESH_ERROR", message: error instanceof Error ? error.message : "Unknown error" } },
      { status: 500 }
    );
  }
}
