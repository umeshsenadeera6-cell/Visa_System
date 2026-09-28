import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Download, Eye, FilePlus2, MoreHorizontal, Pencil, Plus, Trash2, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterGrid, FilterSelect, Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CountryLabel } from "@/components/shared/Country";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useLookups, useStore } from "@/store/store";
import { dayOffset, downloadCSV, formatDate } from "@/lib/utils";
import { passportState } from "@/lib/domain";
import type { Customer } from "@/data/types";

export default function Customers() {
  const store = useStore();
  const { staffName } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [f, setF] = useState({ country: "all", status: "all", staff: "all", date: "all" });
  const loading = useFakeLoading(500);

  const activeApp = useMemo(() => {
    const m = new Map<string, (typeof store.applications)[number]>();
    [...store.applications]
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
      .forEach((a) => m.set(a.customerId, a));
    return m;
  }, [store.applications]);

  const rows = useMemo(() => {
    const n = q.toLowerCase().trim();
    return store.customers.filter((c) => {
      const app = activeApp.get(c.id);
      if (n && !`${c.firstName} ${c.lastName} ${c.id} ${c.email} ${c.phone} ${c.passport.number} ${c.nic}`.toLowerCase().includes(n)) return false;
      if (f.country !== "all" && (app?.countryCode ?? c.travel.preferredDestination) !== f.country) return false;
      if (f.status !== "all" && (app?.status ?? "No application") !== f.status && c.status !== f.status) return false;
      if (f.staff !== "all" && c.assignedTo !== f.staff) return false;
      if (f.date !== "all" && c.createdAt < dayOffset(-Number(f.date))) return false;
      return true;
    });
  }, [store.customers, q, f, activeApp]);

  const table = useTable(rows, {
    pageSize: 10,
    initialSort: { key: "createdAt", dir: "desc" },
    getValue: (c, k) => (k === "name" ? `${c.firstName} ${c.lastName}` : (c as unknown as Record<string, unknown>)[k]),
  });
  const activeFilters = Object.values(f).filter((v) => v !== "all").length + (q ? 1 : 0);

  const remove = (c: Customer) =>
    confirm({
      title: `Delete ${c.firstName} ${c.lastName}?`,
      description: "This removes the customer profile from the demo. Applications and payments remain for audit.",
      onConfirm: () => {
        store.remove("customers", c.id);
        toast.success("Deleted successfully.", { description: `${c.id} removed.` });
      },
    });

  const RowMenu = ({ c }: { c: Customer }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => navigate(`/app/customers/${c.id}`)}>
          <Eye /> View profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => modals.open("customer", { customer: c })}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => modals.open("application", { customerId: c.id })}>
          <FilePlus2 /> New application
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => remove(c)}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${store.customers.length} customers · ${store.customers.filter((c) => c.status === "Active").length} with active files`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                downloadCSV(
                  "customers.csv",
                  rows.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, phone: c.phone, passport: c.passport.number, consultant: staffName(c.assignedTo), status: c.status })),
                );
                toast.success("Export ready.", { description: `${rows.length} customers exported.` });
              }}
            >
              <Download /> Export
            </Button>
            <Button onClick={() => modals.open("customer")}>
              <Plus /> Add Customer
            </Button>
          </>
        }
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={activeFilters} onClear={() => (setQ(""), setF({ country: "all", status: "all", staff: "all", date: "all" }))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, ID, passport, phone…" className="sm:w-80" />
            <FilterGrid>
              <FilterSelect label="Countries" value={f.country} onChange={(v) => setF((x) => ({ ...x, country: v }))} options={store.countries.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
              <FilterSelect
                label="Visa Statuses"
                value={f.status}
                onChange={(v) => setF((x) => ({ ...x, status: v }))}
                options={["Documents Pending", "Documents Uploaded", "Submitted", "Under Processing", "Completed", "No application"]}
              />
              <FilterSelect
                label="Consultants"
                value={f.staff}
                onChange={(v) => setF((x) => ({ ...x, staff: v }))}
                options={store.staff.filter((s) => s.role === "Visa Consultant").map((s) => ({ value: s.id, label: s.name }))}
              />
              <FilterSelect
                label="Dates"
                value={f.date}
                onChange={(v) => setF((x) => ({ ...x, date: v }))}
                options={[
                  { value: "7", label: "Joined last 7 days" },
                  { value: "30", label: "Joined last 30 days" },
                  { value: "90", label: "Joined last 90 days" },
                ]}
              />
            </FilterGrid>
          </Toolbar>

          {rows.length === 0 ? (
            <EmptyState
              icon={UserRoundSearch}
              title="No customers found"
              description="Try changing your filters or create a new customer."
              action={
                <Button onClick={() => modals.open("customer")}>
                  <Plus /> Add Customer
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Customer ID" sortKey="id" sort={table.sort} onSort={table.toggleSort} className="hidden 2xl:table-cell" />
                      <SortableHead label="Customer" sortKey="name" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Passport</TableHead>
                      <TableHead className="hidden xl:table-cell">Phone</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Active Application</TableHead>
                      <TableHead>Assigned Staff</TableHead>
                      <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((c) => {
                      const app = activeApp.get(c.id);
                      const ps = c.passport.expiryDate ? passportState(c.passport.expiryDate) : null;
                      return (
                        <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/app/customers/${c.id}`)}>
                          <TableCell className="hidden text-xs font-medium text-muted-foreground 2xl:table-cell">{c.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <UserAvatar name={`${c.firstName} ${c.lastName}`} className="size-9" />
                              <div>
                                <p className="font-medium">
                                  {c.firstName} {c.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{c.id} · <span className="hidden xl:inline">{c.email}</span></p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-mono text-[12.5px]">{c.passport.number || "—"}</p>
                            {ps && ps.days < 180 && <p className={ps.days < 0 ? "text-[11px] text-[#b4321f]" : "text-[11px] text-[#98600a]"}>Exp. {formatDate(c.passport.expiryDate)}</p>}
                          </TableCell>
                          <TableCell className="hidden text-[13px] xl:table-cell">{c.phone}</TableCell>
                          <TableCell>
                            <CountryLabel code={app?.countryCode ?? c.travel.preferredDestination} />
                          </TableCell>
                          <TableCell>
                            {app ? (
                              <div>
                                <p className="text-[13px] font-medium text-primary">{app.id}</p>
                                <StatusBadge status={app.status} className="mt-0.5" />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No application</span>
                            )}
                          </TableCell>
                          <TableCell className="text-[13px]">{staffName(c.assignedTo)}</TableCell>
                          <TableCell>
                            <StatusBadge status={c.status} />
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <RowMenu c={c} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((c) => {
                  const app = activeApp.get(c.id);
                  return (
                    <MobileCard
                      key={c.id}
                      leading={<UserAvatar name={`${c.firstName} ${c.lastName}`} className="size-9" />}
                      title={`${c.firstName} ${c.lastName}`}
                      subtitle={`${c.id} · ${c.phone}`}
                      badge={<StatusBadge status={c.status} />}
                      onClick={() => navigate(`/app/customers/${c.id}`)}
                      meta={[
                        { label: "Application", value: app?.id ?? "—" },
                        { label: "Consultant", value: staffName(c.assignedTo) },
                      ]}
                    />
                  );
                })}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="customers" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
