import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  AI_DAILY_BUDGET_USD: z.coerce.number().positive().default(20),
  AI_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(30),
  OCR_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(20),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || undefined,
  AI_DAILY_BUDGET_USD: process.env.AI_DAILY_BUDGET_USD,
  AI_MAX_REQUESTS_PER_MINUTE: process.env.AI_MAX_REQUESTS_PER_MINUTE,
  OCR_MAX_REQUESTS_PER_MINUTE: process.env.OCR_MAX_REQUESTS_PER_MINUTE,
});

export type Env = z.infer<typeof envSchema>;
