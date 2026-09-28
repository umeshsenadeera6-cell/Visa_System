import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CircleDashed, ClipboardList, Clock, Wallet } from "lucide-react";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormGrid, RHFSelect } from "@/components/shared/Form";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStore } from "@/store/store";
import { PRIORITIES } from "@/lib/domain";
import { dayOffset, formatLKR } from "@/lib/utils";
import type { Priority } from "@/data/types";
import type { ModalProps } from "./context";

interface FormValues {
  customerId: string;
  countryCode: string;
  visaTypeId: string;
  travelDate: string;
  consultantId: string;
  priority: Priority;
  purpose: string;
  notes: string;
}

export function ApplicationModal({ open, onClose, customerId, countryCode }: ModalProps & { customerId?: string; countryCode?: string }) {
  const store = useStore();
  const navigate = useNavigate();
  const cust = store.customers.find((c) => c.id === customerId);
  const { register, handleSubmit, control, setValue, formState } = useForm<FormValues>({
    defaultValues: {
      customerId: customerId ?? "",
      countryCode: countryCode ?? cust?.travel.preferredDestination ?? "",
      visaTypeId: "",
      travelDate: cust?.travel.plannedDate ?? dayOffset(60),
      consultantId: cust?.assignedTo ?? "STF-03",
      priority: "Medium",
      purpose: "",
      notes: "",
    },
  });
  const [cc, vtId] = useWatch({ control, name: ["countryCode", "visaTypeId"] });
  const visaOptions = store.visaTypes.filter((v) => v.countryCode === cc && v.status === "Active");
  const vt = store.visaTypes.find((v) => v.id === vtId);
  const reqs = vtId ? (store.requirements[vtId] ?? []) : [];
  const e = formState.errors;

  const onSubmit = (v: FormValues) => {
    const id = store.createApplication({ ...v, purpose: v.purpose || `${vt?.category} travel` });
    toast.success("Application created successfully.", { description: `${id} · document checklist generated` });
    onClose();
    navigate(`/app/applications/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>New Visa Application</DialogTitle>
          <DialogDescription>Select the destination and visa type — the document checklist is generated automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <FormGrid className="content-start">
              <Field label="Customer" required error={e.customerId?.message} className="sm:col-span-2">
                <RHFSelect
                  control={control}
                  name="customerId"
                  rules={{ required: "Select a customer" }}
                  placeholder="Select customer"
                  options={store.customers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName} · ${c.id}` }))}
                  onValueChange={(id) => {
                    const c = store.customers.find((x) => x.id === id);
                    if (c) setValue("consultantId", c.assignedTo);
                  }}
                />
              </Field>
              <Field label="Country" required error={e.countryCode?.message}>
                <RHFSelect
                  control={control}
                  name="countryCode"
                  rules={{ required: "Select a country" }}
                  placeholder="Select country"
                  options={store.countries.filter((c) => c.status === "Active").map((c) => ({ value: c.code, label: `${c.flag}  ${c.name}` }))}
                  onValueChange={() => setValue("visaTypeId", "")}
                />
              </Field>
              <Field label="Visa Type" required error={e.visaTypeId?.message}>
                <RHFSelect
                  control={control}
                  name="visaTypeId"
                  rules={{ required: "Select a visa type" }}
                  placeholder={cc ? "Select visa type" : "Select a country first"}
                  disabled={!cc}
                  options={visaOptions.map((v) => ({ value: v.id, label: `${v.category} — ${v.name}` }))}
                />
              </Field>
              <Field label="Intended Travel Date">
                <Input type="date" {...register("travelDate")} />
              </Field>
              <Field label="Priority">
                <RHFSelect control={control} name="priority" options={[...PRIORITIES]} />
              </Field>
              <Field label="Assigned Consultant" className="sm:col-span-2">
                <RHFSelect
                  control={control}
                  name="consultantId"
                  options={store.staff.filter((s) => s.status === "Active" && ["Visa Consultant", "Manager"].includes(s.role)).map((s) => ({ value: s.id, label: s.name }))}
                />
              </Field>
              <Field label="Purpose of Travel" className="sm:col-span-2">
                <Input placeholder="e.g. Holiday & sightseeing in London" {...register("purpose")} />
              </Field>
              <Field label="Internal Notes" className="sm:col-span-2">
                <Textarea rows={2} {...register("notes")} />
              </Field>
            </FormGrid>

            <aside className="rounded-2xl border border-border bg-[#f8faf9] p-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" />
                <p className="text-sm font-semibold">Document Checklist</p>
              </div>
              {!vt ? (
                <div className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground">
                  <CircleDashed className="mb-2 size-6" />
                  Choose a country and visa type to preview the required documents.
                </div>
              ) : (
                <div className="page-enter">
                  <p className="mt-1 text-xs text-muted-foreground">{vt.name}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-white p-2 shadow-xs">
                      <Clock className="mb-1 size-3.5 text-muted-foreground" />
                      <p className="text-muted-foreground">Processing</p>
                      <p className="font-semibold">{vt.processingTime}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 shadow-xs">
                      <Wallet className="mb-1 size-3.5 text-muted-foreground" />
                      <p className="text-muted-foreground">Service fee</p>
                      <p className="font-semibold tabular">{formatLKR(vt.fee)}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {reqs.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-[13px] shadow-xs">
                        <span className="flex min-w-0 items-center gap-2">
                          <CheckCircle2 className="size-3.5 shrink-0 text-primary/70" />
                          <span className="truncate">{r.name}</span>
                        </span>
                        <StatusBadge status={r.level} dot={false} className="text-[10.5px]" />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11.5px] text-muted-foreground">{reqs.length} documents · an invoice will be generated automatically.</p>
                </div>
              )}
            </aside>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
