import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { PromptTemplateService } from "@/services/PromptTemplateService";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: Params) {
  const duplicated = PromptTemplateService.duplicate((await context.params).id);

  if (!duplicated) {
    return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  }

  return NextResponse.json(success(duplicated), { status: 201 });
}
