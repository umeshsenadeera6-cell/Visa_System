import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search, X } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/hooks/useTable";

export function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: string;
  sort?: { key: string; dir: SortDir };
  onSort: (k: string) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort?.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className} aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button onClick={() => onSort(sortKey)} className={cn("inline-flex items-center gap-1 uppercase transition hover:text-foreground", active && "text-foreground")}>
        {label}
        <Icon className={cn("size-3", !active && "opacity-40")} />
      </button>
    </TableHead>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
  label = "results",
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  label?: string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row">
      <p className="text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular">{from}</span>–<span className="font-medium text-foreground tabular">{to}</span> of{" "}
        <span className="font-medium text-foreground tabular">{total}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
            <Button variant={p === page ? "default" : "ghost"} size="icon-sm" onClick={() => onPage(p)} className="tabular" aria-current={p === page ? "page" : undefined}>
              {p}
            </Button>
          </span>
        ))}
        <Button variant="outline" size="icon-sm" onClick={() => onPage(page + 1)} disabled={page === pageCount} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 pr-8" aria-label={placeholder} />
      {value && (
        <button onClick={() => onChange("")} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground" aria-label="Clear search">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-full sm:w-auto sm:min-w-[136px]", value !== "all" && "border-primary/40 bg-[#f3f9f6] text-primary", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function Toolbar({ children, onClear, activeCount = 0 }: { children: ReactNode; onClear?: () => void; activeCount?: number }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border p-3 sm:p-4 lg:flex-row lg:flex-wrap lg:items-center">
      {children}
      {activeCount > 0 && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground lg:ml-auto">
          <X /> Clear filters ({activeCount})
        </Button>
      )}
    </div>
  );
}

export function FilterGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{children}</div>;
}
