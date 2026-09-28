import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  comparison = "from last month",
  invertTrend,
  accent = "emerald",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: number;
  comparison?: string;
  invertTrend?: boolean;
  accent?: "emerald" | "gold" | "blue" | "violet" | "orange" | "teal";
  onClick?: () => void;
}) {
  const up = trend >= 0;
  const good = invertTrend ? !up : up;
  const accents = {
    emerald: "bg-[#e7f4ee] text-[#0a6446]",
    gold: "bg-[#faf3e1] text-[#8a6412]",
    blue: "bg-[#ebf2fe] text-[#2856b8]",
    violet: "bg-[#f3effd] text-[#6841b6]",
    orange: "bg-[#fff0e6] text-[#b24c0c]",
    teal: "bg-[#e6f5f5] text-[#11706f]",
  };
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-5",
        onClick && "cursor-pointer",
      )}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-gradient-to-br from-[#eef6f2] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-xl", accents[accent])}>
          <Icon className="size-[18px]" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular",
            good ? "bg-[#e7f4ee] text-[#0a6446]" : "bg-[#fdeeec] text-[#b4321f]",
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {up ? "+" : ""}
          {trend.toFixed(1)}%
        </span>
      </div>
      <p className="mt-4 text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-[22px] font-bold tracking-tight tabular sm:text-2xl">{value}</p>
      <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
        <span className={cn("font-medium", good ? "text-[#0a6446]" : "text-[#b4321f]")}>
          {up ? "+" : ""}
          {trend.toFixed(1)}%
        </span>{" "}
        {comparison}
      </p>
    </Card>
  );
}
