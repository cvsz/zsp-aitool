import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { ProductService } from "@/services/product-service";

export async function GET() {
  try {
    const products = await ProductService.listProducts();
    return NextResponse.json(success(products));
  } catch {
    return NextResponse.json(failure("INTERNAL_ERROR", "Failed to load products"), { status: 500 });
  }
}
