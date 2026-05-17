import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50"><div className="flex"><Sidebar /><div className="flex-1 pb-16 md:pb-0"><Header /><main className="p-4 md:p-6">{children}</main></div></div><MobileNav /></div>;
}
