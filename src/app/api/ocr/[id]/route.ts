import { NextResponse } from "next/server";
import { getOCRJobSchema } from "@/schemas/ocr.schema";
import { OCRService } from "@/services/OCRService";

const service = new OCRService();

export async function GET(_: Request, context: { params: { id: string } }) {
  const parsed = getOCRJobSchema.safeParse(context.params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
  }

  try {
    const job = await service.getJob(parsed.data.id);
    return NextResponse.json(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
