'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { ExportPipeline } = require('../src/services/export_pipeline.js');

test('ExportPipeline creates an export job with defaults', () => {
  const secret = 'super-secret-signing-key-123456';
  const pipeline = new ExportPipeline(secret);
  const job = pipeline.createJob({
    tenantId: 'tenant-1',
    userId: 'user-1',
    projectId: 'proj-100',
    signingSecret: secret,
  });

  assert.ok(job.id.startsWith('exp-'));
  assert.equal(job.tenantId, 'tenant-1');
  assert.equal(job.status, 'queued');
  assert.equal(job.format, 'mp4');
});

test('ExportPipeline generates and verifies HMAC delivery receipts', () => {
  const secret = 'super-secret-signing-key-123456';
  const pipeline = new ExportPipeline(secret);
  const receipt = pipeline.generateDeliveryReceipt(
    'exp-123',
    'tenant-1',
    'videos/final_render.mp4',
    1024000
  );

  assert.ok(receipt.receiptId.startsWith('rcpt-'));
  assert.ok(receipt.s3Url.includes('https://storage.zeaz.dev/tenant-1/videos/final_render.mp4'));
  assert.equal(receipt.signature.length, 64);

  const isValid = pipeline.verifyDeliveryReceipt(receipt);
  assert.equal(isValid, true);

  const tampered = { ...receipt, bytesTotal: 999 };
  assert.equal(pipeline.verifyDeliveryReceipt(tampered), false);
});
