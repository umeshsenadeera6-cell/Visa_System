import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, BadgeCheck, Banknote, BellRing, CalendarRange, CheckCircle2, CreditCard, Download, Eye, Hourglass, MoreHorizontal, Plus, Receipt, RotateCcw, Trash2, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterGrid, FilterSelect, Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useLookups, useStore } from "@/store/store";
import { paymentsSeed } from "@/data/mock";
import { PAYMENT_METHODS } from "@/lib/domain";
import { cn, dayOffset, downloadCSV, formatDate, formatLKR, todayISO } from "@/lib/utils";
import type { Payment } from "@/data/types";

const monthKey = todayISO().slice(0, 7);
const paidSum = (ps: Payment[], filter: (p: Payment) => boolean = () => true) => ps.filter((p) => p.status === "Paid" && filter(p)).reduce((s, p) => s + p.amount, 0);
const REV_BASE = 77_400_000 - paidSum(paymentsSeed);
const MONTH_BASE = 11_900_000 - paidSum(paymentsSeed, (p) => p.date.startsWith(monthKey));

const methodIcon = { Cash: Banknote, "Bank Transfer": Wallet, Card: CreditCard, Online: TrendingUp };

export default function Payments() {
  const store = useStore();
  const { customerName, staffName } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const loading = useFakeLoading(500);
  const [q, setQ] = useState("");
  const [f, setF] = useState({ status: "all", method: "all", date: "all" });

  const rows = useMemo(
    () =>
      store.payments.filter((p) => {
        if (q && !`${p.id} ${customerName(p.customerId)} ${p.applicationId ?? ""} ${p.reference ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (f.status !== "all" && p.status !== f.status) return false;
        if (f.method !== "all" && p.method !== f.method) return false;
        if (f.date !== "all" && p.date < dayOffset(-Number(f.date))) return false;
        return true;
      }),
    [store.payments, q, f, customerName],
  );
  const table = useTable(rows, {
    pageSize: 10,
    initialSort: { key: "date", dir: "desc" },
    getValue: (p, k) => (k === "customer" ? customerName(p.customerId) : (p as unknown as Record<string, unknown>)[k]),
  });

  const sum = (s: Payment["status"]) => store.payments.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
  const cnt = (s: Payment["status"]) => store.payments.filter((p) => p.status === s).length;
  const cards = [
    { label: "Total Revenue", value: formatLKR(REV_BASE + paidSum(store.payments), true), sub: "Year to date", icon: TrendingUp, cls: "bg-gradient-to-br from-forest to-[#0e5a43] text-white", iconCls: "bg-white/15 text-[#e2c47c]" },
    { label: "This Month", value: formatLKR(MONTH_BASE + paidSum(store.payments, (p) => p.date.startsWith(monthKey)), true), sub: "+14.2% vs last month", icon: CalendarRange, iconCls: "bg-[#faf3e1] text-[#8a6412]" },
    { label: "Paid", value: formatLKR(sum("Paid"), true), sub: `${cnt("Paid")} payments`, icon: BadgeCheck, iconCls: "bg-[#e7f4ee] text-[#0a6446]", filter: "Paid" },
    { label: "Pending", value: formatLKR(sum("Pending"), true), sub: `${cnt("Pending")} payments`, icon: Hourglass, iconCls: "bg-[#ebf2fe] text-[#2856b8]", filter: "Pending" },
    { label: "Overdue", value: formatLKR(sum("Overdue"), true), sub: `${cnt("Overdue")} payments`, icon: AlertCircle, iconCls: "bg-[#fdeeec] text-[#b4321f]", filter: "Overdue" },
  ];

  const markPaid = (p: Payment) => {
    store.update("payments", p.id, { status: "Paid", date: todayISO(), receivedBy: store.session?.staffId ?? "STF-08", reference: p.reference ?? `TXN${Date.now().toString().slice(-6)}` });
    store.log({ customerId: p.customerId, applicationId: p.applicationId, text: `Payment ${p.id} marked as paid`, type: "payment" });
    toast.success("Payment marked as paid.", { description: formatLKR(p.amount) });
  };

  const RowMenu = ({ p }: { p: Payment }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {p.invoiceId && (
          <DropdownMenuItem onClick={() => modals.open("invoice", { invoiceId: p.invoiceId! })}>
            <Receipt /> View invoice
          </DropdownMenuItem>
        )}
        {p.status !== "Paid" && (
          <DropdownMenuItem onClick={() => markPaid(p)}>
            <CheckCircle2 /> Mark as paid
          </DropdownMenuItem>
        )}
        {p.status !== "Paid" && (
          <DropdownMenuItem onClick={() => toast.success("Reminder queued.", { description: `SMS/WhatsApp reminder to ${customerName(p.customerId)} will send after backend integration.` })}>
            <BellRing /> Send reminder
          </DropdownMenuItem>
        )}
        {p.status === "Paid" && (
          <DropdownMenuItem onClick={() => toast.info(`Receipt for ${p.id}`, { description: "PDF receipts will be available after backend integration." })}>
            <Eye /> View receipt
          </DropdownMenuItem>
        )}
        {p.status === "Paid" && (
          <DropdownMenuItem
            onClick={() => {
              store.update("payments", p.id, { status: "Refunded" });
              toast.success("Payment refunded.");
            }}
          >
            <RotateCcw /> Refund
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              title: `Delete payment ${p.id}?`,
              description: "This will affect invoice balances in the demo.",
              onConfirm: () => {
                store.remove("payments", p.id);
                toast.success("Deleted successfully.");
              },
            })
          }
        >
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track collections, pending balances and overdue payments."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                downloadCSV(
                  "payments.csv",
                  rows.map((p) => ({ id: p.id, customer: customerName(p.customerId), application: p.applicationId ?? "", amount: p.amount, method: p.method, date: p.date, status: p.status, receivedBy: staffName(p.receivedBy) })),
                );
                toast.success("Export ready.");
              }}
            >
              <Download /> Export
            </Button>
            <Button onClick={() => modals.open("payment")}>
              <Plus /> Add Payment
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="mb-4">
          <KpiSkeleton count={5} />
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {cards.map((c, i) => (
            <Card
              key={c.label}
              onClick={() => c.filter && setF((x) => ({ ...x, status: x.status === c.filter ? "all" : c.filter! }))}
              className={cn("p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-5", c.cls, c.filter && "cursor-pointer", i === 0 && "col-span-2 md:col-span-1", f.status === c.filter && "ring-2 ring-primary/30")}
            >
              <span className={cn("flex size-9 items-center justify-center rounded-xl", c.iconCls)}>
                <c.icon className="size-[18px]" />
              </span>
              <p className={cn("mt-4 text-[12.5px] font-medium", i === 0 ? "text-white/70" : "text-muted-foreground")}>{c.label}</p>
              <p className="font-display text-2xl font-bold tabular">{c.value}</p>
              <p className={cn("mt-0.5 text-xs", i === 0 ? "text-white/60" : "text-muted-foreground")}>{c.sub}</p>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={(q ? 1 : 0) + Object.values(f).filter((v) => v !== "all").length} onClear={() => (setQ(""), setF({ status: "all", method: "all", date: "all" }))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search payment, customer, reference…" className="sm:w-80" />
            <FilterGrid>
              <FilterSelect label="Statuses" value={f.status} onChange={(v) => setF((x) => ({ ...x, status: v }))} options={["Paid", "Pending", "Overdue", "Refunded"]} />
              <FilterSelect label="Methods" value={f.method} onChange={(v) => setF((x) => ({ ...x, method: v }))} options={[...PAYMENT_METHODS]} />
              <FilterSelect
                label="Dates"
                value={f.date}
                onChange={(v) => setF((x) => ({ ...x, date: v }))}
                options={[
                  { value: "7", label: "Last 7 days" },
                  { value: "30", label: "Last 30 days" },
                  { value: "90", label: "Last 90 days" },
                ]}
              />
            </FilterGrid>
          </Toolbar>
          {rows.length === 0 ? (
            <EmptyState icon={CreditCard} title="No payments found" description="Try changing your filters or record a new payment." action={<Button onClick={() => modals.open("payment")}><Plus /> Add Payment</Button>} />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Payment ID" sortKey="id" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Customer" sortKey="customer" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Application</TableHead>
                      <SortableHead label="Amount" sortKey="amount" sort={table.sort} onSort={table.toggleSort} className="text-right" />
                      <TableHead>Method</TableHead>
                      <SortableHead label="Date" sortKey="date" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Received By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((p) => {
                      const M = methodIcon[p.method];
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="text-[13px] font-medium">{p.id}</p>
                            <p className="text-[11.5px] text-muted-foreground">{p.description}</p>
                          </TableCell>
                          <TableCell>
                            <Link to={`/app/customers/${p.customerId}`} className="flex items-center gap-2.5">
                              <UserAvatar name={customerName(p.customerId)} className="size-7 text-[10px]" />
                              <span className="font-medium hover:text-primary">{customerName(p.customerId)}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {p.applicationId ? (
                              <Link to={`/app/applications/${p.applicationId}`} className="text-[13px] text-primary hover:underline">
                                {p.applicationId}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular">{formatLKR(p.amount)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-[13px]">
                              <M className="size-3.5 text-muted-foreground" /> {p.method}
                            </span>
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{formatDate(p.date)}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} />
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{p.receivedBy ? staffName(p.receivedBy) : "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {p.status !== "Paid" && p.status !== "Refunded" && (
                                <Button size="sm" variant="outline" onClick={() => markPaid(p)}>
                                  Mark paid
                                </Button>
                              )}
                              <RowMenu p={p} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((p) => (
                  <MobileCard
                    key={p.id}
                    leading={<UserAvatar name={customerName(p.customerId)} />}
                    title={customerName(p.customerId)}
                    subtitle={`${p.id} · ${p.method}`}
                    badge={<StatusBadge status={p.status} />}
                    actions={<RowMenu p={p} />}
                    meta={[
                      { label: "Amount", value: formatLKR(p.amount) },
                      { label: "Date", value: formatDate(p.date) },
                    ]}
                  />
                ))}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="payments" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
