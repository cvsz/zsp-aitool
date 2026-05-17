export interface MarkdownContentRecord {
  id: string;
  platform: string;
  output: string;
  prompt?: string | null;
  status?: string | null;
  createdAt?: string | Date | null;
}

export function contentHistoryToMarkdown(items: MarkdownContentRecord[]): string {
  if (items.length === 0) {
    return "# Content Export\n\n_No content history found for this filter._\n";
  }

  const blocks = items.map((item) => {
    const createdAt = item.createdAt ? new Date(item.createdAt).toISOString() : "-";
    return [
      `## Content ${item.id}`,
      "",
      `- Platform: ${item.platform}`,
      `- Status: ${item.status ?? "-"}`,
      `- Created At: ${createdAt}`,
      "",
      "### Prompt",
      "",
      item.prompt?.trim() ? item.prompt : "-",
      "",
      "### Output",
      "",
      item.output?.trim() ? item.output : "-",
      "",
    ].join("\n");
  });

  return ["# Content Export", "", ...blocks].join("\n");
}
