import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRightLeft, Download, Eye, KanbanSquare, List, MoreHorizontal, Plane, Plus, Printer, Trash2, Upload, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterGrid, FilterSelect, Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { PriorityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CountryLabel } from "@/components/shared/Country";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { Kanban } from "@/components/shared/Kanban";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useLookups, useStore } from "@/store/store";
import { APP_STAGES, type AppStatus, type Application } from "@/data/types";
import { PRIORITIES, VISA_CATEGORIES, appProgress } from "@/lib/domain";
import { dayOffset, downloadCSV, formatDate, formatShortDate } from "@/lib/utils";

export default function Applications() {
  const store = useStore();
  const { customerName, staffName, visaType, visaLabel, country } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [q, setQ] = useState("");
  const [f, setF] = useState({ country: "all", visa: "all", status: "all", staff: "all", priority: "all", date: "all" });
  const loading = useFakeLoading(500);

  const rows = useMemo(() => {
    const n = q.toLowerCase().trim();
    return store.applications.filter((a) => {
      if (n && !`${a.id} ${customerName(a.customerId)} ${country(a.countryCode)?.name}`.toLowerCase().includes(n)) return false;
      if (f.country !== "all" && a.countryCode !== f.country) return false;
      if (f.visa !== "all" && visaType(a.visaTypeId)?.category !== f.visa) return false;
      if (f.status !== "all" && a.status !== f.status) return false;
      if (f.staff !== "all" && a.consultantId !== f.staff) return false;
      if (f.priority !== "all" && a.priority !== f.priority) return false;
      if (f.date !== "all" && a.updatedAt.slice(0, 10) < dayOffset(-Number(f.date))) return false;
      return true;
    });
  }, [store.applications, q, f, customerName, country, visaType]);

  const table = useTable(rows, {
    pageSize: 10,
    initialSort: { key: "updatedAt", dir: "desc" },
    getValue: (a, k) => (k === "customer" ? customerName(a.customerId) : k === "status" ? APP_STAGES.indexOf(a.status) : (a as unknown as Record<string, unknown>)[k]),
  });
  const activeFilters = Object.values(f).filter((v) => v !== "all").length + (q ? 1 : 0);

  const move = (a: Application, status: AppStatus) => {
    store.changeStatus(a.id, status, "Moved on Kanban board");
    toast.success("Status changed.", { description: `${a.id} → ${status}` });
  };

  const RowMenu = ({ a }: { a: Application }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => navigate(`/app/applications/${a.id}`)}>
          <Eye /> View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => modals.open("status", { applicationId: a.id })}>
          <ArrowRightLeft /> Change status
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => modals.open("upload", { applicationId: a.id, customerId: a.customerId })}>
          <Upload /> Upload document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => modals.open("payment", { applicationId: a.id, customerId: a.customerId })}>
          <CreditCard /> Add payment
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Print-ready application summaries will be available after backend integration.")}>
          <Printer /> Print summary
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              title: `Delete ${a.id}?`,
              description: "The application, its timeline and checklist links will be removed from the demo data.",
              onConfirm: () => {
                store.remove("applications", a.id);
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
        title="Visa Applications"
        subtitle={`${store.applications.length} applications · ${store.applications.filter((a) => a.status === "Under Processing").length} under processing at embassies`}
        actions={
          <>
            <ViewToggle
              value={view}
              onChange={setView}
              options={[
                { value: "table", label: "Table", icon: List },
                { value: "kanban", label: "Kanban", icon: KanbanSquare },
              ]}
            />
            <Button
              variant="outline"
              onClick={() => {
                downloadCSV(
                  "applications.csv",
                  rows.map((a) => ({ id: a.id, customer: customerName(a.customerId), country: a.countryCode, visa: visaLabel(a.visaTypeId), status: a.status, consultant: staffName(a.consultantId), travel: a.travelDate, priority: a.priority })),
                );
                toast.success("Export ready.", { description: `${rows.length} applications exported.` });
              }}
            >
              <Download /> Export
            </Button>
            <Button onClick={() => modals.open("application")}>
              <Plus /> New Application
            </Button>
          </>
        }
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={activeFilters} onClear={() => (setQ(""), setF({ country: "all", visa: "all", status: "all", staff: "all", priority: "all", date: "all" }))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search ID, customer, country…" />
            <FilterGrid>
              <FilterSelect label="Countries" value={f.country} onChange={(v) => setF((x) => ({ ...x, country: v }))} options={store.countries.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
              <FilterSelect label="Visa Types" value={f.visa} onChange={(v) => setF((x) => ({ ...x, visa: v }))} options={[...VISA_CATEGORIES]} />
              <FilterSelect label="Statuses" value={f.status} onChange={(v) => setF((x) => ({ ...x, status: v }))} options={[...APP_STAGES]} />
              <FilterSelect
                label="Consultants"
                value={f.staff}
                onChange={(v) => setF((x) => ({ ...x, staff: v }))}
                options={store.staff.filter((s) => s.role === "Visa Consultant").map((s) => ({ value: s.id, label: s.name }))}
              />
              <FilterSelect label="Priorities" value={f.priority} onChange={(v) => setF((x) => ({ ...x, priority: v }))} options={[...PRIORITIES]} />
              <FilterSelect
                label="Dates"
                value={f.date}
                onChange={(v) => setF((x) => ({ ...x, date: v }))}
                options={[
                  { value: "7", label: "Updated last 7 days" },
                  { value: "30", label: "Updated last 30 days" },
                  { value: "90", label: "Updated last 90 days" },
                ]}
              />
            </FilterGrid>
          </Toolbar>

          {rows.length === 0 ? (
            <EmptyState
              icon={Plane}
              title="No applications found"
              description="Try changing your filters or create a new application."
              action={
                <Button onClick={() => modals.open("application")}>
                  <Plus /> New Application
                </Button>
              }
            />
          ) : view === "table" ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Application ID" sortKey="id" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Customer" sortKey="customer" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Country" sortKey="countryCode" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Visa Type</TableHead>
                      <SortableHead label="Travel Date" sortKey="travelDate" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Consultant</TableHead>
                      <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Last Updated" sortKey="updatedAt" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((a) => (
                      <TableRow key={a.id} className="cursor-pointer" onClick={() => navigate(`/app/applications/${a.id}`)}>
                        <TableCell>
                          <p className="font-semibold text-primary">{a.id}</p>
                          <PriorityBadge priority={a.priority} className="mt-1 border-0 bg-transparent px-0 py-0 text-[11px]" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={customerName(a.customerId)} />
                            <span className="font-medium">{customerName(a.customerId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <CountryLabel code={a.countryCode} />
                        </TableCell>
                        <TableCell>{visaLabel(a.visaTypeId)}</TableCell>
                        <TableCell className="text-[13px]">{formatDate(a.travelDate)}</TableCell>
                        <TableCell className="text-[13px]">{staffName(a.consultantId)}</TableCell>
                        <TableCell>
                          <div className="w-40">
                            <StatusBadge status={a.status} />
                            <Progress value={appProgress(a.status)} className="mt-1.5 h-1" />
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{formatShortDate(a.updatedAt)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <RowMenu a={a} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((a) => (
                  <MobileCard
                    key={a.id}
                    title={a.id}
                    subtitle={`${customerName(a.customerId)} · ${country(a.countryCode)?.flag} ${visaLabel(a.visaTypeId)}`}
                    badge={<StatusBadge status={a.status} />}
                    onClick={() => navigate(`/app/applications/${a.id}`)}
                    meta={[
                      { label: "Travel", value: formatDate(a.travelDate) },
                      { label: "Consultant", value: staffName(a.consultantId) },
                    ]}
                  />
                ))}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="applications" />
            </>
          ) : (
            <div className="p-3 sm:p-4">
              <Kanban
                columns={APP_STAGES.map((s) => ({ id: s, title: s }))}
                items={rows}
                getColumn={(a) => a.status}
                onMove={(a, col) => move(a, col as AppStatus)}
                columnWidth={264}
                renderCard={(a) => (
                  <div
                    onClick={() => navigate(`/app/applications/${a.id}`)}
                    className="group rounded-xl border border-border bg-card p-3 shadow-xs transition hover:border-[#cfe0d7] hover:shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold text-primary">{a.id}</p>
                        <p className="truncate text-[13px] font-medium">{customerName(a.customerId)}</p>
                      </div>
                      <span className="text-lg leading-none">{country(a.countryCode)?.flag}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{visaLabel(a.visaTypeId)}</p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-semibold text-foreground tabular">{appProgress(a.status)}%</span>
                      </div>
                      <Progress value={appProgress(a.status)} className="h-1.5" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <PriorityBadge priority={a.priority} />
                      <span title={staffName(a.consultantId)}>
                        <UserAvatar name={staffName(a.consultantId)} className="size-6 text-[9px]" />
                      </span>
                    </div>
                  </div>
                )}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground">Scroll horizontally to see all 14 stages · drag a card to change its status.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
