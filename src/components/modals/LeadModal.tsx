import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormGrid, RHFSelect, emailRule } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import type { Lead } from "@/data/types";
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES, VISA_CATEGORIES } from "@/lib/domain";
import { dayOffset, todayISO } from "@/lib/utils";
import type { ModalProps } from "./context";

type FormValues = Omit<Lead, "id" | "createdAt" | "convertedCustomerId">;

export function LeadModal({ open, onClose, lead }: ModalProps & { lead?: Lead }) {
  const store = useStore();
  const { register, handleSubmit, control, formState } = useForm<FormValues>({
    defaultValues: lead ?? {
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
      countryCode: "",
      visaCategory: "Tourist",
      travelDate: dayOffset(60),
      source: "Website",
      assignedTo: store.session?.staffId && store.staff.find((s) => s.id === store.session?.staffId)?.role === "Visa Consultant" ? store.session.staffId : "STF-03",
      priority: "Medium",
      status: "New",
      followUpDate: dayOffset(1),
      notes: "",
    },
  });
  const e = formState.errors;

  const onSubmit = (v: FormValues) => {
    if (lead) {
      store.update("leads", lead.id, v);
      toast.success("Lead updated successfully.");
    } else {
      const id = store.ids.lead();
      store.add("leads", { ...v, whatsapp: v.whatsapp || v.phone, id, createdAt: todayISO() });
      store.notify({ title: `New lead: ${v.name}`, description: `${v.visaCategory} visa enquiry via ${v.source}.`, type: "lead", link: "/app/leads" });
      toast.success("Lead created successfully.", { description: `${v.name} was added to New leads.` });
    }
    onClose();
  };

  const staffOptions = store.staff.filter((s) => s.status === "Active" && ["Visa Consultant", "Manager", "Admin"].includes(s.role)).map((s) => ({ value: s.id, label: s.name }));
  const countryOptions = store.countries.map((c) => ({ value: c.code, label: `${c.flag}  ${c.name}` }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          <DialogDescription>{lead ? `Update details for ${lead.id}.` : "Capture a new visa inquiry and assign it to a consultant."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <FormGrid>
              <Field label="Full Name" required error={e.name?.message} className="sm:col-span-2">
                <Input placeholder="e.g. Harsha Wijeratne" {...register("name", { required: "Full name is required" })} aria-invalid={!!e.name} />
              </Field>
              <Field label="Phone" required error={e.phone?.message}>
                <Input placeholder="+94 77 123 4567" {...register("phone", { required: "Phone is required" })} aria-invalid={!!e.phone} />
              </Field>
              <Field label="WhatsApp" hint="Leave empty to use phone number">
                <Input placeholder="+94 77 123 4567" {...register("whatsapp")} />
              </Field>
              <Field label="Email" error={e.email?.message} className="sm:col-span-2">
                <Input type="email" placeholder="name@example.com" {...register("email", emailRule)} aria-invalid={!!e.email} />
              </Field>
              <Field label="Country" required error={e.countryCode?.message}>
                <RHFSelect control={control} name="countryCode" options={countryOptions} placeholder="Select destination" rules={{ required: "Select a country" }} />
              </Field>
              <Field label="Visa Type" required>
                <RHFSelect control={control} name="visaCategory" options={[...VISA_CATEGORIES]} />
              </Field>
              <Field label="Travel Date">
                <Input type="date" {...register("travelDate")} />
              </Field>
              <Field label="Source">
                <RHFSelect control={control} name="source" options={[...LEAD_SOURCES]} />
              </Field>
              <Field label="Assigned Staff">
                <RHFSelect control={control} name="assignedTo" options={staffOptions} />
              </Field>
              <Field label="Priority">
                <RHFSelect control={control} name="priority" options={[...PRIORITIES]} />
              </Field>
              {lead && (
                <Field label="Status">
                  <RHFSelect control={control} name="status" options={[...LEAD_STATUSES]} />
                </Field>
              )}
              <Field label="Follow-up Date">
                <Input type="date" {...register("followUpDate")} />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea rows={3} placeholder="Anything the consultant should know…" {...register("notes")} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{lead ? "Save Changes" : "Create Lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
