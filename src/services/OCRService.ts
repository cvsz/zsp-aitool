import { JobStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ExtractOCRInput } from "@/schemas/ocr.schema";
import type { OCRProvider, OCRResult } from "@/services/ocr/OCRProvider";
import { MockOCRProvider } from "@/services/ocr/MockOCRProvider";

export class OCRService {
  constructor(private readonly provider: OCRProvider = new MockOCRProvider()) {}

  async extractAndSave(input: ExtractOCRInput) {
    const defaultEmail = process.env.DEFAULT_USER_EMAIL ?? "demo@zsp.local";
    const user = await prisma.user.upsert({ where: { email: defaultEmail }, update: {}, create: { email: defaultEmail, name: "Demo User" } });
    const pending = await prisma.oCRJob.create({
      data: {
        imageUrl: `data:${input.mimeType};base64,${input.imageBase64.slice(0, 64)}...`,
        status: JobStatus.PROCESSING,
        userId: user.id,
      },
    });

    try {
      const result = await this.provider.extract({ imageBase64: input.imageBase64, mimeType: input.mimeType });

      const saved = await prisma.oCRJob.update({
        where: { id: pending.id },
        data: {
          status: JobStatus.COMPLETED,
          extractedText: JSON.stringify(result),
          confidence: result.confidence,
        },
      });

      return { job: saved, result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "OCR processing failed";

      await prisma.oCRJob.update({
        where: { id: pending.id },
        data: {
          status: JobStatus.FAILED,
          errorMessage: message,
        },
      });

      throw new Error(message);
    }
  }

  async getJob(id: string): Promise<{ id: string; status: string; result?: OCRResult; errorMessage?: string | null }> {
    const job = await prisma.oCRJob.findUnique({ where: { id } });
    if (!job) {
      throw new Error("OCR job not found");
    }

    let result: OCRResult | undefined;
    if (job.extractedText) {
      result = JSON.parse(job.extractedText) as OCRResult;
    }

    return { id: job.id, status: job.status, result, errorMessage: job.errorMessage };
  }
}
