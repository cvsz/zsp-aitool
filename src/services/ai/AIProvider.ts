import { AIGenerationInput, AIOutput } from "@/schemas/ai.schema";

export interface AIProviderGenerateRequest {
  prompt: string;
  input: AIGenerationInput;
}

export interface AIProvider {
  generate(request: AIProviderGenerateRequest): Promise<AIOutput[]>;
}
