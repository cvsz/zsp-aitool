import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type HyperFramesDownloadTokenPayload = {
  jobId: string;
  userId: string;
  exp: number;
  nonce: string;
};

export type HyperFramesDownloadTokenConfig = {
  enabled: boolean;
  secret: string;
  ttlSeconds: number;
};

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadSegment: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadSegment).digest("base64url");
}

export function getHyperFramesDownloadTokenConfig(): HyperFramesDownloadTokenConfig {
  return {
    enabled: process.env.HYPERFRAMES_SIGNED_DOWNLOADS_ENABLED === "true",
    secret: process.env.HYPERFRAMES_DOWNLOAD_TOKEN_SECRET ?? "",
    ttlSeconds: Number.parseInt(process.env.HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS ?? "300", 10) || 300,
  };
}

export function createDownloadToken(jobId: string, userId: string, cfg = getHyperFramesDownloadTokenConfig()): string {
  if (!cfg.secret) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
  const payload: HyperFramesDownloadTokenPayload = {
    jobId,
    userId,
    exp: Math.floor(Date.now() / 1000) + Math.max(1, cfg.ttlSeconds),
    nonce: randomUUID(),
  };

  const payloadSegment = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadSegment, cfg.secret);
  return `${payloadSegment}.${signature}`;
}

export function verifyDownloadToken(token: string, cfg = getHyperFramesDownloadTokenConfig()): HyperFramesDownloadTokenPayload {
  if (!cfg.secret) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
  const [payloadSegment, signature] = token.split(".");
  if (!payloadSegment || !signature) throw new Error("DOWNLOAD_TOKEN_INVALID");

  const expected = signPayload(payloadSegment, cfg.secret);
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
    throw new Error("DOWNLOAD_TOKEN_INVALID");
  }

  let payload: HyperFramesDownloadTokenPayload;
  try {
    payload = JSON.parse(decodeBase64Url(payloadSegment)) as HyperFramesDownloadTokenPayload;
  } catch {
    throw new Error("DOWNLOAD_TOKEN_INVALID");
  }

  if (!payload.jobId || !payload.userId || !payload.exp || !payload.nonce) throw new Error("DOWNLOAD_TOKEN_INVALID");
  if (payload.exp <= Math.floor(Date.now() / 1000)) throw new Error("DOWNLOAD_TOKEN_EXPIRED");
  return payload;
}
