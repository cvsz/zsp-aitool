import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface SimilarProductCardProps {
  recommendation: {
    relatedProductId: string;
    score: number;
    reasons: string[];
  };
}

export function SimilarProductCard({ recommendation }: SimilarProductCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
            รหัสสินค้า #{recommendation.relatedProductId}
          </h3>
          <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 text-xs font-extrabold text-sky-700 dark:text-sky-300">
            {recommendation.score}% Match
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 mb-3 border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            เหตุผลที่แนะนำ (Matching Criteria):
          </p>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {recommendation.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-sky-500">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <Link href={`/dashboard/products/${recommendation.relatedProductId}`} className="w-full">
          <Button size="sm" variant="secondary" className="w-full text-xs">
            ดูสินค้าต้นทาง
          </Button>
        </Link>
        <Link href={`/dashboard/generator?productId=${recommendation.relatedProductId}`} className="w-full">
          <Button size="sm" variant="primary" className="w-full text-xs">
            ✍️ รีวิว AI
          </Button>
        </Link>
      </div>
    </div>
  );
}
