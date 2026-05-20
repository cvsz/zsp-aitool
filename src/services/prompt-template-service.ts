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
    {
      id: "default-facebook",
      name: "Facebook promotional post",
      content: "เขียนโพสต์ขาย {{productTitle}} ราคา {{price}} สำหรับ {{platform}} โทน {{tone}} ภาษา {{language}} พร้อม CTA: {{ctaStyle}} และแฮชแท็ก {{hashtags}} พร้อมแทรกลิงก์ {{affiliateLink}}",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
  ].map((template) => templateSchema.parse(template));
};

const globalStore = globalThis as unknown as { templateStoreByUser?: Map<string, PromptTemplate[]> };
const templateStoreByUser = globalStore.templateStoreByUser ?? new Map<string, PromptTemplate[]>();

if (process.env.NODE_ENV !== "production") {
  globalStore.templateStoreByUser = templateStoreByUser;
}

const getStore = (userId: string) => {
  const existing = templateStoreByUser.get(userId);
  if (existing) return existing;
  const defaults = defaultTemplates();
  templateStoreByUser.set(userId, defaults);
  return defaults;
};

function nextCopyName(name: string): string {
  const copyMatch = name.match(/^(.*) \(Copy(?: (\d+))?\)$/);
  if (!copyMatch) return `${name} (Copy)`;

  const baseName = copyMatch[1];
  const copyNumber = copyMatch[2] ? Number.parseInt(copyMatch[2], 10) + 1 : 2;
  return `${baseName} (Copy ${copyNumber})`;
}

export class PromptTemplateService {
  static list(userId: string): PromptTemplate[] {
    return [...getStore(userId)];
  }

  static getById(userId: string, id: string): PromptTemplate | null {
    return getStore(userId).find((template) => template.id === id) ?? null;
  }

  static create(userId: string, payload: TemplatePayload): PromptTemplate {
    const now = nowIso();
    const created = templateSchema.parse({
      ...payload,
      id: randomUUID(),
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });
    templateStoreByUser.set(userId, [created, ...getStore(userId)]);
    return created;
  }

  static update(userId: string, id: string, payload: Partial<TemplatePayload>): PromptTemplate | null {
    const target = this.getById(userId, id);
    if (!target) return null;

    const {
      id: _id,
      isDefault: _isDefault,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...safePayload
    } = payload as Partial<TemplatePayload> & Partial<PromptTemplate>;

    const updated = templateSchema.parse({ ...target, ...safePayload, updatedAt: nowIso() });
    templateStoreByUser.set(userId, getStore(userId).map((template) => (template.id === id ? updated : template)));
    return updated;
  }

  static delete(userId: string, id: string): boolean {
    const before = getStore(userId).length;
    templateStoreByUser.set(userId, getStore(userId).filter((template) => template.id !== id));
    return getStore(userId).length < before;
  }

  static duplicate(userId: string, id: string): PromptTemplate | null {
    const target = this.getById(userId, id);
    if (!target) return null;

    const {
      id: _id,
      isDefault: _isDefault,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...restPayload
    } = target;

    return this.create(userId, { ...restPayload, name: nextCopyName(target.name) });
  }

  static restoreDefaults(userId: string): PromptTemplate[] {
    const customTemplates = getStore(userId).filter((template) => !template.isDefault);
    const merged = [...defaultTemplates(), ...customTemplates];
    templateStoreByUser.set(userId, merged);
    return [...merged];
  }

  static preview(content: string, sample: Record<string, string>) {
    return {
      rendered: TemplateRenderer.render(content, sample),
      variablesUsed: TemplateRenderer.variablesUsed(content),
      availableVariables: [...TEMPLATE_VARIABLES],
    };
  }
}
