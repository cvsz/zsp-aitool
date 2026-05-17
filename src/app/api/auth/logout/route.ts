import { NextResponse } from "next/server";

import { success } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  clearSessionCookie();
  return NextResponse.json(success({ message: "Logged out" }));
}
