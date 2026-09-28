import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleDot, Clock, FileCheck2, Info, CalendarRange, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStore } from "@/store/store";
import { formatLKR } from "@/lib/utils";
import { PageHero } from "./PublicLayout";

export default function PublicRequirements() {
  const store = useStore();
  const [params] = useSearchParams();
  const [country, setCountry] = useState(params.get("country") ?? "UK");
  const types = store.visaTypes.filter((v) => v.countryCode === country && v.status === "Active");
  const [vtId, setVtId] = useState(types[0]?.id ?? "");
  const vt = store.visaTypes.find((v) => v.id === vtId);
  const reqs = store.requirements[vtId] ?? [];
  const c = store.countries.find((x) => x.code === country);

  return (
    <>
      <PageHero eyebrow="Visa requirements" title="Know exactly what documents you need" subtitle="Choose a destination and visa type to see the standard checklist our consultants use." />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <Card className="-mt-24 mb-8 p-5 shadow-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Select
                value={country}
                onValueChange={(v) => {
                  setCountry(v);
                  setVtId(store.visaTypes.find((x) => x.countryCode === v && x.status === "Active")?.id ?? "");
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {store.countries.map((x) => (
                    <SelectItem key={x.code} value={x.code}>
                      {x.flag} {x.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visa type</Label>
              <Select value={vtId} onValueChange={setVtId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.category} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {vt && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <Card className="p-6 page-enter" key={vtId}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{c?.flag}</span>
                <div>
                  <h2 className="text-xl font-bold">
                    {c?.name} {vt.category} Visa
                  </h2>
                  <p className="text-sm text-muted-foreground">{vt.name}</p>
                </div>
              </div>
              <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <FileCheck2 className="size-4 text-primary" /> Required Documents
              </h3>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {reqs.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 p-3.5">
                    <span className="flex gap-3">
                      {r.level === "Required" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <CircleDot className="mt-0.5 size-4 shrink-0 text-[#c2881c]" />}
                      <span>
                        <span className="block text-sm font-medium">{r.name}</span>
                        {r.note && <span className="block text-xs text-muted-foreground">{r.note}</span>}
                      </span>
                    </span>
                    <StatusBadge status={r.level} dot={false} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" /> Requirements can change and additional documents may be requested by the embassy. Your consultant will confirm the final checklist.
              </p>
            </Card>
            <div className="space-y-4">
              <Card className="space-y-4 p-5">
                {[
                  { i: Clock, l: "Processing time", v: vt.processingTime },
                  { i: CalendarRange, l: "Validity", v: `${vt.validity} · ${vt.entry} entry` },
                  { i: Wallet, l: "Service fee", v: formatLKR(vt.fee) },
                  { i: Wallet, l: "Government fee", v: vt.governmentFee ? formatLKR(vt.governmentFee) : "Included / none" },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-[#eef6f2] text-primary">
                      <x.i className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{x.l}</p>
                      <p className="text-sm font-semibold">{x.v}</p>
                    </div>
                  </div>
                ))}
              </Card>
              <Card className="bg-forest p-5 text-white">
                <p className="font-semibold">Not sure you qualify?</p>
                <p className="mt-1 text-sm text-white/70">Use our free eligibility checker for preliminary guidance.</p>
                <Button variant="gold" className="mt-4 w-full" asChild>
                  <Link to="/eligibility">Check eligibility</Link>
                </Button>
              </Card>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
