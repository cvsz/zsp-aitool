import { z } from "zod";

const ALLOWED_AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg"] as const;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const cachedAudioUrlSchema = z
  .string()
  .refine((value) => value.startsWith("/api/hyperframes/audio/"), {
    message: "invalid_cached_audio_url",
  })
  .refine((value) => !value.includes(".."), { message: "invalid_cached_audio_url" });

export const hyperframesVoiceoverSchema = z.object({
  source: z.enum(["upload", "cached"]),
  mimeType: z.enum(ALLOWED_AUDIO_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_AUDIO_BYTES),
  durationSeconds: z.number().positive().max(60),
  url: cachedAudioUrlSchema.optional(),
  transcript: z.string().max(1200).optional(),
});

export type HyperframesVoiceoverMetadata = z.infer<typeof hyperframesVoiceoverSchema>;

export function isTtsEnabled(): boolean {
  return process.env.HYPERFRAMES_TTS_ENABLED === "true";
}

export function alignVoiceoverDuration(durationSeconds: number, voiceover?: HyperframesVoiceoverMetadata | null): number {
  if (!voiceover) return durationSeconds;
  return Math.min(durationSeconds, Math.max(3, Math.round(voiceover.durationSeconds)));
}

export function getAllowedAudioMimeTypes(): readonly string[] {
  return ALLOWED_AUDIO_MIME_TYPES;
}

