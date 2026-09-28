import { Award, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useStore } from "@/store/store";
import { PageHero } from "./PublicLayout";
import { SectionTitle } from "./content";

export default function About() {
  const store = useStore();
  return (
    <>
      <PageHero eyebrow="About us" title="A calmer, clearer way to apply for your visa" subtitle="Serendib Visa Services helps Sri Lankan travellers, students and professionals navigate complex immigration requirements with confidence." />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Our story" title="Founded in Colombo in 2019" />
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>We started with a simple idea: visa applications shouldn't feel like a mystery. Too many applicants were refused because of avoidable mistakes — a missing letter, an uncertified statement or a passport too close to expiry.</p>
            <p>Today our team of consultants and documentation officers across Colombo, Kandy and Galle supports thousands of applications every year, with a client portal that shows every step in real time.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["12k+", "Applications"],
            ["7", "Destinations"],
            ["3", "Branches"],
            ["4.9", "Average rating"],
          ].map(([v, l]) => (
            <Card key={l} className="flex flex-col justify-center p-6">
              <p className="font-display text-4xl font-extrabold text-primary">{v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Our values" title="What guides every file we handle" center />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: ShieldCheck, t: "Honesty first", d: "We never promise outcomes we can't control. You'll always get a realistic assessment." },
              { i: Award, t: "Meticulous detail", d: "Two-step document verification before anything reaches an embassy." },
              { i: HeartHandshake, t: "Personal care", d: "One named consultant from first call to passport collection." },
              { i: Compass, t: "Transparency", d: "Clear fees, live tracking and every update in your portal." },
            ].map((v) => (
              <Card key={v.t} className="p-6">
                <v.i className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="Our team" title="The people behind your application" center />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {store.staff
            .filter((s) => s.status === "Active" && s.role !== "Receptionist")
            .slice(0, 8)
            .map((s) => (
              <Card key={s.id} className="p-6 text-center">
                <UserAvatar name={s.name} className="mx-auto size-16 rounded-2xl text-lg" />
                <p className="mt-4 font-semibold">{s.name}</p>
                <p className="text-sm text-primary">{s.role === "Admin" ? "Founder & Director" : s.role}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.branch}</p>
              </Card>
            ))}
        </div>
      </section>
    </>
  );
}
