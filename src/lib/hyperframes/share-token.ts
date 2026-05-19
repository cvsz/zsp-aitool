import { createHash, randomBytes } from "node:crypto";

export function isRenderShareEnabled(): boolean {
  return process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED === "true" || process.env.HYPERFRAMES_SHARE_ENABLED === "true";
}

export function createRenderShareToken(): { token: string; tokenHash: string } {
  const token = createShareToken();
  return { token, tokenHash: hashShareToken(token) };
}

export function hashRenderShareToken(token: string): string {
  return hashShareToken(token);
}

export function createShareToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashShareToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
