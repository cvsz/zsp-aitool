import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0,_transparent_32rem),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <div className="min-w-0 flex-1 pb-20 md:pb-0">
          <Header />
          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
