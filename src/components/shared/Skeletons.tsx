import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="mt-4 h-3 w-20" />
          <Skeleton className="mt-2 h-6 w-24" />
          <Skeleton className="mt-3 h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Card className="p-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <div className="mt-6 flex items-end gap-2" style={{ height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
        ))}
      </div>
    </Card>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 border-b border-border p-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="ml-auto h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="size-8 rounded-full" />
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" style={{ maxWidth: c === 0 ? 180 : 120 }} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="hidden h-9 w-28 sm:block" />
        </div>
      </Card>
      <Skeleton className="h-10 w-full max-w-xl rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-full" />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
