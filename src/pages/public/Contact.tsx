import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormGrid, RHFSelect, emailRule } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import { VISA_CATEGORIES } from "@/lib/domain";
import { dayOffset, todayISO } from "@/lib/utils";
import type { VisaCategory } from "@/data/types";
import { PageHero } from "./PublicLayout";

interface Form {
  name: string;
  email: string;
  phone: string;
  country: string;
  visa: VisaCategory;
  message: string;
}

export default function Contact() {
  const store = useStore();
  const { register, handleSubmit, control, reset, formState } = useForm<Form>({ defaultValues: { name: "", email: "", phone: "", country: "UK", visa: "Tourist", message: "" } });
  const e = formState.errors;
  const onSubmit = (v: Form) => {
    store.add("leads", {
      id: store.ids.lead(),
      name: v.name,
      phone: v.phone,
      whatsapp: v.phone,
      email: v.email,
      countryCode: v.country,
      visaCategory: v.visa,
      travelDate: dayOffset(60),
      source: "Website",
      assignedTo: "STF-03",
      priority: "Medium",
      status: "New",
      followUpDate: todayISO(),
      notes: v.message,
      createdAt: todayISO(),
    });
    store.notify({ title: "New consultation request", description: `${v.name} · ${v.visa} visa`, type: "lead", link: "/app/leads" });
    toast.success("Consultation request received.", { description: "A consultant will contact you within one business day." });
    reset();
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Book a consultation" subtitle="Visit our Colombo office or meet online. We'll help you choose the right visa and prepare a personal checklist." />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold">Send us a message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormGrid>
              <Field label="Full name" required error={e.name?.message}>
                <Input {...register("name", { required: "Please enter your name" })} aria-invalid={!!e.name} />
              </Field>
              <Field label="Phone / WhatsApp" required error={e.phone?.message}>
                <Input {...register("phone", { required: "Please enter a phone number" })} aria-invalid={!!e.phone} />
              </Field>
              <Field label="Email" required error={e.email?.message} className="sm:col-span-2">
                <Input type="email" {...register("email", { required: "Please enter your email", ...emailRule })} aria-invalid={!!e.email} />
              </Field>
              <Field label="Destination">
                <RHFSelect control={control} name="country" options={store.countries.map((c) => ({ value: c.code, label: `${c.flag}  ${c.name}` }))} />
              </Field>
              <Field label="Visa type">
                <RHFSelect control={control} name="visa" options={[...VISA_CATEGORIES]} />
              </Field>
              <Field label="Message" className="sm:col-span-2">
                <Textarea rows={4} placeholder="Tell us about your travel plans…" {...register("message")} />
              </Field>
            </FormGrid>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Send /> Request Consultation
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            {[
              { i: MapPin, t: "Head office", d: "No. 45, Galle Road, Colombo 03" },
              { i: Phone, t: "Phone", d: "+94 11 234 5678" },
              { i: MessageCircle, t: "WhatsApp", d: "+94 77 210 4455" },
              { i: Mail, t: "Email", d: "hello@serendibvisa.lk" },
              { i: Clock, t: "Hours", d: "Mon – Sat · 9:00 – 17:30" },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#eef6f2] text-primary">
                  <x.i className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{x.t}</p>
                  <p className="text-sm font-medium">{x.d}</p>
                </div>
              </div>
            ))}
          </Card>
          <Card className="relative h-56 overflow-hidden">
            <svg viewBox="0 0 400 220" className="absolute inset-0 size-full" aria-label="Map illustration of our Colombo office">
              <rect width="400" height="220" fill="#eef3f0" />
              <path d="M0 160 C 80 150, 120 170, 200 150 S 330 120, 400 130 L400 220 L0 220 Z" fill="#cfe3f0" />
              {[40, 100, 160, 220, 280, 340].map((x) => (
                <line key={x} x1={x} y1="0" x2={x - 30} y2="150" stroke="#fff" strokeWidth="6" />
              ))}
              <line x1="0" y1="70" x2="400" y2="55" stroke="#fff" strokeWidth="8" />
              <line x1="0" y1="115" x2="400" y2="100" stroke="#fff" strokeWidth="5" />
              <g transform="translate(205 70)">
                <circle r="26" fill="#0a7d57" opacity=".15" />
                <path d="M0 -22c-9 0-16 7-16 16 0 12 16 26 16 26s16-14 16-26c0-9-7-16-16-16z" fill="#0b6b4f" />
                <circle cy="-6" r="6" fill="#fff" />
              </g>
            </svg>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">Galle Road, Colombo 03</div>
          </Card>
        </div>
      </section>
    </>
  );
}
