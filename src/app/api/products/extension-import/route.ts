import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { extensionImportSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { AppError } from "@/lib/errors";
import { withAuth } from "@/middleware/auth-middleware";

export const POST = withAuth(async (request) => {
  try {
    const input = extensionImportSchema.parse(await request.json());
    const product = await productService.importFromExtension(request.auth.userId, {
      ...input.payload,
      price: input.payload.price ?? 0,
      currency: input.payload.currency ?? "THB",
      images: input.payload.images ?? [],
    });

    return NextResponse.json(
      {
        ok: true,
        data: product,
        importState: {
          title: "นำเข้าข้อมูลจากส่วนขยายสำเร็จ",
          message: "ตรวจสอบและแก้ไขรายละเอียดสินค้าอีกครั้งก่อนใช้งานคอนเทนต์หรือเผยแพร่",
        },
        compliance: "Payload must come from data visible to user and submitted by user.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_EXTENSION_PAYLOAD",
            message: "ข้อมูลจากส่วนขยายไม่ถูกต้อง กรุณาตรวจสอบชื่อสินค้า ราคา และ URL ที่มองเห็นได้",
            details: error.flatten(),
          },
        },
        { status: 422 },
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    }

    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } }, { status: 500 });
  }
});
