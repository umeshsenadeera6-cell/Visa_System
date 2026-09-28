import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Card representation of a table row for small screens. */
export function MobileCard({
  title,
  subtitle,
  badge,
  meta,
  leading,
  onClick,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  meta?: { label: string; value: ReactNode }[];
  leading?: ReactNode;
  onClick?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn("px-4 py-3.5 transition-colors", onClick && "cursor-pointer active:bg-muted")}
    >
      <div className="flex items-start gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {badge}
              {actions}
              {onClick && !actions && <ChevronRight className="size-4 text-muted-foreground" />}
            </div>
          </div>
          {meta && (
            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {meta.map((m) => (
                <div key={m.label} className="min-w-0">
                  <dt className="text-muted-foreground">{m.label}</dt>
                  <dd className="truncate font-medium">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border md:hidden">{children}</div>;
}
