import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Download, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoRow } from "@/components/shared/SectionCard";
import { LogoMark } from "@/components/shared/Logo";
import { useLookups, useStore } from "@/store/store";
import { formatDate, formatLKR } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export function ReceiptDialogButton({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);
  const store = useStore();
  const { customerName, staffName } = useLookups();
  const p = store.payments.find((x) => x.id === paymentId);
  if (!p) return null;
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <ReceiptText /> Receipt
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center border-0 pb-0 text-center">
            <LogoMark className="size-10" />
            <DialogTitle className="mt-2">Payment Receipt</DialogTitle>
            <DialogDescription>Serendib Visa Services</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="mb-4 flex flex-col items-center rounded-xl bg-[#eef6f2] py-4">
              <CheckCircle2 className="size-7 text-primary" />
              <p className="mt-1 font-display text-2xl font-bold tabular">{formatLKR(p.amount)}</p>
              <p className="text-xs text-muted-foreground">Payment received</p>
            </div>
            <dl className="divide-y divide-dashed divide-border">
              <InfoRow label="Receipt no." value={p.id.replace("PAY", "RCT")} />
              <InfoRow label="Customer" value={customerName(p.customerId)} />
              <InfoRow label="Application" value={p.applicationId} />
              <InfoRow label="Invoice" value={p.invoiceId} />
              <InfoRow label="Date" value={formatDate(p.date)} />
              <InfoRow label="Method" value={p.method} />
              <InfoRow label="Reference" value={p.reference} />
              <InfoRow label="Received by" value={staffName(p.receivedBy)} />
            </dl>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => toast.info("PDF generation will be available after backend integration.")}>
              <Download /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PortalPayments() {
  const { customer, store } = usePortalCustomer();
  const pays = store.payments.filter((p) => p.customerId === customer.id).sort((a, b) => b.date.localeCompare(a.date));
  const paid = pays.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const due = pays.filter((p) => p.status === "Pending" || p.status === "Overdue").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <h1 className="text-2xl font-bold">Payments</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Your payment history and receipts.</p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total paid</p>
          <p className="font-display text-2xl font-bold text-primary tabular">{formatLKR(paid)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Upcoming / due</p>
          <p className="font-display text-2xl font-bold tabular">{formatLKR(due)}</p>
        </Card>
      </div>
      <Card className="overflow-hidden">
        {pays.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments yet" />
        ) : (
          <ul className="divide-y divide-border">
            {pays.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#faf3e1] text-[#8a6412]">
                  <CreditCard className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.date)} · {p.method} · {p.applicationId}
                  </p>
                </div>
                <p className="font-semibold tabular">{formatLKR(p.amount)}</p>
                <StatusBadge status={p.status} />
                {p.status === "Paid" ? (
                  <ReceiptDialogButton paymentId={p.id} />
                ) : (
                  <Button size="sm" variant="gold" onClick={() => toast.info("Online card payments will be available after payment gateway integration.")}>
                    Pay now
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
