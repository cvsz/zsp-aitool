import { ZodError, z } from "zod";
import { NextResponse } from "next/server";
import { createProductSchema } from "@/schemas/product.schema";
import { productService } from "@/services/ProductService";
import { AppError } from "@/lib/errors";
import { withAuth } from "@/middleware/auth-middleware";
import { AdminAuditLogService } from "@/services/AdminAuditLogService";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  shopName: z.string().trim().optional(),
  source: z.string().trim().optional(),
  hasAffiliateUrl: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["createdAt", "title", "price"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const GET = withAuth(async (request) => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 });
  }
  const query = parsed.data;
  const data = await productService.listProductsPaginated(request.auth.userId, {
    ...query,
    hasAffiliateUrl: query.hasAffiliateUrl == null ? undefined : query.hasAffiliateUrl === "true",
  });
  return NextResponse.json({ ok: true, data });
});

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const input = createProductSchema.parse(body);
    const created = await productService.create(request.auth.userId, input);
    await AdminAuditLogService.writeBestEffort({ actorUserId: request.auth.userId, action: "PRODUCT_CREATE", targetType: "PRODUCT", targetId: created.id, ip: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent"), metadata: { title: input.title, source: "manual" } });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ ok: false, error: error.flatten() }, { status: 422 });
    if (error instanceof AppError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } }, { status: 500 });
  }
});
