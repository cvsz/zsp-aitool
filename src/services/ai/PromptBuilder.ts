export interface PromptInput { productTitle: string; platform: string; tone: string; language: string; }
export class PromptBuilder { build(input: PromptInput){ return [`Platform: ${input.platform}`,`Tone: ${input.tone}`,`Language: ${input.language}`,`Product: ${input.productTitle}`,'Always include affiliate disclosure.'].join('\n'); }}
