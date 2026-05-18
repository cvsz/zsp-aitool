import type { HyperFrameTemplate, HyperFrameTemplateMetadata } from "@/lib/hyperframes/templates/types";

const baseDisclosures = {
  affiliate: { code: "affiliate_disclosure", required: true, description: "ต้องมีข้อความเปิดเผยการใช้ลิงก์แอฟฟิลิเอต" },
  noFakeResults: { code: "no_fake_results", required: true, description: "ห้ามกล่าวอ้างผลลัพธ์เกินจริงหรือปลอม" },
  noUnsupportedClaims: { code: "no_unsupported_claims", required: true, description: "ห้ามอ้างสรรพคุณที่ไม่มีข้อมูลรองรับ" },
  noFakeScarcity: { code: "no_fake_scarcity", required: true, description: "ห้ามใช้ข้อความเร่งด่วนปลอม เช่น เหลือ 1 ชิ้น โดยไม่มีข้อมูลจริง" },
} as const;

export const hyperFrameTemplates: readonly HyperFrameTemplate[] = [
  {
    id: "product-reveal",
    label: "Product reveal",
    description: "เปิดตัวสินค้าแบบสั้น กระชับ พร้อมจุดเด่นสำคัญ",
    scenes: [
      { id: "hook", title: "Hook", purpose: "ดึงความสนใจทันที", minSeconds: 2, maxSeconds: 5 },
      { id: "reveal", title: "Reveal", purpose: "แสดงภาพและชื่อสินค้า", minSeconds: 4, maxSeconds: 9 },
      { id: "cta", title: "CTA", purpose: "ชวนคลิกแบบโปร่งใส", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["image", "video"],
    durationRangeSeconds: { min: 9, max: 30 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noUnsupportedClaims],
  },
  {
    id: "problem-solution",
    label: "Problem / solution",
    description: "เล่าปัญหาที่พบ แล้วชี้วิธีแก้ด้วยสินค้า",
    scenes: [
      { id: "problem", title: "Problem", purpose: "ระบุปัญหาที่กลุ่มเป้าหมายเจอ", minSeconds: 3, maxSeconds: 8 },
      { id: "solution", title: "Solution", purpose: "อธิบายการใช้งานจริง", minSeconds: 5, maxSeconds: 12 },
      { id: "proof", title: "Proof", purpose: "ให้ข้อมูลประกอบที่ตรวจสอบได้", minSeconds: 3, maxSeconds: 8 },
      { id: "cta", title: "CTA", purpose: "ปิดท้ายด้วยคำเชิญชวนปลอดภัย", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["image", "video"],
    durationRangeSeconds: { min: 14, max: 45 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noFakeResults, baseDisclosures.noUnsupportedClaims],
  },
  {
    id: "tutorial",
    label: "Tutorial",
    description: "สาธิตขั้นตอนการใช้สินค้าแบบทีละขั้น",
    scenes: [
      { id: "intro", title: "Intro", purpose: "บอกเป้าหมายของคลิป", minSeconds: 2, maxSeconds: 5 },
      { id: "steps", title: "Steps", purpose: "สาธิต 2-4 ขั้นตอน", minSeconds: 8, maxSeconds: 24 },
      { id: "recap", title: "Recap", purpose: "สรุปผลการใช้งาน", minSeconds: 3, maxSeconds: 8 },
      { id: "cta", title: "CTA", purpose: "แนบลิงก์พร้อม disclosure", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["video", "image"],
    durationRangeSeconds: { min: 16, max: 60 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noUnsupportedClaims],
  },
  {
    id: "feature-highlight",
    label: "Feature highlight",
    description: "โฟกัสจุดเด่น 2-3 ข้อที่ยืนยันได้",
    scenes: [
      { id: "hook", title: "Hook", purpose: "ตั้งประเด็นสั้น ๆ", minSeconds: 2, maxSeconds: 4 },
      { id: "features", title: "Features", purpose: "ชูฟีเจอร์พร้อมภาพประกอบ", minSeconds: 6, maxSeconds: 18 },
      { id: "cta", title: "CTA", purpose: "ปิดการขายแบบไม่เกินจริง", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["image", "video"],
    durationRangeSeconds: { min: 11, max: 35 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noUnsupportedClaims],
  },
  {
    id: "before-after-honest",
    label: "Before/after without fake results",
    description: "เปรียบเทียบก่อน/หลังแบบตรงไปตรงมาและตรวจสอบได้",
    scenes: [
      { id: "baseline", title: "Before", purpose: "แสดงสภาพก่อนใช้งาน", minSeconds: 3, maxSeconds: 8 },
      { id: "usage", title: "Usage", purpose: "อธิบายวิธีใช้และเงื่อนไข", minSeconds: 5, maxSeconds: 15 },
      { id: "after", title: "After", purpose: "แสดงผลลัพธ์จริงพร้อมข้อจำกัด", minSeconds: 4, maxSeconds: 10 },
      { id: "cta", title: "CTA", purpose: "ชวนทดลองด้วยความคาดหวังจริง", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["image", "video"],
    durationRangeSeconds: { min: 15, max: 45 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noFakeResults, baseDisclosures.noUnsupportedClaims],
  },
  {
    id: "comparison-safe",
    label: "Comparison without unsupported claims",
    description: "เทียบทางเลือกแบบเป็นธรรม โดยไม่โจมตีคู่แข่ง",
    scenes: [
      { id: "criteria", title: "Criteria", purpose: "กำหนดเกณฑ์เปรียบเทียบที่ชัดเจน", minSeconds: 3, maxSeconds: 8 },
      { id: "comparison", title: "Comparison", purpose: "เทียบทีละข้อจากข้อมูลที่มี", minSeconds: 6, maxSeconds: 18 },
      { id: "recommendation", title: "Recommendation", purpose: "สรุปว่าเหมาะกับใคร", minSeconds: 3, maxSeconds: 8 },
      { id: "cta", title: "CTA", purpose: "ชวนเลือกตามบริบทผู้ใช้", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["image", "video", "none"],
    durationRangeSeconds: { min: 15, max: 50 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noUnsupportedClaims],
  },
  {
    id: "offer-cta-ethical",
    label: "Offer/CTA without fake scarcity",
    description: "สื่อข้อเสนอและการชวนซื้อโดยไม่สร้างความเร่งด่วนปลอม",
    scenes: [
      { id: "offer", title: "Offer", purpose: "ระบุข้อเสนอจากข้อมูลจริง", minSeconds: 4, maxSeconds: 10 },
      { id: "value", title: "Value", purpose: "ย้ำคุณค่าและเงื่อนไข", minSeconds: 4, maxSeconds: 12 },
      { id: "cta", title: "CTA", purpose: "ปิดท้ายพร้อม disclosure", minSeconds: 3, maxSeconds: 6 },
    ],
    allowedMedia: ["image", "video"],
    durationRangeSeconds: { min: 11, max: 35 },
    requiredDisclosureRules: [baseDisclosures.affiliate, baseDisclosures.noFakeScarcity, baseDisclosures.noUnsupportedClaims],
  },
] as const;

export function getHyperFrameTemplateById(id: string): HyperFrameTemplate | null {
  return hyperFrameTemplates.find((template) => template.id === id) ?? null;
}

export function buildHyperFrameTemplateMetadata(templateId: string): HyperFrameTemplateMetadata | null {
  const template = getHyperFrameTemplateById(templateId);
  if (!template) return null;

  return {
    templateId: template.id,
    templateVersion: "1.0.0",
    sceneCount: template.scenes.length,
    durationRangeSeconds: template.durationRangeSeconds,
    allowedMedia: template.allowedMedia,
    requiredDisclosureCodes: template.requiredDisclosureRules.map((rule) => rule.code).sort(),
  };
}
