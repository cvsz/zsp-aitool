import { z } from "zod";

export const templateCategories = ["product_showcase", "discount_alert", "comparison", "testimonial_style", "social_short_cut"] as const;

const unsafePattern = /(outputPath|\/var\/lib|file:\/\/|systemctl|process\.env|<script|javascript:|token|secret|passwd|\.ssh)/i;

const templateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(280),
  category: z.enum(templateCategories),
  tags: z.array(z.string().min(1).max(24)).min(1).max(8),
  previewImage: z.string().startsWith("/images/hyperframes/").max(200),
  scriptSeed: z.string().min(20).max(1200),
  defaultPlatform: z.enum(["facebook", "instagram", "threads", "x", "blog"] as const),
  defaultAspectRatio: z.enum(["16:9", "9:16", "1:1"] as const),
  defaultDurationSeconds: z.number().int().min(3).max(120),
  safetyNotes: z.array(z.string().min(1).max(120)).min(2).max(8),
});

export type HyperframesTemplatePreset = z.infer<typeof templateSchema>;

export const hyperframesTemplatePresets: readonly HyperframesTemplatePreset[] = [
  { id: "showcase-clean", title: "โชว์สินค้าแบบกระชับ", description: "เปิดจุดเด่นสินค้า + ราคา + คำชวนอย่างโปร่งใส", category: "product_showcase", tags: ["สินค้า", "จุดเด่น", "affiliate"], previewImage: "/images/hyperframes/template-product-showcase.svg", scriptSeed: "Hook: เริ่มด้วย pain point สั้น ๆ\nBody: แสดงสินค้าและจุดเด่นจากข้อมูลจริง\nCTA: ชวนดูรายละเอียดพร้อม disclosure ว่าเป็นลิงก์แอฟฟิลิเอต", defaultPlatform: "facebook", defaultAspectRatio: "9:16", defaultDurationSeconds: 15, safetyNotes: ["ห้ามอวดอ้างผลลัพธ์เกินจริง", "ใส่ affiliate disclosure ทุกครั้ง"] },
  { id: "discount-safe", title: "แจ้งโปรแบบปลอดภัย", description: "เน้นส่วนลด/โปรโมชันจากข้อมูลที่ตรวจสอบได้เท่านั้น", category: "discount_alert", tags: ["ส่วนลด", "โปรโมชัน", "ราคา"], previewImage: "/images/hyperframes/template-discount-alert.svg", scriptSeed: "Hook: ระบุว่ามีโปร\nBody: บอกเงื่อนไขโปรจากข้อมูลจริง เช่น ช่วงเวลา/โค้ด\nCTA: ชวนเช็คหน้าสินค้าก่อนสั่งซื้อ", defaultPlatform: "instagram", defaultAspectRatio: "1:1", defaultDurationSeconds: 12, safetyNotes: ["ห้ามสร้างความเร่งด่วนปลอม", "ห้ามใช้คำรับประกันกำไร"] },
  { id: "compare-fair", title: "เปรียบเทียบแบบเป็นธรรม", description: "เทียบ 2-3 ตัวเลือกตามเกณฑ์ชัดเจนโดยไม่โจมตีคู่แข่ง", category: "comparison", tags: ["เปรียบเทียบ", "เกณฑ์", "เลือกซื้อ"], previewImage: "/images/hyperframes/template-comparison.svg", scriptSeed: "Hook: นิยามปัญหาที่ผู้ชมอยากเทียบ\nBody: เทียบแต่ละตัวเลือกตามเกณฑ์เดียวกัน\nCTA: ให้ผู้ชมตัดสินใจตามการใช้งานของตัวเอง", defaultPlatform: "blog", defaultAspectRatio: "16:9", defaultDurationSeconds: 20, safetyNotes: ["ห้ามกล่าวอ้างอันดับดีที่สุดแบบไม่มีหลักฐาน", "เน้นข้อมูลจริงจากหน้าสินค้า"] },
  { id: "testimonial-style-safe", title: "โทนเล่าประสบการณ์อย่างปลอดภัย", description: "สื่ออารมณ์คล้ายรีวิวแต่ไม่อ้างว่าเป็นลูกค้าจริง", category: "testimonial_style", tags: ["ประสบการณ์", "story", "safe-copy"], previewImage: "/images/hyperframes/template-testimonial-style.svg", scriptSeed: "Hook: เล่าบริบทการใช้งานที่พบได้ทั่วไป\nBody: อธิบายฟีเจอร์ที่อาจช่วยได้ โดยอิงข้อมูลสินค้า\nCTA: ชวนทดลองพิจารณาด้วยข้อมูลครบถ้วน", defaultPlatform: "threads", defaultAspectRatio: "9:16", defaultDurationSeconds: 18, safetyNotes: ["ห้ามใช้คำว่ารีวิวผู้ใช้จริง", "ห้ามสร้างผลลัพธ์ปลอม"] },
  { id: "short-cut-social", title: "คลิปสั้นลงโซเชียล", description: "คัตเร็ว 3 ช่วง: Hook / Highlight / CTA", category: "social_short_cut", tags: ["short", "reels", "tiktok-style"], previewImage: "/images/hyperframes/template-social-short-cut.svg", scriptSeed: "Hook: ประโยคสั้นไม่เกิน 8 คำ\nHighlight: 2-3 จุดเด่นสำคัญ\nCTA: ชวนกดดูรายละเอียดและเปิดเผย affiliate", defaultPlatform: "x", defaultAspectRatio: "9:16", defaultDurationSeconds: 10, safetyNotes: ["ไม่ใส่ URL ภายนอกที่ไม่ผ่านระบบ", "ห้ามแนบโค้ดหรือคำสั่งระบบ"] },
] as const;

export function listTemplatePresets(query?: string, category?: (typeof templateCategories)[number]) {
  return hyperframesTemplatePresets.filter((preset) => {
    const matchesCategory = category ? preset.category === category : true;
    const haystack = `${preset.title} ${preset.description} ${preset.tags.join(" ")}`.toLowerCase();
    const matchesQuery = query ? haystack.includes(query.trim().toLowerCase()) : true;
    return matchesCategory && matchesQuery;
  });
}

export function getTemplatePresetById(id: string): HyperframesTemplatePreset | null {
  const found = hyperframesTemplatePresets.find((preset) => preset.id === id);
  return found ?? null;
}

export function assertSafeTemplatePreset(preset: HyperframesTemplatePreset): void {
  templateSchema.parse(preset);
  const combined = `${preset.description}\n${preset.scriptSeed}\n${preset.safetyNotes.join("\n")}`;
  if (unsafePattern.test(combined)) throw new Error("UNSAFE_TEMPLATE_CONTENT");
}
