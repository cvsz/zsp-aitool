import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (request) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.auth.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json(failure("NOT_FOUND", "User not found"), { status: 404 });
    }

    return NextResponse.json(success({ user }));
  } catch {
    return NextResponse.json(failure("INTERNAL_ERROR", "Something went wrong"), { status: 500 });
  }
});
