import { redirect } from "next/navigation";

import { getAuthenticatedUserIdForServer } from "@/lib/auth";

type AdminAccessResult = {
  allowed: boolean;
  reason: string;
  userId: string;
};

export function isAdminPanelEnabled(): boolean {
  return process.env.ADMIN_PANEL_ENABLED === "true";
}

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const userId = await getAuthenticatedUserIdForServer();

  if (!isAdminPanelEnabled()) {
    return {
      allowed: false,
      reason: "ระบบผู้ดูแลระบบยังไม่เปิดใช้งานในสภาพแวดล้อมนี้",
      userId,
    };
  }

  return {
    allowed: true,
    reason: "อนุญาตให้เข้าถึงแผงผู้ดูแลระบบ",
    userId,
  };
}

export async function denyAdminAccessWithRedirect(): Promise<never> {
  await getAuthenticatedUserIdForServer();
  redirect("/dashboard");
}
