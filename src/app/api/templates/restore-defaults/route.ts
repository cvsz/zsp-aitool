import { NextResponse } from "next/server";
import { success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { PromptTemplateService } from "@/services/prompt-template-service";

export const POST = withAuth(async (request) => NextResponse.json(success(PromptTemplateService.restoreDefaults(request.auth.userId))));
