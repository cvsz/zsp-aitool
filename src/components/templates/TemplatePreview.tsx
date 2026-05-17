"use client";

type Props = {
  rendered: string;
  variablesUsed: string[];
};

export function TemplatePreview({ rendered, variablesUsed }: Props) {
  return (
    <section className="space-y-2 rounded-lg border p-4">
      <h3 className="font-semibold">Preview</h3>
      <p className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm">{rendered}</p>
      <p className="text-xs text-gray-500">Variables used: {variablesUsed.length ? variablesUsed.join(", ") : "-"}</p>
    </section>
  );
}
