import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, Download, Eye, FileText, MoreHorizontal, Receipt, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useLookups, useStore } from "@/store/store";
import { invoiceTotals } from "@/lib/domain";
import { cn, downloadCSV, formatDate, formatLKR } from "@/lib/utils";
import type { InvoiceStatus } from "@/data/types";

const STATUSES: InvoiceStatus[] = ["Paid", "Partially Paid", "Pending", "Overdue"];

export default function Invoices() {
  const store = useStore();
  const { customerName } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const loading = useFakeLoading(500);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");

  const enriched = useMemo(() => store.invoices.map((i) => ({ ...i, ...invoiceTotals(i, store.payments) })), [store.invoices, store.payments]);
  const rows = enriched.filter((i) => (status === "all" || i.status === status) && (!q || `${i.id} ${customerName(i.customerId)} ${i.applicationId ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const table = useTable(rows, { pageSize: 10, initialSort: { key: "date", dir: "desc" }, getValue: (r, k) => (k === "customer" ? customerName(r.customerId) : (r as unknown as Record<string, unknown>)[k]) });

  const outstanding = enriched.reduce((s, i) => s + i.balance, 0);
  const pdf = () => toast.info("PDF generation will be available after backend integration.");

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${formatLKR(outstanding)} outstanding across ${enriched.filter((i) => i.balance > 0).length} invoices`}
        actions={
          <Button
            variant="outline"
            onClick={() => {
              downloadCSV("invoices.csv", rows.map((i) => ({ invoice: i.id, customer: customerName(i.customerId), application: i.applicationId ?? "", total: i.total, paid: i.paid, balance: i.balance, date: i.date, status: i.status })));
              toast.success("Export ready.");
            }}
          >
            <Download /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUSES.map((s) => {
          const list = enriched.filter((i) => i.status === s);
          return (
            <button key={s} onClick={() => setStatus(status === s ? "all" : s)} className="text-left">
              <Card className={cn("p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]", status === s && "ring-2 ring-primary/30")}>
                <div className="flex items-center justify-between">
                  <StatusBadge status={s} />
                  <span className="text-xs text-muted-foreground tabular">{list.length}</span>
                </div>
                <p className="mt-3 font-display text-xl font-bold tabular">{formatLKR(list.reduce((a, i) => a + (s === "Paid" ? i.total : i.balance), 0), true)}</p>
                <p className="text-xs text-muted-foreground">{s === "Paid" ? "collected" : "balance due"}</p>
              </Card>
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={(q ? 1 : 0) + (status !== "all" ? 1 : 0)} onClear={() => (setQ(""), setStatus("all"))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search invoice, customer, application…" className="sm:w-80" />
          </Toolbar>
          {rows.length === 0 ? (
            <EmptyState icon={Receipt} title="No invoices found" description="Invoices are generated automatically when a new application is created." />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Invoice Number" sortKey="id" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Customer" sortKey="customer" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Application</TableHead>
                      <SortableHead label="Amount" sortKey="total" sort={table.sort} onSort={table.toggleSort} className="text-right" />
                      <SortableHead label="Paid" sortKey="paid" sort={table.sort} onSort={table.toggleSort} className="text-right" />
                      <SortableHead label="Balance" sortKey="balance" sort={table.sort} onSort={table.toggleSort} className="text-right" />
                      <SortableHead label="Date" sortKey="date" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((i) => (
                      <TableRow key={i.id} className="cursor-pointer" onClick={() => modals.open("invoice", { invoiceId: i.id })}>
                        <TableCell>
                          <span className="flex items-center gap-2 font-medium">
                            <FileText className="size-4 text-muted-foreground" /> {i.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={customerName(i.customerId)} className="size-7 text-[10px]" />
                            <span className="font-medium">{customerName(i.customerId)}</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {i.applicationId ? (
                            <Link to={`/app/applications/${i.applicationId}`} className="text-[13px] text-primary hover:underline">
                              {i.applicationId}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular">{formatLKR(i.total)}</TableCell>
                        <TableCell className="text-right text-[#177245] tabular">{formatLKR(i.paid)}</TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold tabular">{formatLKR(i.balance)}</p>
                          <Progress value={i.total ? (i.paid / i.total) * 100 : 0} className="mt-1 ml-auto h-1 w-20" />
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{formatDate(i.date)}</TableCell>
                        <TableCell>
                          <StatusBadge status={i.status} />
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label="Actions">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => modals.open("invoice", { invoiceId: i.id })}>
                                <Eye /> Preview
                              </DropdownMenuItem>
                              {i.balance > 0 && (
                                <DropdownMenuItem onClick={() => modals.open("payment", { invoiceId: i.id, customerId: i.customerId, applicationId: i.applicationId })}>
                                  <CreditCard /> Record payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={pdf}>
                                <Download /> Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Email delivery will be available after backend integration.")}>
                                <Send /> Send to customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  confirm({
                                    title: `Delete ${i.id}?`,
                                    onConfirm: () => {
                                      store.remove("invoices", i.id);
                                      toast.success("Deleted successfully.");
                                    },
                                  })
                                }
                              >
                                <Trash2 /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((i) => (
                  <MobileCard
                    key={i.id}
                    title={i.id}
                    subtitle={customerName(i.customerId)}
                    badge={<StatusBadge status={i.status} />}
                    onClick={() => modals.open("invoice", { invoiceId: i.id })}
                    meta={[
                      { label: "Amount", value: formatLKR(i.total) },
                      { label: "Balance", value: formatLKR(i.balance) },
                    ]}
                  />
                ))}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="invoices" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
