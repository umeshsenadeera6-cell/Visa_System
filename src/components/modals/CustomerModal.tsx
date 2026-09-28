import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormGrid, FormSection, RHFSelect, emailRule } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import type { Customer } from "@/data/types";
import { LEAD_SOURCES } from "@/lib/domain";
import { dayOffset, todayISO } from "@/lib/utils";
import type { ModalProps } from "./context";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  dob: string;
  gender: Customer["gender"];
  maritalStatus: Customer["maritalStatus"];
  nic: string;
  address: string;
  city: string;
  occupation: string;
  employer: string;
  passportNumber: string;
  passportIssue: string;
  passportExpiry: string;
  preferredDestination: string;
  assignedTo: string;
  status: Customer["status"];
  source: Customer["source"];
}

export function CustomerModal({ open, onClose, customer }: ModalProps & { customer?: Customer }) {
  const store = useStore();
  const navigate = useNavigate();
  const c = customer;
  const { register, handleSubmit, control, formState } = useForm<FormValues>({
    defaultValues: {
      firstName: c?.firstName ?? "",
      lastName: c?.lastName ?? "",
      email: c?.email ?? "",
      phone: c?.phone ?? "",
      whatsapp: c?.whatsapp ?? "",
      dob: c?.dob ?? "",
      gender: c?.gender ?? "Male",
      maritalStatus: c?.maritalStatus ?? "Single",
      nic: c?.nic ?? "",
      address: c?.address ?? "",
      city: c?.city ?? "",
      occupation: c?.occupation ?? "",
      employer: c?.employer ?? "",
      passportNumber: c?.passport.number ?? "",
      passportIssue: c?.passport.issueDate ?? "",
      passportExpiry: c?.passport.expiryDate ?? dayOffset(365 * 4),
      preferredDestination: c?.travel.preferredDestination ?? "UK",
      assignedTo: c?.assignedTo ?? "STF-03",
      status: c?.status ?? "Active",
      source: c?.source ?? "Walk-in",
    },
  });
  const e = formState.errors;

  const onSubmit = (v: FormValues) => {
    const data: Omit<Customer, "id" | "createdAt"> = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      whatsapp: v.whatsapp || v.phone,
      dob: v.dob,
      gender: v.gender,
      maritalStatus: v.maritalStatus,
      nationality: "Sri Lankan",
      nic: v.nic,
      address: v.address,
      city: v.city,
      occupation: v.occupation,
      employer: v.employer,
      monthlyIncome: c?.monthlyIncome ?? 0,
      passport: { number: v.passportNumber, issueDate: v.passportIssue, expiryDate: v.passportExpiry, placeOfIssue: "Colombo" },
      travel: { ...(c?.travel ?? { purpose: "Tourism", plannedDate: dayOffset(60), previousTravel: [] }), preferredDestination: v.preferredDestination },
      status: v.status,
      assignedTo: v.assignedTo,
      source: v.source,
    };
    if (c) {
      store.update("customers", c.id, data);
      store.log({ customerId: c.id, text: "Customer profile updated", type: "update" });
      toast.success("Customer updated successfully.");
      onClose();
    } else {
      const id = store.ids.customer();
      store.add("customers", { ...data, id, createdAt: todayISO() });
      store.log({ customerId: id, text: "Customer profile created", type: "create" });
      toast.success("Customer created successfully.", { description: `${v.firstName} ${v.lastName} · ${id}` });
      onClose();
      navigate(`/app/customers/${id}`);
    }
  };

  const staffOptions = store.staff.filter((s) => s.status === "Active" && ["Visa Consultant", "Manager"].includes(s.role)).map((s) => ({ value: s.id, label: s.name }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{c ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>{c ? `${c.firstName} ${c.lastName} · ${c.id}` : "Create a customer profile to start a visa application."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="space-y-6">
            <FormSection title="Personal information">
              <FormGrid>
                <Field label="First Name" required error={e.firstName?.message}>
                  <Input {...register("firstName", { required: "Required" })} aria-invalid={!!e.firstName} />
                </Field>
                <Field label="Last Name" required error={e.lastName?.message}>
                  <Input {...register("lastName", { required: "Required" })} aria-invalid={!!e.lastName} />
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" {...register("dob")} />
                </Field>
                <Field label="NIC Number">
                  <Input placeholder="199012345678" {...register("nic")} />
                </Field>
                <Field label="Gender">
                  <RHFSelect control={control} name="gender" options={["Male", "Female"]} />
                </Field>
                <Field label="Marital Status">
                  <RHFSelect control={control} name="maritalStatus" options={["Single", "Married"]} />
                </Field>
              </FormGrid>
            </FormSection>
            <FormSection title="Contact">
              <FormGrid>
                <Field label="Email" required error={e.email?.message}>
                  <Input type="email" {...register("email", { required: "Required", ...emailRule })} aria-invalid={!!e.email} />
                </Field>
                <Field label="Phone" required error={e.phone?.message}>
                  <Input {...register("phone", { required: "Required" })} aria-invalid={!!e.phone} />
                </Field>
                <Field label="WhatsApp">
                  <Input {...register("whatsapp")} />
                </Field>
                <Field label="City">
                  <Input {...register("city")} />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <Input {...register("address")} />
                </Field>
              </FormGrid>
            </FormSection>
            <FormSection title="Passport & employment">
              <FormGrid>
                <Field label="Passport Number">
                  <Input placeholder="N1234567" {...register("passportNumber")} />
                </Field>
                <Field label="Passport Expiry">
                  <Input type="date" {...register("passportExpiry")} />
                </Field>
                <Field label="Issue Date">
                  <Input type="date" {...register("passportIssue")} />
                </Field>
                <Field label="Occupation">
                  <Input {...register("occupation")} />
                </Field>
                <Field label="Employer" className="sm:col-span-2">
                  <Input {...register("employer")} />
                </Field>
              </FormGrid>
            </FormSection>
            <FormSection title="Assignment">
              <FormGrid>
                <Field label="Assigned Consultant">
                  <RHFSelect control={control} name="assignedTo" options={staffOptions} />
                </Field>
                <Field label="Preferred Destination">
                  <RHFSelect control={control} name="preferredDestination" options={store.countries.map((x) => ({ value: x.code, label: `${x.flag}  ${x.name}` }))} />
                </Field>
                <Field label="Status">
                  <RHFSelect control={control} name="status" options={["Active", "Prospect", "Completed", "Inactive"]} />
                </Field>
                <Field label="Source">
                  <RHFSelect control={control} name="source" options={[...LEAD_SOURCES]} />
                </Field>
              </FormGrid>
            </FormSection>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{c ? "Save Changes" : "Create Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
