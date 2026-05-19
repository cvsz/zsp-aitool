import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type SectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";
};

export function Section({ title, description, children, className = "", tone = "default" }: SectionProps) {
  return (
    <Card tone={tone} className={className}>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <p className="mt-1 text-sm opacity-80">{description}</p> : null}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
