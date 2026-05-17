import { JobStatus, Language, Platform, Prisma, Tone } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AIGenerationInput, AIOutput, aiGenerationInputSchema } from "@/schemas/ai.schema";
import { AIProvider } from "@/services/ai/AIProvider";
import { PromptBuilder } from "@/services/ai/PromptBuilder";

export class AIContentService {
  constructor(private readonly provider: AIProvider) {}

  private withGuardrails(prompt: string, hasAffiliateUrl: boolean): string {
    const guardrails = [
      "Compliance rules:",
      "- Do not generate fake personal reviews.",
      "- Do not claim the user personally used the product unless explicitly provided.",
      "- Do not invent product specifications.",
      "- Do not invent price, discount, shipping, warranty, or review counts.",
      "- Separate known product facts from marketing language.",
      "- Avoid deceptive scarcity claims.",
      hasAffiliateUrl
        ? "- Include clear affiliate disclosure in the generated copy."
        : "- If no affiliate URL is provided, do not imply affiliate relationships.",
    ].join("\n");

    return `${prompt}\n\n${guardrails}`;
  }

  async generate(input: AIGenerationInput): Promise<AIOutput[]> {
    const safeInput = aiGenerationInputSchema.parse(input);
    const prompt = this.withGuardrails(
      PromptBuilder.build(safeInput),
      Boolean((input as { product?: { affiliateUrl?: string } }).product?.affiliateUrl),
    );
    const outputs = await this.provider.generate({ prompt, input: safeInput });
    return outputs.slice(0, safeInput.versions);
  }

  buildPrompt(input: AIGenerationInput): string {
    const safeInput = aiGenerationInputSchema.parse(input);
    return this.withGuardrails(
      PromptBuilder.build(safeInput),
      Boolean((input as { product?: { affiliateUrl?: string } }).product?.affiliateUrl),
    );
  }

  async saveGenerationHistory(params: {
    userId: string;
    productId: string;
    platform: AIGenerationInput["platform"];
    tone: AIGenerationInput["tone"];
    language: AIGenerationInput["language"];
    prompt: string;
    output: Prisma.InputJsonValue;
    tokenUsage?: number;
  }) {
    return prisma.contentGeneration.create({
      data: {
        ...params,
        platform: params.platform.toUpperCase() as Platform,
        tone: params.tone.toUpperCase() as Tone,
        language: params.language.toUpperCase() as Language,
        status: JobStatus.COMPLETED,
      },
    });
  }

  async markGenerationFailed(id: string) {
    return prisma.contentGeneration.update({
      where: { id },
      data: { status: JobStatus.FAILED },
    });
  }
}
