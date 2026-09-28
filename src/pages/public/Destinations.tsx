import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/store/store";
import { formatLKR } from "@/lib/utils";
import { PageHero } from "./PublicLayout";

export default function Destinations() {
  const store = useStore();
  return (
    <>
      <PageHero eyebrow="Countries" title="Destinations we specialise in" subtitle="Browse visa options, processing times and service fees for each country." />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-20 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
        {store.countries
          .filter((c) => c.status === "Active")
          .map((c) => {
            const types = store.visaTypes.filter((v) => v.countryCode === c.code && v.status === "Active");
            return (
              <Card key={c.code} className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className="relative flex h-32 items-end bg-gradient-to-br from-[#0e5a43] to-forest p-5">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <span className="absolute top-3 right-4 text-7xl transition-transform duration-500 group-hover:scale-110">{c.flag}</span>
                  <div className="relative text-white">
                    <p className="text-xs text-white/60">{c.region}</p>
                    <h3 className="font-display text-xl font-bold">{c.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <ul className="mt-4 divide-y divide-border">
                    {types.slice(0, 4).map((t) => (
                      <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-medium">{t.category}</span>
                        <span className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="hidden items-center gap-1 sm:flex">
                            <Clock className="size-3" /> {t.processingTime}
                          </span>
                          <span className="font-semibold text-foreground tabular">{formatLKR(t.fee)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/visa-requirements?country=${c.code}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Requirements <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
      </section>
    </>
  );
}
