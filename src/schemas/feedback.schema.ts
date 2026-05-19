import { z } from "zod";

export const feedbackSubmissionSchema = z.object({
  rating: z.number().int().min(1).max(5),
  category: z.enum(["onboarding", "activation", "content", "render", "other"]),
  message: z.string().trim().min(10).max(500),
});

export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;
