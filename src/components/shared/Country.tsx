import { useLookups } from "@/store/store";
import { cn } from "@/lib/utils";

export function CountryLabel({ code, className, short }: { code: string; className?: string; short?: boolean }) {
  const { country } = useLookups();
  const c = country(code);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="text-base leading-none" aria-hidden>
        {c?.flag ?? "🏳️"}
      </span>
      <span className="truncate">{short ? code : (c?.name ?? code)}</span>
    </span>
  );
}
