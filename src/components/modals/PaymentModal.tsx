import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormGrid, RHFSelect } from "@/components/shared/Form";
import { useStore } from "@/store/store";
import { PAYMENT_METHODS, invoiceTotals } from "@/lib/domain";
import { formatLKR, todayISO } from "@/lib/utils";
import type { PaymentMethod, PaymentStatus } from "@/data/types";
import { useModals, type ModalProps } from "./context";

interface FormValues {
  customerId: string;
  applicationId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
  reference: string;
  description: string;
}

export function PaymentModal({ open, onClose, customerId, applicationId, invoiceId }: ModalProps & { customerId?: string; applicationId?: string; invoiceId?: string }) {
  const store = useStore();
  const modals = useModals();
  const inv0 = store.invoices.find((i) => i.id === invoiceId) ?? store.invoices.find((i) => i.applicationId === applicationId);
  const cust0 = customerId ?? inv0?.customerId ?? store.applications.find((a) => a.id === applicationId)?.customerId ?? "";
  const bal0 = inv0 ? invoiceTotals(inv0, store.payments).balance : 0;
  const { register, handleSubmit, control, setValue, formState } = useForm<FormValues>({
    defaultValues: {
      customerId: cust0,
      applicationId: applicationId ?? inv0?.applicationId ?? "none",
      invoiceId: inv0?.id ?? "none",
      amount: bal0 || undefined,
      method: "Bank Transfer",
      date: todayISO(),
      status: "Paid",
      reference: "",
      description: bal0 ? "Balance payment" : "Advance payment",
    },
  });
  const [cid, aid, iid] = useWatch({ control, name: ["customerId", "applicationId", "invoiceId"] });
  const apps = store.applications.filter((a) => a.customerId === cid);
  const invs = store.invoices.filter((i) => i.customerId === cid && (aid === "none" || i.applicationId === aid));
  const selectedInv = store.invoices.find((i) => i.id === iid);
  const totals = useMemo(() => (selectedInv ? invoiceTotals(selectedInv, store.payments) : null), [selectedInv, store.payments]);
  const e = formState.errors;

  const onSubmit = (v: FormValues) => {
    const id = store.addPayment({
      customerId: v.customerId,
      applicationId: v.applicationId !== "none" ? v.applicationId : undefined,
      invoiceId: v.invoiceId !== "none" ? v.invoiceId : undefined,
      amount: Number(v.amount),
      method: v.method,
      date: v.date,
      status: v.status,
      receivedBy: v.status === "Paid" ? (store.session?.staffId ?? "STF-08") : undefined,
      reference: v.reference || undefined,
      description: v.description || "Payment",
    });
    toast.success("Payment added.", {
      description: `${formatLKR(Number(v.amount))} · ${id}`,
      action: v.invoiceId !== "none" ? { label: "View invoice", onClick: () => modals.open("invoice", { invoiceId: v.invoiceId }) } : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>Record a payment against a customer invoice.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="space-y-5">
            <FormGrid>
              <Field label="Customer" required error={e.customerId?.message} className="sm:col-span-2">
                <RHFSelect
                  control={control}
                  name="customerId"
                  rules={{ required: "Select a customer" }}
                  placeholder="Select customer"
                  options={store.customers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName} · ${c.id}` }))}
                  onValueChange={() => {
                    setValue("applicationId", "none");
                    setValue("invoiceId", "none");
                  }}
                />
              </Field>
              <Field label="Application">
                <RHFSelect
                  control={control}
                  name="applicationId"
                  options={[{ value: "none", label: "Not linked" }, ...apps.map((a) => ({ value: a.id, label: a.id }))]}
                  onValueChange={(v) => {
                    const inv = store.invoices.find((i) => i.applicationId === v);
                    setValue("invoiceId", inv?.id ?? "none");
                    if (inv) setValue("amount", invoiceTotals(inv, store.payments).balance);
                  }}
                />
              </Field>
              <Field label="Invoice">
                <RHFSelect
                  control={control}
                  name="invoiceId"
                  options={[{ value: "none", label: "No invoice" }, ...invs.map((i) => ({ value: i.id, label: i.id }))]}
                  onValueChange={(v) => {
                    const inv = store.invoices.find((i) => i.id === v);
                    if (inv) setValue("amount", invoiceTotals(inv, store.payments).balance);
                  }}
                />
              </Field>
            </FormGrid>
            {totals && (
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-[#f8faf9] p-3 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Invoice total</p>
                  <p className="mt-0.5 font-semibold tabular">{formatLKR(totals.total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="mt-0.5 font-semibold text-[#177245] tabular">{formatLKR(totals.paid)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className="mt-0.5 font-semibold text-[#b24c0c] tabular">{formatLKR(totals.balance)}</p>
                </div>
              </div>
            )}
            <FormGrid>
              <Field label="Amount (LKR)" required error={e.amount?.message}>
                <Input type="number" min={1} step="any" {...register("amount", { required: "Enter an amount", min: { value: 1, message: "Must be greater than 0" }, valueAsNumber: true })} aria-invalid={!!e.amount} />
              </Field>
              <Field label="Payment Method">
                <RHFSelect control={control} name="method" options={[...PAYMENT_METHODS]} />
              </Field>
              <Field label="Payment Date">
                <Input type="date" {...register("date")} />
              </Field>
              <Field label="Status">
                <RHFSelect control={control} name="status" options={["Paid", "Pending"]} />
              </Field>
              <Field label="Reference / Transaction ID">
                <Input placeholder="Optional" {...register("reference")} />
              </Field>
              <Field label="Description">
                <Input {...register("description")} />
              </Field>
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
