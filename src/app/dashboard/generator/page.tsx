import { ContentGeneratorForm } from "@/components/ai/ContentGeneratorForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function GeneratorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Content Generator"
        subtitle="สร้างแคปชันรีวิวสินค้า Hook ภาษาไทย และแฮชแท็กสำหรับทุกช่องทางโซเชียลมีเดีย พร้อมคำเปิดเผย Affiliate อัตโนมัติ"
      />
      <ContentGeneratorForm />
    </div>
  );
}
