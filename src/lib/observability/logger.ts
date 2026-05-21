import crypto from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const SECRET_PATTERNS: RegExp[] = [
  /authorization\s*[:=]\s*bearer\s+[a-z0-9._\-]+/gi,
  /(authorization|cookie|set-cookie|password|token|secret|apikey|api_key|database_url)\s*[:=]\s*[^\s,;]+/gi,
  /bearer[\s=]+[a-z0-9._\-]+/gi,
  /\/home\/[\w\-/.]+/gi,
  /\/var\/lib\/[\w\-/.]+/gi,
];

export function redactSensitiveText(value: string): string {
  return SECRET_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "[REDACTED]"), value);
}

export function safeErrorShape(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return { name: error.name, message: redactSensitiveText(error.message || "Unknown error") };
  }

  return { name: "UnknownError", message: redactSensitiveText(String(error)) };
}

export function hashUserId(userId: string): string {
  return crypto.createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...JSON.parse(redactSensitiveText(JSON.stringify(context))),
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
