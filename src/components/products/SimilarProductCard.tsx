interface SimilarProductCardProps {
  recommendation: {
    relatedProductId: string;
    score: number;
    reasons: string[];
  };
}

export function SimilarProductCard({ recommendation }: SimilarProductCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Product #{recommendation.relatedProductId}</h3>
        <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">{recommendation.score}/100</span>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
        {recommendation.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
