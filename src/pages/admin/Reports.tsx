import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe2,
  Plane,
  Stamp,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
  Wallet,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/DataTable";
import { SectionCard } from "@/components/shared/SectionCard";
import { ChartSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChartTooltip, CHART, axisProps } from "@/components/shared/ChartTooltip";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useStore } from "@/store/store";
import { CONSULTANT_IDS } from "@/data/mock";
import { LEAD_SOURCES, VISA_CATEGORIES } from "@/lib/domain";
import { cn, downloadCSV, formatLKR, formatNumber } from "@/lib/utils";
import type { VisaCategory } from "@/data/types";

/* Synthetic historical dataset (deterministic) so every filter meaningfully changes charts. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const COUNTRIES = ["UK", "AU", "CA", "JP", "US", "AE", "SG"];
const COUNTRY_W = [124, 98, 76, 54, 62, 89, 44];
const CAT_W: Record<VisaCategory, number> = { Tourist: 44, Business: 16, Student: 14, Work: 12, "Family Visit": 8, Dependent: 3, Transit: 1, Medical: 2 };
const STATUSES = ["Approved", "Rejected", "In Progress", "Documents Pending"] as const;

interface Rec {
  month: number;
  country: string;
  cat: VisaCategory;
  staff: string;
  status: (typeof STATUSES)[number];
  revenue: number;
  days: number;
  source: string;
  converted: boolean;
}

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}
const weighted = <T,>(items: T[], weights: number[], r: number) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = r * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
};
const DATA: Rec[] = (() => {
  const r = rng(42);
  const out: Rec[] = [];
  const perMonth = [34, 38, 45, 41, 50, 57, 53, 61, 66];
  perMonth.forEach((n, m) => {
    for (let i = 0; i < n; i++) {
      const cat = weighted(Object.keys(CAT_W) as VisaCategory[], Object.values(CAT_W), r());
      const st = m < 7 ? weighted([...STATUSES], [78, 8, 10, 4], r()) : weighted([...STATUSES], [40, 4, 40, 16], r());
      out.push({
        month: m,
        country: weighted(COUNTRIES, COUNTRY_W, r()),
        cat,
        staff: CONSULTANT_IDS[Math.floor(r() * 3)],
        status: st,
        revenue: Math.round((cat === "Work" ? 260000 : cat === "Student" ? 210000 : cat === "Business" ? 115000 : 95000) * (0.8 + r() * 0.5)),
        days: Math.round(12 + r() * 30 + (cat === "Work" ? 25 : 0)),
        source: weighted([...LEAD_SOURCES], [26, 18, 14, 16, 9, 10, 5, 2], r()),
        converted: r() > 0.42,
      });
    }
  });
  return out;
})();

const REPORTS = [
  { key: "applications", title: "Applications Report", desc: "Volume and outcomes over time", icon: Plane },
  { key: "customers", title: "Customer Report", desc: "New customers and sources", icon: Users },
  { key: "revenue", title: "Revenue Report", desc: "Collections by month & visa", icon: Wallet },
  { key: "leads", title: "Lead Conversion", desc: "Funnel and source performance", icon: UserCheck },
  { key: "country", title: "Country Performance", desc: "Volume & approval by destination", icon: Globe2 },
  { key: "visa", title: "Visa Type Performance", desc: "Demand and success by category", icon: Stamp },
  { key: "staff", title: "Staff Performance", desc: "Consultant productivity", icon: UsersRound },
  { key: "documents", title: "Document Report", desc: "Verification pipeline status", icon: FileText },
] as const;
type ReportKey = (typeof REPORTS)[number]["key"];

const RANGE = [
  { value: "q1", label: "Q1 (Jan – Mar)", months: [0, 1, 2] },
  { value: "q2", label: "Q2 (Apr – Jun)", months: [3, 4, 5] },
  { value: "q3", label: "Q3 (Jul – Sep)", months: [6, 7, 8] },
  { value: "3m", label: "Last 3 months", months: [6, 7, 8] },
  { value: "6m", label: "Last 6 months", months: [3, 4, 5, 6, 7, 8] },
];
const PALETTE = [CHART.c1, CHART.c2, CHART.c3, CHART.c4, CHART.c5];

export default function Reports() {
  const store = useStore();
  const [report, setReport] = useState<ReportKey>("applications");
  const [f, setF] = useState({ range: "all", country: "all", visa: "all", staff: "all", status: "all" });
  const loading = useFakeLoading(500, [report, f.range, f.country, f.visa, f.staff, f.status]);
  const staffName = (id: string) => store.staff.find((s) => s.id === id)?.name ?? id;
  const countryName = (c: string) => (c === "AE" ? "Dubai" : c === "US" ? "USA" : (store.countries.find((x) => x.code === c)?.name.replace("United Kingdom", "UK") ?? c));

  const data = useMemo(() => {
    const months = f.range === "all" ? null : RANGE.find((r) => r.value === f.range)!.months;
    return DATA.filter(
      (d) =>
        (!months || months.includes(d.month)) &&
        (f.country === "all" || d.country === f.country) &&
        (f.visa === "all" || d.cat === f.visa) &&
        (f.staff === "all" || d.staff === f.staff) &&
        (f.status === "all" || d.status === f.status),
    );
  }, [f]);
  const monthsShown = f.range === "all" ? MONTHS.map((_, i) => i) : RANGE.find((r) => r.value === f.range)!.months;

  const decided = data.filter((d) => d.status === "Approved" || d.status === "Rejected");
  const approvalRate = decided.length ? (data.filter((d) => d.status === "Approved").length / decided.length) * 100 : 0;
  const revenue = data.reduce((s, d) => s + d.revenue, 0);
  const avgDays = data.length ? data.reduce((s, d) => s + d.days, 0) / data.length : 0;

  const byMonth = monthsShown.map((m) => {
    const list = data.filter((d) => d.month === m);
    return {
      month: MONTHS[m],
      applications: list.length,
      approved: list.filter((d) => d.status === "Approved").length,
      revenue: Math.round(list.reduce((s, d) => s + d.revenue, 0) / 100000) / 10,
      customers: Math.round(list.length * 0.82),
      leads: Math.round(list.length * 1.9),
    };
  });
  const group = <K extends keyof Rec>(key: K, keys: string[]) =>
    keys
      .map((k) => {
        const list = data.filter((d) => d[key] === k);
        const dec = list.filter((d) => d.status === "Approved" || d.status === "Rejected");
        return {
          key: k,
          applications: list.length,
          approved: list.filter((d) => d.status === "Approved").length,
          rejected: list.filter((d) => d.status === "Rejected").length,
          approval: dec.length ? Math.round((list.filter((d) => d.status === "Approved").length / dec.length) * 100) : 0,
          revenue: list.reduce((s, d) => s + d.revenue, 0),
          days: list.length ? Math.round(list.reduce((s, d) => s + d.days, 0) / list.length) : 0,
          converted: list.filter((d) => d.converted).length,
        };
      })
      .filter((g) => g.applications > 0);

  const byCountry = group("country", COUNTRIES).map((g) => ({ ...g, name: countryName(g.key) }));
  const byCat = group("cat", [...VISA_CATEGORIES]).map((g) => ({ ...g, name: g.key }));
  const byStaff = group("staff", CONSULTANT_IDS).map((g) => ({ ...g, name: staffName(g.key) }));
  const bySource = group("source", [...LEAD_SOURCES]).map((g) => ({ ...g, name: g.key, leads: Math.round(g.applications * 1.9) }));
  const byStatus = STATUSES.map((s, i) => ({ name: s, value: data.filter((d) => d.status === s).length, color: [CHART.c1, CHART.c4, CHART.c3, CHART.c2][i] })).filter((x) => x.value > 0);
  const totalLeads = Math.round(data.length * 1.9);
  const funnel = [
    { name: "Leads", value: totalLeads },
    { name: "Contacted", value: Math.round(totalLeads * 0.78) },
    { name: "Consultation", value: Math.round(totalLeads * 0.61) },
    { name: "Documents Requested", value: Math.round(totalLeads * 0.49) },
    { name: "Converted", value: data.length },
  ];
  const docStats = ["Verified", "Uploaded", "Under Review", "Re-upload Required", "Rejected", "Pending"].map((s, i) => ({
    name: s,
    value: store.documents.filter((d) => d.status === s && (f.country === "all" || store.applications.find((a) => a.id === d.applicationId)?.countryCode === f.country)).length,
    color: PALETTE[i % 5],
  }));

  const activeFilters = Object.values(f).filter((v) => v !== "all").length;
  const current = REPORTS.find((r) => r.key === report)!;

  /* table for current report */
  const table: { cols: string[]; rows: (string | number)[][] } = (() => {
    switch (report) {
      case "applications":
        return { cols: ["Month", "Applications", "Approved", "Approval %"], rows: byMonth.map((m) => [m.month, m.applications, m.approved, m.applications ? `${Math.round((m.approved / m.applications) * 100)}%` : "—"]) };
      case "customers":
        return { cols: ["Source", "Customers", "Share"], rows: bySource.map((s) => [s.name, Math.round(s.applications * 0.82), `${Math.round((s.applications / Math.max(data.length, 1)) * 100)}%`]) };
      case "revenue":
        return { cols: ["Visa Type", "Applications", "Revenue", "Avg. per file"], rows: byCat.map((c) => [c.name, c.applications, formatLKR(c.revenue), formatLKR(Math.round(c.revenue / c.applications))]) };
      case "leads":
        return { cols: ["Source", "Leads", "Converted", "Conversion %"], rows: bySource.map((s) => [s.name, s.leads, s.applications, `${Math.round((s.applications / Math.max(s.leads, 1)) * 100)}%`]) };
      case "country":
        return { cols: ["Country", "Applications", "Approved", "Rejected", "Approval %", "Avg. days"], rows: byCountry.map((c) => [c.name, c.applications, c.approved, c.rejected, `${c.approval}%`, c.days]) };
      case "visa":
        return { cols: ["Visa Type", "Applications", "Approval %", "Avg. days", "Revenue"], rows: byCat.map((c) => [c.name, c.applications, `${c.approval}%`, c.days, formatLKR(c.revenue)]) };
      case "staff":
        return { cols: ["Consultant", "Applications", "Approved", "Approval %", "Revenue"], rows: byStaff.map((s) => [s.name, s.applications, s.approved, `${s.approval}%`, formatLKR(s.revenue)]) };
      case "documents":
        return { cols: ["Status", "Documents", "Share"], rows: docStats.map((d) => [d.name, d.value, `${Math.round((d.value / Math.max(store.documents.length, 1)) * 100)}%`]) };
    }
  })();

  const exportCsv = () => {
    downloadCSV(`${report}-report.csv`, table.rows.map((r) => Object.fromEntries(table.cols.map((c, i) => [c, r[i]]))));
    toast.success("CSV exported.", { description: `${current.title} · ${table.rows.length} rows` });
  };

  const chart = (() => {
    const h = "h-[300px]";
    switch (report) {
      case "applications":
        return (
          <div className={h}>
            <ResponsiveContainer>
              <LineChart data={byMonth} margin={{ top: 8, right: 8, left: -16 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="applications" name="Applications" stroke={CHART.c1} strokeWidth={2} dot={{ r: 3 }} />
                <Line dataKey="approved" name="Approved" stroke={CHART.c2} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "customers":
        return (
          <div className={h}>
            <ResponsiveContainer>
              <BarChart data={byMonth} margin={{ top: 8, right: 8, left: -16 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f7f5" }} />
                <Bar dataKey="customers" name="New customers" fill={CHART.c1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "revenue":
        return (
          <div className={h}>
            <ResponsiveContainer>
              <AreaChart data={byMonth} margin={{ top: 8, right: 8, left: -16 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.c1} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={CHART.c1} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v) => `${v}M`} />
                <Tooltip content={<ChartTooltip formatter={(v) => `LKR ${v}M`} />} />
                <Area dataKey="revenue" name="Revenue" stroke={CHART.c1} strokeWidth={2} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      case "leads":
        return (
          <div className={h}>
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical" margin={{ top: 8, right: 24, left: 40 }}>
                <CartesianGrid stroke={CHART.grid} horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="name" {...axisProps} width={120} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f7f5" }} />
                <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} barSize={26}>
                  {funnel.map((_, i) => (
                    <Cell key={i} fill={i === funnel.length - 1 ? CHART.c2 : CHART.c1} fillOpacity={1 - i * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "country":
      case "visa":
      case "staff": {
        const d = report === "country" ? byCountry : report === "visa" ? byCat : byStaff;
        return (
          <div className={h}>
            <ResponsiveContainer>
              <BarChart data={d} margin={{ top: 8, right: 8, left: -16 }} barGap={2}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" {...axisProps} interval={0} tickFormatter={(v: string) => (v.length > 12 ? v.split(" ")[0] : v)} />
                <YAxis {...axisProps} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f7f5" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="applications" name="Applications" fill={CHART.c1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill={CHART.c2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
      case "documents":
        return (
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div className="mx-auto h-[260px] w-[260px]">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie animationBegin={0} data={docStats.filter((d) => d.value)} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                    {docStats
                      .filter((d) => d.value)
                      .map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {docStats.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm" style={{ background: d.color }} /> {d.name}
                  </span>
                  <span className="font-semibold tabular">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        );
    }
  })();

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analyse performance across destinations, visa types, staff and revenue."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <FileSpreadsheet /> Export CSV
            </Button>
            <Button onClick={() => toast.info("PDF report generation will be available after backend integration.")}>
              <Download /> Export PDF
            </Button>
          </>
        }
      />

      {/* Report cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setReport(r.key)}
            className={cn(
              "group flex items-start gap-3 rounded-2xl border bg-card p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5",
              report === r.key ? "border-primary ring-2 ring-primary/10" : "border-border/80 hover:border-[#cfd8d3]",
            )}
          >
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl transition", report === r.key ? "bg-primary text-white" : "bg-[#eef6f2] text-primary")}>
              <r.icon className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] leading-tight font-semibold">{r.title}</span>
              <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{r.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-5 p-3 sm:p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="size-4" /> Filters
          </span>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <FilterSelect label="Dates" value={f.range} onChange={(v) => setF((x) => ({ ...x, range: v }))} options={RANGE.map((r) => ({ value: r.value, label: r.label }))} />
            <FilterSelect label="Countries" value={f.country} onChange={(v) => setF((x) => ({ ...x, country: v }))} options={COUNTRIES.map((c) => ({ value: c, label: countryName(c) }))} />
            <FilterSelect label="Visa Types" value={f.visa} onChange={(v) => setF((x) => ({ ...x, visa: v }))} options={[...VISA_CATEGORIES]} />
            <FilterSelect label="Staff" value={f.staff} onChange={(v) => setF((x) => ({ ...x, staff: v }))} options={CONSULTANT_IDS.map((id) => ({ value: id, label: staffName(id) }))} />
            <FilterSelect label="Statuses" value={f.status} onChange={(v) => setF((x) => ({ ...x, status: v }))} options={[...STATUSES]} />
          </div>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" className="lg:ml-auto" onClick={() => setF({ range: "all", country: "all", visa: "all", staff: "all", status: "all" })}>
              <RotateCcw /> Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Applications", value: formatNumber(data.length), icon: BarChart3 },
          { label: "Approval rate", value: `${approvalRate.toFixed(1)}%`, icon: CheckCircle2 },
          { label: "Revenue", value: formatLKR(revenue, true), icon: TrendingUp },
          { label: "Avg. processing", value: `${avgDays.toFixed(0)} days`, icon: Clock },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef6f2] text-primary">
              <s.icon className="size-5" />
            </span>
            <span>
              <span className="block font-display text-xl font-bold tabular">{s.value}</span>
              <span className="block text-xs text-muted-foreground">{s.label}</span>
            </span>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ChartSkeleton height={300} />
          </div>
          <ChartSkeleton height={300} />
        </div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState icon={BarChart3} title="No data for these filters" description="Try widening the date range or clearing some filters." action={<Button variant="outline" onClick={() => setF({ range: "all", country: "all", visa: "all", staff: "all", status: "all" })}>Reset filters</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard className="xl:col-span-2" title={current.title} description={current.desc}>
            {chart}
          </SectionCard>
          <SectionCard title="Outcome mix" description="Share of applications by status">
            <div className="relative mx-auto h-[200px] w-[200px]">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie animationBegin={0} data={byStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                    {byStatus.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-xl font-bold tabular">{data.length}</p>
                <p className="text-[11px] text-muted-foreground">files</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {byStatus.map((d) => (
                <li key={d.name} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm" style={{ background: d.color }} /> {d.name}
                  </span>
                  <span className="font-medium tabular">{Math.round((d.value / data.length) * 100)}%</span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard
            className="xl:col-span-3"
            title="Detailed breakdown"
            bodyClassName="px-0 pb-0"
            action={
              <Button variant="ghost" size="sm" onClick={exportCsv}>
                <Download /> CSV
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  {table.cols.map((c, i) => (
                    <TableHead key={c} className={i > 0 ? "text-right" : ""}>
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map((r) => (
                  <TableRow key={String(r[0])}>
                    {r.map((v, i) => (
                      <TableCell key={i} className={i > 0 ? "text-right tabular" : "font-medium"}>
                        {v}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
