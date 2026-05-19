import type { FeedbackSubmissionInput } from "@/schemas/feedback.schema";
import { prisma } from "@/lib/prisma";

export class FeedbackService {
  async submit(userId: string, input: FeedbackSubmissionInput) {
    return prisma.feedbackSubmission.create({
      data: { userId, rating: input.rating, category: input.category, message: input.message },
      select: { id: true, createdAt: true },
    });
  }
}

export const feedbackService = new FeedbackService();
