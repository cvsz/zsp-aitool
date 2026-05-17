import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { templateUpdatePayloadSchema } from "@/schemas/template.schema";
import { PromptTemplateService } from "@/services/PromptTemplateService";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const template = PromptTemplateService.getById(params.id);
  if (!template) {
    return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  }

  return NextResponse.json(success(template));
}

export async function PATCH(request: Request, { params }: Params) {
  const parsed = templateUpdatePayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(failure("VALIDATION_ERROR", parsed.error.message), { status: 400 });
  }

  const updated = PromptTemplateService.update(params.id, parsed.data);
  if (!updated) {
    return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  }

  return NextResponse.json(success(updated));
}

export async function DELETE(_: Request, { params }: Params) {
  const deleted = PromptTemplateService.delete(params.id);
  if (!deleted) {
    return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  }

  return NextResponse.json(success({ id: params.id, deleted: true }));
}
