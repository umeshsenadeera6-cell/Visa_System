import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Field, FormGrid } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";
import { SERVICES } from "./content";
import { PageHero } from "./PublicLayout";

const STEPS = ["Destination", "Visa Type", "Personal Information", "Employment", "Financial Information", "Travel History", "Summary"];

type Answers = {
  destination: string;
  visa: string;
  name: string;
  age: string;
  email: string;
  phone: string;
  employment: string;
  employer: string;
  years: string;
  income: string;
  savings: string;
  sponsor: string;
  history: string[];
  refusals: string;
};

function Choice({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
        selected ? "border-primary bg-[#eef6f2] ring-2 ring-primary/15" : "border-border bg-card hover:border-[#c9d6cf] hover:bg-[#fafcfb]",
        className,
      )}
    >
      {children}
      {selected && (
        <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export default function Eligibility() {
  const store = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [a, setA] = useState<Answers>({ destination: "", visa: "", name: "", age: "", email: "", phone: "", employment: "", employer: "", years: "", income: "", savings: "", sponsor: "No", history: [], refusals: "No" });
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));

  const valid = [!!a.destination, !!a.visa, !!a.name && !!a.email, !!a.employment, !!a.income && !!a.savings, true, true][step];
  const country = store.countries.find((c) => c.code === a.destination);
  const next = () => {
    if (!valid) return toast.error("Please complete this step to continue.");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <>
      <PageHero eyebrow="Eligibility checker" title="See which visa options may suit you" subtitle="Answer a few questions for preliminary guidance from our consultants. It takes about 2 minutes." />
      <section className="mx-auto -mt-10 max-w-4xl px-4 pb-20 sm:px-6">
        <Card className="relative overflow-hidden shadow-2xl">
          {done ? (
            <div className="px-6 py-14 text-center sm:px-12 page-enter">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e7f4ee] text-primary">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Thank you, {a.name.split(" ")[0]}!</h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Your information has been submitted for preliminary guidance.</p>
              <div className="mx-auto mt-6 max-w-lg rounded-xl border border-[#f0e2bb] bg-[#fffaf0] p-4 text-left text-sm text-[#6b4d0c]">
                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  Final visa eligibility and decisions are determined by the relevant immigration authority. This checker does not guarantee approval.
                </p>
              </div>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="gold"
                  onClick={() => {
                    toast.success("Consultation requested.", { description: "A consultant will contact you within one business day." });
                    navigate("/contact");
                  }}
                >
                  Request a Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setDone(false);
                    setStep(0);
                  }}
                >
                  <RotateCcw /> Start again
                </Button>
              </div>
              <p className="mt-6 text-sm">
                <Link to={`/visa-requirements?country=${a.destination}`} className="text-primary hover:underline">
                  View the document requirements for {country?.name}
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-border p-5 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold">
                    Step {step + 1} of {STEPS.length}: <span className="text-primary">{STEPS[step]}</span>
                  </p>
                  <span className="text-muted-foreground tabular">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
                </div>
                <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1.5" />
                <ol className="mt-4 hidden gap-1 md:flex">
                  {STEPS.map((s, i) => (
                    <li key={s} className="flex-1">
                      <button
                        onClick={() => i < step && setStep(i)}
                        disabled={i > step}
                        className={cn("w-full truncate rounded-md px-1 py-1 text-[11px] font-medium", i === step ? "text-primary" : i < step ? "text-foreground hover:bg-muted" : "text-muted-foreground/60")}
                      >
                        {i < step ? "✓ " : ""}
                        {s}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              <div key={step} className="min-h-[340px] p-5 sm:p-8 page-enter">
                {step === 0 && (
                  <>
                    <h2 className="text-xl font-bold">Where would you like to go?</h2>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {store.countries.map((c) => (
                        <Choice key={c.code} selected={a.destination === c.code} onClick={() => set("destination", c.code)}>
                          <span className="text-3xl">{c.flag}</span>
                          <span className="text-sm font-medium">{c.name}</span>
                        </Choice>
                      ))}
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2 className="text-xl font-bold">What is the purpose of your trip?</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {SERVICES.filter((s) => store.visaTypes.some((v) => v.countryCode === a.destination && v.category === s.cat)).map((s) => (
                        <Choice key={s.cat} selected={a.visa === s.cat} onClick={() => set("visa", s.cat)}>
                          <s.icon className="size-5 shrink-0 text-primary" />
                          <span>
                            <span className="block text-sm font-semibold">{s.title}</span>
                            <span className="block text-xs text-muted-foreground">{s.desc}</span>
                          </span>
                        </Choice>
                      ))}
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <h2 className="text-xl font-bold">Tell us about yourself</h2>
                    <FormGrid className="mt-5">
                      <Field label="Full name" required>
                        <Input value={a.name} onChange={(e) => set("name", e.target.value)} />
                      </Field>
                      <Field label="Age">
                        <Input type="number" value={a.age} onChange={(e) => set("age", e.target.value)} />
                      </Field>
                      <Field label="Email" required>
                        <Input type="email" value={a.email} onChange={(e) => set("email", e.target.value)} />
                      </Field>
                      <Field label="Phone / WhatsApp">
                        <Input value={a.phone} onChange={(e) => set("phone", e.target.value)} />
                      </Field>
                    </FormGrid>
                  </>
                )}
                {step === 3 && (
                  <>
                    <h2 className="text-xl font-bold">What is your employment status?</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {["Employed", "Self-employed / Business owner", "Student", "Retired", "Not employed"].map((e) => (
                        <Choice key={e} selected={a.employment === e} onClick={() => set("employment", e)}>
                          <span className="text-sm font-medium">{e}</span>
                        </Choice>
                      ))}
                    </div>
                    {(a.employment === "Employed" || a.employment.startsWith("Self")) && (
                      <FormGrid className="mt-5">
                        <Field label="Employer / business name">
                          <Input value={a.employer} onChange={(e) => set("employer", e.target.value)} />
                        </Field>
                        <Field label="Years in current role">
                          <Input type="number" value={a.years} onChange={(e) => set("years", e.target.value)} />
                        </Field>
                      </FormGrid>
                    )}
                  </>
                )}
                {step === 4 && (
                  <>
                    <h2 className="text-xl font-bold">Financial information</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Approximate figures are fine.</p>
                    <div className="mt-5 space-y-5">
                      <div>
                        <Label className="mb-2">Monthly income (LKR)</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {["Below 100K", "100K – 250K", "250K – 500K", "Above 500K"].map((x) => (
                            <Choice key={x} selected={a.income === x} onClick={() => set("income", x)} className="justify-center p-3">
                              <span className="text-sm font-medium">{x}</span>
                            </Choice>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2">Savings / bank balance (LKR)</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {["Below 500K", "500K – 1.5M", "1.5M – 5M", "Above 5M"].map((x) => (
                            <Choice key={x} selected={a.savings === x} onClick={() => set("savings", x)} className="justify-center p-3">
                              <span className="text-sm font-medium">{x}</span>
                            </Choice>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2">Will someone sponsor your trip?</Label>
                        <div className="flex gap-2">
                          {["Yes", "No"].map((x) => (
                            <Choice key={x} selected={a.sponsor === x} onClick={() => set("sponsor", x)} className="px-6 py-2.5">
                              <span className="text-sm font-medium">{x}</span>
                            </Choice>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {step === 5 && (
                  <>
                    <h2 className="text-xl font-bold">Travel history</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Select any regions you've visited in the last 10 years.</p>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {["India / Maldives", "South-East Asia", "Middle East", "Europe / Schengen", "UK", "USA / Canada", "Australia / NZ", "East Asia", "None yet"].map((x) => {
                        const on = a.history.includes(x);
                        return (
                          <Choice key={x} selected={on} onClick={() => set("history", x === "None yet" ? (on ? [] : ["None yet"]) : on ? a.history.filter((y) => y !== x) : [...a.history.filter((y) => y !== "None yet"), x])} className="p-3">
                            <span className="text-sm font-medium">{x}</span>
                          </Choice>
                        );
                      })}
                    </div>
                    <div className="mt-6">
                      <Label className="mb-2">Have you ever been refused a visa?</Label>
                      <div className="flex gap-2">
                        {["No", "Yes"].map((x) => (
                          <Choice key={x} selected={a.refusals === x} onClick={() => set("refusals", x)} className="px-6 py-2.5">
                            <span className="text-sm font-medium">{x}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {step === 6 && (
                  <>
                    <h2 className="text-xl font-bold">Review your answers</h2>
                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        ["Destination", `${country?.flag ?? ""} ${country?.name ?? "—"}`],
                        ["Visa type", a.visa],
                        ["Name", a.name],
                        ["Contact", [a.email, a.phone].filter(Boolean).join(" · ")],
                        ["Employment", [a.employment, a.employer].filter(Boolean).join(" · ")],
                        ["Monthly income", a.income],
                        ["Savings", a.savings],
                        ["Sponsor", a.sponsor],
                        ["Travel history", a.history.join(", ") || "Not specified"],
                        ["Previous refusals", a.refusals],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-[#f8faf9] p-3">
                          <dt className="text-xs text-muted-foreground">{k}</dt>
                          <dd className="mt-0.5 text-sm font-medium">{v || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-5 flex items-start gap-2 rounded-xl border border-[#f0e2bb] bg-[#fffaf0] p-3 text-xs text-[#6b4d0c]">
                      <Info className="mt-0.5 size-4 shrink-0" /> This questionnaire provides preliminary guidance only. Final visa eligibility and decisions are determined by the relevant immigration authority.
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border bg-[#fafbfa] p-4 sm:px-8">
                <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  <ArrowLeft /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={next} disabled={!valid}>
                    Continue <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    onClick={() => {
                      setDone(true);
                      store.add("leads", {
                        id: store.ids.lead(),
                        name: a.name,
                        phone: a.phone || "—",
                        whatsapp: a.phone || "—",
                        email: a.email,
                        countryCode: a.destination,
                        visaCategory: a.visa as never,
                        travelDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
                        source: "Website",
                        assignedTo: "STF-03",
                        priority: "Medium",
                        status: "New",
                        followUpDate: new Date().toISOString().slice(0, 10),
                        notes: `Eligibility checker: ${a.employment}, income ${a.income}, savings ${a.savings}, refusals ${a.refusals}.`,
                        createdAt: new Date().toISOString().slice(0, 10),
                      });
                      store.notify({ title: `New lead from Eligibility Checker`, description: `${a.name} · ${country?.name} ${a.visa}`, type: "lead", link: "/app/leads" });
                    }}
                  >
                    Submit for guidance
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </section>
    </>
  );
}
