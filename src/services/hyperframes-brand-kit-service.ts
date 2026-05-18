import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { validateHttpMediaUrl } from "@/lib/hyperframes/sanitize";
import { hyperframesBrandKitSchema, type HyperframesBrandKitInput } from "@/schemas/hyperframes-brand-kit.schema";

function sanitizeBrandColors(colors: string[]): string[] {
  return [...new Set(colors.map((c) => c.toUpperCase()))].slice(0, 8);
}

function sanitizeWatermark(input?: string | null): string | null {
  if (!input) return null;
  return input.replace(/[{}<>]/g, "").slice(0, 120).trim() || null;
}

function toResponse(row: { brandColors: string[]; fontPreference: string | null; logoUrl: string | null; watermarkText: string | null; defaultAspectRatio: string | null; defaultCTA: string | null; }) {
  return {
    brandColors: row.brandColors ?? [],
    fontPreference: row.fontPreference,
    logoUrl: row.logoUrl,
    watermarkText: row.watermarkText,
    defaultAspectRatio: row.defaultAspectRatio,
    defaultCTA: row.defaultCTA,
  };
}

export async function getHyperframesBrandKit(userId: string) {
  try {
    const row = await prisma.userSetting.findUnique({ where: { userId } });
    if (!row) return { brandColors: [], fontPreference: null, logoUrl: null, watermarkText: null, defaultAspectRatio: null, defaultCTA: null };
    return toResponse(row);
  } catch {
    return { brandColors: [], fontPreference: null, logoUrl: null, watermarkText: null, defaultAspectRatio: null, defaultCTA: null };
  }
}

export async function upsertHyperframesBrandKit(userId: string, payload: unknown) {
  const parsed = hyperframesBrandKitSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", "Invalid brand kit payload", 422);
  }

  const data: HyperframesBrandKitInput = parsed.data;
  const safeLogoUrl = data.logoUrl ? validateHttpMediaUrl(data.logoUrl) : null;

  if (safeLogoUrl && /(127\.0\.0\.1|localhost|0\.0\.0\.0|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(safeLogoUrl)) {
    throw new AppError("VALIDATION_ERROR", "Unsafe logo URL", 422);
  }

  const saved = await prisma.userSetting.upsert({
    where: { userId },
    create: {
      userId,
      brandColors: sanitizeBrandColors(data.brandColors),
      fontPreference: data.fontPreference?.trim() || null,
      logoUrl: safeLogoUrl,
      watermarkText: sanitizeWatermark(data.watermarkText),
      defaultAspectRatio: data.defaultAspectRatio ?? null,
      defaultCTA: data.defaultCTA?.trim() || null,
    },
    update: {
      brandColors: sanitizeBrandColors(data.brandColors),
      fontPreference: data.fontPreference?.trim() || null,
      logoUrl: safeLogoUrl,
      watermarkText: sanitizeWatermark(data.watermarkText),
      defaultAspectRatio: data.defaultAspectRatio ?? null,
      defaultCTA: data.defaultCTA?.trim() || null,
    },
  });

  return toResponse(saved);
}
