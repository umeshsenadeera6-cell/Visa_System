import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon && <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eef6f2] text-primary [&_svg]:size-4">{icon}</div>}
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>
            {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("flex-1 px-5 pb-5", bodyClassName)}>{children}</div>
    </Card>
  );
}

export function InfoRow({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2.5 text-sm", className)}>
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
