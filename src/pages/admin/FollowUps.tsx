import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlarmClock, CalendarCheck, CalendarClock, CheckCircle2, Circle, Mail, MessageCircle, MoreHorizontal, Pencil, Phone, Plus, RotateCcw, Trash2, Users, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterGrid, FilterSelect, Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { PriorityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useLookups, useStore } from "@/store/store";
import { PRIORITIES } from "@/lib/domain";
import { cn, formatDate, todayISO } from "@/lib/utils";
import type { FollowUp } from "@/data/types";

type Section = "today" | "upcoming" | "overdue" | "completed";
const channelIcon = { Call: Phone, WhatsApp: MessageCircle, Email: Mail, Meeting: Users };

export default function FollowUps() {
  const store = useStore();
  const { customerName, staffName } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const loading = useFakeLoading(450);
  const today = todayISO();
  const [section, setSection] = useState<Section>("today");
  const [q, setQ] = useState("");
  const [prio, setPrio] = useState("all");
  const [staff, setStaff] = useState("all");

  const bucket = (f: FollowUp): Section => (f.status === "Completed" ? "completed" : f.dueDate < today ? "overdue" : f.dueDate === today ? "today" : "upcoming");
  const counts = useMemo(() => {
    const c = { today: 0, upcoming: 0, overdue: 0, completed: 0 };
    store.followUps.forEach((f) => c[bucket(f)]++);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.followUps, today]);

  const rows = useMemo(
    () =>
      store.followUps.filter((f) => {
        if (bucket(f) !== section) return false;
        if (q && !`${f.task} ${customerName(f.customerId)} ${f.applicationId ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (prio !== "all" && f.priority !== prio) return false;
        if (staff !== "all" && f.assignedTo !== staff) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.followUps, section, q, prio, staff, customerName],
  );
  const table = useTable(rows, {
    pageSize: 10,
    initialSort: { key: "dueDate", dir: section === "completed" ? "desc" : "asc" },
    getValue: (f, k) => (k === "customer" ? customerName(f.customerId) : k === "priority" ? PRIORITIES.indexOf(f.priority) : (f as unknown as Record<string, unknown>)[k]),
  });

  const toggle = (f: FollowUp) => {
    const status = f.status === "Completed" ? "Pending" : "Completed";
    store.update("followUps", f.id, { status });
    toast.success(status === "Completed" ? "Follow-up completed." : "Follow-up reopened.", { description: f.task });
  };

  const sections: { key: Section; label: string; icon: typeof AlarmClock; cls: string }[] = [
    { key: "today", label: "Today's Follow-ups", icon: CalendarClock, cls: "text-[#98600a] bg-[#fff5e0]" },
    { key: "upcoming", label: "Upcoming", icon: CalendarCheck, cls: "text-[#2856b8] bg-[#ebf2fe]" },
    { key: "overdue", label: "Overdue", icon: CalendarX, cls: "text-[#b4321f] bg-[#fdeeec]" },
    { key: "completed", label: "Completed", icon: CheckCircle2, cls: "text-[#0a6446] bg-[#e7f4ee]" },
  ];

  const RowMenu = ({ f }: { f: FollowUp }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toggle(f)}>{f.status === "Completed" ? <><RotateCcw /> Reopen</> : <><CheckCircle2 /> Mark complete</>}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => modals.open("followUp", { followUp: f })}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              title: "Delete this follow-up?",
              description: f.task,
              onConfirm: () => {
                store.remove("followUps", f.id);
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
        title="Follow-ups"
        subtitle="Never miss a call-back, reminder or document chase."
        actions={
          <Button onClick={() => modals.open("followUp")}>
            <Plus /> Add Follow-up
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5",
              section === s.key ? "border-primary ring-2 ring-primary/10" : "border-border/80",
            )}
          >
            <span className={cn("flex size-10 items-center justify-center rounded-xl", s.cls)}>
              <s.icon className="size-5" />
            </span>
            <span>
              <span className="block font-display text-xl font-bold tabular">{counts[s.key]}</span>
              <span className="block text-xs text-muted-foreground">{s.label}</span>
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={(q ? 1 : 0) + (prio !== "all" ? 1 : 0) + (staff !== "all" ? 1 : 0)} onClear={() => (setQ(""), setPrio("all"), setStaff("all"))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search task or customer…" />
            <FilterGrid>
              <FilterSelect label="Priorities" value={prio} onChange={setPrio} options={[...PRIORITIES]} />
              <FilterSelect label="Staff" value={staff} onChange={setStaff} options={store.staff.filter((s) => s.status === "Active").map((s) => ({ value: s.id, label: s.name }))} />
            </FilterGrid>
          </Toolbar>
          {rows.length === 0 ? (
            <EmptyState
              icon={section === "overdue" ? CheckCircle2 : CalendarClock}
              title={section === "overdue" ? "Nothing overdue" : "No follow-ups found"}
              description={section === "overdue" ? "Great work — every task is on schedule." : "Try changing your filters or add a new follow-up."}
              action={
                <Button onClick={() => modals.open("followUp")}>
                  <Plus /> Add Follow-up
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <SortableHead label="Customer" sortKey="customer" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Application</TableHead>
                      <TableHead>Task</TableHead>
                      <SortableHead label="Due Date" sortKey="dueDate" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Assigned To</TableHead>
                      <SortableHead label="Priority" sortKey="priority" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((f) => {
                      const C = channelIcon[f.channel];
                      const b = bucket(f);
                      return (
                        <TableRow key={f.id} className={cn(f.status === "Completed" && "opacity-70")}>
                          <TableCell>
                            <button onClick={() => toggle(f)} aria-label={f.status === "Completed" ? "Reopen" : "Mark complete"} className="text-muted-foreground transition hover:text-primary">
                              {f.status === "Completed" ? <CheckCircle2 className="size-5 text-primary" /> : <Circle className="size-5" />}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Link to={`/app/customers/${f.customerId}`} className="flex items-center gap-2.5">
                              <UserAvatar name={customerName(f.customerId)} />
                              <span className="font-medium hover:text-primary">{customerName(f.customerId)}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {f.applicationId ? (
                              <Link to={`/app/applications/${f.applicationId}`} className="text-[13px] text-primary hover:underline">
                                {f.applicationId}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className={cn("flex max-w-[280px] items-center gap-2 truncate text-[13px]", f.status === "Completed" && "line-through")}>
                              <C className="size-3.5 shrink-0 text-muted-foreground" /> {f.task}
                            </p>
                          </TableCell>
                          <TableCell className={cn("text-[13px]", b === "overdue" && "font-medium text-[#b4321f]", b === "today" && "font-medium text-[#98600a]")}>
                            {b === "today" ? "Today" : formatDate(f.dueDate)}
                          </TableCell>
                          <TableCell className="text-[13px]">{staffName(f.assignedTo)}</TableCell>
                          <TableCell>
                            <PriorityBadge priority={f.priority} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={b === "overdue" ? "Overdue" : f.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <RowMenu f={f} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((f) => (
                  <MobileCard
                    key={f.id}
                    leading={
                      <button onClick={() => toggle(f)} className="mt-0.5 text-muted-foreground" aria-label="Toggle complete">
                        {f.status === "Completed" ? <CheckCircle2 className="size-5 text-primary" /> : <Circle className="size-5" />}
                      </button>
                    }
                    title={f.task}
                    subtitle={`${customerName(f.customerId)} · ${f.applicationId ?? "No application"}`}
                    badge={<PriorityBadge priority={f.priority} />}
                    actions={<RowMenu f={f} />}
                    meta={[
                      { label: "Due", value: bucket(f) === "today" ? "Today" : formatDate(f.dueDate) },
                      { label: "Assigned", value: staffName(f.assignedTo) },
                    ]}
                  />
                ))}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="follow-ups" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
