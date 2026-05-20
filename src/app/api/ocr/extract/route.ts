import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";
import { extractOCRSchema } from "@/schemas/ocr.schema";
import { OCRService } from "@/services/OCRService";
import { BudgetService } from "@/services/BudgetService";
import { env } from "@/lib/env";
import { enforceUsageQuota } from "@/lib/usage-guard";
import { withAuth } from "@/middleware/auth-middleware";
import { failure } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

const service = new OCRService();

export const POST = withAuth(async (request) => {
  try {
    const quota = await enforceUsageQuota({ request, namespace: "ocr", maxRequestsPerMinute: env.OCR_MAX_REQUESTS_PER_MINUTE });
    if (!quota.allowed) return NextResponse.json(failure("RATE_LIMITED", "OCR request quota exceeded. Please retry later."), { status: 429 });
    
    await BudgetService.checkBudget(request.auth.userId);

    const parsed = extractOCRSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json(failure("VALIDATION_ERROR", "Invalid request", parsed.error.flatten()), { status: 400 });
    
    const output = await service.extractAndSave(request.auth.userId, parsed.data);

    // OCR cost: 0.01 USD per request
    await BudgetService.logUsage(
      request.auth.userId,
      "pluggable",
      "/api/ocr/extract",
      0.01,
      JobStatus.COMPLETED,
      { jobId: output.job.id }
    );

    return NextResponse.json({ ok: true, data: { jobId: output.job.id, status: output.job.status, result: output.result, note: "โปรดตรวจสอบและแก้ไขผล OCR ก่อนบันทึกสินค้า" } });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(failure(error.code, error.message), { status: error.status });
    }
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to process OCR request"), { status: 500 });
  }
});

