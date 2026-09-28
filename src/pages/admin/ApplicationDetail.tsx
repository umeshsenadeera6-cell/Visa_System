import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  CalendarPlus,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  ExternalLink,
  Eye,
  History,
  MapPin,
  Pencil,
  Plane,
  Printer,
  Receipt,
  Upload,
  Clock3,
  MonitorSmartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, InfoRow } from "@/components/shared/SectionCard";
import { PriorityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { Field, FormGrid } from "@/components/shared/Form";
import { ApplicationTimeline, DocumentChecklist } from "@/components/shared/ApplicationWidgets";
import { useModals } from "@/components/modals/context";
import { useSwitchRole } from "@/components/layout/RoleSwitcher";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useLookups, useStore } from "@/store/store";
import { PRIORITIES, appProgress, buildChecklist, invoiceTotals } from "@/lib/domain";
import { cn, daysUntil, formatDate, formatLKR, parseDate } from "@/lib/utils";
import type { Application } from "@/data/types";

export default function ApplicationDetail() {
  const { id } = useParams();
  const store = useStore();
  const { customer, staffName, country, visaType, fullVisaLabel } = useLookups();
  const modals = useModals();
  const navigate = useNavigate();
  const switchRole = useSwitchRole();
  const loading = useFakeLoading(550, [id]);
  const [editOpen, setEditOpen] = useState(false);
  const app = store.applications.find((a) => a.id === id);

  if (loading) return <ProfileSkeleton />;
  if (!app)
    return (
      <EmptyState
        icon={Plane}
        title="Application not found"
        description="It may have been deleted or the ID is incorrect."
        action={<Button onClick={() => navigate("/app/applications")}>Back to applications</Button>}
      />
    );

  const c = customer(app.customerId);
  const vt = visaType(app.visaTypeId);
  const ctry = country(app.countryCode);
  const inv = store.invoices.find((i) => i.applicationId === app.id);
  const totals = inv ? invoiceTotals(inv, store.payments) : null;
  const pays = store.payments.filter((p) => p.applicationId === app.id).sort((a, b) => b.date.localeCompare(a.date));
  const appts = store.appointments.filter((a) => a.applicationId === app.id).sort((a, b) => a.date.localeCompare(b.date));
  const acts = store.activities.filter((a) => a.applicationId === app.id);
  const cl = buildChecklist(app, store.requirements[app.visaTypeId] ?? [], store.documents);
  const pct = appProgress(app.status);
  const travelIn = daysUntil(app.travelDate);

  return (
    <div className="print-area">
      <PageHeader breadcrumbs={[{ label: "Visa Applications", to: "/app/applications" }, { label: app.id }]} title="" className="mb-3" />

      {/* Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef6f2] to-[#dcefe6] text-3xl shadow-inner">{ctry?.flag}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-bold sm:text-2xl">{app.id}</h1>
                <StatusBadge status={app.status} />
                {app.decision && <StatusBadge status={app.decision} />}
                <PriorityBadge priority={app.priority} />
              </div>
              <p className="mt-1 text-[15px]">
                <Link to={`/app/customers/${app.customerId}`} className="font-semibold hover:text-primary">
                  {c?.firstName} {c?.lastName}
                </Link>
                <span className="text-muted-foreground"> · {fullVisaLabel(app.visaTypeId)}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {vt?.name} · created {formatDate(app.createdAt)} · updated {formatDate(app.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit
            </Button>
            <Button variant="outline" onClick={() => modals.open("upload", { applicationId: app.id, customerId: app.customerId })}>
              <Upload /> Upload Document
            </Button>
            <Button variant="outline" onClick={() => modals.open("payment", { applicationId: app.id, customerId: app.customerId })}>
              <CreditCard /> Add Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Opening print dialog…");
                setTimeout(() => window.print(), 300);
              }}
            >
              <Printer /> Print
            </Button>
            <Button onClick={() => modals.open("status", { applicationId: app.id })}>
              <ArrowRightLeft /> Change Status
            </Button>
          </div>
        </div>
        <div className="border-t border-border bg-[#fafcfb] px-5 py-5 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Application Progress</p>
            <div className="flex items-center gap-3">
              <Progress value={pct} className="h-2 w-40" />
              <span className="font-display text-lg font-bold text-primary tabular">{pct}%</span>
            </div>
          </div>
          <ApplicationTimeline app={app} variant="horizontal" />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Document Checklist"
            icon={<ClipboardCheck />}
            description="Generated automatically from the visa type requirements"
            action={
              <Button size="sm" variant="outline" onClick={() => modals.open("upload", { applicationId: app.id, customerId: app.customerId })}>
                <Upload /> Upload
              </Button>
            }
          >
            <DocumentChecklist app={app} />
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Payments"
              icon={<CreditCard />}
              action={
                <Button size="sm" variant="outline" onClick={() => modals.open("payment", { applicationId: app.id, customerId: app.customerId })}>
                  Add
                </Button>
              }
            >
              {totals && inv ? (
                <>
                  <div className="rounded-xl bg-gradient-to-br from-forest to-[#0e5a43] p-4 text-white">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/70">Invoice {inv.id}</p>
                      <StatusBadge status={totals.status} className="border-white/20 bg-white/15 text-white [&>span]:bg-[#e2c47c]" />
                    </div>
                    <p className="mt-2 font-display text-2xl font-bold tabular">{formatLKR(totals.balance)}</p>
                    <p className="text-xs text-white/70">balance due of {formatLKR(totals.total)}</p>
                    <Progress value={totals.total ? (totals.paid / totals.total) * 100 : 0} className="mt-3 h-1.5 bg-white/20" indicatorClassName="bg-[#e2c47c]" />
                  </div>
                  <ul className="mt-3 divide-y divide-border">
                    {pays.slice(0, 4).map((p) => (
                      <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                        <span>
                          <span className="font-medium">{formatLKR(p.amount)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {p.method} · {formatDate(p.date)}
                          </span>
                        </span>
                        <StatusBadge status={p.status} />
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => modals.open("invoice", { invoiceId: inv.id })}>
                    <Receipt /> Generate Invoice Preview
                  </Button>
                </>
              ) : (
                <EmptyState compact icon={Receipt} title="No invoice yet" />
              )}
            </SectionCard>

            <SectionCard
              title="Appointments"
              icon={<CalendarDays />}
              action={
                <Button size="sm" variant="outline" onClick={() => modals.open("appointment", { applicationId: app.id, customerId: app.customerId })}>
                  <CalendarPlus /> Schedule
                </Button>
              }
            >
              {appts.length === 0 ? (
                <EmptyState compact icon={CalendarDays} title="No appointments" description="Schedule VFS, biometrics or an interview." />
              ) : (
                <ul className="space-y-2">
                  {appts.map((a) => (
                    <li key={a.id}>
                      <button onClick={() => modals.open("appointment", { appointment: a })} className="flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left transition hover:bg-[#f9fbfa]">
                        <div className="flex w-11 flex-col items-center rounded-lg bg-[#eef6f2] py-1 text-primary">
                          <span className="text-[9.5px] font-semibold uppercase">{parseDate(a.date).toLocaleDateString("en", { month: "short" })}</span>
                          <span className="font-display text-base leading-none font-bold">{parseDate(a.date).getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{a.type}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Clock3 className="size-3" /> {a.time} <MapPin className="ml-1 size-3" /> {a.location}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Activity Log" icon={<History />}>
            <ActivityFeed items={acts} limit={10} />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Application Details" icon={<Plane />}>
            <dl className="divide-y divide-border">
              <InfoRow
                label="Customer"
                value={
                  <Link to={`/app/customers/${app.customerId}`} className="text-primary hover:underline">
                    {c?.firstName} {c?.lastName}
                  </Link>
                }
              />
              <InfoRow label="Passport" value={<span className="font-mono">{c?.passport.number}</span>} />
              <InfoRow label="Country" value={`${ctry?.flag} ${ctry?.name}`} />
              <InfoRow label="Visa type" value={vt?.name} />
              <InfoRow label="Entry / validity" value={`${vt?.entry} · ${vt?.validity}`} />
              <InfoRow label="Processing time" value={vt?.processingTime} />
              <InfoRow label="Travel date" value={<span className={cn(travelIn < 21 && travelIn >= 0 && "text-[#b24c0c]")}>{formatDate(app.travelDate)}{travelIn >= 0 ? ` (${travelIn}d)` : ""}</span>} />
              <InfoRow label="Purpose" value={app.purpose} />
              <InfoRow
                label="Consultant"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <UserAvatar name={staffName(app.consultantId)} className="size-5 text-[8px]" />
                    {staffName(app.consultantId)}
                  </span>
                }
              />
              <InfoRow label="Checklist" value={`${cl.completed}/${cl.total} verified`} />
            </dl>
            {app.notes && <p className="mt-3 rounded-lg bg-[#fff5e0] p-3 text-xs text-[#6f4a0a]">{app.notes}</p>}
          </SectionCard>

          <SectionCard title="Application Timeline" icon={<CheckCircle2 />}>
            <ApplicationTimeline app={app} />
          </SectionCard>

          <SectionCard title="Customer view" icon={<MonitorSmartphone />} description="Preview the portal and public tracking page.">
            <div className="grid gap-2">
              <Button variant="gold" onClick={() => switchRole("Customer", app.customerId)}>
                <Eye /> Open customer portal
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/track?id=${app.id}`}>
                  <ExternalLink /> Public tracking page
                </Link>
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      {editOpen && <EditApplicationDialog app={app} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function EditApplicationDialog({ app, onClose }: { app: Application; onClose: () => void }) {
  const store = useStore();
  const [v, setV] = useState({ travelDate: app.travelDate, consultantId: app.consultantId, priority: app.priority, purpose: app.purpose, notes: app.notes ?? "" });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>{app.id}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FormGrid>
            <Field label="Travel Date">
              <Input type="date" value={v.travelDate} onChange={(e) => setV({ ...v, travelDate: e.target.value })} />
            </Field>
            <Field label="Priority">
              <Select value={v.priority} onValueChange={(p) => setV({ ...v, priority: p as Application["priority"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Consultant" className="sm:col-span-2">
              <Select value={v.consultantId} onValueChange={(x) => setV({ ...v, consultantId: x })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {store.staff
                    .filter((s) => ["Visa Consultant", "Manager"].includes(s.role))
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Purpose" className="sm:col-span-2">
              <Input value={v.purpose} onChange={(e) => setV({ ...v, purpose: e.target.value })} />
            </Field>
            <Field label="Internal Notes" className="sm:col-span-2">
              <Textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />
            </Field>
          </FormGrid>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              store.update("applications", app.id, { ...v, updatedAt: new Date().toISOString() });
              store.log({ customerId: app.customerId, applicationId: app.id, text: "Application details updated", type: "update" });
              toast.success("Updated successfully.");
              onClose();
            }}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
