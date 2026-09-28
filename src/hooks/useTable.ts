import { useEffect, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export function useTable<T>(rows: T[], opts: { pageSize?: number; initialSort?: { key: string; dir: SortDir }; getValue?: (row: T, key: string) => unknown } = {}) {
  const { pageSize = 10, initialSort, getValue } = opts;
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | undefined>(initialSort);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const val = (r: T) => (getValue ? getValue(r, sort.key) : (r as Record<string, unknown>)[sort.key]);
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      let cmp = 0;
      if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
      else cmp = String(va ?? "").localeCompare(String(vb ?? ""), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, getValue]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : undefined) : { key, dir: "asc" }));

  return { rows: pageRows, all: sorted, page, setPage, pageCount, total: rows.length, sort, toggleSort, pageSize };
}
