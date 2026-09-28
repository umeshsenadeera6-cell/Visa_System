import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 text-center", compact ? "py-8" : "py-14", className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 scale-150 rounded-full bg-[#e7f4ee] opacity-60 blur-xl" />
        <div className="relative flex size-12 items-center justify-center rounded-2xl border border-[#d6ebe1] bg-gradient-to-b from-white to-[#eef6f2] text-primary shadow-sm">
          <Icon className="size-5" />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
