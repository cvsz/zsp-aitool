import { NextResponse } from "next/server";
import { z } from "zod";

import { failure, success } from "@/lib/api-response";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional()
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      return NextResponse.json(failure("CONFLICT", "Email already in use"), { status: 409 });
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: hashedPassword
      }
    });

    const token = createSessionToken(user.id, user.email);
    setSessionCookie(token);

    return NextResponse.json(success({ user: { id: user.id, email: user.email, name: user.name } }), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(failure("VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid input"), { status: 400 });
    }

    return NextResponse.json(failure("INTERNAL_ERROR", "Something went wrong"), { status: 500 });
  }
}
