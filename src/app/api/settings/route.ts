import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { failure, success } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { UserSettingService } from "@/services/UserSettingService";

async function getCurrentUserId() {
  const defaultEmail = process.env.DEFAULT_USER_EMAIL ?? "demo@zsp.local";
  const user = await prisma.user.upsert({
    where: { email: defaultEmail },
    update: {},
    create: { email: defaultEmail, name: "Demo User" },
  });
  return user.id;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const settings = await UserSettingService.getByUserId(userId);
    return NextResponse.json(success(settings));
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Failed to load settings", 500);
    return NextResponse.json(failure(appError.code, appError.message), { status: appError.status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await getCurrentUserId();
    const settings = await UserSettingService.upsert(userId, body);
    return NextResponse.json(success(settings));
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Failed to save settings", 500);
    return NextResponse.json(failure(appError.code, appError.message), { status: appError.status });
  }
}
