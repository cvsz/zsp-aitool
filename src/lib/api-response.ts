import type { ApiFailure, ApiSuccess } from "../types/api";

export function success<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

export function failure(code: string, message: string): ApiFailure {
  return { ok: false, error: { code, message } };
}
