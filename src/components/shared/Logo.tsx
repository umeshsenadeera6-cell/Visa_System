import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <defs>
        <linearGradient id="lg-m" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f7a5a" />
          <stop offset="1" stopColor="#0b3b2e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg-m)" />
      <circle cx="20" cy="20" r="10.5" fill="none" stroke="#d6b263" strokeWidth="1.8" />
      <path d="M9.5 20h21M20 9.5c3.8 3 3.8 18 0 21M20 9.5c-3.8 3-3.8 18 0 21" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".9" />
      <path d="M27 11.5l3.5-1.2-1.2 3.5" fill="none" stroke="#d6b263" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, light, compact }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="leading-none">
          <span className={cn("block font-display text-[15px] font-bold tracking-tight", light ? "text-white" : "text-forest")}>Serendib</span>
          <span className={cn("mt-0.5 block text-[10px] font-semibold tracking-[0.22em] uppercase", light ? "text-[#d6b263]" : "text-gold")}>Visa Services</span>
        </span>
      )}
    </span>
  );
}
