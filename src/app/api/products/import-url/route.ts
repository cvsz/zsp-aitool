import { NextResponse } from "next/server";
import { importUrlSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function POST(request: Request) {
  const input = importUrlSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: await productService.importByUrl(process.env.DEFAULT_USER_ID ?? "demo-user", input.originalUrl), compliance: "No private endpoint scraping. User must confirm details manually." });
}
