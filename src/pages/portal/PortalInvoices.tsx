import { Eye, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useModals } from "@/components/modals/context";
import { invoiceTotals } from "@/lib/domain";
import { formatDate, formatLKR } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalInvoices() {
  const { customer, store } = usePortalCustomer();
  const modals = useModals();
  const invs = store.invoices.filter((i) => i.customerId === customer.id);
  return (
    <div>
      <h1 className="text-2xl font-bold">Invoices</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Invoices for your visa services.</p>
      {invs.length === 0 ? (
        <Card>
          <EmptyState icon={Receipt} title="No invoices yet" />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {invs.map((i) => {
            const t = invoiceTotals(i, store.payments);
            return (
              <Card key={i.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-bold">{i.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued {formatDate(i.date)} · due {formatDate(i.dueDate)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold tabular">{formatLKR(t.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-semibold text-[#177245] tabular">{formatLKR(t.paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-semibold tabular">{formatLKR(t.balance)}</p>
                  </div>
                </div>
                <Progress value={(t.paid / Math.max(t.total, 1)) * 100} className="mt-4 h-1.5" />
                <Button variant="outline" className="mt-5 w-full" onClick={() => modals.open("invoice", { invoiceId: i.id, customerView: true })}>
                  <Eye /> View invoice
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
