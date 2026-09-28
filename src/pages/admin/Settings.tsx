import { useState } from "react";
import { toast } from "sonner";
import { Building2, Bell, Database, KeyRound, RotateCcw, ShieldCheck, UserRound, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Field, FormGrid } from "@/components/shared/Form";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useConfirm } from "@/components/shared/Confirm";
import { useSwitchRole } from "@/components/layout/RoleSwitcher";
import { DEMO_ROLES } from "@/components/layout/nav";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";

export default function Settings() {
  const store = useStore();
  const confirm = useConfirm();
  const switchRole = useSwitchRole();
  const staff = store.staff.find((s) => s.id === store.session?.staffId);
  const [prefs, setPrefs] = useState({ email: true, whatsapp: true, docs: true, payments: true, digest: false, sms: false });
  const saved = () => toast.success("Settings saved.", { description: "Changes are stored in this browser for the demo." });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Settings" subtitle="Manage your profile, company details and notification preferences." />
      <Tabs defaultValue="profile">
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="profile">
              <UserRound /> Profile
            </TabsTrigger>
            <TabsTrigger value="company">
              <Building2 /> Company
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldCheck /> Security
            </TabsTrigger>
            <TabsTrigger value="demo">
              <Database /> Demo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <SectionCard title="Your profile" description="Visible to your team and on customer communications.">
            <div className="mb-6 flex items-center gap-4">
              <UserAvatar name={store.session?.name ?? ""} className="size-16 rounded-2xl text-lg" />
              <div>
                <p className="font-semibold">{store.session?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {store.session?.role} · {staff?.branch ?? "Colombo 03"}
                </p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.info("Photo uploads will be available after backend integration.")}>
                  Change photo
                </Button>
              </div>
            </div>
            <FormGrid>
              <Field label="Full name">
                <Input defaultValue={store.session?.name} />
              </Field>
              <Field label="Email">
                <Input defaultValue={store.session?.email} />
              </Field>
              <Field label="Phone">
                <Input defaultValue={staff?.phone ?? "+94 77 000 0000"} />
              </Field>
              <Field label="Branch">
                <Input defaultValue={staff?.branch ?? "Colombo 03"} />
              </Field>
            </FormGrid>
            <div className="mt-5 flex justify-end">
              <Button onClick={saved}>Save changes</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="company">
          <SectionCard title="Company details" description="Used on invoices, receipts and the public website.">
            <FormGrid>
              <Field label="Company name">
                <Input defaultValue="Serendib Visa Services (Pvt) Ltd" />
              </Field>
              <Field label="Registration no.">
                <Input defaultValue="PV 00231456" />
              </Field>
              <Field label="Email">
                <Input defaultValue="hello@serendibvisa.lk" />
              </Field>
              <Field label="Phone">
                <Input defaultValue="+94 11 234 5678" />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Textarea defaultValue="No. 45, Galle Road, Colombo 03, Sri Lanka" rows={2} />
              </Field>
              <Field label="Invoice prefix">
                <Input defaultValue="INV-2026-" />
              </Field>
              <Field label="Default currency">
                <Input defaultValue="LKR" />
              </Field>
            </FormGrid>
            <div className="mt-5 flex justify-end">
              <Button onClick={saved}>Save changes</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications">
          <SectionCard title="Notification preferences">
            <ul className="divide-y divide-border">
              {(
                [
                  ["email", "Email notifications", "Status changes and assignments by email"],
                  ["whatsapp", "WhatsApp alerts", "Instant alerts for urgent follow-ups"],
                  ["docs", "Document uploads", "When a customer uploads a document"],
                  ["payments", "Payment updates", "New payments and overdue balances"],
                  ["digest", "Daily digest", "A summary every morning at 8:00"],
                  ["sms", "SMS reminders to customers", "Automatic reminders before appointments"],
                ] as const
              ).map(([k, t, d]) => (
                <li key={k} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <Label htmlFor={k} className="text-sm">
                      {t}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d}</p>
                  </div>
                  <Switch
                    id={k}
                    checked={prefs[k]}
                    onCheckedChange={(v) => {
                      setPrefs({ ...prefs, [k]: v });
                      toast.success(`${t} ${v ? "enabled" : "disabled"}.`);
                    }}
                  />
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <SectionCard title="Password & security" icon={<KeyRound />}>
            <FormGrid>
              <Field label="Current password" className="sm:col-span-2">
                <Input type="password" placeholder="••••••••" />
              </Field>
              <Field label="New password">
                <Input type="password" />
              </Field>
              <Field label="Confirm new password">
                <Input type="password" />
              </Field>
            </FormGrid>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => toast.info("Authentication is mocked in this frontend demo.")}>Update password</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="demo" className="space-y-4">
          <SectionCard title="Switch demo role" icon={<Repeat />} description="Each role sees a different navigation and dashboard.">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition hover:border-primary/40 hover:bg-[#f9fbfa]",
                    store.session?.role === r.role ? "border-primary bg-[#eef6f2]" : "border-border",
                  )}
                >
                  <p className="text-sm font-semibold">{r.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.name} · {r.description}
                  </p>
                </button>
              ))}
            </div>
          </SectionCard>
          <Card className="flex flex-col gap-4 border-[#f7d4ce] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Reset demo data</p>
              <p className="text-sm text-muted-foreground">Restore all customers, applications, documents and payments to the original mock data.</p>
            </div>
            <Button
              variant="destructive"
              onClick={() =>
                confirm({
                  title: "Reset all demo data?",
                  description: "Everything you created or changed in this browser will be replaced with the original sample data.",
                  confirmLabel: "Reset data",
                  onConfirm: () => {
                    store.resetDemo();
                    toast.success("Demo data restored.");
                  },
                })
              }
            >
              <RotateCcw /> Reset data
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
