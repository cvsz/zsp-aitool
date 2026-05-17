import { Language, Tone } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { settingsInputSchema } from "@/schemas/settings.schema";

const providerKeyMap: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  other: "CUSTOM_AI_PROVIDER_API_KEY",
};

const ocrKeyMap: Record<string, string> = {
  google_vision: "GOOGLE_VISION_API_KEY",
  tesseract: "TESSERACT_BINARY_PATH",
  ocr_space: "OCR_SPACE_API_KEY",
  other: "CUSTOM_OCR_PROVIDER_KEY",
};

function toLanguage(value: "th" | "en" | "mixed"): Language {
  return value === "en" ? Language.EN : Language.TH;
}

function toTone(value: "friendly" | "professional" | "casual" | "sales" | "minimal"): Tone {
  switch (value) {
    case "professional":
      return Tone.PROFESSIONAL;
    case "casual":
      return Tone.CASUAL;
    case "sales":
      return Tone.SALES;
    case "minimal":
      return Tone.FRIENDLY;
    default:
      return Tone.FRIENDLY;
  }
}

export class UserSettingService {
  static getProviderStatus(provider: string) {
    const envName = providerKeyMap[provider] ?? "";
    return { envName, configured: Boolean(envName && process.env[envName]) };
  }

  static getOcrProviderStatus(provider: string) {
    const envName = ocrKeyMap[provider] ?? "";
    return { envName, configured: Boolean(envName && process.env[envName]) };
  }

  static async getByUserId(userId: string) {
    const row = await prisma.userSetting.findUnique({ where: { userId } });
    if (!row) return null;

    return row;
  }

  static async upsert(userId: string, payload: unknown) {
    const parsed = settingsInputSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.flatten().formErrors.join(", ") || "Invalid settings payload", 422);
    }

    const data = parsed.data;
    const saved = await prisma.userSetting.upsert({
      where: { userId },
      create: {
        userId,
        defaultLanguage: toLanguage(data.defaultLanguage),
        defaultTone: toTone(data.defaultTone),
        affiliateDisclosure: data.affiliateDisclosure,
        defaultHashtags: [],
        ctaStyle: data.defaultCtaStyle,
      },
      update: {
        defaultLanguage: toLanguage(data.defaultLanguage),
        defaultTone: toTone(data.defaultTone),
        affiliateDisclosure: data.affiliateDisclosure,
        ctaStyle: data.defaultCtaStyle,
      },
    });

    return {
      ...saved,
      aiProvider: data.aiProvider,
      ocrProvider: data.ocrProvider,
      defaultHashtagPreference: data.defaultHashtagPreference,
      profile: data.profile,
      aiProviderKeyStatus: this.getProviderStatus(data.aiProvider),
      ocrProviderKeyStatus: this.getOcrProviderStatus(data.ocrProvider),
    };
  }
}
