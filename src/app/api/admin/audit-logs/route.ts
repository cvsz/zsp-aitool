import { NextResponse } from "next/server";
import { z } from "zod";

import { failure, success } from "@/lib/api-response";
import { isAdminPanelEnabled } from "@/lib/admin/access";
import { withAuth } from "@/middleware/auth-middleware";
import { AdminAuditLogService } from "@/services/AdminAuditLogService";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().trim().optional(),
  targetType: z.string().trim().optional(),
  actorUserId: z.string().trim().optional(),
  status: z.string().trim().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const GET = withAuth(async (request) => {
  if (!isAdminPanelEnabled()) return NextResponse.json(failure("ADMIN_DISABLED", "Admin panel is disabled"), { status: 403 });
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return NextResponse.json(failure("VALIDATION_ERROR", "Invalid query"), { status: 422 });

  const q = parsed.data;
  const data = await AdminAuditLogService.listForAdmin({
    ...q,
    dateFrom: q.dateFrom ? new Date(q.dateFrom) : undefined,
    dateTo: q.dateTo ? new Date(q.dateTo) : undefined,
  });
  return NextResponse.json(success(data));
});
