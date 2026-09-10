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
  default: "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm",
  muted: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  info: "bg-sky-500 text-slate-950 dark:bg-sky-400 dark:text-slate-950 shadow-sm",
  success: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm",
  warning: "bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 shadow-sm",
  danger: "bg-rose-600 text-white dark:bg-rose-500 dark:text-slate-950 shadow-sm",
  dark: "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm",
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
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              selectedKey === tab.key
                ? `${toneClasses[tone]} border-transparent`
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selectedKey === tab.key ? "bg-black/20 text-current" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    );
  }

  const actualItems = items ?? [];
  const active = actualItems.find((item) => item.key === internalActiveKey) ?? actualItems[0];

  if (!active) return null;

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
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              active.key === item.key
                ? toneClasses[tone]
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={`tab-panel-${active.key}`} role="tabpanel" className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        {active.content}
      </div>
    </div>
  );
}
