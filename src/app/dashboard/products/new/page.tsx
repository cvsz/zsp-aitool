import { ProductForm } from "@/components/products/ProductForm";
import { ProductImportForm } from "@/components/products/ProductImportForm";

export default function NewProductPage() {
  return <main className="space-y-6 p-6"><h1 className="text-2xl font-bold">เพิ่ม/นำเข้าสินค้า</h1><ProductForm /><ProductImportForm /></main>;
}
