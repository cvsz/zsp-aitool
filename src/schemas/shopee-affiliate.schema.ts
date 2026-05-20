import { z } from "zod";
import { isAllowedShopeeUrl } from "@/lib/shopee-url";

const shopeeUrlSchema = z.string().trim().url().refine((value) => isAllowedShopeeUrl(value), "ต้องเป็น Shopee URL ที่อนุญาตเท่านั้น");

export const manualAffiliateImportSchema = z.object({
  affiliateUrl: shopeeUrlSchema,
  productUrl: shopeeUrlSchema,
  saveMode: z.enum(["product", "affiliate-link"]),
  productId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  price: z.number().finite().min(0).optional(),
});

export const csvImportPreviewSchema = z.object({
  csv: z.string().min(1).max(2_000_000),
});
