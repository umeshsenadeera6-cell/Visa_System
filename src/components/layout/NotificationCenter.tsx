import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, CheckCheck, CreditCard, FileText, RefreshCw, Settings2, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import { cn, relativeTime } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/data/types";

export const notifIcon: Record<NotificationType, { icon: typeof Bell; cls: string }> = {
  document: { icon: FileText, cls: "bg-[#ebf2fe] text-[#2856b8]" },
  payment: { icon: CreditCard, cls: "bg-[#fdeeec] text-[#b4321f]" },
  status: { icon: RefreshCw, cls: "bg-[#e7f4ee] text-[#0a6446]" },
  appointment: { icon: CalendarDays, cls: "bg-[#faf3e1] text-[#8a6412]" },
  lead: { icon: UserPlus, cls: "bg-[#f3effd] text-[#6841b6]" },
  system: { icon: Settings2, cls: "bg-[#f0f2f1] text-[#4d5a55]" },
};

export function NotificationRow({ n, onClick }: { n: AppNotification; onClick?: () => void }) {
  const I = notifIcon[n.type];
  return (
    <button onClick={onClick} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#f7faf8]", !n.read && "bg-[#f6fbf8]")}>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", I.cls)}>
        <I.icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-[13px] leading-snug", !n.read ? "font-semibold" : "font-medium")}>{n.title}</span>
          {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{n.description}</span>
        <span className="mt-1 block text-[11px] text-muted-foreground/80">{relativeTime(n.time)}</span>
      </span>
    </button>
  );
}

export function NotificationCenter({ audience = "staff" }: { audience?: "staff" | "customer" }) {
  const store = useStore();
  const navigate = useNavigate();
  const list = store.notifications
    .filter((n) => (audience === "customer" ? n.audience === "customer" && n.customerId === store.session?.customerId : n.audience !== "customer"))
    .sort((a, b) => b.time.localeCompare(a.time));
  const unread = list.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label={`Notifications, ${unread} unread`}>
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#cf4f3a] px-1 text-[10px] font-bold text-white ring-2 ring-white tabular">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-1.5rem)] max-w-sm p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread ? `${unread} unread` : "You're all caught up"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => store.markAllRead(audience, store.session?.customerId)} disabled={!unread}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
        <div className="max-h-[420px] divide-y divide-border overflow-y-auto scrollbar-thin">
          {list.slice(0, 8).map((n) => (
            <NotificationRow
              key={n.id}
              n={n}
              onClick={() => {
                store.update("notifications", n.id, { read: true });
                if (n.link) navigate(n.link);
              }}
            />
          ))}
          {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No notifications yet</p>}
        </div>
        {audience === "staff" && (
          <div className="border-t border-border p-2">
            <Button variant="ghost" className="w-full" onClick={() => navigate("/app/notifications")}>
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
