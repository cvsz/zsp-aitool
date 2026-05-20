import { NextResponse } from "next/server";
import { getOCRJobSchema } from "@/schemas/ocr.schema";
import { OCRService } from "@/services/OCRService";
import { withAuth } from "@/middleware/auth-middleware";
import { failure, success } from "@/lib/api-response";

const service = new OCRService();

export const GET = withAuth(async (request, context: { params: Promise<{ id: string }> }) => {
  const parsed = getOCRJobSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json(failure("VALIDATION_ERROR", "Invalid job id"), { status: 400 });
  try {
    const job = await service.getJob(request.auth.userId, parsed.data.id);
    return NextResponse.json(success(job));
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("not found")) return NextResponse.json(failure("NOT_FOUND", "OCR job not found"), { status: 404 });
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to load OCR job"), { status: 500 });
  }
});
