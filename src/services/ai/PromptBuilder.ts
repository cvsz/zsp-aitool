import { AIGenerationInput } from "@/schemas/ai.schema";
import { buildProductFactSummary, getDefaultDisclosure } from "./ContentSafety";

const platformGuidance: Record<AIGenerationInput["platform"], string> = {
  facebook: "Write engaging Facebook post copy with readable line breaks.",
  instagram: "Write visual-first Instagram caption with concise hashtags.",
  threads: "Write conversational Threads style with short paragraphs.",
  x: "Write concise X post with strong hook and compact hashtags.",
  blog: "Write blog teaser copy and CTA in social format.",
  seo_article: "Write SEO-friendly short article summary with natural keyword use.",
  comment: "Write short comment-style promotional copy that sounds natural.",
  short_caption: "Write very short caption (1-2 sentences).",
};

const lengthGuidance: Record<AIGenerationInput["contentLength"], string> = {
  short: "Keep caption around 1-2 short paragraphs.",
  medium: "Keep caption around 3-5 short paragraphs.",
  long: "Keep caption detailed with 5+ short paragraphs when needed.",
};

export class PromptBuilder {
  static build(input: AIGenerationInput): string {
    const disclosure = input.affiliateDisclosure || getDefaultDisclosure(input.language);
    const languageInstruction =
      input.language === "th"
        ? "เขียนภาษาไทยธรรมชาติ อ่านง่าย"
        : "Write in natural, fluent English";

    return [
      "You are an assistant for affiliate content creation.",
      languageInstruction,
      `Tone: ${input.tone}`,
      `Platform: ${input.platform}`,
      `Versions: ${input.versions}`,
      platformGuidance[input.platform],
      lengthGuidance[input.contentLength],
      "Strict safety rules:",
      "- Do NOT create fake reviews or testimonials.",
      "- Do NOT make exaggerated, guaranteed, medical, or unverified claims.",
      "- If product data is missing, use neutral phrasing and avoid specifics.",
      `- Must include affiliate disclosure: \"${disclosure}\"`,
      "Use only these product facts:",
      buildProductFactSummary(input.product),
      "Return JSON array only. Each item format:",
      JSON.stringify(
        {
          platform: input.platform,
          headline: "",
          caption: "",
          hashtags: [],
          cta: "",
          affiliateDisclosure: disclosure,
          warnings: [],
        },
        null,
        2,
      ),
    ].join("\n");
  }
}
