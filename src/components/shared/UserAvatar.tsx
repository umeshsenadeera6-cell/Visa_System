import { cn, initials } from "@/lib/utils";

const palettes = [
  "bg-[#e3f1ea] text-[#0a6446]",
  "bg-[#f7eed8] text-[#80600f]",
  "bg-[#e6eefb] text-[#2d5bb5]",
  "bg-[#f1ebfa] text-[#6a44b0]",
  "bg-[#fde9e4] text-[#a8402c]",
  "bg-[#e3f3f3] text-[#146f6d]",
];

export function UserAvatar({ name, className, ring }: { name: string; className?: string; ring?: boolean }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold select-none",
        palettes[hash % palettes.length],
        ring && "ring-2 ring-white",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
