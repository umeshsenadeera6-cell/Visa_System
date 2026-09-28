import { useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, List, Mail, MoreHorizontal, Pencil, Phone, Plus, Power, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect, SearchInput, Toolbar } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useStore } from "@/store/store";
import { formatDate } from "@/lib/utils";
import type { Staff } from "@/data/types";

export default function StaffPage() {
  const store = useStore();
  const modals = useModals();
  const confirm = useConfirm();
  const loading = useFakeLoading(450);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = store.staff.filter((s) => (!q || `${s.name} ${s.email}`.toLowerCase().includes(q.toLowerCase())) && (role === "all" || s.role === role) && (status === "all" || s.status === status));
  const stats = (s: Staff) => ({
    apps: store.applications.filter((a) => a.consultantId === s.id).length + (s.role === "Visa Consultant" ? 30 + (s.id.charCodeAt(5) % 7) * 4 : 0),
    leads: store.leads.filter((l) => l.assignedTo === s.id).length,
  });

  const Menu = ({ s }: { s: Staff }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => modals.open("staff", { staff: s })}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            store.update("staff", s.id, { status: s.status === "Active" ? "Inactive" : "Active" });
            toast.success("Updated successfully.", { description: `${s.name} is now ${s.status === "Active" ? "inactive" : "active"}.` });
          }}
        >
          <Power /> {s.status === "Active" ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={s.role === "Admin"}
          onClick={() =>
            confirm({
              title: `Remove ${s.name}?`,
              description: "Their assigned customers will need to be re-assigned.",
              confirmLabel: "Remove",
              onConfirm: () => {
                store.remove("staff", s.id);
                toast.success("Deleted successfully.");
              },
            })
          }
        >
          <Trash2 /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={`${store.staff.filter((s) => s.status === "Active").length} active team members across 3 branches`}
        actions={
          <>
            <ViewToggle
              value={view}
              onChange={setView}
              options={[
                { value: "cards", label: "Cards", icon: LayoutGrid },
                { value: "table", label: "Table", icon: List },
              ]}
            />
            <Button onClick={() => modals.open("staff")}>
              <Plus /> Add Staff
            </Button>
          </>
        }
      />
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <Card className="mb-4 overflow-hidden">
            <Toolbar activeCount={(q ? 1 : 0) + (role !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0)} onClear={() => (setQ(""), setRole("all"), setStatus("all"))}>
              <SearchInput value={q} onChange={setQ} placeholder="Search staff…" />
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <FilterSelect label="Roles" value={role} onChange={setRole} options={["Admin", "Manager", "Visa Consultant", "Documentation Officer", "Finance Officer", "Receptionist"]} />
                <FilterSelect label="Statuses" value={status} onChange={setStatus} options={["Active", "Inactive"]} />
              </div>
            </Toolbar>
            {view === "table" && rows.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Applications</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={s.name} className="size-9" />
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.branch}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px]">{s.role}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{s.email}</TableCell>
                      <TableCell className="text-right tabular">{stats(s).apps}</TableCell>
                      <TableCell className="text-right tabular">{stats(s).leads}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Menu s={s} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {rows.length === 0 && <EmptyState icon={UsersRound} title="No staff found" description="Try changing your filters or add a team member." />}
          </Card>
          {view === "cards" && rows.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {rows.map((s) => {
                const st = stats(s);
                return (
                  <Card key={s.id} className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-[#eef6f2] to-[#f7f1e2]" />
                    <div className="relative flex items-start justify-between">
                      <UserAvatar name={s.name} className="size-14 rounded-2xl text-base ring-4 ring-white" />
                      <Menu s={s} />
                    </div>
                    <h3 className="relative mt-3 font-semibold">{s.name}</h3>
                    <p className="text-[13px] text-primary">{s.role}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3.5" /> {s.email}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="size-3.5" /> {s.phone}
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f8faf9] p-3 text-center">
                      <div>
                        <p className="font-display text-lg font-bold tabular">{st.apps}</p>
                        <p className="text-[11px] text-muted-foreground">Applications</p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold tabular">{st.leads}</p>
                        <p className="text-[11px] text-muted-foreground">Leads</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Joined {formatDate(s.joinedAt)}</span>
                      <StatusBadge status={s.status} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
