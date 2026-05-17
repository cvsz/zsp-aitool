import { z } from "zod";

export const TEMPLATE_VARIABLES = [
  "{{productTitle}}",
  "{{price}}",
  "{{description}}",
  "{{rating}}",
  "{{reviewSummary}}",
  "{{affiliateLink}}",
  "{{platform}}",
  "{{tone}}",
  "{{language}}",
  "{{ctaStyle}}",
  "{{hashtags}}",
] as const;

export const templateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  content: z.string().min(10),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const templatePayloadSchema = templateSchema.pick({
  name: true,
  content: true,
});

export const templateUpdatePayloadSchema = templatePayloadSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required",
);

export const templatePreviewSchema = z.object({
  content: z.string().min(1),
  sample: z.object({
    productTitle: z.string().default("สินค้าเดโม"),
    price: z.string().default("199 บาท"),
    description: z.string().default("รายละเอียดสินค้าเดโม"),
    rating: z.string().default("4.8/5"),
    reviewSummary: z.string().default("รีวิวส่วนใหญ่บอกว่าคุ้มค่า"),
    affiliateLink: z.string().default("https://example.com/affiliate"),
    platform: z.string().default("Facebook"),
    tone: z.string().default("เป็นกันเอง"),
    language: z.string().default("th"),
    ctaStyle: z.string().default("ชวนซื้อแบบสุภาพ"),
    hashtags: z.string().default("#โปรดี #ของมันต้องมี"),
  }),
});

export type PromptTemplate = z.infer<typeof templateSchema>;
export type TemplatePayload = z.infer<typeof templatePayloadSchema>;
export type TemplatePreviewPayload = z.infer<typeof templatePreviewSchema>;
