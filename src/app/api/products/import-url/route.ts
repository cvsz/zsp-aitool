import { NextResponse } from "next/server";
import { importUrlSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";

export async function POST(request: Request) {
  const input = importUrlSchema.parse(await request.json());
  return NextResponse.json({ ok: true, data: productService.importByUrl(input.originalUrl), compliance: "No private endpoint scraping. User must confirm details manually." });
}
