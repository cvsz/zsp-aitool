import { AppError } from "@/lib/errors";
import { HYPERFRAME_MAX_TEXT_LENGTH } from "@/lib/hyperframes/types";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function stripDangerousControlChars(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

export function sanitizePlainText(input: string, maxLength: number): string {
  const normalized = String(input ?? "");
  const noControlChars = stripDangerousControlChars(normalized);
  const noScriptTokens = noControlChars.replace(/<\/?\s*script\b[^>]*>/gi, " ");
  const collapsedWhitespace = noScriptTokens.replace(/[\t\n\r ]+/g, " ").trim();
  const bounded = collapsedWhitespace.slice(0, maxLength);
  return escapeHtml(bounded);
}

export function sanitizeText(input: string): string {
  return sanitizePlainText(input, HYPERFRAME_MAX_TEXT_LENGTH);
}

export function validateHttpMediaUrl(rawUrl: string): string {
  const normalized = String(rawUrl ?? "").trim();
  if (!normalized) {
    throw new AppError("VALIDATION_ERROR", "invalid media URL", 422);
  }

  const strippedControls = stripDangerousControlChars(normalized);
  if (strippedControls !== normalized || /[\t\n\r]/.test(normalized)) {
    throw new AppError("VALIDATION_ERROR", "invalid media URL", 422);
  }

  let parsed: URL;
  try {
    parsed = new URL(strippedControls);
  } catch {
    throw new AppError("VALIDATION_ERROR", "invalid media URL", 422);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("VALIDATION_ERROR", "invalid media URL", 422);
  }

  return parsed.toString();
}

export function validateMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    return validateHttpMediaUrl(url);
  } catch {
    return null;
  }
}
