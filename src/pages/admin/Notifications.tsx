import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { NotificationRow } from "@/components/layout/NotificationCenter";
import { useConfirm } from "@/components/shared/Confirm";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/data/types";

const TABS: { key: "all" | "unread" | NotificationType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "document", label: "Documents" },
  { key: "payment", label: "Payments" },
  { key: "status", label: "Status" },
  { key: "appointment", label: "Appointments" },
  { key: "lead", label: "Leads" },
];

export default function Notifications() {
  const store = useStore();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const all = store.notifications.filter((n) => n.audience !== "customer").sort((a, b) => b.time.localeCompare(a.time));
  const list = all.filter((n) => (tab === "all" ? true : tab === "unread" ? !n.read : n.type === tab));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={`${all.filter((n) => !n.read).length} unread`}
        actions={
          <>
            <Button variant="outline" onClick={() => (store.markAllRead("staff"), toast.success("All notifications marked as read."))}>
              <CheckCheck /> Mark all read
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                confirm({
                  title: "Clear read notifications?",
                  confirmLabel: "Clear",
                  onConfirm: () => {
                    all.filter((n) => n.read).forEach((n) => store.remove("notifications", n.id));
                    toast.success("Deleted successfully.");
                  },
                })
              }
            >
              <Trash2 /> Clear read
            </Button>
          </>
        }
      />
      <div className="scrollbar-none -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition", tab === t.key ? "bg-forest text-white" : "bg-card text-muted-foreground hover:text-foreground border border-border")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications" description="You're all caught up." />
        ) : (
          <div className="divide-y divide-border">
            {list.map((n) => (
              <NotificationRow
                key={n.id}
                n={n}
                onClick={() => {
                  store.update("notifications", n.id, { read: true });
                  if (n.link) navigate(n.link);
                }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
