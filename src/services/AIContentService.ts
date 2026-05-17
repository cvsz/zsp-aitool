import { PromptBuilder, type PromptInput } from './ai/PromptBuilder';
export interface AIProvider { generate:(prompt:string)=>Promise<{caption:string}>; }
export class AIContentService { constructor(private readonly provider: AIProvider, private readonly builder = new PromptBuilder()) {}
async generateContent(input: PromptInput){ const prompt=this.builder.build(input); const result=await this.provider.generate(prompt); return {...result,prompt}; }}
