import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { templateUpdatePayloadSchema } from "@/schemas/template.schema";
import { PromptTemplateService } from "@/services/prompt-template-service";

type Params = { params: Promise<{ id: string }> };

export const GET = withAuth(async (request, context: Params) => {
  const template = PromptTemplateService.getById(request.auth.userId, (await context.params).id);
  if (!template) return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  return NextResponse.json(success(template));
});

export const PATCH = withAuth(async (request, context: Params) => {
  const parsed = templateUpdatePayloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json(failure("VALIDATION_ERROR", parsed.error.message), { status: 400 });
  const updated = PromptTemplateService.update(request.auth.userId, (await context.params).id, parsed.data);
  if (!updated) return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  return NextResponse.json(success(updated));
});

export const DELETE = withAuth(async (request, context: Params) => {
  const id = (await context.params).id;
  const deleted = PromptTemplateService.delete(request.auth.userId, id);
  if (!deleted) return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  return NextResponse.json(success({ id, deleted: true }));
});
