import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Stamp, Trash2, ListChecks, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterGrid, FilterSelect, Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountryLabel } from "@/components/shared/Country";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useStore } from "@/store/store";
import { VISA_CATEGORIES } from "@/lib/domain";
import { formatLKR } from "@/lib/utils";
import type { VisaType } from "@/data/types";

export default function VisaTypes() {
  const store = useStore();
  const modals = useModals();
  const confirm = useConfirm();
  const loading = useFakeLoading(450);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      store.visaTypes.filter(
        (v) =>
          (!q || `${v.name} ${v.category}`.toLowerCase().includes(q.toLowerCase())) &&
          (country === "all" || v.countryCode === country) &&
          (cat === "all" || v.category === cat) &&
          (status === "all" || v.status === status),
      ),
    [store.visaTypes, q, country, cat, status],
  );
  const table = useTable(rows, { pageSize: 12, initialSort: { key: "countryCode", dir: "asc" } });

  const Menu = ({ v }: { v: VisaType }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => modals.open("visaType", { visaType: v })}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/app/requirements?vt=${v.id}`}>
            <ListChecks /> Requirements
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            store.update("visaTypes", v.id, { status: v.status === "Active" ? "Inactive" : "Active" });
            toast.success("Updated successfully.", { description: `${v.name} is now ${v.status === "Active" ? "inactive" : "active"}.` });
          }}
        >
          <Power /> {v.status === "Active" ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              title: `Delete ${v.name}?`,
              onConfirm: () => {
                store.remove("visaTypes", v.id);
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
        title="Visa Types"
        subtitle={`${store.visaTypes.length} visa products across ${store.countries.length} countries`}
        actions={
          <Button onClick={() => modals.open("visaType")}>
            <Plus /> Add Visa Type
          </Button>
        }
      />
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar activeCount={(q ? 1 : 0) + [country, cat, status].filter((x) => x !== "all").length} onClear={() => (setQ(""), setCountry("all"), setCat("all"), setStatus("all"))}>
            <SearchInput value={q} onChange={setQ} placeholder="Search visa types…" />
            <FilterGrid>
              <FilterSelect label="Countries" value={country} onChange={setCountry} options={store.countries.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
              <FilterSelect label="Categories" value={cat} onChange={setCat} options={[...VISA_CATEGORIES]} />
              <FilterSelect label="Statuses" value={status} onChange={setStatus} options={["Active", "Inactive"]} />
            </FilterGrid>
          </Toolbar>
          {rows.length === 0 ? (
            <EmptyState icon={Stamp} title="No visa types found" description="Try changing your filters or add a new visa type." action={<Button onClick={() => modals.open("visaType")}><Plus /> Add Visa Type</Button>} />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Country" sortKey="countryCode" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Visa Type" sortKey="category" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Entry</TableHead>
                      <SortableHead label="Fee" sortKey="fee" sort={table.sort} onSort={table.toggleSort} className="text-right" />
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <CountryLabel code={v.countryCode} />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{v.category}</p>
                          <p className="text-xs text-muted-foreground">{v.name}</p>
                        </TableCell>
                        <TableCell className="text-[13px]">{v.processingTime}</TableCell>
                        <TableCell className="text-[13px]">{v.validity}</TableCell>
                        <TableCell className="text-[13px]">{v.entry}</TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium tabular">{formatLKR(v.fee)}</p>
                          {v.governmentFee > 0 && <p className="text-[11px] text-muted-foreground tabular">+ {formatLKR(v.governmentFee)} gov.</p>}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={v.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Menu v={v} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((v) => (
                  <MobileCard
                    key={v.id}
                    title={`${store.countries.find((c) => c.code === v.countryCode)?.flag} ${v.category}`}
                    subtitle={v.name}
                    badge={<StatusBadge status={v.status} />}
                    actions={<Menu v={v} />}
                    meta={[
                      { label: "Processing", value: v.processingTime },
                      { label: "Fee", value: formatLKR(v.fee) },
                    ]}
                  />
                ))}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="visa types" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
