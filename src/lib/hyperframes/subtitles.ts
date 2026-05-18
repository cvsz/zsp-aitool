import { z } from "zod";

import { sanitizePlainText } from "@/lib/hyperframes/sanitize";

export const subtitleStyleOptions = ["default", "emphasis", "muted"] as const;

export const hyperFrameSubtitleSchema = z.object({
  text: z.string().min(1).max(500),
  start: z.number().min(0),
  end: z.number().min(0),
  style: z.enum(subtitleStyleOptions).default("default"),
  language: z.string().trim().min(2).max(12).default("th"),
}).superRefine((value, ctx) => {
  if (value.end <= value.start) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end"], message: "end_must_be_greater_than_start" });
  }
});

export type HyperFrameSubtitle = z.infer<typeof hyperFrameSubtitleSchema>;

export function validateSubtitles(subtitles: HyperFrameSubtitle[], durationSeconds?: number): HyperFrameSubtitle[] {
  const parsed = subtitles.map((item) => hyperFrameSubtitleSchema.parse(item));
  const sorted = [...parsed].sort((a, b) => a.start - b.start);

  for (let i = 0; i < sorted.length; i += 1) {
    const cur = sorted[i];
    const prev = sorted[i - 1];
    if (prev && cur.start < prev.end) {
      throw new Error("subtitle_overlap_not_allowed");
    }
    if (durationSeconds != null && cur.end > durationSeconds) {
      throw new Error("subtitle_out_of_duration");
    }
  }

  return sorted.map((item) => ({ ...item, text: sanitizePlainText(item.text, 500) }));
}

function toSrtTime(value: number): string {
  const total = Math.max(0, value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor((total - Math.floor(total)) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function toVttTime(value: number): string {
  return toSrtTime(value).replace(",", ".");
}

export function exportSubtitlesToSrt(subtitles: HyperFrameSubtitle[]): string {
  return validateSubtitles(subtitles)
    .map((line, index) => `${index + 1}\n${toSrtTime(line.start)} --> ${toSrtTime(line.end)}\n${line.text}`)
    .join("\n\n");
}

export function exportSubtitlesToVtt(subtitles: HyperFrameSubtitle[]): string {
  const cues = validateSubtitles(subtitles)
    .map((line) => `${toVttTime(line.start)} --> ${toVttTime(line.end)}\n${line.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${cues}`;
}
