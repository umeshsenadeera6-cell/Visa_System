import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CalendarClock,
  Download,
  KanbanSquare,
  List,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LEAD_SOURCES, LEAD_STATUSES, VISA_CATEGORIES } from "@/lib/domain";
import { cn, dayOffset, downloadCSV, formatShortDate, todayISO } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/data/types";

const DATE_OPTS = [
  { value: "today", label: "Created today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

export default function Leads() {
  const store = useStore();
  const { staffName, country } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [f, setF] = useState({ country: "all", visa: "all", status: "all", source: "all", staff: "all", date: "all" });
  const loading = useFakeLoading(500);
  const today = todayISO();

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return store.leads.filter((l) => {
      if (needle && !`${l.name} ${l.id} ${l.phone} ${l.email}`.toLowerCase().includes(needle)) return false;
      if (f.country !== "all" && l.countryCode !== f.country) return false;
      if (f.visa !== "all" && l.visaCategory !== f.visa) return false;
      if (f.status !== "all" && l.status !== f.status) return false;
      if (f.source !== "all" && l.source !== f.source) return false;
      if (f.staff !== "all" && l.assignedTo !== f.staff) return false;
      if (f.date === "today" && l.createdAt !== today) return false;
      if ((f.date === "7" || f.date === "30") && l.createdAt < dayOffset(-Number(f.date))) return false;
      return true;
    });
  }, [store.leads, q, f, today]);

  const table = useTable(filtered, { pageSize: 10, initialSort: { key: "createdAt", dir: "desc" } });
  const activeFilters = Object.values(f).filter((v) => v !== "all").length + (q ? 1 : 0);
  const staffOpts = store.staff.filter((s) => ["Visa Consultant", "Manager"].includes(s.role)).map((s) => ({ value: s.id, label: s.name }));

  const setStatus = (l: Lead, status: LeadStatus) => {
    if (status === "Converted") return convert(l);
    store.update("leads", l.id, { status });
    toast.success("Lead updated successfully.", { description: `${l.name} moved to ${status}.` });
  };

  const convert = (l: Lead) => {
    const id = store.convertLead(l.id);
    toast.success("Lead converted to customer.", {
      description: `${l.name} · ${id}`,
      action: { label: "Open profile", onClick: () => navigate(`/app/customers/${id}`) },
    });
    return id;
  };

  const remove = (l: Lead) =>
    confirm({
      title: `Delete lead ${l.name}?`,
      description: "The inquiry and its notes will be permanently removed from the CRM.",
      onConfirm: () => {
        store.remove("leads", l.id);
        toast.success("Deleted successfully.", { description: `${l.id} removed.` });
      },
    });

  const RowMenu = ({ l }: { l: Lead }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${l.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => modals.open("lead", { lead: l })}>
          <Pencil /> Edit lead
        </DropdownMenuItem>
        {l.status !== "Converted" ? (
          <DropdownMenuItem
            onClick={() => {
              const id = convert(l);
              navigate(`/app/customers/${id}`);
            }}
          >
            <UserCheck /> Convert to customer
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => navigate(`/app/customers/${l.convertedCustomerId}`)}>
            <UserCheck /> Open customer profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightLeft /> Change status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LEAD_STATUSES.map((s) => (
              <DropdownMenuItem key={s} disabled={s === l.status} onClick={() => setStatus(l, s)}>
                <StatusBadge status={s} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          onClick={() => {
            store.update("leads", l.id, { followUpDate: dayOffset(1) });
            toast.success("Follow-up scheduled for tomorrow.");
          }}
        >
          <CalendarClock /> Follow up tomorrow
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info(`Opening WhatsApp chat with ${l.name}…`, { description: "WhatsApp API is available after backend integration." })}>
          <MessageCircle /> WhatsApp
        </DropdownMenuItem>
        {l.status !== "Lost" && (
          <DropdownMenuItem onClick={() => setStatus(l, "Lost")}>
            <UserX /> Mark as lost
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => remove(l)}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const empty = (
    <EmptyState
      icon={UserPlus}
      title="No leads found"
      description="Try changing your filters or add a new inquiry."
      action={
        <Button onClick={() => modals.open("lead")}>
          <Plus /> Add Lead
        </Button>
      }
    />
  );

  return (
    <div>
      <PageHeader
        title="Leads & Inquiries"
        subtitle="Manage incoming visa inquiries and convert leads into customers."
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
                  "leads.csv",
                  filtered.map((l) => ({ id: l.id, name: l.name, phone: l.phone, email: l.email, country: l.countryCode, visa: l.visaCategory, source: l.source, status: l.status, assigned: staffName(l.assignedTo), followUp: l.followUpDate })),
                );
                toast.success("Export ready.", { description: `${filtered.length} leads exported to CSV.` });
              }}
            >
              <Download /> Export
            </Button>
            <Button onClick={() => modals.open("lead")}>
              <Plus /> Add Lead
            </Button>
          </>
        }
      />

      {/* Status summary */}
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {LEAD_STATUSES.map((s) => {
          const count = store.leads.filter((l) => l.status === s).length;
          const active = f.status === s;
          return (
            <button
              key={s}
              onClick={() => setF((x) => ({ ...x, status: active ? "all" : s }))}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition",
                active ? "border-primary bg-[#eef6f2] text-primary" : "border-border bg-card hover:border-[#cfd8d3]",
              )}
            >
              {s}
              <span className="rounded-md bg-muted px-1.5 text-xs tabular">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={activeFilters} onClear={() => (setQ(""), setF({ country: "all", visa: "all", status: "all", source: "all", staff: "all", date: "all" }))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, phone, email…" />
            <FilterGrid>
              <FilterSelect label="Countries" value={f.country} onChange={(v) => setF((x) => ({ ...x, country: v }))} options={store.countries.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
              <FilterSelect label="Visa Types" value={f.visa} onChange={(v) => setF((x) => ({ ...x, visa: v }))} options={[...VISA_CATEGORIES]} />
              <FilterSelect label="Statuses" value={f.status} onChange={(v) => setF((x) => ({ ...x, status: v }))} options={[...LEAD_STATUSES]} />
              <FilterSelect label="Sources" value={f.source} onChange={(v) => setF((x) => ({ ...x, source: v }))} options={[...LEAD_SOURCES]} />
              <FilterSelect label="Staff" value={f.staff} onChange={(v) => setF((x) => ({ ...x, staff: v }))} options={staffOpts} />
              <FilterSelect label="Dates" value={f.date} onChange={(v) => setF((x) => ({ ...x, date: v }))} options={DATE_OPTS} />
            </FilterGrid>
          </Toolbar>

          {view === "table" ? (
            filtered.length === 0 ? (
              empty
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHead label="Lead ID" sortKey="id" sort={table.sort} onSort={table.toggleSort} className="hidden 2xl:table-cell" />
                        <SortableHead label="Name" sortKey="name" sort={table.sort} onSort={table.toggleSort} />
                        <TableHead>Contact</TableHead>
                        <SortableHead label="Country" sortKey="countryCode" sort={table.sort} onSort={table.toggleSort} />
                        <TableHead>Visa Type</TableHead>
                        <TableHead className="hidden 2xl:table-cell">Source</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                        <SortableHead label="Follow-up" sortKey="followUpDate" sort={table.sort} onSort={table.toggleSort} />
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.rows.map((l) => {
                        const overdue = l.followUpDate < today && !["Converted", "Lost"].includes(l.status);
                        return (
                          <TableRow key={l.id}>
                            <TableCell className="hidden text-xs font-medium text-muted-foreground 2xl:table-cell">{l.id}</TableCell>
                            <TableCell>
                              <button onClick={() => modals.open("lead", { lead: l })} className="flex items-center gap-2.5 text-left">
                                <UserAvatar name={l.name} />
                                <div>
                                  <p className="font-medium hover:text-primary">{l.name}</p>
                                  <PriorityBadge priority={l.priority} className="mt-0.5 border-0 bg-transparent px-0 py-0 text-[11px]" />
                                </div>
                              </button>
                            </TableCell>
                            <TableCell>
                              <p className="text-[13px]">{l.phone}</p>
                              <p className="max-w-[180px] truncate text-xs text-muted-foreground">{l.email}</p>
                            </TableCell>
                            <TableCell>
                              <CountryLabel code={l.countryCode} />
                            </TableCell>
                            <TableCell>{l.visaCategory}</TableCell>
                            <TableCell className="hidden text-muted-foreground 2xl:table-cell">{l.source}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserAvatar name={staffName(l.assignedTo)} className="size-6 text-[9px]" />
                                <span className="text-[13px]">{staffName(l.assignedTo).split(" ")[0]}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={l.status} />
                            </TableCell>
                            <TableCell>
                              <span className={cn("text-[13px]", overdue && "font-medium text-[#b4321f]", l.followUpDate === today && "font-medium text-[#98600a]")}>
                                {l.followUpDate === today ? "Today" : formatShortDate(l.followUpDate)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon-sm" aria-label={`Call ${l.name}`} onClick={() => toast.info(`Calling ${l.phone}…`)}>
                                  <Phone />
                                </Button>
                                <RowMenu l={l} />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <MobileList>
                  {table.rows.map((l) => (
                    <MobileCard
                      key={l.id}
                      leading={<UserAvatar name={l.name} />}
                      title={l.name}
                      subtitle={`${country(l.countryCode)?.flag} ${l.visaCategory} · ${l.phone}`}
                      badge={<StatusBadge status={l.status} />}
                      actions={<RowMenu l={l} />}
                      meta={[
                        { label: "Assigned", value: staffName(l.assignedTo) },
                        { label: "Follow-up", value: formatShortDate(l.followUpDate) },
                      ]}
                    />
                  ))}
                </MobileList>
                <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="leads" />
              </>
            )
          ) : (
            <div className="p-3 sm:p-4">
              <Kanban
                columns={LEAD_STATUSES.map((s) => ({ id: s, title: s }))}
                items={filtered}
                getColumn={(l) => l.status}
                onMove={(l, col) => setStatus(l, col as LeadStatus)}
                columnWidth={272}
                renderCard={(l) => (
                  <div className="group rounded-xl border border-border bg-card p-3 shadow-xs transition hover:border-[#cfe0d7] hover:shadow-[var(--shadow-soft)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar name={l.name} className="size-7 text-[10px]" />
                        <p className="truncate text-[13px] font-semibold">{l.name}</p>
                      </div>
                      <RowMenu l={l} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <CountryLabel code={l.countryCode} className="text-[12.5px]" />
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">{l.visaCategory}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="size-3" /> {l.phone}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserAvatar name={staffName(l.assignedTo)} className="size-5 text-[8px]" />
                        {staffName(l.assignedTo).split(" ")[0]}
                      </div>
                      <span className={cn("flex items-center gap-1 text-xs", l.followUpDate < today && !["Converted", "Lost"].includes(l.status) ? "font-medium text-[#b4321f]" : "text-muted-foreground")}>
                        <CalendarClock className="size-3" />
                        {l.followUpDate === today ? "Today" : formatShortDate(l.followUpDate)}
                      </span>
                    </div>
                  </div>
                )}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground">Drag cards between columns to update status · dropping on “Converted” creates a customer profile.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
