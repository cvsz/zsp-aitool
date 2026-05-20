import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { PromptTemplateService } from "@/services/prompt-template-service";

type Params = { params: Promise<{ id: string }> };

export const POST = withAuth(async (request, context: Params) => {
  const duplicated = PromptTemplateService.duplicate(request.auth.userId, (await context.params).id);
  if (!duplicated) return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  return NextResponse.json(success(duplicated), { status: 201 });
});
