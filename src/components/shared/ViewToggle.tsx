import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon: LucideIcon }[] }) {
  return (
    <div role="tablist" className="inline-flex h-9 items-center rounded-lg border border-border bg-card p-0.5 shadow-xs">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-full items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-all",
            value === o.value ? "bg-primary text-white shadow-sm" : "hover:text-foreground",
          )}
        >
          <o.icon className="size-4" />
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
