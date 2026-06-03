import type { HyperFrameTemplate } from "@/lib/hyperframes/templates/types";

type TemplateSelectorProps = {
  templates: readonly HyperFrameTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
};

export function TemplateSelector({ templates, selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div className="space-y-2 rounded border border-white/10 bg-cyber-surface2 p-3">
      <label className="text-sm font-medium text-slate-200" htmlFor="hf-template">วิดีโอเทมเพลต</label>
      <select
        id="hf-template"
        className="w-full rounded border p-2"
        value={selectedTemplateId}
        onChange={(event) => onSelectTemplate(event.target.value)}
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>{template.label}</option>
        ))}
      </select>
      <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">
        {templates.find((template) => template.id === selectedTemplateId)?.requiredDisclosureRules.map((rule) => (
          <li key={rule.code}>{rule.description}</li>
        ))}
      </ul>
    </div>
  );
}
