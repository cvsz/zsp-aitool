import { Card, CardContent } from "@/components/ui/Card";

export function AlertBanner({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent>
        <p className="text-sm font-semibold text-amber-800">{title}</p>
        <p className="mt-1 text-sm text-amber-700">{description}</p>
      </CardContent>
    </Card>
  );
}
