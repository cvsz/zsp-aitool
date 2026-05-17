import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { settingsInputSchema, type SettingsInput } from "@/schemas/settings.schema";

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

    return {
      ...row,
      aiProviderKeyStatus: this.getProviderStatus(row.aiProvider),
      ocrProviderKeyStatus: this.getOcrProviderStatus(row.ocrProvider),
    };
  }

  static async upsert(userId: string, payload: unknown) {
    const parsed = settingsInputSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.flatten().formErrors.join(", ") || "Invalid settings payload", 422);
    }

    const data: SettingsInput = parsed.data;
    const saved = await prisma.userSetting.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return {
      ...saved,
      aiProviderKeyStatus: this.getProviderStatus(saved.aiProvider),
      ocrProviderKeyStatus: this.getOcrProviderStatus(saved.ocrProvider),
    };
  }
}
