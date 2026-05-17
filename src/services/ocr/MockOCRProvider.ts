import type { OCRExtractInput, OCRProvider, OCRResult } from "./OCRProvider";

function parsePrice(text: string): number | undefined {
  const match = text.match(/(?:฿|THB\s?)((?:\d|,)+(?:\.\d+)?)/i);
  if (!match?.[1]) return undefined;
  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class MockOCRProvider implements OCRProvider {
  async extract(input: OCRExtractInput): Promise<OCRResult> {
    if (!input.imageBase64 || !input.mimeType.startsWith("image/")) {
      throw new Error("Invalid image input for OCR");
    }

    const lines = [
      { text: "หูฟังบลูทูธเสียงดี รุ่น Pro Max", confidence: 0.91 },
      { text: "฿799 ลด 20%", confidence: 0.88 },
      { text: "คะแนน 4.8 | ขายแล้ว 1.2พัน", confidence: 0.83 },
      { text: "แบตอึด ใช้งานได้ทั้งวัน พกพาง่าย", confidence: 0.8 },
    ];

    const rawText = lines.map((x) => x.text).join("\n");
    const price = parsePrice(rawText);

    return {
      rawText,
      lines,
      confidence: 0.86,
      fields: {
        title: lines[0]?.text,
        price,
        discount: "20%",
        rating: 4.8,
        soldCount: 1200,
        descriptionSnippets: ["แบตอึด", "ใช้งานได้ทั้งวัน", "พกพาง่าย"],
      },
    };
  }
}
