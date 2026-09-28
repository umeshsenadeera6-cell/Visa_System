import { CreditCard, FilePlus2, FileText, CalendarDays, MessageSquare, Pencil, RefreshCw, StickyNote, History } from "lucide-react";
import { useLookups } from "@/store/store";
import { cn, formatDate, relativeTime } from "@/lib/utils";
import type { Activity } from "@/data/types";
import { EmptyState } from "./EmptyState";

const icons: Record<Activity["type"], { icon: typeof FileText; cls: string }> = {
  create: { icon: FilePlus2, cls: "bg-[#e7f4ee] text-[#0a6446]" },
  update: { icon: Pencil, cls: "bg-[#f0f2f1] text-[#4d5a55]" },
  document: { icon: FileText, cls: "bg-[#ebf2fe] text-[#2856b8]" },
  payment: { icon: CreditCard, cls: "bg-[#faf3e1] text-[#8a6412]" },
  status: { icon: RefreshCw, cls: "bg-[#f3effd] text-[#6841b6]" },
  appointment: { icon: CalendarDays, cls: "bg-[#e6f5f5] text-[#11706f]" },
  message: { icon: MessageSquare, cls: "bg-[#ebf2fe] text-[#2856b8]" },
  note: { icon: StickyNote, cls: "bg-[#fff5e0] text-[#98600a]" },
};

export function ActivityFeed({ items, limit }: { items: Activity[]; limit?: number }) {
  const { staffName } = useLookups();
  const sorted = [...items].sort((a, b) => b.time.localeCompare(a.time)).slice(0, limit);
  if (!sorted.length) return <EmptyState compact icon={History} title="No activity yet" />;
  return (
    <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border">
      {sorted.map((a) => {
        const I = icons[a.type];
        return (
          <li key={a.id} className="relative flex gap-3">
            <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card", I.cls)}>
              <I.icon className="size-3.5" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm">{a.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {staffName(a.by)} · <span title={formatDate(a.time)}>{relativeTime(a.time)}</span>
                {a.applicationId && <span className="ml-1 text-muted-foreground/80">· {a.applicationId}</span>}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
