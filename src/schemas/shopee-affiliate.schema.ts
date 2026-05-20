import { z } from "zod";
import { isAllowedShopeeAffiliateUrl } from "@/lib/shopee-affiliate-url-safety";

const shopeeUrlSchema = z.string().trim().url().refine((value) => isAllowedShopeeAffiliateUrl(value), "ต้องเป็น Shopee URL แบบ HTTPS ที่อนุญาตเท่านั้น");

export const manualAffiliateImportSchema = z.object({
  affiliateUrl: shopeeUrlSchema,
  productUrl: shopeeUrlSchema,
  saveMode: z.enum(["product", "affiliate-link"]),
  productId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  price: z.number().finite().min(0).optional(),
  campaignNote: z.string().trim().max(120).optional(),
});

export const csvImportPreviewSchema = z.object({
  csv: z.string().min(1).max(2_000_000),
  importProducts: z.boolean().optional().default(false),
});
