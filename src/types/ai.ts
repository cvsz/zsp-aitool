import type { ContentLanguage, ContentTone, GeneratedContent, Platform } from "./content";

export interface AIModelUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AIGenerationInput {
  platform: Platform;
  tone: ContentTone;
  language: ContentLanguage;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGenerationResponse {
  content: GeneratedContent;
  rawText?: string;
  model?: string;
  usage?: AIModelUsage;
}
