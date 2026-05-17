import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { UserSettingService } from "@/services/UserSettingService";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (req) => {
  try {
    const settings = await UserSettingService.getByUserId(req.auth.userId);
    return NextResponse.json(success(settings));
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Failed to load settings", 500);
    return NextResponse.json(failure(appError.code, appError.message), { status: appError.status });
  }
});

export const PUT = withAuth(async (req) => {
  try {
    const body = await req.json();
    const settings = await UserSettingService.upsert(req.auth.userId, body);
    return NextResponse.json(success(settings));
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Failed to save settings", 500);
    return NextResponse.json(failure(appError.code, appError.message), { status: appError.status });
  }
});
