export type OCRJobStatus = "queued" | "processing" | "success" | "failed";

export interface OCRExtractedFields {
  title?: string;
  price?: number;
  rating?: number;
  soldCount?: number;
  description?: string;
}

export interface OCRJob {
  id: string;
  imageUrl: string;
  extractedText: string;
  confidence?: number;
  fields?: OCRExtractedFields;
  status: OCRJobStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
