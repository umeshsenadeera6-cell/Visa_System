import { useState, useMemo } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  Globe2,
  Search,
  Stamp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStore } from "@/store/store";
import { formatLKR } from "@/lib/utils";
import { downloadRequirementsPDF } from "@/lib/pdf";
import type { VisaType } from "@/data/types";

const LEVEL_ICONS = {
  Required: CheckCircle2,
  Optional: HelpCircle,
  Conditional: AlertCircle,
};
const LEVEL_COLORS = {
  Required: "text-emerald-600",
  Optional: "text-slate-500",
  Conditional: "text-amber-600",
};
const LEVEL_BG = {
  Required: "bg-emerald-50 border-emerald-200",
  Optional: "bg-slate-50 border-slate-200",
  Conditional: "bg-amber-50 border-amber-200",
};

function VisaCard({ vt, countryFlag }: { vt: VisaType; countryFlag: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const reqs = store.requirements[vt.id] ?? [];
  const required = reqs.filter((r) => r.level === "Required");
  const optional = reqs.filter((r) => r.level === "Optional");
  const conditional = reqs.filter((r) => r.level === "Conditional");
  const country = store.countries.find((c) => c.code === vt.countryCode);

  const handleDownload = () => {
    if (!country) return;
    downloadRequirementsPDF({
      visaType: vt,
      country,
      requirements: reqs,
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        {/* Flag + info */}
        <div className="flex flex-1 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef6f2] text-2xl">
            {countryFlag}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[15px] font-bold leading-tight">{vt.category} Visa</h3>
              <StatusBadge status={vt.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{vt.name}</p>
            {/* Meta chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "⏱ Processing", value: vt.processingTime },
                { label: "📅 Validity", value: vt.validity },
                { label: "🔁 Entry", value: vt.entry },
              ].map(({ label, value }) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[12px]">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="font-semibold">{value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fee + actions */}
        <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Service Fee</p>
            <p className="font-display text-xl font-bold text-foreground">{formatLKR(vt.fee)}</p>
            {vt.governmentFee > 0 && (
              <p className="text-[11px] text-muted-foreground">+ {formatLKR(vt.governmentFee)} gov. fee</p>
            )}
          </div>
          <div className="flex gap-2">
            {reqs.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                onClick={handleDownload}
                id={`download-pdf-${vt.id}`}
                aria-label={`Download PDF for ${vt.name}`}
              >
                <Download className="size-3.5" />
                PDF
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="gap-1"
              onClick={() => setOpen((o) => !o)}
              id={`toggle-requirements-${vt.id}`}
              aria-expanded={open}
              aria-label={`${open ? "Hide" : "Show"} requirements for ${vt.name}`}
            >
              {reqs.length === 0 ? (
                <span className="text-muted-foreground">No docs listed</span>
              ) : (
                <>
                  <FileCheck2 className="size-3.5" />
                  {reqs.length} docs
                  {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Requirements panel */}
      {open && reqs.length > 0 && (
        <div className="border-t border-border bg-[#fafcfb] px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground">Required Documents</p>
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={handleDownload}
              id={`download-pdf-expanded-${vt.id}`}
            >
              <Download className="size-3.5" />
              Download PDF
            </Button>
          </div>
          <div className="space-y-3">
            {(["Required", "Optional", "Conditional"] as const).map((level) => {
              const items = reqs.filter((r) => r.level === level);
              if (items.length === 0) return null;
              const Icon = LEVEL_ICONS[level];
              return (
                <div key={level}>
                  <div
                    className={`mb-1.5 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-wide ${LEVEL_BG[level]} ${LEVEL_COLORS[level]}`}
                  >
                    <Icon className="size-3.5" />
                    {level} ({items.length})
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {items.map((r, i) => (
                      <li
                        key={r.id}
                        className="flex items-start gap-2.5 rounded-xl border border-border bg-white px-3 py-2 text-[13px] shadow-xs"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold tabular">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{r.name}</p>
                          {r.note && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{r.note}</p>}
                        </div>
                        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                          {r.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          {/* Summary row */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
            <span className="text-[12px] text-muted-foreground">Summary:</span>
            {required.length > 0 && (
              <StatusBadge status={`${required.length} Required`} tone="emerald" />
            )}
            {optional.length > 0 && (
              <StatusBadge status={`${optional.length} Optional`} tone="slate" />
            )}
            {conditional.length > 0 && (
              <StatusBadge status={`${conditional.length} Conditional`} tone="gold" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalVisaGuide() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const activeCountries = useMemo(
    () => store.countries.filter((c) => c.status === "Active"),
    [store.countries],
  );

  const filteredVisaTypes = useMemo(() => {
    const q = search.toLowerCase();
    return store.visaTypes.filter((vt) => {
      if (vt.status === "Inactive") return false;
      if (selectedCountry !== "all" && vt.countryCode !== selectedCountry) return false;
      if (q) {
        const c = store.countries.find((x) => x.code === vt.countryCode);
        const haystack = `${vt.name} ${vt.category} ${c?.name ?? ""}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [store.visaTypes, store.countries, search, selectedCountry]);

  // Group by country
  const grouped = useMemo(() => {
    const map = new Map<string, { countryName: string; countryFlag: string; types: VisaType[] }>();
    for (const vt of filteredVisaTypes) {
      const c = store.countries.find((x) => x.code === vt.countryCode);
      if (!map.has(vt.countryCode)) {
        map.set(vt.countryCode, { countryName: c?.name ?? vt.countryCode, countryFlag: c?.flag ?? "🌍", types: [] });
      }
      map.get(vt.countryCode)!.types.push(vt);
    }
    return [...map.entries()].map(([code, v]) => ({ code, ...v }));
  }, [filteredVisaTypes, store.countries]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#eef6f2]">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-[26px]">Visa Guide</h1>
            <p className="text-sm text-muted-foreground">
              Browse available visa types, requirements &amp; fees
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <Card className="flex items-start gap-3 border-[#c7ddd5] bg-[#eef6f2] p-4 shadow-none">
        <Stamp className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-[13.5px] leading-relaxed text-[#1e4d38]">
          This guide shows all visa types our consultants currently offer. Click any visa card to expand the
          document checklist, or download it as a <strong>PDF</strong> to share or print. Your consultant will open
          an application once you're ready.
        </p>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="visa-guide-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visa types, countries…"
            className="h-10 pl-9"
            aria-label="Search visa types"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            id="filter-all-countries"
            onClick={() => setSelectedCountry("all")}
            className={`rounded-xl border px-3 py-1.5 text-[13px] font-medium transition ${
              selectedCountry === "all"
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            All
          </button>
          {activeCountries.map((c) => (
            <button
              key={c.code}
              id={`filter-country-${c.code}`}
              onClick={() => setSelectedCountry(c.code === selectedCountry ? "all" : c.code)}
              className={`rounded-xl border px-3 py-1.5 text-[13px] font-medium transition ${
                selectedCountry === c.code
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.flag} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {grouped.length === 0 ? (
        <Card>
          <EmptyState
            icon={Globe2}
            title="No visa types found"
            description={search ? "Try a different search term." : "No active visa types available right now."}
          />
        </Card>
      ) : (
        grouped.map(({ code, countryName, countryFlag, types }) => (
          <section key={code} aria-labelledby={`country-heading-${code}`}>
            {/* Country heading */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{countryFlag}</span>
              <div>
                <h2 id={`country-heading-${code}`} className="font-display text-[17px] font-bold">
                  {countryName}
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  <Clock className="mr-1 inline size-3" />
                  {types.length} visa type{types.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {types.map((vt) => (
                <VisaCard key={vt.id} vt={vt} countryFlag={countryFlag} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
