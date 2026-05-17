import { NextResponse } from "next/server";

import { success } from "@/lib/api-response";
import { PromptTemplateService } from "@/services/PromptTemplateService";

export async function POST() {
  return NextResponse.json(success(PromptTemplateService.restoreDefaults()));
}
