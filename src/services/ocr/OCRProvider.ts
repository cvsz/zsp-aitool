export type OCRExtractedFields = {
  title?: string;
  price?: number;
  discount?: string;
  rating?: number;
  soldCount?: number;
  descriptionSnippets: string[];
};

export type OCRLine = {
  text: string;
  confidence?: number;
};

export type OCRResult = {
  rawText: string;
  lines: OCRLine[];
  fields: OCRExtractedFields;
  confidence?: number;
};

export type OCRExtractInput = {
  imageBase64: string;
  mimeType: string;
};

export interface OCRProvider {
  extract(input: OCRExtractInput): Promise<OCRResult>;
}
