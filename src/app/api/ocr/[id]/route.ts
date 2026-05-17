import { NextResponse } from "next/server";
import { getOCRJobSchema } from "@/schemas/ocr.schema";
import { OCRService } from "@/services/OCRService";
import { withAuth } from "@/middleware/auth-middleware";

const service = new OCRService();

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const parsed = getOCRJobSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
  try {
    const job = await service.getJob(request.auth.userId, parsed.data.id);
    return NextResponse.json(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: message.includes("not found") ? 404 : 500 });
  }
});
