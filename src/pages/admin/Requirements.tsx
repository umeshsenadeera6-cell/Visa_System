import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, ClipboardList, GripVertical, Pencil, Plus, Trash2, X, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useConfirm } from "@/components/shared/Confirm";
import { useStore } from "@/store/store";
import { DOC_CATEGORIES } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { DocCategory, Requirement, RequirementLevel } from "@/data/types";

const LEVELS: RequirementLevel[] = ["Required", "Optional", "Conditional"];

export default function Requirements() {
  const store = useStore();
  const confirm = useConfirm();
  const [params] = useSearchParams();
  const initialVt = store.visaTypes.find((v) => v.id === params.get("vt")) ?? store.visaTypes[0];
  const [country, setCountry] = useState(initialVt?.countryCode ?? "UK");
  const [vtId, setVtId] = useState(initialVt?.id ?? "");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; note: string }>({ name: "", note: "" });
  const [newReq, setNewReq] = useState<{ name: string; category: DocCategory; level: RequirementLevel; note: string }>({ name: "", category: "Other", level: "Required", note: "" });

  const types = store.visaTypes.filter((v) => v.countryCode === country);
  const vt = store.visaTypes.find((v) => v.id === vtId);
  const reqs = store.requirements[vtId] ?? [];
  const save = (list: Requirement[], msg?: string) => {
    store.setRequirements(vtId, list);
    if (msg) toast.success(msg);
  };
  const move = (i: number, dir: -1 | 1) => {
    const list = [...reqs];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    save(list);
  };

  const counts = LEVELS.map((l) => ({ l, n: reqs.filter((r) => r.level === l).length }));

  return (
    <div>
      <PageHeader title="Requirements" subtitle="Define the document checklist generated for each country and visa type." />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select
              value={country}
              onValueChange={(c) => {
                setCountry(c);
                setVtId(store.visaTypes.find((v) => v.countryCode === c)?.id ?? "");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {store.countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Visa Type</Label>
            <Select value={vtId} onValueChange={setVtId}>
              <SelectTrigger>
                <SelectValue placeholder="Select visa type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.category} — {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {counts.map((c) => (
              <StatusBadge key={c.l} status={`${c.n} ${c.l}`} tone={c.l === "Required" ? "emerald" : c.l === "Optional" ? "slate" : "gold"} />
            ))}
          </div>
        </div>
      </Card>

      {!vt ? (
        <Card>
          <EmptyState icon={ClipboardList} title="Select a visa type" description="Choose a country and visa type to manage its requirements." />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard className="xl:col-span-2" title="Required Documents" description={`${vt.name} · ${reqs.length} items`} icon={<ClipboardList />}>
            {reqs.length === 0 ? (
              <EmptyState compact icon={ClipboardList} title="No requirements yet" description="Add the first document below." />
            ) : (
              <ul className="space-y-2">
                {reqs.map((r, i) => (
                  <li key={r.id} className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition hover:border-[#cfe0d7] sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold tabular">{i + 1}</span>
                      {editing === r.id ? (
                        <div className="grid flex-1 gap-2 sm:grid-cols-2">
                          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus aria-label="Requirement name" />
                          <Input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Note (optional)" aria-label="Note" />
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{r.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.category}
                            {r.note ? ` · ${r.note}` : ""}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 pl-14 sm:pl-0">
                      <Select value={r.level} onValueChange={(l) => save(reqs.map((x) => (x.id === r.id ? { ...x, level: l as RequirementLevel } : x)), "Requirement updated.")}>
                        <SelectTrigger className={cn("h-8 w-[130px] text-xs")} aria-label="Requirement level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>
                              <StatusBadge status={l} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editing === r.id ? (
                        <>
                          <Button
                            size="icon-sm"
                            aria-label="Save"
                            onClick={() => {
                              if (!draft.name.trim()) return toast.error("Name is required.");
                              save(reqs.map((x) => (x.id === r.id ? { ...x, name: draft.name.trim(), note: draft.note || undefined } : x)), "Updated successfully.");
                              setEditing(null);
                            }}
                          >
                            <Check />
                          </Button>
                          <Button size="icon-sm" variant="ghost" aria-label="Cancel" onClick={() => setEditing(null)}>
                            <X />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon-sm" variant="ghost" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                            <ArrowUp />
                          </Button>
                          <Button size="icon-sm" variant="ghost" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === reqs.length - 1}>
                            <ArrowDown />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={() => {
                              setEditing(r.id);
                              setDraft({ name: r.name, note: r.note ?? "" });
                            }}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:bg-[#fdf1ec]"
                            aria-label="Remove"
                            onClick={() =>
                              confirm({
                                title: `Remove “${r.name}”?`,
                                description: "New applications will no longer include this document in their checklist.",
                                confirmLabel: "Remove",
                                onConfirm: () => save(reqs.filter((x) => x.id !== r.id), "Deleted successfully."),
                              })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 rounded-xl border border-dashed border-[#cfdcd5] bg-[#fafcfb] p-4">
              <p className="mb-3 text-sm font-semibold">Add requirement</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_160px_140px_auto]">
                <Input placeholder="e.g. Police Clearance Certificate" value={newReq.name} onChange={(e) => setNewReq({ ...newReq, name: e.target.value })} aria-label="New requirement name" />
                <Select value={newReq.category} onValueChange={(v) => setNewReq({ ...newReq, category: v as DocCategory })}>
                  <SelectTrigger aria-label="Category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newReq.level} onValueChange={(v) => setNewReq({ ...newReq, level: v as RequirementLevel })}>
                  <SelectTrigger aria-label="Level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (!newReq.name.trim()) return toast.error("Enter a requirement name.");
                    save([...reqs, { id: `${vtId}-R${Date.now().toString(36)}`, name: newReq.name.trim(), category: newReq.category, level: newReq.level, note: newReq.note || undefined }], "Requirement added.");
                    setNewReq({ name: "", category: "Other", level: "Required", note: "" });
                  }}
                >
                  <Plus /> Add
                </Button>
              </div>
              <Input className="mt-2" placeholder="Guidance note shown to customers (optional)" value={newReq.note} onChange={(e) => setNewReq({ ...newReq, note: e.target.value })} aria-label="Guidance note" />
            </div>
          </SectionCard>

          <SectionCard title="Customer checklist preview" description="How this appears in the customer portal" icon={<FileCheck2 />}>
            <div className="rounded-2xl border border-border bg-[#f8faf9] p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {store.countries.find((c) => c.code === vt.countryCode)?.flag} {vt.category} Visa
              </p>
              <p className="text-sm font-semibold">{vt.name}</p>
              <ul className="mt-3 space-y-1.5">
                {reqs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-[13px] shadow-xs">
                    <span className="flex items-center gap-2">
                      <span className="size-4 rounded-full border-2 border-[#cfd8d3]" />
                      {r.name}
                    </span>
                    {r.level !== "Required" && <span className="text-[11px] text-muted-foreground">{r.level}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
