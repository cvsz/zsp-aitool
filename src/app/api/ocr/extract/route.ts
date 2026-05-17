import { NextResponse } from "next/server";
import { extractOCRSchema } from "@/schemas/ocr.schema";
import { OCRService } from "@/services/OCRService";

const service = new OCRService();

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = extractOCRSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const output = await service.extractAndSave(parsed.data);

    return NextResponse.json({
      jobId: output.job.id,
      status: output.job.status,
      result: output.result,
      note: "โปรดตรวจสอบและแก้ไขผล OCR ก่อนบันทึกสินค้า",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
