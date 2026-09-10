import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

type ModuleCardTone = "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  tone?: ModuleCardTone;
  icon?: string;
};

export function ModuleCard({ title, description, href, tone = "default", icon }: ModuleCardProps) {
  return (
    <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl">
      <Card tone={tone} className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-sky-500/40 group-hover:shadow-md">
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            {icon ? <span className="text-lg">{icon}</span> : null}
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{title}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
