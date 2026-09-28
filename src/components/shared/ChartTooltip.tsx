/* eslint-disable @typescript-eslint/no-explicit-any */
export function ChartTooltip({ active, payload, label, formatter }: { active?: boolean; payload?: any[]; label?: string; formatter?: (v: number, name: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl border border-border bg-white/95 px-3 py-2.5 text-xs shadow-[var(--shadow-lift)] backdrop-blur">
      {label && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: p.color ?? p.payload?.fill }} />
              {p.name}
            </span>
            <span className="font-semibold text-foreground tabular">{formatter ? formatter(p.value, p.name) : p.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CHART = {
  c1: "#0a7d57",
  c2: "#c2881c",
  c3: "#3a6fd8",
  c4: "#cf4f3a",
  c5: "#8a5cc9",
  grid: "#eef1ef",
  axis: "#8a9791",
};

export const axisProps = {
  tick: { fill: CHART.axis, fontSize: 11.5 },
  tickLine: false,
  axisLine: false,
} as const;
