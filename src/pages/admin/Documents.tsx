import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileImage,
  FileText,
  FileWarning,
  FolderOpen,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Upload,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterGrid, FilterSelect, Pagination, SearchInput, SortableHead, Toolbar } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { MobileCard, MobileList } from "@/components/shared/MobileCard";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useTable } from "@/hooks/useTable";
import { useLookups, useStore } from "@/store/store";
import { DOC_CATEGORIES, DOC_STATUSES } from "@/lib/domain";
import { cn, daysUntil, formatBytes, formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/data/types";

export default function Documents() {
  const store = useStore();
  const { customerName, staffName } = useLookups();
  const modals = useModals();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [uploader, setUploader] = useState("all");
  const loading = useFakeLoading(500);

  const rows = useMemo(() => {
    const n = q.toLowerCase().trim();
    return store.documents.filter((d) => {
      if (n && !`${d.name} ${d.fileName} ${customerName(d.customerId)} ${d.applicationId ?? ""}`.toLowerCase().includes(n)) return false;
      if (cat !== "all" && d.category !== cat) return false;
      if (status !== "all" && d.status !== status) return false;
      if (uploader !== "all" && d.uploadedBy !== uploader) return false;
      return true;
    });
  }, [store.documents, q, cat, status, uploader, customerName]);

  const table = useTable(rows, {
    pageSize: 12,
    initialSort: { key: "uploadedAt", dir: "desc" },
    getValue: (d, k) => (k === "customer" ? customerName(d.customerId) : (d as unknown as Record<string, unknown>)[k]),
  });

  const stats = [
    { label: "Awaiting review", value: store.documents.filter((d) => d.status === "Uploaded" || d.status === "Under Review").length, icon: Clock, cls: "bg-[#ebf2fe] text-[#2856b8]", filter: "Uploaded" },
    { label: "Verified", value: store.documents.filter((d) => d.status === "Verified").length, icon: BadgeCheck, cls: "bg-[#e7f4ee] text-[#0a6446]", filter: "Verified" },
    { label: "Needs re-upload", value: store.documents.filter((d) => d.status === "Re-upload Required" || d.status === "Rejected").length, icon: FileWarning, cls: "bg-[#fff0e6] text-[#b24c0c]", filter: "Re-upload Required" },
    { label: "Expiring < 90 days", value: store.documents.filter((d) => d.expiry && daysUntil(d.expiry) < 90).length, icon: CalendarClock, cls: "bg-[#faf3e1] text-[#8a6412]", filter: "all" },
  ];

  const setDoc = (d: DocumentItem, s: DocumentItem["status"], msg: string, note?: string) => {
    store.setDocumentStatus(d.id, s, note);
    toast.success(msg, { description: `${d.name} · ${customerName(d.customerId)}` });
  };

  const RowMenu = ({ d }: { d: DocumentItem }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => modals.open("document", { docId: d.id })}>
          <Eye /> Preview
        </DropdownMenuItem>
        {d.status !== "Verified" && (
          <DropdownMenuItem onClick={() => setDoc(d, "Verified", "Document verified.")}>
            <CheckCircle2 /> Verify
          </DropdownMenuItem>
        )}
        {d.status !== "Under Review" && d.status !== "Verified" && (
          <DropdownMenuItem onClick={() => setDoc(d, "Under Review", "Marked as under review.")}>
            <Clock /> Mark under review
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setDoc(d, "Re-upload Required", "Re-upload requested.", "Please upload a clearer, complete copy.")}>
          <RotateCcw /> Request re-upload
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDoc(d, "Rejected", "Document rejected.", "Document does not meet embassy requirements.")}>
          <XCircle /> Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              title: `Delete ${d.name}?`,
              description: "The file will be removed from the customer's record and checklist.",
              onConfirm: () => {
                store.remove("documents", d.id);
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
        title="Documents"
        subtitle="Collect, review and verify supporting documents for every application."
        actions={
          <Button onClick={() => modals.open("upload")}>
            <Upload /> Upload Document
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => setStatus(s.filter)} className="text-left">
            <Card className="flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
              <div className={cn("flex size-10 items-center justify-center rounded-xl", s.cls)}>
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tabular">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setCat("all")}
          className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition", cat === "all" ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-[#cfd8d3]")}
        >
          All · {store.documents.length}
        </button>
        {DOC_CATEGORIES.map((c) => {
          const n = store.documents.filter((d) => d.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCat(cat === c ? "all" : c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition",
                cat === c ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-[#cfd8d3]",
                n === 0 && cat !== c && "text-muted-foreground",
              )}
            >
              {c} · {n}
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <Toolbar
            activeCount={(q ? 1 : 0) + (cat !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0) + (uploader !== "all" ? 1 : 0)}
            onClear={() => (setQ(""), setCat("all"), setStatus("all"), setUploader("all"))}
          >
            <SearchInput value={q} onChange={setQ} placeholder="Search document, customer, application…" className="sm:w-80" />
            <FilterGrid>
              <FilterSelect label="Categories" value={cat} onChange={setCat} options={[...DOC_CATEGORIES]} />
              <FilterSelect label="Statuses" value={status} onChange={setStatus} options={[...DOC_STATUSES]} />
              <FilterSelect
                label="Uploaders"
                value={uploader}
                onChange={setUploader}
                options={[
                  { value: "customer", label: "Customer portal" },
                  { value: "staff", label: "Staff" },
                ]}
              />
            </FilterGrid>
          </Toolbar>

          {rows.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No documents found"
              description="Try changing your filters or upload a new document."
              action={
                <Button onClick={() => modals.open("upload")}>
                  <Upload /> Upload Document
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Document" sortKey="name" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Customer" sortKey="customer" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Application</TableHead>
                      <SortableHead label="Uploaded" sortKey="uploadedAt" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                      <SortableHead label="Expiry" sortKey="expiry" sort={table.sort} onSort={table.toggleSort} />
                      <TableHead>Verified By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((d) => {
                      const exp = d.expiry ? daysUntil(d.expiry) : null;
                      return (
                        <TableRow key={d.id}>
                          <TableCell>
                            <button onClick={() => modals.open("document", { docId: d.id })} className="flex items-center gap-3 text-left">
                              <span className={cn("flex size-9 items-center justify-center rounded-lg", d.fileType === "image" ? "bg-[#ebf2fe] text-[#2856b8]" : "bg-[#fdeeec] text-[#b4321f]")}>
                                {d.fileType === "image" ? <FileImage className="size-4" /> : <FileText className="size-4" />}
                              </span>
                              <span>
                                <span className="block font-medium hover:text-primary">{d.name}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {d.category} · {formatBytes(d.size)}
                                </span>
                              </span>
                            </button>
                          </TableCell>
                          <TableCell>
                            <Link to={`/app/customers/${d.customerId}`} className="text-[13px] font-medium hover:text-primary">
                              {customerName(d.customerId)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {d.applicationId ? (
                              <Link to={`/app/applications/${d.applicationId}`} className="text-[13px] text-primary hover:underline">
                                {d.applicationId}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">
                            {formatDate(d.uploadedAt)}
                            {d.uploadedBy === "customer" && <span className="ml-1 rounded bg-[#faf3e1] px-1 text-[10.5px] text-[#8a6412]">portal</span>}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={d.status} />
                          </TableCell>
                          <TableCell className={cn("text-[13px]", exp !== null && exp < 90 ? "font-medium text-[#b24c0c]" : "text-muted-foreground")}>{formatDate(d.expiry)}</TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{d.verifiedBy ? staffName(d.verifiedBy) : "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {(d.status === "Uploaded" || d.status === "Under Review") && (
                                <Button size="sm" variant="outline" className="border-primary/30 text-primary" onClick={() => setDoc(d, "Verified", "Document verified.")}>
                                  <CheckCircle2 /> Verify
                                </Button>
                              )}
                              <RowMenu d={d} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <MobileList>
                {table.rows.map((d) => (
                  <MobileCard
                    key={d.id}
                    title={d.name}
                    subtitle={`${customerName(d.customerId)} · ${d.applicationId ?? "—"}`}
                    badge={<StatusBadge status={d.status} />}
                    actions={<RowMenu d={d} />}
                    meta={[
                      { label: "Uploaded", value: formatDate(d.uploadedAt) },
                      { label: "Expiry", value: formatDate(d.expiry) },
                    ]}
                  />
                ))}
              </MobileList>
              <Pagination page={table.page} pageCount={table.pageCount} total={table.total} pageSize={table.pageSize} onPage={table.setPage} label="documents" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
