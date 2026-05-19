import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

type ModuleCardTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  tone?: ModuleCardTone;
};

export function ModuleCard({ title, description, href, tone = "default" }: ModuleCardProps) {
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
      <Card tone={tone} className="h-full transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
        <CardContent>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
