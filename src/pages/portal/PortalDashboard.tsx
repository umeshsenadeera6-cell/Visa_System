import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock3, CreditCard, FileText, MapPin, MessageSquare, Plane, Upload, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ApplicationTimeline } from "@/components/shared/ApplicationWidgets";
import { useModals } from "@/components/modals/context";
import { useLookups } from "@/store/store";
import { appProgress, buildChecklist, invoiceTotals } from "@/lib/domain";
import { formatDate, formatLKR, parseDate, relativeTime, todayISO } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalDashboard() {
  const { customer, apps, store } = usePortalCustomer();
  const { fullVisaLabel, country, staffName, visaType } = useLookups();
  const modals = useModals();
  const app = apps[0];
  const today = todayISO();

  if (!customer) return null;
  const cl = app ? buildChecklist(app, store.requirements[app.visaTypeId] ?? [], store.documents) : null;
  const needed = cl?.items.filter((i) => i.state === "missing" || i.state === "action") ?? [];
  const nextAppt = store.appointments.filter((a) => a.customerId === customer.id && a.date >= today && a.status !== "Cancelled").sort((a, b) => a.date.localeCompare(b.date))[0];
  const inv = app ? store.invoices.find((i) => i.applicationId === app.id) : undefined;
  const t = inv ? invoiceTotals(inv, store.payments) : null;
  const lastMsg = store.messages.filter((m) => m.customerId === customer.id).sort((a, b) => b.time.localeCompare(a.time))[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-[28px]">Welcome back, {customer.firstName} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's the latest on your visa journey.</p>
      </div>

      {!app ? (
        <Card>
          <EmptyState icon={Plane} title="No applications yet" description="Your consultant will open an application for you after your consultation." />
        </Card>
      ) : (
        <>
          <Card className="relative overflow-hidden border-0 bg-forest text-white">
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="absolute -top-24 -right-24 size-72 rounded-full bg-[#14815d] opacity-50 blur-3xl" />
            <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{country(app.countryCode)?.flag}</span>
                  <div>
                    <p className="text-[13px] text-white/60">{app.id}</p>
                    <h2 className="font-display text-xl font-bold sm:text-2xl">{fullVisaLabel(app.visaTypeId)}</h2>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium ring-1 ring-white/15">
                    Status: <span className="text-[#e9cf8b]">{app.status}</span>
                  </span>
                  {app.decision && <StatusBadge status={app.decision} />}
                  <span className="text-sm text-white/70">Travel {formatDate(app.travelDate)}</span>
                </div>
                <p className="mt-4 max-w-lg text-sm text-white/70">
                  {app.status === "Under Processing"
                    ? "Your application is with the embassy. Processing typically takes " + (visaType(app.visaTypeId)?.processingTime ?? "a few weeks") + ". We'll notify you as soon as there's a decision."
                    : "Your consultant is working on the next step. Keep an eye on required documents below."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="gold" asChild>
                    <Link to={`/portal/applications/${app.id}`}>
                      View application <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
                    <Link to={`/track?id=${app.id}`}>Public tracking</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-6 self-center">
                <ProgressRing value={appProgress(app.status)} size={140} light />
              </div>
            </div>
            <div className="relative border-t border-white/10 bg-black/10 px-6 py-5 sm:px-8 [&_p]:text-white [&_.text-muted-foreground]:!text-white/55">
              <ApplicationTimeline app={app} variant="horizontal" publicMode />
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className={needed.length ? "border-[#f7e1b0] bg-[#fffaf0] p-5" : "p-5"}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {needed.length ? <AlertTriangle className="size-4 text-[#b7770d]" /> : <CheckCircle2 className="size-4 text-primary" />}
                {needed.length ? "Action required" : "Documents complete"}
              </div>
              {needed.length ? (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {needed.length} document{needed.length > 1 ? "s" : ""} needed: <span className="font-medium text-foreground">{needed.map((n) => n.requirement.name).join(", ")}</span>
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => modals.open("upload", { customerId: customer.id, applicationId: app.id, requirement: needed[0].requirement.name, category: needed[0].requirement.category, asCustomer: true })}
                  >
                    <Upload /> Upload {needed[0].requirement.name}
                  </Button>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">All required documents have been received.</p>
              )}
              {cl && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {cl.completed}/{cl.total} verified
                    </span>
                    <span>{cl.percent}%</span>
                  </div>
                  <Progress value={cl.percent} className="h-1.5" />
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="size-4 text-primary" /> Next appointment
              </div>
              {nextAppt ? (
                <div className="mt-3 flex gap-3">
                  <div className="flex w-12 flex-col items-center rounded-lg bg-[#eef6f2] py-1.5 text-primary">
                    <span className="text-[10px] font-semibold uppercase">{parseDate(nextAppt.date).toLocaleDateString("en", { month: "short" })}</span>
                    <span className="font-display text-lg leading-none font-bold">{parseDate(nextAppt.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{nextAppt.type}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="size-3" /> {nextAppt.time}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {nextAppt.location}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No upcoming appointments.</p>
              )}
              <Button variant="ghost" size="sm" className="mt-3 -ml-2" asChild>
                <Link to="/portal/appointments">
                  All appointments <ArrowRight />
                </Link>
              </Button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="size-4 text-primary" /> Payment summary
              </div>
              {t && inv ? (
                <>
                  <p className="mt-3 font-display text-2xl font-bold tabular">{formatLKR(t.balance)}</p>
                  <p className="text-xs text-muted-foreground">balance of {formatLKR(t.total)}</p>
                  <Progress value={(t.paid / t.total) * 100} className="mt-3 h-1.5" />
                  <Button variant="ghost" size="sm" className="mt-3 -ml-2" onClick={() => modals.open("invoice", { invoiceId: inv.id, customerView: true })}>
                    <FileText /> View invoice
                  </Button>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No invoices yet.</p>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-primary" /> Latest message
              </div>
              {lastMsg ? (
                <div className="mt-3 flex gap-2.5">
                  <UserAvatar name={lastMsg.from === "staff" ? staffName(lastMsg.staffId) : customer.firstName} className="size-8" />
                  <div className="min-w-0">
                    <p className="line-clamp-3 text-sm">{lastMsg.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{relativeTime(lastMsg.time)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No messages yet.</p>
              )}
              <Button variant="ghost" size="sm" className="mt-3 -ml-2" asChild>
                <Link to="/portal/messages">
                  Open messages <ArrowRight />
                </Link>
              </Button>
            </Card>
          </div>

          <Card className="flex items-center gap-3 border-dashed bg-transparent p-4 text-sm text-muted-foreground shadow-none">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <p>
              Your consultant is <span className="font-medium text-foreground">{staffName(app.consultantId)}</span>. Final visa decisions are made solely by the relevant immigration authority.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
