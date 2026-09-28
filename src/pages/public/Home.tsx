import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Headphones,
  MessageSquareText,
  Quote,
  ShieldCheck,
  Star,
  Stamp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TravelArt } from "@/components/shared/TravelArt";
import { useStore } from "@/store/store";
import { formatLKR } from "@/lib/utils";
import { FAQS, FaqList, REVIEWS, SERVICES, SectionTitle } from "./content";

const DEST_GRADIENTS: Record<string, string> = {
  UK: "from-[#1d3557] to-[#0f2238]",
  AU: "from-[#b5651d] to-[#6f3a10]",
  CA: "from-[#9b2226] to-[#5a1215]",
  JP: "from-[#c05780] to-[#6d2a47]",
  US: "from-[#264653] to-[#12262e]",
  AE: "from-[#c9a14a] to-[#7a5a14]",
  SG: "from-[#0a7d57] to-[#0b3b2e]",
};

export default function Home() {
  const store = useStore();
  const minFee = (code: string) => Math.min(...store.visaTypes.filter((v) => v.countryCode === code).map((v) => v.fee));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest pt-18">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-40 -left-40 size-[560px] rounded-full bg-[#14815d] opacity-40 blur-[120px]" />
        <div className="absolute right-0 bottom-0 size-[420px] rounded-full bg-[#c9a14a] opacity-[0.16] blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[#e9cf8b] ring-1 ring-white/10">
              <Sparkles className="size-3.5" /> Trusted visa consultants in Colombo since 2019
            </span>
            <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold text-balance text-white sm:text-5xl lg:text-6xl">
              Your Journey Starts With the <span className="bg-gradient-to-r from-[#f0d894] to-[#c9a14a] bg-clip-text text-transparent">Right Visa Guidance.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">Professional visa consultation and application support for your international journey.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="gold" asChild>
                <Link to="/eligibility">
                  Check Visa Options <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/contact">Book a Consultation</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-white">
              {[
                ["12,000+", "applications handled"],
                ["92%", "approval rate*"],
                ["4.9/5", "client rating"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-[#e9cf8b]">{v}</p>
                  <p className="text-xs text-white/55">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/40">*Historical rate across completed files. Past outcomes don't guarantee future decisions.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <TravelArt className="w-full animate-float drop-shadow-2xl" />
            <Card className="absolute top-[8%] -left-2 w-56 border-0 p-3.5 shadow-2xl sm:-left-8">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#e7f4ee] text-primary">
                  <BadgeCheck className="size-5" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold">Visa approved</p>
                  <p className="text-[11px] text-muted-foreground">🇬🇧 UK Visitor · 2 min ago</p>
                </div>
              </div>
            </Card>
            <Card className="absolute right-0 bottom-[10%] w-60 border-0 p-4 shadow-2xl sm:-right-6">
              <p className="text-[11px] font-medium text-muted-foreground">SVS-UK-2026-00125</p>
              <p className="text-sm font-semibold">Under Processing</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8eeea]">
                <div className="h-full w-4/5 rounded-full bg-primary" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>8 of 10 steps</span>
                <span className="font-semibold text-foreground">80%</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="Why choose us" title="Visa support that is clear, careful and honest" subtitle="We combine experienced consultants with a modern client portal, so you always know what's next." center />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileSearch, t: "Document review", d: "Every file is checked against embassy requirements before submission." },
            { icon: ClipboardCheck, t: "Personal checklist", d: "A live checklist in your portal shows exactly what's missing." },
            { icon: CalendarCheck, t: "Appointments handled", d: "We book VFS, biometrics and interviews — and prepare you for them." },
            { icon: Headphones, t: "Real people, fast replies", d: "Chat with your consultant in the portal or on WhatsApp." },
          ].map((f) => (
            <Card key={f.t} className="group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#eef6f2] text-primary transition group-hover:bg-primary group-hover:text-white">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle eyebrow="Popular destinations" title="Where our clients are heading" />
            <Button variant="outline" asChild>
              <Link to="/destinations">
                All countries <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {store.countries.slice(0, 3).map((c, i) => (
              <Link
                key={c.code}
                to={`/visa-requirements?country=${c.code}`}
                className={`group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${DEST_GRADIENTS[c.code] ?? "from-forest to-black"} ${i === 0 ? "lg:col-span-2" : ""}`}
              >
                <div className="absolute inset-0 bg-grid opacity-30" />
                <span className="absolute top-5 right-5 text-[88px] leading-none opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">{c.flag}</span>
                <div className="relative">
                  <p className="text-xs text-white/70">{c.region}</p>
                  <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                  <p className="mt-1 text-sm text-white/75">
                    {store.visaTypes.filter((v) => v.countryCode === c.code).length} visa types · from {formatLKR(minFee(c.code))}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f0d894]">
                    View requirements <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="Visa services" title="Every visa category, one experienced team" center />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link key={s.title} to="/services" className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-[var(--shadow-soft)]">
              <s.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-forest py-20 text-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#e2c47c] uppercase">How it works</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Four steps from inquiry to passport collection</h2>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { icon: MessageSquareText, t: "Consultation", d: "Tell us your plans. We recommend the right visa and give you an honest assessment." },
              { icon: ClipboardCheck, t: "Documents", d: "Upload documents to your portal. We review and verify each one." },
              { icon: Stamp, t: "Submission", d: "We prepare the application, book appointments and submit on time." },
              { icon: ShieldCheck, t: "Decision", d: "Track progress live until your passport is returned." },
            ].map((s, i) => (
              <li key={s.t} className="relative rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
                <span className="font-display text-5xl font-extrabold text-white/10">0{i + 1}</span>
                <s.icon className="mt-2 size-6 text-[#e2c47c]" />
                <h3 className="mt-4 text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="Customer reviews" title="What travellers say about us" subtitle="Illustrative reviews for this demo website." center />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <Card key={r.name} className="relative p-6">
              <Quote className="absolute top-5 right-5 size-8 text-[#eef3f0]" />
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed">“{r.text}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#eef6f2] text-sm font-semibold text-primary">{r.name[0]}</span>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.trip}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionTitle eyebrow="FAQ" title="Questions we hear every day" subtitle="Can't find your answer? Our consultants are happy to help." />
            <Button className="mt-6" variant="outline" asChild>
              <Link to="/faq">
                All FAQs <ArrowRight />
              </Link>
            </Button>
          </div>
          <FaqList items={FAQS.slice(0, 4)} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e5a43] to-forest p-8 sm:p-14">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-[#c9a14a] opacity-20 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to plan your next journey?</h2>
              <p className="mt-3 text-white/70">Book a free 20-minute consultation and get a personalised document checklist.</p>
              <ul className="mt-5 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                {["No-obligation advice", "Transparent fees", "Live application tracking", "Colombo & online"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#e2c47c]" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="gold" asChild>
                <Link to="/contact">Book a Consultation</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/track">Track Application</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
