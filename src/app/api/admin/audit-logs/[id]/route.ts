import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { isAdminPanelEnabled } from "@/lib/admin/access";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async (_request, context: { params: Promise<{ id: string }> }) => {
  if (!isAdminPanelEnabled()) return NextResponse.json(failure("ADMIN_DISABLED", "Admin panel is disabled"), { status: 403 });
  const { id } = await context.params;
  const row = await prisma.adminAuditLog.findFirst({ where: { id, deletedAt: null } });
  if (!row) return NextResponse.json(failure("NOT_FOUND", "Audit log not found"), { status: 404 });
  return NextResponse.json(success(row));
});
