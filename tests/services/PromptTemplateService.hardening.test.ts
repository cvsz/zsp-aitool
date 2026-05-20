import { describe, expect, it } from "vitest";
import { PromptTemplateService } from "@/services/prompt-template-service";

describe("PromptTemplateService hardening", () => {
  it("restoreDefaults preserves custom templates", () => {
    const userId = `template-restore-${crypto.randomUUID()}`;
    const custom = PromptTemplateService.create(userId, {
      name: "Custom template",
      content: "สร้างคอนเทนต์สำหรับ {{productTitle}} พร้อมลิงก์ {{affiliateLink}}",
    });

    const restored = PromptTemplateService.restoreDefaults(userId);

    expect(restored.some((template) => template.id === custom.id)).toBe(true);
    expect(restored.some((template) => template.isDefault)).toBe(true);
  });

  it("duplicate increments copy names safely", () => {
    const userId = `template-duplicate-${crypto.randomUUID()}`;
    const first = PromptTemplateService.create(userId, {
      name: "Launch Post",
      content: "เขียนโพสต์เปิดตัว {{productTitle}} พร้อม CTA {{ctaStyle}}",
    });

    const copy = PromptTemplateService.duplicate(userId, first.id);
    expect(copy?.name).toBe("Launch Post (Copy)");

    const secondCopy = PromptTemplateService.duplicate(userId, copy!.id);
    expect(secondCopy?.name).toBe("Launch Post (Copy 2)");
  });

  it("update ignores immutable fields from unsafe payload", () => {
    const userId = `template-update-${crypto.randomUUID()}`;
    const created = PromptTemplateService.create(userId, {
      name: "Safe Update",
      content: "เขียนโพสต์สินค้า {{productTitle}} ราคา {{price}}",
    });

    const updated = PromptTemplateService.update(userId, created.id, {
      id: "malicious-id",
      isDefault: true,
      createdAt: "2000-01-01T00:00:00.000Z",
      name: "Updated Name",
    } as never);

    expect(updated?.id).toBe(created.id);
    expect(updated?.isDefault).toBe(false);
    expect(updated?.createdAt).toBe(created.createdAt);
    expect(updated?.name).toBe("Updated Name");
  });
});
