import type { ApiFailure, ApiSuccess } from "../types/api";

export function success<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { ok: true, success: true, data, meta };
}

export function failure(code: string, message: string, details?: unknown): ApiFailure {
  return { ok: false, error: { code, message, details } };
}
