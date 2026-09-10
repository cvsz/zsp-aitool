/**
 * export_pipeline.ts
 *
 * Async Batch Render-to-Export Pipeline for ZSP-AITool.
 * Uploads finalized video assets to tenant-scoped S3/R2 storage with HMAC-signed delivery receipts.
 */

import { createHmac, randomUUID } from "node:crypto";

export interface ExportJobOptions {
  jobId?: string;
  tenantId: string;
  userId: string;
  projectId: string;
  videoFormat?: "mp4" | "webm";
  resolution?: "1080p" | "4k" | "720p";
  fps?: 30 | 60;
  signingSecret: string;
}

export interface ExportReceipt {
  receiptId: string;
  jobId: string;
  tenantId: string;
  s3Url: string;
  bytesTotal: number;
  signature: string;
  completedAt: string;
}

export class ExportPipeline {
  private signingSecret: string;

  constructor(signingSecret: string) {
    if (!signingSecret || signingSecret.length < 16) {
      throw new Error("signingSecret must be at least 16 characters");
    }
    this.signingSecret = signingSecret;
  }

  public createJob(options: ExportJobOptions) {
    if (!options.tenantId) throw new Error("tenantId is required");
    if (!options.projectId) throw new Error("projectId is required");

    return {
      id: options.jobId || `exp-${randomUUID()}`,
      tenantId: options.tenantId,
      userId: options.userId,
      projectId: options.projectId,
      format: options.videoFormat || "mp4",
      resolution: options.resolution || "1080p",
      status: "queued" as const,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
  }

  public generateDeliveryReceipt(
    jobId: string,
    tenantId: string,
    s3Key: string,
    bytesTotal: number
  ): ExportReceipt {
    const receiptId = `rcpt-${randomUUID().slice(0, 12)}`;
    const completedAt = new Date().toISOString();
    const s3Url = `https://storage.zeaz.dev/${tenantId}/${s3Key}`;

    const payload = `${receiptId}:${jobId}:${tenantId}:${s3Url}:${bytesTotal}:${completedAt}`;
    const signature = createHmac("sha256", this.signingSecret)
      .update(payload)
      .digest("hex");

    return {
      receiptId,
      jobId,
      tenantId,
      s3Url,
      bytesTotal,
      signature,
      completedAt,
    };
  }

  public verifyDeliveryReceipt(receipt: ExportReceipt): boolean {
    const payload = `${receipt.receiptId}:${receipt.jobId}:${receipt.tenantId}:${receipt.s3Url}:${receipt.bytesTotal}:${receipt.completedAt}`;
    const expected = createHmac("sha256", this.signingSecret)
      .update(payload)
      .digest("hex");

    return receipt.signature === expected;
  }
}
