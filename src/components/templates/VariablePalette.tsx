"use client";

import { TEMPLATE_VARIABLES } from "@/schemas/template.schema";

type Props = {
  onInsert: (variable: string) => void;
};

export function VariablePalette({ onInsert }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">ตัวแปร</p>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATE_VARIABLES.map((v) => {
          const label = v.replace(/[{}]/g, "");
          return (
            <button
              key={v}
              type="button"
              title="คลิกเพื่อแทรก"
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100 active:scale-95"
              onClick={() => onInsert(v)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] leading-relaxed text-slate-400">
        คลิกตัวแปรเพื่อแทรกในตำแหน่งเคอร์เซอร์ หรือพิมพ์ <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">{`{{variableName}}`}</code> ด้วยตนเอง
      </p>
    </div>
  );
}
