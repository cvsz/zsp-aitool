import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { PromptTemplateService } from "@/services/PromptTemplateService";

type Params = { params: { id: string } };

export async function POST(_: Request, { params }: Params) {
  const duplicated = PromptTemplateService.duplicate(params.id);

  if (!duplicated) {
    return NextResponse.json(failure("NOT_FOUND", "Template not found"), { status: 404 });
  }

  return NextResponse.json(success(duplicated), { status: 201 });
}
