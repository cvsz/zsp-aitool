import { NextResponse } from "next/server";

import { failure, success } from "@/lib/api-response";
import { withAuth } from "@/middleware/auth-middleware";
import { feedbackSubmissionSchema } from "@/schemas/feedback.schema";
import { feedbackService } from "@/services/FeedbackService";

export const POST = withAuth(async (request) => {
  const parsed = feedbackSubmissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid feedback payload"), { status: 400 });
  }

  const result = await feedbackService.submit(request.auth.userId, parsed.data);
  return NextResponse.json(success({ id: result.id, createdAt: result.createdAt.toISOString() }));
});
