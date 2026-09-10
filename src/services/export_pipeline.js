/**
 * export_pipeline.js
 *
 * Async Batch Render-to-Export Pipeline for ZSP-AITool.
 * Uploads finalized video assets to tenant-scoped S3/R2 storage with HMAC-signed delivery receipts.
 */

'use strict';

const { createHmac, randomUUID } = require('node:crypto');

class ExportPipeline {
  constructor(signingSecret) {
    if (!signingSecret || signingSecret.length < 16) {
      throw new Error('signingSecret must be at least 16 characters');
    }
    this.signingSecret = signingSecret;
  }

  createJob(options = {}) {
    if (!options.tenantId) throw new Error('tenantId is required');
    if (!options.projectId) throw new Error('projectId is required');

    return {
      id: options.jobId || `exp-${randomUUID()}`,
      tenantId: options.tenantId,
      userId: options.userId,
      projectId: options.projectId,
      format: options.videoFormat || 'mp4',
      resolution: options.resolution || '1080p',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
  }

  generateDeliveryReceipt(jobId, tenantId, s3Key, bytesTotal) {
    const receiptId = `rcpt-${randomUUID().slice(0, 12)}`;
    const completedAt = new Date().toISOString();
    const s3Url = `https://storage.zeaz.dev/${tenantId}/${s3Key}`;

    const payload = `${receiptId}:${jobId}:${tenantId}:${s3Url}:${bytesTotal}:${completedAt}`;
    const signature = createHmac('sha256', this.signingSecret)
      .update(payload)
      .digest('hex');

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

  verifyDeliveryReceipt(receipt) {
    const payload = `${receipt.receiptId}:${receipt.jobId}:${receipt.tenantId}:${receipt.s3Url}:${receipt.bytesTotal}:${receipt.completedAt}`;
    const expected = createHmac('sha256', this.signingSecret)
      .update(payload)
      .digest('hex');

    return receipt.signature === expected;
  }
}

module.exports = {
  ExportPipeline,
};
