import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormGrid, RHFSelect, emailRule } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import { VISA_CATEGORIES } from "@/lib/domain";
import type { Country, Staff, VisaType } from "@/data/types";
import type { ModalProps } from "./context";

export function VisaTypeModal({ open, onClose, visaType, countryCode }: ModalProps & { visaType?: VisaType; countryCode?: string }) {
  const store = useStore();
  const v = visaType;
  const { register, handleSubmit, control, formState } = useForm<Omit<VisaType, "id">>({
    defaultValues: v ?? { countryCode: countryCode ?? "UK", category: "Tourist", name: "", processingTime: "15 working days", validity: "6 months", entry: "Single", fee: 45000, governmentFee: 0, status: "Active" },
  });
  const e = formState.errors;
  const onSubmit = (data: Omit<VisaType, "id">) => {
    const payload = { ...data, fee: Number(data.fee), governmentFee: Number(data.governmentFee) };
    if (v) {
      store.update("visaTypes", v.id, payload);
      toast.success("Visa type updated successfully.");
    } else {
      const n = store.visaTypes.filter((x) => x.countryCode === data.countryCode).length + 1;
      const id = `VT-${data.countryCode}-${String(n).padStart(2, "0")}-${Date.now().toString(36).slice(-3)}`;
      store.add("visaTypes", { ...payload, id });
      store.setRequirements(id, [
        { id: `${id}-R1`, name: "Passport", category: "Passport", level: "Required" },
        { id: `${id}-R2`, name: "Passport Photos", category: "Photo", level: "Required" },
        { id: `${id}-R3`, name: "Bank Statement", category: "Bank Statement", level: "Required" },
      ]);
      toast.success("Visa type created successfully.", { description: "Default requirements were added — customise them under Requirements." });
    }
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{v ? "Edit Visa Type" : "Add Visa Type"}</DialogTitle>
          <DialogDescription>Configure processing time, validity and fees.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <FormGrid>
              <Field label="Country">
                <RHFSelect control={control} name="countryCode" options={store.countries.map((c) => ({ value: c.code, label: `${c.flag}  ${c.name}` }))} />
              </Field>
              <Field label="Category">
                <RHFSelect control={control} name="category" options={[...VISA_CATEGORIES]} />
              </Field>
              <Field label="Visa Name" required error={e.name?.message} className="sm:col-span-2">
                <Input placeholder="e.g. Standard Visitor Visa" {...register("name", { required: "Name is required" })} aria-invalid={!!e.name} />
              </Field>
              <Field label="Processing Time">
                <Input {...register("processingTime")} />
              </Field>
              <Field label="Validity">
                <Input {...register("validity")} />
              </Field>
              <Field label="Entry">
                <RHFSelect control={control} name="entry" options={["Single", "Double", "Multiple"]} />
              </Field>
              <Field label="Status">
                <RHFSelect control={control} name="status" options={["Active", "Inactive"]} />
              </Field>
              <Field label="Service Fee (LKR)">
                <Input type="number" {...register("fee", { valueAsNumber: true })} />
              </Field>
              <Field label="Government Fee (LKR)">
                <Input type="number" {...register("governmentFee", { valueAsNumber: true })} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{v ? "Save Changes" : "Add Visa Type"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CountryModal({ open, onClose, country }: ModalProps & { country?: Country }) {
  const store = useStore();
  const c = country;
  const { register, handleSubmit, control, formState } = useForm<Country>({
    defaultValues: c ?? { code: "", name: "", flag: "🏳️", region: "Europe", capital: "", currency: "", description: "", historicalApplications: 0, successRate: 90, status: "Active" },
  });
  const e = formState.errors;
  const onSubmit = (data: Country) => {
    if (c) {
      store.update("countries", c.code, data);
      toast.success("Country updated successfully.");
    } else {
      if (store.countries.some((x) => x.code === data.code.toUpperCase())) return toast.error("A country with this code already exists.");
      store.add("countries", { ...data, code: data.code.toUpperCase(), historicalApplications: 0 });
      toast.success("Country created successfully.");
    }
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{c ? "Edit Country" : "Add Country"}</DialogTitle>
          <DialogDescription>Destinations offered to customers.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <FormGrid>
              <Field label="Country Name" required error={e.name?.message}>
                <Input placeholder="e.g. Germany" {...register("name", { required: "Required" })} aria-invalid={!!e.name} />
              </Field>
              <Field label="Code" required error={e.code?.message} hint="Used in application IDs, e.g. DE">
                <Input maxLength={3} disabled={!!c} {...register("code", { required: "Required" })} aria-invalid={!!e.code} />
              </Field>
              <Field label="Flag Emoji">
                <Input {...register("flag")} />
              </Field>
              <Field label="Region">
                <RHFSelect control={control} name="region" options={["Europe", "Asia", "Middle East", "North America", "Oceania", "Africa", "South America"]} />
              </Field>
              <Field label="Capital">
                <Input {...register("capital")} />
              </Field>
              <Field label="Currency">
                <Input {...register("currency")} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea rows={2} {...register("description")} />
              </Field>
              <Field label="Status">
                <RHFSelect control={control} name="status" options={["Active", "Inactive"]} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{c ? "Save Changes" : "Add Country"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffModal({ open, onClose, staff }: ModalProps & { staff?: Staff }) {
  const store = useStore();
  const s = staff;
  const { register, handleSubmit, control, formState } = useForm<Omit<Staff, "id">>({
    defaultValues: s ?? { name: "", role: "Visa Consultant", email: "", phone: "", status: "Active", joinedAt: new Date().toISOString().slice(0, 10), branch: "Colombo 03" },
  });
  const e = formState.errors;
  const onSubmit = (data: Omit<Staff, "id">) => {
    if (s) {
      store.update("staff", s.id, data);
      toast.success("Staff member updated successfully.");
    } else {
      store.add("staff", { ...data, id: store.ids.staff() });
      toast.success("Staff member created successfully.", { description: `An invitation email would be sent to ${data.email}.` });
    }
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{s ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          <DialogDescription>Team members and their access role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <FormGrid>
              <Field label="Full Name" required error={e.name?.message} className="sm:col-span-2">
                <Input {...register("name", { required: "Required" })} aria-invalid={!!e.name} />
              </Field>
              <Field label="Email" required error={e.email?.message}>
                <Input type="email" {...register("email", { required: "Required", ...emailRule })} aria-invalid={!!e.email} />
              </Field>
              <Field label="Phone">
                <Input {...register("phone")} />
              </Field>
              <Field label="Role">
                <RHFSelect control={control} name="role" options={["Manager", "Visa Consultant", "Documentation Officer", "Finance Officer", "Receptionist"]} />
              </Field>
              <Field label="Branch">
                <RHFSelect control={control} name="branch" options={["Colombo 03", "Kandy", "Galle"]} />
              </Field>
              <Field label="Status">
                <RHFSelect control={control} name="status" options={["Active", "Inactive"]} />
              </Field>
              <Field label="Joined">
                <Input type="date" {...register("joinedAt")} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{s ? "Save Changes" : "Add Staff"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
