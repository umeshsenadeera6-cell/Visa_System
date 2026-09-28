import { toast } from "sonner";
import { Download, Printer, Send } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/Logo";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useLookups, useStore } from "@/store/store";
import { invoiceTotals } from "@/lib/domain";
import { formatDate, formatLKR } from "@/lib/utils";
import type { ModalProps } from "./context";

export function InvoicePreview({ open, onClose, invoiceId }: ModalProps & { invoiceId: string }) {
  const store = useStore();
  const { customer, application, visaType, country } = useLookups();
  const inv = store.invoices.find((i) => i.id === invoiceId);
  if (!inv) return null;
  const c = customer(inv.customerId);
  const app = application(inv.applicationId);
  const vt = visaType(app?.visaTypeId);
  const t = invoiceTotals(inv, store.payments);
  const payments = store.payments.filter((p) => p.invoiceId === inv.id && p.status === "Paid");

  const backendToast = (what: string) => toast.info(`${what} will be available after backend integration.`);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl bg-[#f3f5f4]">
        <DialogTitle className="sr-only">Invoice {inv.id}</DialogTitle>
        <DialogDescription className="sr-only">Invoice preview</DialogDescription>
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-5 py-3 pr-12">
          <p className="mr-auto text-sm font-semibold">Invoice preview</p>
          <Button size="sm" variant="outline" onClick={() => backendToast("PDF generation")}>
            <Download /> Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          <Button size="sm" onClick={() => backendToast("Email delivery")}>
            <Send /> Send
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin sm:p-6">
          <article className="print-area mx-auto max-w-[720px] rounded-xl bg-white p-6 text-[13px] shadow-[var(--shadow-soft)] sm:p-10">
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <LogoMark className="size-12" />
                <div>
                  <p className="font-display text-lg font-extrabold tracking-wide text-forest">SERENDIB VISA SERVICES</p>
                  <p className="text-xs text-muted-foreground">No. 45, Galle Road, Colombo 03, Sri Lanka</p>
                  <p className="text-xs text-muted-foreground">+94 11 234 5678 · accounts@serendibvisa.lk</p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">Invoice</p>
                <p className="font-display text-xl font-bold">{inv.id}</p>
                <div className="mt-1 sm:flex sm:justify-end">
                  <StatusBadge status={t.status} />
                </div>
              </div>
            </header>

            <div className="my-6 h-px bg-gradient-to-r from-gold/60 via-border to-transparent" />

            <section className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Billed to</p>
                <p className="mt-1.5 font-semibold">
                  {c?.firstName} {c?.lastName}
                </p>
                <p className="text-muted-foreground">{c?.id}</p>
                <p className="text-muted-foreground">{c?.email}</p>
                <p className="text-muted-foreground">{c?.phone}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Service</p>
                <p className="mt-1.5 font-semibold">{vt ? `${country(vt.countryCode)?.name} — ${vt.category} Visa` : "Consultation"}</p>
                <p className="text-muted-foreground">{app?.id ?? "—"}</p>
                <p className="text-muted-foreground">{vt?.name}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Dates</p>
                <p className="mt-1.5">
                  <span className="text-muted-foreground">Issued: </span>
                  {formatDate(inv.date)}
                </p>
                <p>
                  <span className="text-muted-foreground">Due: </span>
                  {formatDate(inv.dueDate)}
                </p>
              </div>
            </section>

            <table className="mt-8 w-full">
              <thead>
                <tr className="border-b-2 border-forest/80 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="py-2 font-semibold">Description</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((it) => (
                  <tr key={it.description} className="border-b border-border">
                    <td className="py-3">{it.description}</td>
                    <td className="py-3 text-right tabular">{formatLKR(it.amount)}</td>
                  </tr>
                ))}
                {!inv.items.some((i) => i.description.startsWith("Other")) && (
                  <tr className="border-b border-border text-muted-foreground">
                    <td className="py-3">Other Charges</td>
                    <td className="py-3 text-right tabular">{formatLKR(0)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <section className="mt-6 flex flex-col-reverse gap-6 sm:flex-row sm:justify-between">
              <div className="max-w-xs text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Payment details</p>
                <p className="mt-1">Commercial Credit Bank · Colombo 03</p>
                <p>Account: 1002 3344 5566 · Serendib Visa Services (Pvt) Ltd</p>
                <p className="mt-3">{inv.notes}</p>
                <p className="mt-2 italic">Government and embassy fees are non-refundable once the application is submitted.</p>
              </div>
              <dl className="w-full space-y-1.5 sm:w-64">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular">{formatLKR(t.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="tabular">− {formatLKR(inv.discount)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-[15px] font-bold">
                  <dt>Total</dt>
                  <dd className="tabular">{formatLKR(t.total)}</dd>
                </div>
                <div className="flex justify-between text-[#177245]">
                  <dt>Paid</dt>
                  <dd className="tabular">{formatLKR(t.paid)}</dd>
                </div>
                <div className="flex justify-between rounded-lg bg-[#faf3e1] px-3 py-2 font-semibold text-[#6b4d0c]">
                  <dt>Balance</dt>
                  <dd className="tabular">{formatLKR(t.balance)}</dd>
                </div>
              </dl>
            </section>

            {payments.length > 0 && (
              <section className="mt-8">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Payments received</p>
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                      <span>
                        {formatDate(p.date)} · {p.method} · <span className="text-muted-foreground">{p.id}</span>
                      </span>
                      <span className="font-medium tabular">{formatLKR(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="mt-10 border-t border-border pt-4 text-center text-[11px] text-muted-foreground">
              This is a computer-generated invoice. Serendib Visa Services provides consultation and application support; visa decisions are made solely by the relevant immigration authority.
            </footer>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
