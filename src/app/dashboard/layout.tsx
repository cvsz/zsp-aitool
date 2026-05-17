import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
