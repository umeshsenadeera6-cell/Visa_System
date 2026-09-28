import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/store/store";
import { formatLKR } from "@/lib/utils";
import { PageHero } from "./PublicLayout";
import { SERVICES, SectionTitle } from "./content";

export default function Services() {
  const store = useStore();
  return (
    <>
      <PageHero eyebrow="Visa services" title="Expert support for every type of visa" subtitle="From a two-week holiday to a multi-year work permit, we manage the paperwork so you can focus on the journey." />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {SERVICES.map((s) => {
            const types = store.visaTypes.filter((v) => v.category === s.cat && v.status === "Active");
            const from = types.length ? Math.min(...types.map((t) => t.fee)) : 0;
            return (
              <Card key={s.title} className="group flex flex-col p-6 transition hover:shadow-[var(--shadow-lift)] sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef6f2] text-primary">
                    <s.icon className="size-6" />
                  </span>
                  {from > 0 && <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-[#7a5a14]">from {formatLKR(from)}</span>}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {types.map((t) => (
                    <span key={t.id} className="rounded-md bg-muted px-2 py-1 text-xs">
                      {store.countries.find((c) => c.code === t.countryCode)?.flag} {t.countryCode === "AE" ? "Dubai" : t.countryCode}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" className="mt-auto -ml-3 w-fit pt-4 text-primary" asChild>
                  <Link to="/visa-requirements">
                    View requirements <ArrowRight />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <SectionTitle eyebrow="Included" title="What every service package includes" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {["Eligibility assessment", "Personalised document checklist", "Document review & verification", "Form preparation", "Appointment booking", "Interview preparation", "Live tracking in client portal", "Passport collection support"].map((x) => (
              <li key={x} className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-sm font-medium">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3.5" />
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
