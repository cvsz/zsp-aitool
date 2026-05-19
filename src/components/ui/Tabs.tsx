"use client";

import { useMemo, useState, type ReactNode } from "react";

export type TabOption = {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

type TabItem = {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items?: TabItem[];
  defaultKey?: string;
  className?: string;
  tone?: "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";
  tabs?: TabOption[];
  activeKey?: string;
  onChange?: (key: string) => void;
  ariaLabel?: string;
};

const toneClasses = {
  default: "bg-slate-100 text-slate-700",
  muted: "bg-slate-50 text-slate-600",
  info: "bg-sky-50 text-sky-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  dark: "bg-slate-900 text-slate-100",
};

export function Tabs({ items, defaultKey, className = "", tone = "default", tabs, activeKey, onChange, ariaLabel = "แท็บข้อมูล" }: TabsProps) {
  const safeDefault = useMemo(() => {
    if (items && items.length > 0) {
      return defaultKey && items.some((item) => item.key === defaultKey) ? defaultKey : items[0].key;
    }
    return tabs && tabs.length > 0 ? tabs[0].key : undefined;
  }, [defaultKey, items, tabs]);
  const [internalActiveKey, setInternalActiveKey] = useState<string | undefined>(safeDefault);

  if (tabs && tabs.length > 0) {
    const selectedKey = activeKey ?? internalActiveKey ?? tabs[0].key;
    return (
      <div className={`flex flex-wrap gap-2 ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === tab.key}
            disabled={tab.disabled}
            onClick={() => {
              if (!activeKey) {
                setInternalActiveKey(tab.key);
              }
              onChange?.(tab.key);
            }}
            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${selectedKey === tab.key ? `${toneClasses[tone]} border-transparent` : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{tab.count}</span> : null}
          </button>
        ))}
      </div>
    );
  }

  const actualItems = items ?? [];
  const active = actualItems.find((item) => item.key === internalActiveKey) ?? actualItems[0];

  if (!active) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={ariaLabel}>
        {actualItems.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active.key === item.key}
            aria-controls={`tab-panel-${item.key}`}
            disabled={item.disabled}
            onClick={() => setInternalActiveKey(item.key)}
            className={`rounded-2xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${active.key === item.key ? toneClasses[tone] : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={`tab-panel-${active.key}`} role="tabpanel" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        {active.content}
      </div>
    </div>
  );
}
