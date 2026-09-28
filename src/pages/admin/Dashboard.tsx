import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileWarning,
  MapPin,
  Phone,
  Plane,
  UserPlus,
  Users,
  Wallet,
  MessageCircle,
  Mail,
  CalendarCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { PriorityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CountryLabel } from "@/components/shared/Country";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChartSkeleton, KpiSkeleton } from "@/components/shared/Skeletons";
import { ChartTooltip, CHART, axisProps } from "@/components/shared/ChartTooltip";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useLookups, useStore } from "@/store/store";
import { applicationsSeed, customersSeed, documentsSeed, leadsSeed, monthlyApplications, monthlyRevenue, paymentsSeed } from "@/data/mock";
import { formatDate, formatLKR, formatNumber, formatShortDate, parseDate, todayISO } from "@/lib/utils";
import { stageIndex } from "@/lib/domain";
import type { Application, DocumentItem, Payment } from "@/data/types";
import { useModals } from "@/components/modals/context";

/* Headline numbers = historical base + live mock state, so creating records moves the KPIs. */
const isActive = (a: Application) => stageIndex(a.status) < 11;
const isPendingDoc = (d: DocumentItem) => ["Pending", "Uploaded", "Under Review", "Re-upload Required"].includes(d.status);
const pendingAmt = (ps: Payment[]) => ps.filter((p) => p.status !== "Paid" && p.status !== "Refunded").reduce((s, p) => s + p.amount, 0);
const BASE = {
  customers: 1248 - customersSeed.length,
  leads: 86 - leadsSeed.filter((l) => l.status === "New" || l.status === "Contacted").length,
  active: 324 - applicationsSeed.filter(isActive).length,
  docs: 47 - documentsSeed.filter(isPendingDoc).length,
  approved: 186 - applicationsSeed.filter((a) => a.decision === "Approved").length,
  pending: 2_400_000 - pendingAmt(paymentsSeed),
};

const RANGES = {
  today: { label: "Today", cmp: "from yesterday", factor: 0.4 },
  week: { label: "Last 7 days", cmp: "from previous week", factor: 0.7 },
  month: { label: "This month", cmp: "from last month", factor: 1 },
  quarter: { label: "This quarter", cmp: "from last quarter", factor: 1.2 },
  year: { label: "This year", cmp: "from last year", factor: 1.6 },
} as const;
type RangeKey = keyof typeof RANGES;

export default function Dashboard() {
  const store = useStore();
  const { customerName, staffName, country, visaLabel } = useLookups();
  const navigate = useNavigate();
  const modals = useModals();
  const [range, setRange] = useState<RangeKey>("month");
  const loading = useFakeLoading(650, [range]);
  const today = todayISO();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const who = store.session?.role === "Admin" ? "Admin" : (store.session?.name.split(" ")[0] ?? "there");

  const kpi = useMemo(() => {
    return {
      customers: BASE.customers + store.customers.length,
      leads: BASE.leads + store.leads.filter((l) => l.status === "New" || l.status === "Contacted").length,
      active: BASE.active + store.applications.filter(isActive).length,
      docs: Math.max(0, BASE.docs + store.documents.filter(isPendingDoc).length),
      approved: BASE.approved + store.applications.filter((a) => a.decision === "Approved").length,
      pending: Math.max(0, BASE.pending + pendingAmt(store.payments)),
    };
  }, [store.customers, store.leads, store.applications, store.documents, store.payments]);

  const f = RANGES[range].factor;
  const byCountry = useMemo(
    () =>
      ["UK", "AU", "CA", "JP", "US", "AE", "SG"].map((code) => {
        const c = country(code);
        return {
          name: code === "AE" ? "Dubai" : code === "US" ? "USA" : (c?.name.replace("United Kingdom", "UK") ?? code),
          applications: (c?.historicalApplications ?? 0) + store.applications.filter((a) => a.countryCode === code).length,
        };
      }),
    [store.applications, country],
  );

  const statusData = useMemo(() => {
    const live = store.applications;
    const s = (from: number, to: number) => live.filter((a) => stageIndex(a.status) >= from && stageIndex(a.status) <= to && !a.decision).length;
    return [
      { name: "Documents Pending", value: 58 + s(0, 3), color: CHART.c2 },
      { name: "Processing", value: 41 + s(4, 6), color: CHART.c3 },
      { name: "Submitted", value: 94 + s(7, 10), color: CHART.c5 },
      { name: "Approved", value: 184 + live.filter((a) => a.decision === "Approved").length, color: CHART.c1 },
      { name: "Rejected", value: 20 + live.filter((a) => a.decision === "Rejected").length, color: CHART.c4 },
    ];
  }, [store.applications]);
  const statusTotal = statusData.reduce((s, d) => s + d.value, 0);

  const todaysFollowUps = store.followUps.filter((x) => x.status === "Pending" && x.dueDate <= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = store.appointments
    .filter((a) => a.date >= today && a.status !== "Cancelled" && a.status !== "Completed")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);
  const recentApps = [...store.applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const recentPayments = [...store.payments].sort((a, b) => b.date.localeCompare(a.date)).filter((p) => p.date <= today).slice(0, 6);

  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-[28px]">
            {greeting}, {who} <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_1]">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your visa applications today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <SelectTrigger className="h-10 w-full rounded-xl sm:w-44" aria-label="Date range">
              <CalendarDays className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RANGES).map(([k, r]) => (
                <SelectItem key={k} value={k}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="h-10 rounded-xl" onClick={() => modals.open("application")}>
            <Plane /> <span className="hidden sm:inline">New Application</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 sm:gap-4">
          <KpiCard icon={Users} label="Total Customers" value={formatNumber(kpi.customers)} trend={12.5 * f} comparison={RANGES[range].cmp} onClick={() => navigate("/app/customers")} />
          <KpiCard icon={UserPlus} label="New Leads" value={formatNumber(kpi.leads)} trend={8.2 * f} comparison={RANGES[range].cmp} accent="violet" onClick={() => navigate("/app/leads")} />
          <KpiCard icon={Plane} label="Active Applications" value={formatNumber(kpi.active)} trend={5.7 * f} comparison={RANGES[range].cmp} accent="blue" onClick={() => navigate("/app/applications")} />
          <KpiCard icon={FileWarning} label="Pending Documents" value={formatNumber(kpi.docs)} trend={-3.4 * f} invertTrend comparison={RANGES[range].cmp} accent="orange" onClick={() => navigate("/app/documents")} />
          <KpiCard icon={CheckCircle2} label="Approved" value={formatNumber(kpi.approved)} trend={15.3 * f} comparison={RANGES[range].cmp} accent="teal" />
          <KpiCard icon={Wallet} label="Pending Payments" value={formatLKR(kpi.pending, true)} trend={-6.1 * f} invertTrend comparison={RANGES[range].cmp} accent="gold" onClick={() => navigate("/app/payments")} />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <SectionCard
              className="xl:col-span-2"
              title="Visa Applications Overview"
              description="Applications received vs. approved, January – September"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/reports">
                    Reports <ArrowUpRight />
                  </Link>
                </Button>
              }
            >
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyApplications} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="month" {...axisProps} dy={6} />
                    <YAxis {...axisProps} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cfd8d3", strokeDasharray: "4 4" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="applications" name="Applications" stroke={CHART.c1} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} animationDuration={900} />
                    <Line type="monotone" dataKey="approved" name="Approved" stroke={CHART.c2} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} animationDuration={900} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Application Status" description="All applications this year">
              <div className="relative mx-auto h-[200px] w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie animationBegin={0} data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="#fff" strokeWidth={2} cornerRadius={4} animationDuration={900}>
                      {statusData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-display text-2xl font-bold tabular">{statusTotal}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {statusData.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-medium tabular">
                      {d.value} <span className="text-xs text-muted-foreground">({Math.round((d.value / statusTotal) * 100)}%)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <SectionCard title="Applications by Country" description="Year to date, all visa types">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCountry} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="name" {...axisProps} dy={6} interval={0} />
                    <YAxis {...axisProps} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f7f5" }} />
                    <Bar dataKey="applications" name="Applications" fill={CHART.c1} radius={[4, 4, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Monthly Revenue" description="Collected revenue in LKR millions">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART.c1} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={CHART.c1} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="month" {...axisProps} dy={6} />
                    <YAxis {...axisProps} tickFormatter={(v) => `${v}M`} />
                    <Tooltip content={<ChartTooltip formatter={(v) => `LKR ${v}M`} />} cursor={{ stroke: "#cfd8d3", strokeDasharray: "4 4" }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={CHART.c1} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {/* Lower section */}
      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Today's Follow-ups"
          description={`${todaysFollowUps.length} tasks due today or overdue`}
          bodyClassName="px-0 pb-0"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/follow-ups">
                View all <ArrowUpRight />
              </Link>
            </Button>
          }
        >
          {todaysFollowUps.length === 0 ? (
            <EmptyState compact icon={CheckCircle2} title="All caught up" description="No follow-ups due today." />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Visa</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysFollowUps.slice(0, 6).map((fu) => {
                      const app = store.applications.find((a) => a.id === fu.applicationId);
                      const overdue = fu.dueDate < today;
                      return (
                        <TableRow key={fu.id}>
                          <TableCell>
                            <Link to={`/app/customers/${fu.customerId}`} className="flex items-center gap-2.5">
                              <UserAvatar name={customerName(fu.customerId)} />
                              <div className="min-w-0">
                                <p className="font-medium hover:text-primary">{customerName(fu.customerId)}</p>
                                <p className="max-w-[220px] truncate text-xs text-muted-foreground">{fu.task}</p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>{app ? <CountryLabel code={app.countryCode} /> : "—"}</TableCell>
                          <TableCell>{app ? visaLabel(app.visaTypeId) : "—"}</TableCell>
                          <TableCell>
                            <span className={overdue ? "font-medium text-[#b4321f]" : ""}>{overdue ? `Overdue · ${formatShortDate(fu.dueDate)}` : "Today"}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{staffName(fu.assignedTo)}</TableCell>
                          <TableCell>
                            <PriorityBadge priority={fu.priority} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon-sm" aria-label="Call" onClick={() => toast.info(`Calling ${customerName(fu.customerId)}…`, { description: "Telephony integration is available after backend setup." })}>
                                {fu.channel === "WhatsApp" ? <MessageCircle /> : fu.channel === "Email" ? <Mail /> : <Phone />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  store.update("followUps", fu.id, { status: "Completed" });
                                  toast.success("Follow-up marked as done.");
                                }}
                              >
                                <CheckCircle2 /> Done
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {todaysFollowUps.slice(0, 5).map((fu) => (
                  <MobileCard
                    key={fu.id}
                    leading={<UserAvatar name={customerName(fu.customerId)} />}
                    title={customerName(fu.customerId)}
                    subtitle={fu.task}
                    badge={<PriorityBadge priority={fu.priority} />}
                    onClick={() => navigate(`/app/customers/${fu.customerId}`)}
                    meta={[
                      { label: "Due", value: fu.dueDate < today ? `Overdue · ${formatShortDate(fu.dueDate)}` : "Today" },
                      { label: "Assigned", value: staffName(fu.assignedTo) },
                    ]}
                  />
                ))}
              </MobileList>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming Appointments"
          description="Next scheduled visits"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/appointments">
                Calendar <ArrowUpRight />
              </Link>
            </Button>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState compact icon={CalendarCheck2} title="No upcoming appointments" />
          ) : (
            <ul className="space-y-2.5">
              {upcoming.map((a) => {
                const d = parseDate(a.date);
                return (
                  <li key={a.id} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-[#cfe0d7] hover:bg-[#f9fbfa]">
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-[#eef6f2] py-1.5 text-primary">
                      <span className="text-[10px] font-semibold uppercase">{d.toLocaleDateString("en", { month: "short" })}</span>
                      <span className="font-display text-lg leading-none font-bold">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{customerName(a.customerId)}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Clock3 className="size-3" /> {a.time} · {a.type}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {a.location}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Recent Applications"
          bodyClassName="px-0 pb-0"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/applications">
                View all <ArrowUpRight />
              </Link>
            </Button>
          }
        >
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApps.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => navigate(`/app/applications/${a.id}`)}>
                    <TableCell className="font-medium text-primary">{a.id}</TableCell>
                    <TableCell>{customerName(a.customerId)}</TableCell>
                    <TableCell>
                      <CountryLabel code={a.countryCode} short />
                    </TableCell>
                    <TableCell>{visaLabel(a.visaTypeId)}</TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatShortDate(a.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <MobileList>
            {recentApps.map((a) => (
              <MobileCard
                key={a.id}
                title={a.id}
                subtitle={`${customerName(a.customerId)} · ${country(a.countryCode)?.flag} ${visaLabel(a.visaTypeId)}`}
                badge={<StatusBadge status={a.status} />}
                onClick={() => navigate(`/app/applications/${a.id}`)}
              />
            ))}
          </MobileList>
        </SectionCard>

        <SectionCard
          title="Recent Payments"
          bodyClassName="px-0 pb-0"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/payments">
                View all <ArrowUpRight />
              </Link>
            </Button>
          }
        >
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={customerName(p.customerId)} className="size-7 text-[10px]" />
                        <span className="font-medium">{customerName(p.customerId)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular">{formatLKR(p.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.method}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <MobileList>
            {recentPayments.map((p) => (
              <MobileCard
                key={p.id}
                leading={<UserAvatar name={customerName(p.customerId)} />}
                title={customerName(p.customerId)}
                subtitle={`${p.method} · ${formatDate(p.date)}`}
                badge={
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular">{formatLKR(p.amount)}</p>
                    <StatusBadge status={p.status} className="mt-1" />
                  </div>
                }
              />
            ))}
          </MobileList>
        </SectionCard>
      </div>
    </div>
  );
}
