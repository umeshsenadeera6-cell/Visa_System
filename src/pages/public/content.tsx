import { Briefcase, GraduationCap, HeartHandshake, HeartPulse, Plane, PlaneTakeoff, Users, BriefcaseBusiness, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const SERVICES = [
  { icon: Plane, title: "Tourist Visas", desc: "Holiday and sightseeing visas with itinerary, hotel and insurance guidance.", cat: "Tourist" },
  { icon: BriefcaseBusiness, title: "Business Visas", desc: "Meetings, trade fairs and conferences — invitation letters and company documents.", cat: "Business" },
  { icon: GraduationCap, title: "Student Visas", desc: "CAS, offer letters, financial evidence and interview preparation.", cat: "Student" },
  { icon: Briefcase, title: "Work Permits", desc: "Skilled worker and employer-sponsored routes with end-to-end documentation.", cat: "Work" },
  { icon: Users, title: "Family Visit", desc: "Visit relatives abroad with sponsor documents and relationship evidence.", cat: "Family Visit" },
  { icon: HeartHandshake, title: "Dependent Visas", desc: "Join a spouse or parent who is studying or working overseas.", cat: "Dependent" },
  { icon: PlaneTakeoff, title: "Transit Visas", desc: "Airside and landside transit permissions for connecting flights.", cat: "Transit" },
  { icon: HeartPulse, title: "Medical Visas", desc: "Treatment abroad with hospital letters and financial documentation.", cat: "Medical" },
];

export const FAQS = [
  { q: "Can you guarantee my visa will be approved?", a: "No consultancy can guarantee approval. Visa decisions are made solely by the relevant embassy or immigration authority. We make sure your application is complete, accurate and well-presented, which gives you the strongest possible case." },
  { q: "How long does the visa process take?", a: "It depends on the destination and visa type. A Dubai tourist e-visa can take 3–5 working days, a UK visitor visa around 15 working days, and Canadian work permits several weeks. We share a realistic timeline at your consultation." },
  { q: "What documents do I need?", a: "Most applications need a valid passport, photographs, bank statements and proof of employment or study. Each visa type has its own checklist — you can preview them on our Requirements page, and your portal will show exactly what's outstanding." },
  { q: "How do I track my application?", a: "Use the Track Application page with your application number (e.g. SVS-UK-2026-00125). Registered customers can also log in to the client portal for full details, documents and messages." },
  { q: "What are your fees?", a: "Our service fee depends on the visa type and complexity. Government and embassy fees are charged separately and are non-refundable once submitted. You'll receive a detailed invoice before we begin." },
  { q: "Do you help with appointments and biometrics?", a: "Yes. We book VFS, embassy and biometrics appointments, prepare you for interviews and arrange passport collection." },
];

export const REVIEWS = [
  { name: "Dilshan R.", trip: "UK Visitor Visa", text: "The checklist in the portal made it so easy to know what was missing. I always knew where my application stood." },
  { name: "Nadia F.", trip: "Canada Study Permit", text: "Clear advice from the first consultation and quick replies on WhatsApp. Biometrics and interview prep were really helpful." },
  { name: "Ravi S.", trip: "Australia Visitor Visa", text: "Professional team that explained every step honestly. The document review saved me from a costly mistake." },
];

export function FaqList({ items = FAQS }: { items?: typeof FAQS }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((f, i) => (
        <details key={f.q} className="group px-5 py-1 sm:px-6" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium outline-none [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180")} />
          </summary>
          <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center }: { eyebrow: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-balance sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
