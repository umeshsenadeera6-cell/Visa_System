import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, Circle, Eye, RotateCcw, Upload, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useModals } from "@/components/modals/context";
import { useLookups, useStore } from "@/store/store";
import { buildChecklist, milestoneStates, type ChecklistState } from "@/lib/domain";
import { cn, formatDate } from "@/lib/utils";
import type { Application } from "@/data/types";

/* ---------------------------------------------------------------- */
/* Timeline                                                         */
/* ---------------------------------------------------------------- */

export function ApplicationTimeline({ app, variant = "vertical", publicMode }: { app: Application; variant?: "vertical" | "horizontal"; publicMode?: boolean }) {
  const { staffName } = useLookups();
  const steps = milestoneStates(app);

  if (variant === "horizontal") {
    const doneCount = steps.filter((s) => s.state === "done").length;
    const pct = (Math.max(doneCount - (steps.some((s) => s.state === "current") ? 0 : 1), 0) / (steps.length - 1)) * 100;
    return (
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="relative min-w-[760px] px-2 pt-1">
          <div className="absolute top-[17px] right-[5%] left-[5%] h-0.5 rounded-full bg-border" />
          <div
            className="absolute top-[17px] left-[5%] h-0.5 origin-left rounded-full bg-primary [animation:grow-x_1s_cubic-bezier(0.22,1,0.36,1)_both]"
            style={{ width: `${Math.min(pct, 100) * 0.9}%` }}
          />
          <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((s) => (
              <li key={s.label} className="flex flex-col items-center px-1 text-center">
                <StepDot state={s.state} />
                <p className={cn("mt-2 text-[12px] leading-tight font-medium", s.state === "upcoming" && "text-muted-foreground")}>{publicMode ? s.public : s.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.state !== "upcoming" && s.date ? formatDate(s.date).slice(0, 6) : ""}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
          {i < steps.length - 1 && <span className={cn("absolute top-9 bottom-0 left-[17px] w-0.5 rounded-full", s.state === "done" ? "bg-primary" : "bg-border")} />}
          <StepDot state={s.state} />
          <div className="min-w-0 flex-1 pt-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("text-sm font-semibold", s.state === "upcoming" && "font-medium text-muted-foreground")}>{publicMode ? s.public : s.label}</p>
              {s.state === "current" && <StatusBadge status="In progress" tone="gold" />}
            </div>
            {s.state !== "upcoming" && s.date ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(s.date)}
                {!publicMode && s.by ? ` · ${staffName(s.by)}` : ""}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground/70">Pending</p>
            )}
            {!publicMode && s.note && s.state !== "upcoming" && <p className="mt-1 text-xs text-foreground/70">{s.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepDot({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done")
    return (
      <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-4 ring-card">
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  if (state === "current")
    return (
      <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-soft ring-4 ring-card">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" />
        <span className="size-3 rounded-full bg-gold" />
      </span>
    );
  return (
    <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#cfd8d3] bg-card ring-4 ring-card">
      <Circle className="size-2.5 text-transparent" />
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Document checklist                                               */
/* ---------------------------------------------------------------- */

const stateUi: Record<ChecklistState, { icon: typeof Check; cls: string; label: string }> = {
  complete: { icon: Check, cls: "bg-primary text-white", label: "Verified" },
  review: { icon: AlertTriangle, cls: "bg-[#fff5e0] text-[#b7770d]", label: "Awaiting review" },
  action: { icon: RotateCcw, cls: "bg-[#fff0e6] text-[#b24c0c]", label: "Re-upload required" },
  missing: { icon: X, cls: "bg-[#fdeeec] text-[#b4321f]", label: "Missing" },
};

export function DocumentChecklist({ app, mode = "admin", compact }: { app: Application; mode?: "admin" | "customer"; compact?: boolean }) {
  const store = useStore();
  const modals = useModals();
  const { fullVisaLabel, visaType } = useLookups();
  const vt = visaType(app.visaTypeId);
  const cl = buildChecklist(app, store.requirements[app.visaTypeId] ?? [], store.documents);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{fullVisaLabel(app.visaTypeId)}</p>
          <p className="mt-0.5 text-sm font-semibold">
            {cl.completed} / {cl.total} Documents Completed
          </p>
        </div>
        <p className="font-display text-2xl font-bold text-primary tabular">{cl.percent}%</p>
      </div>
      <Progress value={cl.percent} className="mt-3 h-2.5" />
      <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-primary" /> Verified
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-[#d98b0b]" /> Awaiting review
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-[#cf4f3a]" /> Missing / action needed
        </span>
      </div>

      {cl.items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          <ClipboardList className="mb-2 size-5" />
          No requirements configured for {vt?.name}.
        </div>
      ) : (
        <ul className={cn("mt-4 divide-y divide-border rounded-xl border border-border", compact && "text-[13px]")}>
          {cl.items.map((it) => {
            const ui = stateUi[it.state];
            return (
              <li key={it.requirement.id} className="flex flex-col gap-2 px-3 py-3 transition-colors hover:bg-[#fafcfb] sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", ui.cls)} title={ui.label}>
                    <ui.icon className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      {it.requirement.name}
                      {it.requirement.level !== "Required" && <StatusBadge status={it.requirement.level} dot={false} className="text-[10.5px]" />}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {it.doc ? (
                        <>
                          {it.doc.fileName} · {it.doc.status}
                          {it.doc.note && it.state === "action" ? ` — ${it.doc.note}` : ""}
                        </>
                      ) : (
                        (it.requirement.note ?? "Not uploaded yet")
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pl-9 sm:pl-0">
                  {it.doc && (
                    <Button variant="ghost" size="sm" onClick={() => modals.open("document", { docId: it.doc!.id, customerView: mode === "customer" })}>
                      <Eye /> View
                    </Button>
                  )}
                  {mode === "admin" && it.doc && it.state === "review" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-[#eef6f2]"
                      onClick={() => {
                        store.setDocumentStatus(it.doc!.id, "Verified");
                        toast.success(`${it.requirement.name} verified.`);
                      }}
                    >
                      <CheckCircle2 /> Verify
                    </Button>
                  )}
                  {(it.state === "missing" || it.state === "action" || (mode === "admin" && it.state !== "complete" && !it.doc)) && (
                    <Button
                      size="sm"
                      variant={mode === "customer" ? "default" : "outline"}
                      onClick={() =>
                        modals.open("upload", { customerId: app.customerId, applicationId: app.id, requirement: it.requirement.name, category: it.requirement.category, asCustomer: mode === "customer" })
                      }
                    >
                      <Upload /> {it.state === "action" ? "Re-upload" : "Upload"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
