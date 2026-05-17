export interface SessionLike { userId?: string; }
export function validateSession(session: SessionLike){ return Boolean(session.userId && session.userId.trim().length>0); }
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "zsp_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signPayload(payloadEncoded: string): string {
  return createHmac("sha256", getSessionSecret()).update(payloadEncoded).digest("base64url");
}

export function createSessionToken(userId: string, email: string): string {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadEncoded);

  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const expectedSignature = signPayload(payloadEncoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length != expectedBuffer.length) return null;

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(payloadEncoded, "base64url").toString("utf8")) as SessionPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getAuthenticatedUserIdForServer(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = verifySessionToken(token);
    if (session?.userId) {
      return session.userId;
    }
  }

  if (process.env.ZSP_ENABLE_DEMO_USER === "true" && process.env.DEFAULT_USER_ID) {
    return process.env.DEFAULT_USER_ID;
  }

  redirect("/login");
}

export { SESSION_COOKIE_NAME };
