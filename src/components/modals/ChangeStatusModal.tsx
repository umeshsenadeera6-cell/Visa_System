import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStore } from "@/store/store";
import { APP_STAGES, type AppStatus } from "@/data/types";
import { cn } from "@/lib/utils";
import type { ModalProps } from "./context";

export function ChangeStatusModal({ open, onClose, applicationId }: ModalProps & { applicationId: string }) {
  const store = useStore();
  const app = store.applications.find((a) => a.id === applicationId);
  const [status, setStatus] = useState<AppStatus>(app ? APP_STAGES[Math.min(APP_STAGES.indexOf(app.status) + 1, 13)] : "Inquiry");
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"Approved" | "Rejected">("Approved");
  if (!app) return null;
  const current = APP_STAGES.indexOf(app.status);

  const submit = () => {
    if (status === app.status) return toast.info("Status unchanged.");
    store.changeStatus(app.id, status, note || undefined, status === "Decision Received" ? decision : undefined);
    toast.success("Status changed.", { description: `${app.id} → ${status}` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Application Status</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            {app.id} · currently <StatusBadge status={app.status} />
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {APP_STAGES.map((s, i) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                  status === s ? "border-primary bg-[#eef6f2] ring-2 ring-primary/15" : "border-border hover:border-[#c9d6cf] hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    i < current ? "bg-primary text-white" : i === current ? "bg-gold text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < current ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="truncate">{s}</span>
                {i === current && <span className="ml-auto text-[10.5px] font-medium text-[#8a6412]">Current</span>}
              </button>
            ))}
          </div>
          {status === "Decision Received" && (
            <div className="space-y-2">
              <Label>Decision</Label>
              <div className="flex gap-2">
                {(["Approved", "Rejected"] as const).map((d) => (
                  <Button key={d} type="button" variant={decision === d ? "default" : "outline"} size="sm" onClick={() => setDecision(d)}>
                    {d}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="status-note">Note (visible in timeline)</Label>
            <Textarea id="status-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Application forwarded to the British High Commission" />
          </div>
          <p className="rounded-lg bg-[#f8faf9] px-3 py-2 text-xs text-muted-foreground">The customer will be notified in their portal and the change is logged in the application timeline.</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
