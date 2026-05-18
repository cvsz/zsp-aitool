import { OrgRole, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type HyperFramesScope = { userId: string; orgId?: string | null; role?: OrgRole | null };

export async function resolveScope(userId: string, orgId?: string | null): Promise<HyperFramesScope | null> {
  if (!orgId) return { userId, orgId: null, role: null };
  const membership = await prisma.orgMembership.findUnique({ where: { orgId_userId: { orgId, userId } }, select: { role: true } });
  if (!membership) return null;
  return { userId, orgId, role: membership.role };
}

export function historyWhere(scope: HyperFramesScope): Prisma.HyperFrameRenderJobWhereInput {
  if (scope.orgId) return { orgId: scope.orgId, deletedAt: null };
  return { userId: scope.userId, orgId: null, deletedAt: null };
}

export function canManage(scope: HyperFramesScope): boolean {
  return !scope.orgId || scope.role === OrgRole.ADMIN || scope.role === OrgRole.EDITOR;
}
