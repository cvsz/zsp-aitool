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
  ].map((template) => templateSchema.parse(template));
};

let templateStoreByUser = new Map<string, PromptTemplate[]>();
const getStore = (userId: string) => {
  const existing = templateStoreByUser.get(userId);
  if (existing) return existing;
  const defaults = defaultTemplates();
  templateStoreByUser.set(userId, defaults);
  return defaults;
};

export class PromptTemplateService {
  static list(userId: string): PromptTemplate[] { return [...getStore(userId)]; }
  static getById(userId: string, id: string): PromptTemplate | null { return getStore(userId).find((t) => t.id === id) ?? null; }
  static create(userId: string, payload: TemplatePayload): PromptTemplate {
    const now = nowIso();
    const created = templateSchema.parse({ id: randomUUID(), name: payload.name, content: payload.content, isDefault: false, createdAt: now, updatedAt: now });
    templateStoreByUser.set(userId, [created, ...getStore(userId)]);
    return created;
  }
  static update(userId: string, id: string, payload: Partial<TemplatePayload>): PromptTemplate | null {
    const target = this.getById(userId, id); if (!target) return null;
    const updated = templateSchema.parse({ ...target, ...payload, updatedAt: nowIso() });
    templateStoreByUser.set(userId, getStore(userId).map((t) => t.id === id ? updated : t));
    return updated;
  }
  static delete(userId: string, id: string): boolean {
    const before = getStore(userId).length;
    templateStoreByUser.set(userId, getStore(userId).filter((t) => t.id !== id));
    return getStore(userId).length < before;
  }
  static duplicate(userId: string, id: string): PromptTemplate | null {
    const target = this.getById(userId, id); if (!target) return null;
    return this.create(userId, { name: `${target.name} (Copy)`, content: target.content });
  }
  static restoreDefaults(userId: string): PromptTemplate[] { const d=defaultTemplates(); templateStoreByUser.set(userId,d); return [...d]; }
  static preview(content: string, sample: Record<string, string>) { return { rendered: TemplateRenderer.render(content, sample), variablesUsed: TemplateRenderer.variablesUsed(content), availableVariables: [...TEMPLATE_VARIABLES] }; }
}
