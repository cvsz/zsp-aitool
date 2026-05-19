import { ContentGeneratorForm } from "@/components/ai/ContentGeneratorForm";

export default function GeneratorPage() {
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-bold">AI Content Generator</h1><p className="text-sm text-slate-600">เลือกสินค้า เลือกแพลตฟอร์ม แล้วสร้างคอนเทนต์พร้อมคำเปิดเผยลิงก์แอฟฟิลิเอต</p><ContentGeneratorForm /></main>;
}
