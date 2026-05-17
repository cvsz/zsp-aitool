"use client";

import { useState } from "react";

type Props = {
  initialName?: string;
  initialContent?: string;
  onSave: (payload: { name: string; content: string }) => Promise<void>;
};

export function PromptTemplateEditor({ initialName = "", initialContent = "", onSave }: Props) {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        await onSave({ name, content });
        setSaving(false);
      }}
    >
      <input className="w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อเทมเพลต" required />
      <textarea className="h-48 w-full rounded border p-2" value={content} onChange={(e) => setContent(e.target.value)} placeholder="เนื้อหาเทมเพลต" required />
      <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-60" disabled={saving} type="submit">
        {saving ? "กำลังบันทึก..." : "บันทึกเทมเพลต"}
      </button>
    </form>
  );
}
