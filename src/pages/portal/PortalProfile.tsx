import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard, InfoRow } from "@/components/shared/SectionCard";
import { Field, FormGrid } from "@/components/shared/Form";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { passportState, toneClasses } from "@/lib/domain";
import { cn, formatDate } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalProfile() {
  const { customer: c, store } = usePortalCustomer();
  const [v, setV] = useState({ phone: c.phone, whatsapp: c.whatsapp, email: c.email, address: c.address });
  const ps = passportState(c.passport.expiryDate);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar name={`${c.firstName} ${c.lastName}`} className="size-16 rounded-2xl text-lg" />
        <div>
          <h1 className="text-2xl font-bold">
            {c.firstName} {c.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">Customer ID {c.id}</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Contact details" description="Keep these up to date so we can reach you.">
          <FormGrid>
            <Field label="Phone">
              <Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
            </Field>
            <Field label="WhatsApp">
              <Input value={v.whatsapp} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <Input value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />
            </Field>
          </FormGrid>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                store.update("customers", c.id, v);
                store.log({ customerId: c.id, text: "Contact details updated by customer", type: "update", by: "customer" });
                toast.success("Updated successfully.");
              }}
            >
              Save changes
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="Passport">
          <div className={cn("mb-3 flex items-center gap-3 rounded-xl border p-3", toneClasses[ps.tone])}>
            {ps.tone === "emerald" ? <ShieldCheck className="size-5" /> : <AlertTriangle className="size-5" />}
            <p className="text-sm font-semibold">{ps.label}</p>
          </div>
          <dl className="divide-y divide-border">
            <InfoRow label="Passport number" value={c.passport.number} />
            <InfoRow label="Issue date" value={formatDate(c.passport.issueDate)} />
            <InfoRow label="Expiry date" value={formatDate(c.passport.expiryDate)} />
            <InfoRow label="Date of birth" value={formatDate(c.dob)} />
            <InfoRow label="Nationality" value={c.nationality} />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">To change passport details please message your consultant with a copy of your new passport.</p>
        </SectionCard>
      </div>
    </div>
  );
}
