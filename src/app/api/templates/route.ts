import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { templatePayloadSchema, templatePreviewSchema } from "@/schemas/template.schema";
import { PromptTemplateService } from "@/services/PromptTemplateService";

export async function GET() {
  return NextResponse.json(success(PromptTemplateService.list()));
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body?.action === "preview") {
    const parsedPreview = templatePreviewSchema.safeParse(body);
    if (!parsedPreview.success) {
      return NextResponse.json(failure("VALIDATION_ERROR", parsedPreview.error.message), { status: 400 });
    }

    return NextResponse.json(success(PromptTemplateService.preview(parsedPreview.data.content, parsedPreview.data.sample)));
  }

  const parsed = templatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(failure("VALIDATION_ERROR", parsed.error.message), { status: 400 });
  }

  return NextResponse.json(success(PromptTemplateService.create(parsed.data)), { status: 201 });
}
