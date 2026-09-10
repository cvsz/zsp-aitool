import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
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
