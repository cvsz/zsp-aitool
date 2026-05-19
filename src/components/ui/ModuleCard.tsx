import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

export function ModuleCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow">
        <CardContent>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
