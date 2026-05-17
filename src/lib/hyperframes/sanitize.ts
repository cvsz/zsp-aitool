import { HYPERFRAME_MAX_TEXT_LENGTH } from "@/lib/hyperframes/types";

export function escapeHtml(input: string): string {
  return input.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] ?? char));
}

export function sanitizeText(input: string): string {
  return escapeHtml(
    input
      .replace(/<\s*\/?\s*script[^>]*>/gi, "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, HYPERFRAME_MAX_TEXT_LENGTH),
  );
}

export function validateMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const lowered = trimmed.toLowerCase();

  if (lowered.startsWith("javascript:") || lowered.startsWith("data:")) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
