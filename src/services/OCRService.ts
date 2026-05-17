export interface OCRProvider { extractText:(imageUrl:string)=>Promise<{text:string;confidence?:number}>; }
export class OCRService { constructor(private readonly provider: OCRProvider) {} async extract(imageUrl:string){ if(!imageUrl) throw new Error('imageUrl is required'); return this.provider.extractText(imageUrl);} }
import { prisma } from "@/lib/prisma";
import type { ExtractOCRInput } from "@/schemas/ocr.schema";
import type { OCRProvider, OCRResult } from "@/services/ocr/OCRProvider";
import { MockOCRProvider } from "@/services/ocr/MockOCRProvider";

export class OCRService {
  constructor(private readonly provider: OCRProvider = new MockOCRProvider()) {}

  async extractAndSave(input: ExtractOCRInput) {
    const pending = await prisma.oCRJob.create({
      data: {
        imageUrl: `data:${input.mimeType};base64,${input.imageBase64.slice(0, 64)}...`,
        status: "processing",
      },
    });

    try {
      const result = await this.provider.extract({ imageBase64: input.imageBase64, mimeType: input.mimeType });

      const saved = await prisma.oCRJob.update({
        where: { id: pending.id },
        data: {
          status: "completed",
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
          status: "failed",
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
