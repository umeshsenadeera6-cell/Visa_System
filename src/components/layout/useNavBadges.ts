import { useStore } from "@/store/store";
import { todayISO } from "@/lib/utils";

export function useNavBadges() {
  const s = useStore();
  const today = todayISO();
  return {
    leads: s.leads.filter((l) => l.status === "New").length,
    followUps: s.followUps.filter((f) => f.status === "Pending" && f.dueDate <= today).length,
    notifications: s.notifications.filter((n) => n.audience !== "customer" && !n.read).length,
    documents: s.documents.filter((d) => d.status === "Uploaded" || d.status === "Under Review").length,
  };
}
