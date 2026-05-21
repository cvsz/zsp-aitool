import crypto from "node:crypto";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SENSITIVE_KEY_RE = /(password|token|secret|authorization|cookie|session|api[_-]?key|database_url|refresh)/i;
const LOCAL_PATH_RE = /(^|\s)(\/var\/|\/home\/|[A-Za-z]:\\)/;
const MAX_METADATA_BYTES = 4096;

export type AdminAuditWriteInput = {
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  status?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
};

function sanitizePrimitive(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (LOCAL_PATH_RE.test(value)) return "[REDACTED_PATH]";
  return value.length > 500 ? `${value.slice(0, 500)}…` : value;
}

export function redactMetadata(value: unknown): unknown {
  if (value == null) return null;
  if (Array.isArray(value)) return value.slice(0, 40).map((item) => redactMetadata(item));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_RE.test(key)) {
        out[key] = "[REDACTED]";
      } else {
        out[key] = redactMetadata(raw);
      }
    }
    return out;
  }
  return sanitizePrimitive(value);
}

function toBoundedMetadata(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  const redacted = redactMetadata(value);
  const asText = JSON.stringify(redacted);
  if (!asText) return undefined;
  if (Buffer.byteLength(asText, "utf8") <= MAX_METADATA_BYTES) return redacted as Prisma.InputJsonValue;
  return { truncated: true, preview: asText.slice(0, MAX_METADATA_BYTES) } as Prisma.InputJsonValue;
}

function hashIp(ip?: string | null): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export class AdminAuditLogService {
  static async writeEvent(input: AdminAuditWriteInput): Promise<void> {
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        status: input.status ?? "SUCCESS",
        ipHash: hashIp(input.ip),
        userAgent: sanitizePrimitive(input.userAgent ?? null) as string | null,
        metadata: toBoundedMetadata(input.metadata),
      },
    });
  }

  static async writeBestEffort(input: AdminAuditWriteInput): Promise<void> {
    try {
      await this.writeEvent(input);
    } catch {
      // best-effort by design
    }
  }

  static async listForAdmin(params: { page: number; pageSize: number; action?: string; targetType?: string; actorUserId?: string; status?: string; dateFrom?: Date; dateTo?: Date }) {
    const where = {
      deletedAt: null,
      ...(params.action ? { action: params.action } : {}),
      ...(params.targetType ? { targetType: params.targetType } : {}),
      ...(params.actorUserId ? { actorUserId: params.actorUserId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.dateFrom || params.dateTo
        ? { createdAt: { ...(params.dateFrom ? { gte: params.dateFrom } : {}), ...(params.dateTo ? { lte: params.dateTo } : {}) } }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.adminAuditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (params.page - 1) * params.pageSize, take: params.pageSize }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return { rows, total, page: params.page, pageSize: params.pageSize };
  }
}
