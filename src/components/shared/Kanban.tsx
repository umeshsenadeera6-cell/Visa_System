import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { dotClasses, toneFor } from "@/lib/domain";

export interface KanbanColumn {
  id: string;
  title: string;
}

export function Kanban<T extends { id: string }>({
  columns,
  items,
  getColumn,
  onMove,
  renderCard,
  columnWidth = 288,
  emptyText = "Drop items here",
}: {
  columns: KanbanColumn[];
  items: T[];
  getColumn: (item: T) => string;
  onMove: (item: T, columnId: string) => void;
  renderCard: (item: T) => ReactNode;
  columnWidth?: number;
  emptyText?: string;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-thin sm:mx-0 sm:px-0">
      <div className="flex gap-3" style={{ minWidth: columns.length * (columnWidth + 12) }}>
        {columns.map((col) => {
          const colItems = items.filter((i) => getColumn(i) === col.id);
          const isOver = overCol === col.id && dragId !== null;
          return (
            <div
              key={col.id}
              style={{ width: columnWidth }}
              className={cn(
                "flex shrink-0 flex-col rounded-2xl border border-transparent bg-[#eef2f0] p-2 transition-colors",
                isOver && "border-primary/40 bg-[#e3f1ea]",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                const item = items.find((i) => i.id === dragId);
                if (item && getColumn(item) !== col.id) onMove(item, col.id);
                setDragId(null);
                setOverCol(null);
              }}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", dotClasses[toneFor(col.title)])} />
                  <h3 className="text-[13px] font-semibold">{col.title}</h3>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-muted-foreground tabular shadow-xs">{colItems.length}</span>
              </div>
              <div className="flex min-h-24 flex-1 flex-col gap-2">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(item.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={cn("cursor-grab active:cursor-grabbing transition-opacity", dragId === item.id && "opacity-40")}
                  >
                    {renderCard(item)}
                  </div>
                ))}
                {colItems.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#cfd8d3] px-3 py-6 text-center text-xs text-muted-foreground">
                    {emptyText}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
