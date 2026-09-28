import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookUser,
  CalendarDays,
  CalendarPlus,
  CreditCard,
  Eye,
  FilePlus2,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  Pencil,
  Phone,
  Plane,
  Receipt,
  ShieldCheck,
  Upload,
  UserRound,
  Briefcase,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, InfoRow } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CountryLabel } from "@/components/shared/Country";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { MessageThread } from "@/components/shared/MessageThread";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useModals } from "@/components/modals/context";
import { useSwitchRole } from "@/components/layout/RoleSwitcher";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useLookups, useStore } from "@/store/store";
import { appProgress, invoiceTotals, passportState, toneClasses } from "@/lib/domain";
import { cn, daysUntil, formatDate, formatLKR, parseDate } from "@/lib/utils";

export default function CustomerProfile() {
  const { id } = useParams();
  const store = useStore();
  const { staffName, country, visaLabel, fullVisaLabel } = useLookups();
  const modals = useModals();
  const navigate = useNavigate();
  const switchRole = useSwitchRole();
  const loading = useFakeLoading(550, [id]);
  const c = store.customers.find((x) => x.id === id);

  if (loading) return <ProfileSkeleton />;
  if (!c)
    return (
      <EmptyState
        icon={UserRound}
        title="Customer not found"
        description="This customer may have been deleted."
        action={<Button onClick={() => navigate("/app/customers")}>Back to customers</Button>}
      />
    );

  const name = `${c.firstName} ${c.lastName}`;
  const apps = store.applications.filter((a) => a.customerId === c.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const docs = store.documents.filter((d) => d.customerId === c.id).sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));
  const pays = store.payments.filter((p) => p.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const invs = store.invoices.filter((i) => i.customerId === c.id);
  const appts = store.appointments.filter((a) => a.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const acts = store.activities.filter((a) => a.customerId === c.id);
  const ps = passportState(c.passport.expiryDate);
  const balance = invs.reduce((s, i) => s + invoiceTotals(i, store.payments).balance, 0);
  const paid = pays.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const current = apps[0];
  const validityPct = Math.max(0, Math.min(100, (ps.days / 3650) * 100));

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: "Customers", to: "/app/customers" }, { label: name }]} title="" className="mb-3" />

      {/* Profile header */}
      <Card className="relative mb-6 overflow-hidden">
        <div className="relative h-24 bg-gradient-to-r from-forest via-[#0e5a43] to-[#14704f]">
          <div className="absolute inset-0 bg-grid opacity-50" />
        </div>
        <div className="relative flex flex-col gap-5 px-5 pb-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <UserAvatar name={name} className="-mt-10 size-20 rounded-2xl text-2xl shadow-lg ring-4 ring-white" />
            <div className="sm:pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">{name}</h1>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                <span className="font-medium text-foreground/80">{c.id}</span>
                <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-primary">
                  <Phone className="size-3.5" /> {c.phone}
                </a>
                <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary">
                  <Mail className="size-3.5" /> {c.email}
                </a>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {c.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:pt-4">
            <Button variant="outline" onClick={() => modals.open("customer", { customer: c })}>
              <Pencil /> Edit
            </Button>
            <Button variant="outline" onClick={() => modals.open("upload", { customerId: c.id, applicationId: current?.id })}>
              <Upload /> Add Document
            </Button>
            <Button variant="outline" onClick={() => modals.open("payment", { customerId: c.id, applicationId: current?.id })}>
              <CreditCard /> Add Payment
            </Button>
            <Button onClick={() => modals.open("application", { customerId: c.id })}>
              <FilePlus2 /> New Application
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-border border-t border-border sm:grid-cols-4 sm:divide-x">
          {[
            { label: "Applications", value: apps.length, icon: Plane },
            { label: "Documents", value: docs.length, icon: FileText },
            { label: "Total paid", value: formatLKR(paid, true), icon: CreditCard },
            { label: "Outstanding", value: formatLKR(balance, true), icon: Receipt, warn: balance > 0 },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-5 py-3.5">
              <s.icon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[11.5px] text-muted-foreground">{s.label}</p>
                <p className={cn("font-semibold tabular", s.warn && "text-[#b24c0c]")}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications ({apps.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
              <SectionCard title="Personal Information" icon={<UserRound />}>
                <dl className="divide-y divide-border">
                  <InfoRow label="Full name" value={name} />
                  <InfoRow label="Date of birth" value={formatDate(c.dob)} />
                  <InfoRow label="Gender" value={c.gender} />
                  <InfoRow label="Marital status" value={c.maritalStatus} />
                  <InfoRow label="Nationality" value={c.nationality} />
                  <InfoRow label="NIC" value={c.nic} />
                </dl>
              </SectionCard>

              <SectionCard title="Passport Information" icon={<BookUser />}>
                <div className={cn("mb-3 flex items-center gap-3 rounded-xl border p-3", toneClasses[ps.tone])}>
                  {ps.tone === "emerald" ? <ShieldCheck className="size-5 shrink-0" /> : <AlertTriangle className="size-5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{ps.label}</p>
                    <p className="text-xs opacity-80">{ps.days < 180 ? "Most embassies require 6 months validity beyond travel." : "Meets the 6-month validity rule for travel."}</p>
                    <Progress
                      value={validityPct}
                      className="mt-2 h-1.5 bg-white/60"
                      indicatorClassName={ps.tone === "emerald" ? "bg-[#0a7d57]" : ps.tone === "amber" ? "bg-[#d98b0b]" : "bg-[#cf4f3a]"}
                    />
                  </div>
                </div>
                <dl className="divide-y divide-border">
                  <InfoRow label="Passport number" value={<span className="font-mono">{c.passport.number}</span>} />
                  <InfoRow label="Issue date" value={formatDate(c.passport.issueDate)} />
                  <InfoRow label="Expiry date" value={formatDate(c.passport.expiryDate)} />
                  <InfoRow label="Place of issue" value={c.passport.placeOfIssue} />
                </dl>
              </SectionCard>

              <SectionCard title="Contact Information" icon={<Phone />}>
                <dl className="divide-y divide-border">
                  <InfoRow label="Phone" value={c.phone} />
                  <InfoRow label="WhatsApp" value={c.whatsapp} />
                  <InfoRow label="Email" value={c.email} />
                  <InfoRow label="Address" value={c.address} />
                  <InfoRow label="City" value={c.city} />
                </dl>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info(`Opening WhatsApp with ${c.firstName}…`, { description: "WhatsApp API is available after backend integration." })}>
                    <MessageCircle /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Email delivery will be available after backend integration.")}>
                    <Mail /> Email
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title="Travel Information" icon={<Globe2 />}>
                <dl className="divide-y divide-border">
                  <InfoRow label="Preferred destination" value={<CountryLabel code={c.travel.preferredDestination} />} />
                  <InfoRow label="Purpose" value={c.travel.purpose} />
                  <InfoRow label="Planned travel" value={formatDate(c.travel.plannedDate)} />
                  <InfoRow label="Occupation" value={c.occupation} />
                  <InfoRow label="Employer" value={c.employer} />
                  <InfoRow label="Previous travel" value={c.travel.previousTravel.length ? c.travel.previousTravel.join(", ") : "None recorded"} />
                </dl>
              </SectionCard>
            </div>

            <div className="space-y-4">
              {current ? (
                <SectionCard title="Current Application" icon={<Plane />}>
                  <Link to={`/app/applications/${current.id}`} className="group block rounded-xl border border-border p-4 transition hover:border-primary/30 hover:bg-[#f9fbfa]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-primary group-hover:underline">{current.id}</p>
                      <span className="text-lg">{country(current.countryCode)?.flag}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{fullVisaLabel(current.visaTypeId)}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <StatusBadge status={current.status} />
                      <span className="font-semibold tabular">{appProgress(current.status)}%</span>
                    </div>
                    <Progress value={appProgress(current.status)} className="mt-2" />
                    <p className="mt-3 text-xs text-muted-foreground">
                      Travel {formatDate(current.travelDate)} · {daysUntil(current.travelDate) >= 0 ? `${daysUntil(current.travelDate)} days away` : "past"}
                    </p>
                  </Link>
                </SectionCard>
              ) : (
                <Card>
                  <EmptyState
                    compact
                    icon={Plane}
                    title="No applications yet"
                    description="Start a visa application for this customer."
                    action={
                      <Button size="sm" onClick={() => modals.open("application", { customerId: c.id })}>
                        <FilePlus2 /> New Application
                      </Button>
                    }
                  />
                </Card>
              )}

              <SectionCard title="Assigned Consultant" icon={<Briefcase />}>
                <div className="flex items-center gap-3">
                  <UserAvatar name={staffName(c.assignedTo)} className="size-10" />
                  <div>
                    <p className="text-sm font-semibold">{staffName(c.assignedTo)}</p>
                    <p className="text-xs text-muted-foreground">Visa Consultant · since {formatDate(c.createdAt)}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Customer Portal" icon={<MonitorSmartphone />} description="See exactly what this customer sees.">
                <Button variant="gold" className="w-full" onClick={() => switchRole("Customer", c.id)}>
                  <Eye /> View as customer
                </Button>
              </SectionCard>

              <SectionCard title="Recent Activity">
                <ActivityFeed items={acts} limit={5} />
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications">
          {apps.length === 0 ? (
            <Card>
              <EmptyState
                icon={Plane}
                title="No applications found"
                description="Create a visa application to generate the document checklist."
                action={
                  <Button onClick={() => modals.open("application", { customerId: c.id })}>
                    <FilePlus2 /> New Application
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {apps.map((a) => (
                <Link key={a.id} to={`/app/applications/${a.id}`}>
                  <Card className="group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-primary">{a.id}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {country(a.countryCode)?.name} · {visaLabel(a.visaTypeId)}
                        </p>
                      </div>
                      <span className="text-2xl">{country(a.countryCode)?.flag}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <StatusBadge status={a.status} />
                      {a.decision && <StatusBadge status={a.decision} />}
                    </div>
                    <Progress value={appProgress(a.status)} className="mt-3" />
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>Travel {formatDate(a.travelDate)}</span>
                      <span>{staffName(a.consultantId)}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold">All documents</p>
              <Button size="sm" onClick={() => modals.open("upload", { customerId: c.id, applicationId: current?.id })}>
                <Upload /> Upload Document
              </Button>
            </div>
            {docs.length === 0 ? (
              <EmptyState icon={FileText} title="No documents uploaded" description="Upload passport, bank statements and other supporting documents." />
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Application</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {docs.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <FileText className="size-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{d.name}</p>
                                <p className="text-xs text-muted-foreground">{d.fileName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-[13px]">{d.applicationId ?? "—"}</TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{formatDate(d.uploadedAt)}</TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{formatDate(d.expiry)}</TableCell>
                          <TableCell>
                            <StatusBadge status={d.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => modals.open("document", { docId: d.id })}>
                              <Eye /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <MobileList>
                  {docs.map((d) => (
                    <MobileCard key={d.id} title={d.name} subtitle={`${d.applicationId ?? "—"} · ${formatDate(d.uploadedAt)}`} badge={<StatusBadge status={d.status} />} onClick={() => modals.open("document", { docId: d.id })} />
                  ))}
                </MobileList>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold">
                Payments · <span className="text-muted-foreground">{formatLKR(paid)} received</span>
              </p>
              <Button size="sm" onClick={() => modals.open("payment", { customerId: c.id, applicationId: current?.id })}>
                <CreditCard /> Add Payment
              </Button>
            </div>
            {pays.length === 0 ? (
              <EmptyState icon={CreditCard} title="No payments recorded" />
            ) : (
              <div className="divide-y divide-border">
                {pays.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf3e1] text-[#8a6412]">
                      <CreditCard className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {p.description} <span className="text-xs text-muted-foreground">· {p.id}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.date)} · {p.method} {p.applicationId ? `· ${p.applicationId}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold tabular">{formatLKR(p.amount)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices">
          {invs.length === 0 ? (
            <Card>
              <EmptyState icon={Receipt} title="No invoices" description="Invoices are generated automatically when an application is created." />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {invs.map((i) => {
                const t = invoiceTotals(i, store.payments);
                return (
                  <Card key={i.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{i.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.applicationId} · {formatDate(i.date)}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <dl className="mt-4 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total</dt>
                        <dd className="font-medium tabular">{formatLKR(t.total)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Paid</dt>
                        <dd className="text-[#177245] tabular">{formatLKR(t.paid)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Balance</dt>
                        <dd className="font-semibold tabular">{formatLKR(t.balance)}</dd>
                      </div>
                    </dl>
                    <Progress value={t.total ? (t.paid / t.total) * 100 : 0} className="mt-3 h-1.5" />
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => modals.open("invoice", { invoiceId: i.id })}>
                      <Eye /> Preview Invoice
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold">Appointments</p>
              <Button size="sm" onClick={() => modals.open("appointment", { customerId: c.id, applicationId: current?.id })}>
                <CalendarPlus /> Schedule
              </Button>
            </div>
            {appts.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No appointments" />
            ) : (
              <div className="divide-y divide-border">
                {appts.map((a) => (
                  <button key={a.id} onClick={() => modals.open("appointment", { appointment: a })} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f9fbfa]">
                    <div className="flex w-12 flex-col items-center rounded-lg bg-[#eef6f2] py-1.5 text-primary">
                      <span className="text-[10px] font-semibold uppercase">{parseDate(a.date).toLocaleDateString("en", { month: "short" })}</span>
                      <span className="font-display text-lg leading-none font-bold">{parseDate(a.date).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.time} · {a.location} · {staffName(a.staffId)}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <MessageThread customerId={c.id} as="staff" />
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-5 sm:p-6">
            <ActivityFeed items={acts} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
