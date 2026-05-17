import { ProductForm } from "@/components/products/ProductForm";
import { ProductImportForm } from "@/components/products/ProductImportForm";

export default function NewProductPage() {
  return <main className="p-6 space-y-6"><h1 className="text-xl font-bold">Add Product</h1><ProductForm /><ProductImportForm /></main>;
}
