import { AIOutput, AILanguage, AIProductInput } from "@/schemas/ai.schema";

const TH_DISCLOSURE = "โพสต์นี้มีลิงก์ Affiliate/โพสต์โปรโมต อาจได้รับค่าคอมมิชชั่นเมื่อมีการสั่งซื้อ";
const EN_DISCLOSURE = "This post contains affiliate links / sponsored promotion. I may earn a commission from qualifying purchases.";

const prohibitedPatterns = [
  /รีวิวจากผู้ใช้จริง/gi,
  /รับประกันผล/gi,
  /ดีที่สุดในโลก/gi,
  /100%/g,
  /clinically proven/gi,
  /guaranteed results?/gi,
  /fake review/gi,
];

export function getDefaultDisclosure(language: AILanguage): string {
  return language === "th" ? TH_DISCLOSURE : EN_DISCLOSURE;
}

export function buildProductFactSummary(product: AIProductInput): string {
  const facts: string[] = [];
  facts.push(`Title: ${product.title}`);
  if (product.category) facts.push(`Category: ${product.category}`);
  if (product.price !== undefined && product.currency) {
    facts.push(`Price: ${product.price} ${product.currency}`);
  }
  if (product.shopName) facts.push(`Shop: ${product.shopName}`);
  if (product.rating !== undefined) facts.push(`Rating: ${product.rating}/5`);
  if (product.soldCount !== undefined) facts.push(`Sold count: ${product.soldCount}`);
  if (product.description) facts.push(`Description: ${product.description}`);
  if (product.keyFeatures?.length) facts.push(`Key features: ${product.keyFeatures.join(", ")}`);

  return facts.join("\n");
}

export function enforceContentSafety(output: AIOutput, language: AILanguage): AIOutput {
  const warnings = [...output.warnings];
  const allText = [output.headline, output.caption, output.cta].join("\n");

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(allText)) {
      warnings.push(
        language === "th"
          ? "ตรวจพบข้อความที่อาจเกินจริงหรือคล้ายรีวิวปลอม"
          : "Potential exaggerated claim or fake-review style language detected",
      );
      break;
    }
  }

  if (!output.affiliateDisclosure?.trim()) {
    output.affiliateDisclosure = getDefaultDisclosure(language);
  }

  return {
    ...output,
    affiliateDisclosure: output.affiliateDisclosure,
    warnings,
  };
}
