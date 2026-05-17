import { Platform } from "@prisma/client";

export function PlatformSelector({ value, onChange, multiple = false }: { value: Platform[]; onChange: (v: Platform[]) => void; multiple?: boolean }) {
  const items = Object.values(Platform);
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((p) => (
        <label key={p} className="text-sm flex items-center gap-1">
          <input
            type={multiple ? "checkbox" : "radio"}
            checked={value.includes(p)}
            onChange={() => onChange(multiple ? (value.includes(p) ? value.filter((x) => x !== p) : [...value, p]) : [p])}
          />
          {p}
        </label>
      ))}
    </div>
  );
}
