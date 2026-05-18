import { RenderJobStatus } from "@prisma/client";

export const RETRYABLE_RENDER_STATUSES: RenderJobStatus[] = [RenderJobStatus.FAILED, RenderJobStatus.CANCELLED];

export function isRetryableStatus(status: RenderJobStatus) {
  return RETRYABLE_RENDER_STATUSES.includes(status);
}
