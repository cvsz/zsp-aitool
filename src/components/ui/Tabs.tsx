import type { ReactNode } from "react";

export type TabOption = {
  key: string;
  label: string;
  count?: number;
};

type TabsProps = {
  ariaLabel: string;
  tabs: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  trailing?: ReactNode;
};

export function Tabs({ ariaLabel, tabs, activeKey, onChange, trailing }: TabsProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div role="tablist" aria-label={ariaLabel} className="inline-flex w-full gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={active}
              className={[
                "inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
                active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
              onClick={() => onChange(tab.key)}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tab.count}</span> : null}
            </button>
          );
        })}
      </div>
      {trailing ? <div className="flex items-center">{trailing}</div> : null}
    </div>
  );
}
