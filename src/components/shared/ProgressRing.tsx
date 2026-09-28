export function ProgressRing({ value, size = 120, stroke = 10, light }: { value: number; size?: number; stroke?: number; light?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${value}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={light ? "rgb(255 255 255 / 0.15)" : "#e8eeea"} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={light ? "#e2c47c" : "#0a7d57"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-2xl font-bold tabular ${light ? "text-white" : ""}`}>{value}%</span>
        <span className={`text-[10.5px] ${light ? "text-white/60" : "text-muted-foreground"}`}>complete</span>
      </div>
    </div>
  );
}
