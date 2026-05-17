import { JobStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AIGenerationInput, AIOutput, aiGenerationInputSchema } from "@/schemas/ai.schema";
import { AIProvider } from "@/services/ai/AIProvider";
import { PromptBuilder } from "@/services/ai/PromptBuilder";

export class AIContentService {
  constructor(private readonly provider: AIProvider) {}

  async generate(input: AIGenerationInput): Promise<AIOutput[]> {
    const safeInput = aiGenerationInputSchema.parse(input);
    const prompt = PromptBuilder.build(safeInput);
    const outputs = await this.provider.generate({ prompt, input: safeInput });
    return outputs.slice(0, safeInput.versions);
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
    return prisma.contentGeneration.create({ data: { ...params, status: JobStatus.COMPLETED } });
  }
}
