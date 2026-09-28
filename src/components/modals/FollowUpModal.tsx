import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormGrid, RHFSelect } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import { PRIORITIES } from "@/lib/domain";
import { dayOffset } from "@/lib/utils";
import type { FollowUp } from "@/data/types";
import type { ModalProps } from "./context";

type FormValues = Omit<FollowUp, "id" | "applicationId"> & { applicationId: string };

export function FollowUpModal({ open, onClose, customerId, applicationId, followUp }: ModalProps & { customerId?: string; applicationId?: string; followUp?: FollowUp }) {
  const store = useStore();
  const f = followUp;
  const { register, handleSubmit, control, setValue, formState } = useForm<FormValues>({
    defaultValues: {
      customerId: f?.customerId ?? customerId ?? store.applications.find((x) => x.id === applicationId)?.customerId ?? "",
      applicationId: f?.applicationId ?? applicationId ?? "none",
      task: f?.task ?? "",
      dueDate: f?.dueDate ?? dayOffset(1),
      assignedTo: f?.assignedTo ?? store.session?.staffId ?? "STF-03",
      priority: f?.priority ?? "Medium",
      status: f?.status ?? "Pending",
      channel: f?.channel ?? "Call",
    },
  });
  const cid = useWatch({ control, name: "customerId" });
  const e = formState.errors;

  const onSubmit = (v: FormValues) => {
    const payload = { ...v, applicationId: v.applicationId !== "none" ? v.applicationId : undefined };
    if (f) {
      store.update("followUps", f.id, payload);
      toast.success("Follow-up updated successfully.");
    } else {
      store.add("followUps", { ...payload, id: store.ids.followUp() });
      store.log({ customerId: v.customerId, applicationId: payload.applicationId, text: `Follow-up scheduled: ${v.task}`, type: "note" });
      toast.success("Follow-up created successfully.");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{f ? "Edit Follow-up" : "Add Follow-up"}</DialogTitle>
          <DialogDescription>Schedule a reminder to contact a customer.</DialogDescription>
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
              <Field label="Task" required error={e.task?.message} className="sm:col-span-2">
                <Input placeholder="e.g. Remind about bank statement" {...register("task", { required: "Describe the task" })} aria-invalid={!!e.task} />
              </Field>
              <Field label="Application">
                <RHFSelect control={control} name="applicationId" options={[{ value: "none", label: "Not linked" }, ...store.applications.filter((x) => x.customerId === cid).map((x) => ({ value: x.id, label: x.id }))]} />
              </Field>
              <Field label="Due Date">
                <Input type="date" {...register("dueDate")} />
              </Field>
              <Field label="Assigned To">
                <RHFSelect control={control} name="assignedTo" options={store.staff.filter((s) => s.status === "Active").map((s) => ({ value: s.id, label: s.name }))} />
              </Field>
              <Field label="Priority">
                <RHFSelect control={control} name="priority" options={[...PRIORITIES]} />
              </Field>
              <Field label="Channel">
                <RHFSelect control={control} name="channel" options={["Call", "WhatsApp", "Email", "Meeting"]} />
              </Field>
              <Field label="Status">
                <RHFSelect control={control} name="status" options={["Pending", "Completed"]} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{f ? "Save Changes" : "Create Follow-up"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
