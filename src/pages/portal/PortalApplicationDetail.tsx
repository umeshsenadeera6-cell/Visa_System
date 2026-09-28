import { Link, useParams } from "react-router-dom";
import { CalendarDays, ClipboardCheck, CreditCard, Eye, History, MessageSquare, Plane, Receipt, MapPin, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, InfoRow } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { MessageThread } from "@/components/shared/MessageThread";
import { ApplicationTimeline, DocumentChecklist } from "@/components/shared/ApplicationWidgets";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useLookups } from "@/store/store";
import { appProgress, invoiceTotals } from "@/lib/domain";
import { formatDate, formatLKR, parseDate } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";
import { ReceiptDialogButton } from "./PortalPayments";

export default function PortalApplicationDetail() {
  const { id } = useParams();
  const { apps, store, customer } = usePortalCustomer();
  const { country, visaType, staffName, fullVisaLabel } = useLookups();
  const modals = useModals();
  const loading = useFakeLoading(450, [id]);
  const app = apps.find((a) => a.id === id);

  if (loading) return <ProfileSkeleton />;
  if (!app)
    return (
      <Card>
        <EmptyState icon={Plane} title="Application not found" action={<Button asChild><Link to="/portal/applications">Back</Link></Button>} />
      </Card>
    );
  const vt = visaType(app.visaTypeId);
  const inv = store.invoices.find((i) => i.applicationId === app.id);
  const t = inv ? invoiceTotals(inv, store.payments) : null;
  const pays = store.payments.filter((p) => p.applicationId === app.id).sort((a, b) => b.date.localeCompare(a.date));
  const appts = store.appointments.filter((a) => a.applicationId === app.id).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: "My Applications", to: "/portal/applications" }, { label: app.id }]} title="" className="mb-3" />
      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing value={appProgress(app.status)} size={112} />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{app.id}</p>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
              {country(app.countryCode)?.flag} {fullVisaLabel(app.visaTypeId)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={app.status} />
              {app.decision && <StatusBadge status={app.decision} />}
              <span className="text-sm text-muted-foreground">· updated {formatDate(app.updatedAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => modals.open("upload", { customerId: customer.id, applicationId: app.id, asCustomer: true })}>
              Upload document
            </Button>
            {inv && (
              <Button onClick={() => modals.open("invoice", { invoiceId: inv.id, customerView: true })}>
                <Receipt /> View invoice
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Document Checklist" icon={<ClipboardCheck />} description="Upload anything marked missing — our team will verify it.">
            <DocumentChecklist app={app} mode="customer" />
          </SectionCard>

          <SectionCard title="Messages" icon={<MessageSquare />} bodyClassName="px-0 pb-0 [&>div]:rounded-none [&>div]:border-x-0 [&>div]:border-b-0">
            <MessageThread customerId={customer.id} as="customer" />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Application Details" icon={<Plane />}>
            <dl className="divide-y divide-border">
              <InfoRow label="Visa" value={vt?.name} />
              <InfoRow label="Processing time" value={vt?.processingTime} />
              <InfoRow label="Travel date" value={formatDate(app.travelDate)} />
              <InfoRow label="Purpose" value={app.purpose} />
              <InfoRow label="Consultant" value={staffName(app.consultantId)} />
            </dl>
          </SectionCard>

          <SectionCard title="Timeline" icon={<History />}>
            <ApplicationTimeline app={app} publicMode />
          </SectionCard>

          <SectionCard title="Payment Summary" icon={<CreditCard />}>
            {t && inv ? (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Balance due</p>
                    <p className="font-display text-2xl font-bold tabular">{formatLKR(t.balance)}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <Progress value={(t.paid / t.total) * 100} className="mt-3 h-1.5" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatLKR(t.paid)} paid of {formatLKR(t.total)}
                </p>
                <ul className="mt-3 divide-y divide-border">
                  {pays.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <span>
                        {formatLKR(p.amount)} <span className="text-xs text-muted-foreground">· {formatDate(p.date)}</span>
                      </span>
                      {p.status === "Paid" ? <ReceiptDialogButton paymentId={p.id} /> : <StatusBadge status={p.status} />}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => modals.open("invoice", { invoiceId: inv.id, customerView: true })}>
                  <Eye /> View invoice
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No invoice yet.</p>
            )}
          </SectionCard>

          <SectionCard title="Appointments" icon={<CalendarDays />}>
            {appts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {appts.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                    <div className="flex w-11 flex-col items-center rounded-lg bg-[#eef6f2] py-1 text-primary">
                      <span className="text-[9.5px] font-semibold uppercase">{parseDate(a.date).toLocaleDateString("en", { month: "short" })}</span>
                      <span className="font-display text-base leading-none font-bold">{parseDate(a.date).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{a.type}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Clock3 className="size-3" /> {a.time} <MapPin className="ml-1 size-3" /> {a.location}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
