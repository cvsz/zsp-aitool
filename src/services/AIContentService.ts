import { PromptBuilder, type PromptInput } from './ai/PromptBuilder';
export interface AIProvider { generate:(prompt:string)=>Promise<{caption:string}>; }
export class AIContentService { constructor(private readonly provider: AIProvider, private readonly builder = new PromptBuilder()) {}
async generateContent(input: PromptInput){ const prompt=this.builder.build(input); const result=await this.provider.generate(prompt); return {...result,prompt}; }}
import { AIGenerationInput, AIOutput, aiGenerationInputSchema } from "@/schemas/ai.schema";
import { AIProvider } from "@/services/ai/AIProvider";
import { PromptBuilder } from "@/services/ai/PromptBuilder";

export class AIContentService {
  constructor(private readonly provider: AIProvider) {}

  async generate(input: AIGenerationInput): Promise<AIOutput[]> {
    const safeInput = aiGenerationInputSchema.parse(input);
    const prompt = PromptBuilder.build(safeInput);
    const outputs = await this.provider.generate({
      prompt,
      input: safeInput,
    });

    return outputs.slice(0, safeInput.versions);
  }
}
