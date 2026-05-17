import { AIProvider, AIProviderGenerateRequest } from "./AIProvider";
import { AIOutput, aiOutputSchema } from "@/schemas/ai.schema";
import { enforceContentSafety } from "./ContentSafety";

interface OpenAICompatibleProviderOptions {
  baseURL: string;
  apiKey: string;
  model: string;
}

export class OpenAICompatibleProvider implements AIProvider {
  constructor(private readonly options: OpenAICompatibleProviderOptions) {}

  async generate(request: AIProviderGenerateRequest): Promise<AIOutput[]> {
    const response = await fetch(`${this.options.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        model: this.options.model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: request.prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI-compatible API error: ${response.status} ${text}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from AI provider");
    }

    const parsed = JSON.parse(content) as AIOutput[] | { results?: AIOutput[] };
    const outputs = Array.isArray(parsed) ? parsed : parsed.results ?? [];

    return outputs.map((item) =>
      enforceContentSafety(aiOutputSchema.parse(item), request.input.language),
    );
  }
}
