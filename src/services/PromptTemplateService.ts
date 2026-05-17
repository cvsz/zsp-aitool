import { randomUUID } from "node:crypto";

import {
  type PromptTemplate,
  type TemplatePayload,
  TEMPLATE_VARIABLES,
  templateSchema,
} from "@/schemas/template.schema";
import { TemplateRenderer } from "@/services/TemplateRenderer";

const nowIso = () => new Date().toISOString();

const defaultTemplates = (): PromptTemplate[] => {
  const now = nowIso();
  return [
    { id: "default-facebook", name: "Facebook promotional post", content: "เขียนโพสต์ขาย {{productTitle}} ราคา {{price}} สำหรับ {{platform}} โทน {{tone}} ภาษา {{language}} พร้อม CTA: {{ctaStyle}} และแฮชแท็ก {{hashtags}} พร้อมแทรกลิงก์ {{affiliateLink}}", isDefault: true, createdAt: now, updatedAt: now },
    { id: "default-instagram", name: "Instagram caption", content: "เขียนแคปชัน IG โปรโมต {{productTitle}} จุดเด่น: {{description}} ราคา {{price}} เรต {{rating}} สรุปรีวิว {{reviewSummary}} ปิดท้าย {{ctaStyle}} {{hashtags}}", isDefault: true, createdAt: now, updatedAt: now },
    { id: "default-threads", name: "Threads short post", content: "โพสต์สั้นสำหรับ Threads: {{productTitle}} ราคา {{price}} น่าสนใจเพราะ {{description}} ดูเพิ่มที่ {{affiliateLink}} {{hashtags}}", isDefault: true, createdAt: now, updatedAt: now },
    { id: "default-x", name: "X post", content: "สร้างโพสต์ X ไม่เกิน 280 ตัวอักษร โปรโมต {{productTitle}} ราคา {{price}} โทน {{tone}} พร้อม CTA {{ctaStyle}} และ {{hashtags}}", isDefault: true, createdAt: now, updatedAt: now },
    { id: "default-blog", name: "Blog article", content: "เขียนบทความโปรโมตสินค้า {{productTitle}} โดยมีรายละเอียด {{description}} ราคา {{price}} คะแนน {{rating}} รีวิว {{reviewSummary}} และลิงก์ {{affiliateLink}}", isDefault: true, createdAt: now, updatedAt: now },
    { id: "default-seo", name: "SEO article", content: "เขียนบทความ SEO ภาษา {{language}} โปรโมต {{productTitle}} แพลตฟอร์ม {{platform}} ราคา {{price}} จุดเด่น {{description}} แทรกคำชวน {{ctaStyle}} และ {{hashtags}}", isDefault: true, createdAt: now, updatedAt: now },
    { id: "default-comment", name: "Comment reply", content: "เขียนคอมเมนต์ตอบกลับลูกค้าเกี่ยวกับ {{productTitle}} แบบ {{tone}} อธิบายสั้น ๆ ว่า {{description}} ราคา {{price}} และแนบ {{affiliateLink}}", isDefault: true, createdAt: now, updatedAt: now },
  ].map((template) => templateSchema.parse(template));
};

let templateStore: PromptTemplate[] = defaultTemplates();

export class PromptTemplateService {
  static list(): PromptTemplate[] {
    return [...templateStore];
  }

  static getById(id: string): PromptTemplate | null {
    return templateStore.find((template) => template.id === id) ?? null;
  }

  static create(payload: TemplatePayload): PromptTemplate {
    const now = nowIso();
    const created = templateSchema.parse({
      id: randomUUID(),
      name: payload.name,
      content: payload.content,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });

    templateStore.unshift(created);
    return created;
  }

  static update(id: string, payload: Partial<TemplatePayload>): PromptTemplate | null {
    const target = this.getById(id);
    if (!target) return null;

    const updated = templateSchema.parse({
      ...target,
      ...payload,
      updatedAt: nowIso(),
    });

    templateStore = templateStore.map((template) => (template.id === id ? updated : template));
    return updated;
  }

  static delete(id: string): boolean {
    const before = templateStore.length;
    templateStore = templateStore.filter((template) => template.id !== id);
    return templateStore.length < before;
  }

  static duplicate(id: string): PromptTemplate | null {
    const target = this.getById(id);
    if (!target) return null;

    return this.create({ name: `${target.name} (Copy)`, content: target.content });
  }

  static restoreDefaults(): PromptTemplate[] {
    templateStore = defaultTemplates();
    return this.list();
  }

  static preview(content: string, sample: Record<string, string>) {
    return {
      rendered: TemplateRenderer.render(content, sample),
      variablesUsed: TemplateRenderer.variablesUsed(content),
      availableVariables: [...TEMPLATE_VARIABLES],
    };
  }
}
