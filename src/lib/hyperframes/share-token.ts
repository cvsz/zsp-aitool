import { createHash, randomBytes } from "node:crypto";

export function isRenderShareEnabled(): boolean {
  return process.env.HYPERFRAMES_PUBLIC_SHARE_ENABLED === "true";
}

export function createRenderShareToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashRenderShareToken(token);
  return { token, tokenHash };
}

export function hashRenderShareToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
