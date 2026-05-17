import { TEMPLATE_VARIABLES } from "@/schemas/template.schema";

export type TemplateRenderInput = Record<string, string>;

const variableRegex = /\{\{\s*([a-zA-Z0-9]+)\s*\}\}/g;

export class TemplateRenderer {
  static render(template: string, input: TemplateRenderInput): string {
    return template.replace(variableRegex, (_, rawName: string) => {
      const key = rawName.trim();
      return input[key] ?? `{{${key}}}`;
    });
  }

  static variablesUsed(template: string): string[] {
    const found = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = variableRegex.exec(template)) !== null) {
      found.add(`{{${match[1].trim()}}}`);
    }

    return TEMPLATE_VARIABLES.filter((variable) => found.has(variable));
  }
}
