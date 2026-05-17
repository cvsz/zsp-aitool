import { Tone } from "@prisma/client";

export function ToneSelector({ value, onChange }: { value: Tone; onChange: (v: Tone) => void }) {
  return (
    <select className="border rounded px-2 py-1" value={value} onChange={(e) => onChange(e.target.value as Tone)}>
      {Object.values(Tone).map((tone) => (
        <option key={tone} value={tone}>{tone}</option>
      ))}
    </select>
  );
}
