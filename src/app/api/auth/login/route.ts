import { NextResponse } from "next/server";
import { z } from "zod";

import { failure, success } from "@/lib/api-response";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, createRateLimitKey } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS_PER_IP = 20;
const LOGIN_MAX_ATTEMPTS_PER_EMAIL = 7;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    const ipBucket = await applyRateLimit(createRateLimitKey(request, "auth:login:ip"), LOGIN_MAX_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS);
    if (!ipBucket.allowed) {
      return NextResponse.json(failure("RATE_LIMITED", "Too many login attempts. Please try again later."), { status: 429 });
    }

    const emailBucket = await applyRateLimit(createRateLimitKey(request, "auth:login:email", input.email.toLowerCase()), LOGIN_MAX_ATTEMPTS_PER_EMAIL, LOGIN_WINDOW_MS);
    if (!emailBucket.allowed) {
      return NextResponse.json(failure("RATE_LIMITED", "Too many login attempts for this account. Please try again later."), { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      return NextResponse.json(failure("INVALID_CREDENTIALS", "Invalid email or password"), { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json(failure("INVALID_CREDENTIALS", "Invalid email or password"), { status: 401 });
    }

    const isValidPassword = await verifyPassword(input.password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(failure("INVALID_CREDENTIALS", "Invalid email or password"), { status: 401 });
    }

    const token = createSessionToken(user.id, user.email);
    setSessionCookie(token);

    return NextResponse.json(success({ user: { id: user.id, email: user.email, name: user.name } }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(failure("VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid input"), { status: 400 });
    }

    return NextResponse.json(failure("INTERNAL_ERROR", "Something went wrong"), { status: 500 });
  }
}
