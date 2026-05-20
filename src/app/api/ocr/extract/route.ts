import { NextResponse } from "next/server";
import { extractOCRSchema } from "@/schemas/ocr.schema";
import { OCRService } from "@/services/OCRService";
import { env } from "@/lib/env";
import { enforceUsageQuota } from "@/lib/usage-guard";
import { withAuth } from "@/middleware/auth-middleware";
import { failure } from "@/lib/api-response";

const service = new OCRService();

export const POST = withAuth(async (request) => {
  try {
    const quota = enforceUsageQuota({ request, namespace: "ocr", maxRequestsPerMinute: env.OCR_MAX_REQUESTS_PER_MINUTE });
    if (!quota.allowed) return NextResponse.json(failure("RATE_LIMITED", "OCR request quota exceeded. Please retry later."), { status: 429 });
    const parsed = extractOCRSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json(failure("VALIDATION_ERROR", "Invalid request", parsed.error.flatten()), { status: 400 });
    const output = await service.extractAndSave(request.auth.userId, parsed.data);
    return NextResponse.json({ ok: true, data: { jobId: output.job.id, status: output.job.status, result: output.result, note: "โปรดตรวจสอบและแก้ไขผล OCR ก่อนบันทึกสินค้า" } });
  } catch {
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to process OCR request"), { status: 500 });
  }
});
