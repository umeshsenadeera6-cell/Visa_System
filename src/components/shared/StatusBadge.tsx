import { cn } from "@/lib/utils";
import { dotClasses, toneClasses, toneFor, type Tone } from "@/lib/domain";
import { AlertTriangle, ArrowDown, ArrowUp, Flame, Minus } from "lucide-react";

export function StatusBadge({ status, tone, className, dot = true }: { status: string; tone?: Tone; className?: string; dot?: boolean }) {
  const t = tone ?? toneFor(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap leading-5",
        toneClasses[t],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotClasses[t])} />}
      {status}
    </span>
  );
}

const prioIcon = { Low: ArrowDown, Medium: Minus, High: ArrowUp, Urgent: Flame } as const;

export function PriorityBadge({ priority, className }: { priority: "Low" | "Medium" | "High" | "Urgent"; className?: string }) {
  const Icon = prioIcon[priority] ?? AlertTriangle;
  const t = toneFor(priority);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium", toneClasses[t], className)}>
      <Icon className="size-3" />
      {priority}
    </span>
  );
}
