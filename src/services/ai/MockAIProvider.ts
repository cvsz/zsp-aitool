import { AIProvider, AIProviderGenerateRequest } from "./AIProvider";
import { AIOutput } from "@/schemas/ai.schema";
import { enforceContentSafety, getDefaultDisclosure } from "./ContentSafety";

export class MockAIProvider implements AIProvider {
  async generate(request: AIProviderGenerateRequest): Promise<AIOutput[]> {
    const { input } = request;
    const disclosure = input.affiliateDisclosure || getDefaultDisclosure(input.language);

    return Array.from({ length: input.versions }).map((_, index) =>
      enforceContentSafety(
        {
          platform: input.platform,
          headline:
            input.language === "th"
              ? `ตัวเลือกโพสต์ที่ ${index + 1}: ${input.product.title}`
              : `Version ${index + 1}: ${input.product.title}`,
          caption:
            input.language === "th"
              ? `โพสต์นี้แนะนำสินค้าแบบข้อมูลกลาง ๆ เหมาะสำหรับผู้ที่สนใจ ${input.product.title}`
              : `This is a neutral promotional caption for ${input.product.title} with factual tone.`,
          hashtags: ["#affiliate", `#${input.platform}`],
          cta:
            input.language === "th"
              ? "กดดูรายละเอียดเพิ่มเติมก่อนตัดสินใจซื้อ"
              : "Check the product details before purchasing.",
          affiliateDisclosure: disclosure,
          warnings: [],
        },
        input.language,
      ),
    );
  }
}
