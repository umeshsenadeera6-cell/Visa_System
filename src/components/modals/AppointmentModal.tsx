import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormGrid, RHFSelect } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import { APPOINTMENT_TYPES } from "@/lib/domain";
import { dayOffset } from "@/lib/utils";
import type { Appointment } from "@/data/types";
import type { ModalProps } from "./context";

type FormValues = Omit<Appointment, "id" | "applicationId"> & { applicationId: string };

const LOCATIONS = [
  "Serendib Office — Colombo 03",
  "Online — Google Meet",
  "VFS Global — Colombo",
  "AVAC — Colombo 04",
  "U.S. Embassy — Colombo 03",
  "High Commission of Canada",
  "Embassy of Japan",
];

export function AppointmentModal({ open, onClose, customerId, applicationId, date, appointment }: ModalProps & { customerId?: string; applicationId?: string; date?: string; appointment?: Appointment }) {
  const store = useStore();
  const a = appointment;
  const { register, handleSubmit, control, setValue, formState } = useForm<FormValues>({
    defaultValues: {
      customerId: a?.customerId ?? customerId ?? store.applications.find((x) => x.id === applicationId)?.customerId ?? "",
      applicationId: a?.applicationId ?? applicationId ?? "none",
      type: a?.type ?? "Consultation",
      date: a?.date ?? date ?? dayOffset(1),
      time: a?.time ?? "10:00",
      duration: a?.duration ?? 45,
      staffId: a?.staffId ?? store.session?.staffId ?? "STF-03",
      status: a?.status ?? "Scheduled",
      location: a?.location ?? LOCATIONS[0],
      notes: a?.notes ?? "",
    },
  });
  const cid = useWatch({ control, name: "customerId" });
  const e = formState.errors;

  const onSubmit = (v: FormValues) => {
    const payload = { ...v, applicationId: v.applicationId !== "none" ? v.applicationId : undefined, duration: Number(v.duration) };
    if (a) {
      store.update("appointments", a.id, payload);
      toast.success("Appointment updated successfully.");
    } else {
      store.addAppointment(payload);
      toast.success("Appointment created.", { description: `${v.type} on ${v.date} at ${v.time}` });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{a ? "Edit Appointment" : "Schedule Appointment"}</DialogTitle>
          <DialogDescription>Consultations, VFS, embassy, biometrics, interviews and passport collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <FormGrid>
              <Field label="Customer" required error={e.customerId?.message} className="sm:col-span-2">
                <RHFSelect
                  control={control}
                  name="customerId"
                  rules={{ required: "Select a customer" }}
                  placeholder="Select customer"
                  options={store.customers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName} · ${c.id}` }))}
                  onValueChange={() => setValue("applicationId", "none")}
                />
              </Field>
              <Field label="Application">
                <RHFSelect control={control} name="applicationId" options={[{ value: "none", label: "Not linked" }, ...store.applications.filter((x) => x.customerId === cid).map((x) => ({ value: x.id, label: x.id }))]} />
              </Field>
              <Field label="Appointment Type">
                <RHFSelect control={control} name="type" options={[...APPOINTMENT_TYPES]} />
              </Field>
              <Field label="Date" required>
                <Input type="date" {...register("date", { required: true })} />
              </Field>
              <Field label="Time" required>
                <Input type="time" {...register("time", { required: true })} />
              </Field>
              <Field label="Staff">
                <RHFSelect control={control} name="staffId" options={store.staff.filter((s) => s.status === "Active").map((s) => ({ value: s.id, label: `${s.name} · ${s.role}` }))} />
              </Field>
              <Field label="Status">
                <RHFSelect control={control} name="status" options={["Scheduled", "Confirmed", "Completed", "Cancelled"]} />
              </Field>
              <Field label="Location" className="sm:col-span-2">
                <RHFSelect control={control} name="location" options={LOCATIONS} />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea rows={2} {...register("notes")} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{a ? "Save Changes" : "Create Appointment"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
