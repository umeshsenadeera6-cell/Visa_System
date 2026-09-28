import { useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  Globe2,
  HelpCircle,
  MapPin,
  Search,
  Stamp,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStore } from "@/store/store";
import { formatLKR } from "@/lib/utils";
import { downloadRequirementsPDF } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import type { Country, VisaType } from "@/data/types";

/* ─── level config ─────────────────────────────────────────── */
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

/* ─── Country hero card (left panel) ───────────────────────── */
function CountryCard({
  country,
  visaCount,
  isSelected,
  onClick,
}: {
  country: Country;
  visaCount: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`country-card-${country.code}`}
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300",
        isSelected
          ? "border-primary bg-gradient-to-br from-[#0f7a5a] to-[#0b5a42] text-white shadow-lg shadow-primary/20"
          : "border-border bg-white hover:border-primary/40 hover:shadow-md",
      )}
    >
      {/* Decorative blobs */}
      {isSelected && (
        <>
          <div className="pointer-events-none absolute -top-6 -right-6 size-20 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 size-16 rounded-full bg-white/5 blur-lg" />
        </>
      )}

      <div className="relative flex items-start gap-3">
        {/* Flag */}
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110",
            isSelected ? "bg-white/20" : "bg-[#eef6f2]",
          )}
        >
          {country.flag}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-[15px] font-bold leading-tight", isSelected ? "text-white" : "text-foreground")}>
            {country.name}
          </p>
          <p className={cn("mt-0.5 text-[12px]", isSelected ? "text-white/70" : "text-muted-foreground")}>
            <MapPin className="mr-0.5 inline size-3" />
            {country.capital} · {country.region}
          </p>

          {/* Stats row */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
              )}
            >
              <Stamp className="size-3" />
              {visaCount} visa type{visaCount !== 1 ? "s" : ""}
            </span>
            {country.successRate > 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                  isSelected ? "bg-white/20 text-white" : "bg-[#fffbec] text-[#8a6412]",
                )}
              >
                <TrendingUp className="size-3" />
                {country.successRate}% success
              </span>
            )}
          </div>
        </div>

        {isSelected && <ChevronRight className="mt-1 size-4 shrink-0 text-white/60" />}
      </div>
    </button>
  );
}

/* ─── Visa type detail card (right panel) ───────────────────── */
function VisaDetailCard({ vt, countryFlag }: { vt: VisaType; countryFlag: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const reqs = store.requirements[vt.id] ?? [];
  const required = reqs.filter((r) => r.level === "Required");
  const optional = reqs.filter((r) => r.level === "Optional");
  const conditional = reqs.filter((r) => r.level === "Conditional");
  const country = store.countries.find((c) => c.code === vt.countryCode);

  const handleDownload = () => {
    if (!country) return;
    downloadRequirementsPDF({ visaType: vt, country, requirements: reqs });
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300",
        open ? "border-primary/30 shadow-md" : "border-border hover:border-primary/20 hover:shadow-sm",
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Icon + name */}
        <div className="flex flex-1 items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eef6f2] to-[#d8ede6] text-2xl">
            {countryFlag}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[15px] font-bold">{vt.category} Visa</h3>
              <StatusBadge status={vt.status} />
            </div>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{vt.name}</p>
          </div>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Fee</p>
            <p className="font-display text-[22px] font-bold text-primary leading-tight">{formatLKR(vt.fee)}</p>
            {vt.governmentFee > 0 && (
              <p className="text-[11px] text-muted-foreground">+ {formatLKR(vt.governmentFee)} gov. fee</p>
            )}
          </div>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {[
          { icon: "⏱", label: "Processing", value: vt.processingTime },
          { icon: "📅", label: "Validity", value: vt.validity },
          { icon: "🔁", label: "Entry", value: vt.entry },
        ].map(({ icon, label, value }) => (
          <span key={label} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-[12.5px]">
            <span>{icon}</span>
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-semibold">{value}</span>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border bg-[#fafcfb] px-5 py-3">
        <button
          id={`toggle-requirements-${vt.id}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition",
            open ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <FileCheck2 className="size-4 shrink-0" />
          {reqs.length === 0
            ? "No documents listed yet"
            : `${reqs.length} document${reqs.length !== 1 ? "s" : ""} required`}
          {reqs.length > 0 && (
            open ? <ChevronDown className="ml-auto size-4" /> : <ChevronRight className="ml-auto size-4" />
          )}
        </button>
        {reqs.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            onClick={handleDownload}
            id={`download-pdf-${vt.id}`}
          >
            <Download className="size-3.5" />
            PDF
          </Button>
        )}
      </div>

      {/* Expanded requirements */}
      {open && reqs.length > 0 && (
        <div className="border-t border-border bg-[#f7faf9] px-5 py-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {required.length > 0 && <StatusBadge status={`${required.length} Required`} tone="emerald" />}
              {optional.length > 0 && <StatusBadge status={`${optional.length} Optional`} tone="slate" />}
              {conditional.length > 0 && <StatusBadge status={`${conditional.length} Conditional`} tone="gold" />}
            </div>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={handleDownload} id={`download-pdf-expanded-${vt.id}`}>
              <Download className="size-3.5" />
              Download PDF
            </Button>
          </div>

          <div className="space-y-4">
            {(["Required", "Optional", "Conditional"] as const).map((level) => {
              const items = reqs.filter((r) => r.level === level);
              if (items.length === 0) return null;
              const Icon = LEVEL_ICONS[level];
              return (
                <div key={level}>
                  <div className={cn("mb-2 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-wide", LEVEL_BG[level], LEVEL_COLORS[level])}>
                    <Icon className="size-3.5" />
                    {level} ({items.length})
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((r, i) => (
                      <li
                        key={r.id}
                        className="flex items-start gap-3 rounded-xl border border-border bg-white px-3.5 py-2.5 text-[13px] shadow-xs transition hover:border-primary/20"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold tabular">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{r.name}</p>
                          {r.note && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{r.note}</p>}
                        </div>
                        <span className="shrink-0 rounded-lg bg-muted px-2 py-0.5 text-[10.5px] text-muted-foreground">
                          {r.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function PortalVisaGuide() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const activeCountries = useMemo(
    () => store.countries.filter((c) => c.status === "Active"),
    [store.countries],
  );

  // visa counts per country (active only)
  const visaCountByCountry = useMemo(() => {
    const m: Record<string, number> = {};
    for (const vt of store.visaTypes) {
      if (vt.status === "Active") m[vt.countryCode] = (m[vt.countryCode] ?? 0) + 1;
    }
    return m;
  }, [store.visaTypes]);

  // countries that actually have active visas
  const countriesWithVisas = useMemo(
    () => activeCountries.filter((c) => (visaCountByCountry[c.code] ?? 0) > 0),
    [activeCountries, visaCountByCountry],
  );

  // auto-select first country if none selected
  const effectiveCountry = selectedCountry ?? countriesWithVisas[0]?.code ?? null;
  const selectedCountryObj = store.countries.find((c) => c.code === effectiveCountry);

  // filtered visa types for selected country
  const visaTypes = useMemo(() => {
    const q = search.toLowerCase();
    return store.visaTypes.filter((vt) => {
      if (vt.status === "Inactive") return false;
      if (effectiveCountry && vt.countryCode !== effectiveCountry) return false;
      if (q) {
        const haystack = `${vt.name} ${vt.category}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [store.visaTypes, effectiveCountry, search]);

  return (
    <div className="space-y-6">
      {/* ── Page hero ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f7a5a] to-[#0b5a42] p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 size-32 rounded-full bg-[#c9a14a]/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
              <Globe2 className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Visa Guide</h1>
              <p className="text-sm text-white/65">
                Select a destination to explore visa types, fees & required documents
              </p>
            </div>
          </div>

          {/* Stat chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: Globe2, label: `${countriesWithVisas.length} Destinations` },
              { icon: Stamp, label: `${store.visaTypes.filter((v) => v.status === "Active").length} Visa Types` },
              { icon: Star, label: "PDF Checklists Available" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-sm">
                <Icon className="size-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

        {/* Left: Country selector */}
        <div className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Select Destination
          </p>
          <div className="space-y-2.5">
            {countriesWithVisas.map((c) => (
              <CountryCard
                key={c.code}
                country={c}
                visaCount={visaCountByCountry[c.code] ?? 0}
                isSelected={c.code === effectiveCountry}
                onClick={() => {
                  setSelectedCountry(c.code);
                  setSearch("");
                }}
              />
            ))}
            {countriesWithVisas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No active destinations available.
              </div>
            )}
          </div>
        </div>

        {/* Right: Visa types for selected country */}
        <div className="space-y-4">
          {/* Country banner */}
          {selectedCountryObj && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
              <span className="text-4xl">{selectedCountryObj.flag}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-bold">{selectedCountryObj.name}</h2>
                <p className="text-[13px] text-muted-foreground line-clamp-2">{selectedCountryObj.description}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Currency</span>
                <span className="font-semibold text-[14px]">{selectedCountryObj.currency}</span>
              </div>
            </div>
          )}

          {/* Search within country */}
          {visaTypes.length > 1 && (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="visa-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search visa types in ${selectedCountryObj?.name ?? ""}…`}
                className="h-10 pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}

          {/* Visa type cards */}
          {visaTypes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white">
              <EmptyState
                icon={Stamp}
                title="No visa types found"
                description={search ? "Try a different search term." : "No active visa types for this destination."}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Section label */}
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {visaTypes.length} Visa Type{visaTypes.length !== 1 ? "s" : ""} Available
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>

              {visaTypes.map((vt) => (
                <VisaDetailCard
                  key={vt.id}
                  vt={vt}
                  countryFlag={selectedCountryObj?.flag ?? "🌍"}
                />
              ))}
            </div>
          )}

          {/* Pro tip */}
          {visaTypes.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#c7ddd5] bg-[#eef6f2] p-4">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-[13px] leading-relaxed text-[#1e4d38]">
                Click any visa card to expand the document checklist, then download it as a <strong>PDF</strong> to share or print.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
