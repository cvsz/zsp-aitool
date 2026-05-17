import { JobStatus, Language, Platform, Prisma, Tone } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type GenerateInput = {
  product: { id: string; title: string; description: string | null };
  platform: Platform;
  tone: Tone;
  language: Language;
  versions: number;
  customPrompt?: string;
};

export class AIContentService {
  static async generateContent(input: GenerateInput) {
    const base = `${input.product.title} (${input.platform})`;
    const versions = Array.from({ length: input.versions }).map((_, i) => ({
      version: i + 1,
      title: `${base} - ${input.tone}`,
      body: `${input.customPrompt ? `${input.customPrompt} ` : ""}${input.product.description ?? ""}`.trim(),
      language: input.language,
    }));

    return {
      outputs: versions,
      tokenUsage: Math.max(20, JSON.stringify(versions).length / 4),
    };
  }

  static async saveGenerationHistory(params: {
    userId: string;
    productId: string;
    platform: Platform;
    tone: Tone;
    language: Language;
    prompt: string;
    output: Prisma.InputJsonValue;
    tokenUsage?: number;
  }) {
    return prisma.contentGeneration.create({
      data: {
        ...params,
        status: JobStatus.COMPLETED,
      },
    });
  }
}
