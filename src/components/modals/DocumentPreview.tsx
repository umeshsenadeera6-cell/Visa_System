import { toast } from "sonner";
import { CheckCircle2, Download, FileText, RotateCcw, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoRow } from "@/components/shared/SectionCard";
import { useLookups, useStore } from "@/store/store";
import { formatBytes, formatDate } from "@/lib/utils";
import { uploadedPreviews, type ModalProps } from "./context";
import type { DocumentItem } from "@/data/types";

function MockPage({ doc, name }: { doc: DocumentItem; name: string }) {
  if (doc.category === "Passport") {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl bg-gradient-to-br from-[#123c5a] to-[#0c2a40] p-5 text-white shadow-xl">
        <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase opacity-80">
          <span>Democratic Socialist Republic of Sri Lanka</span>
          <span>Passport</span>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="flex h-28 w-22 shrink-0 items-center justify-center rounded-md bg-white/15 text-2xl font-bold">{name.split(" ").map((p) => p[0]).join("")}</div>
          <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
            <div className="col-span-2">
              <p className="opacity-60">Surname / Given names</p>
              <p className="font-semibold uppercase">{name}</p>
            </div>
            <div>
              <p className="opacity-60">Nationality</p>
              <p className="font-semibold">SRI LANKAN</p>
            </div>
            <div>
              <p className="opacity-60">Expiry</p>
              <p className="font-semibold">{formatDate(doc.expiry)}</p>
            </div>
          </div>
        </div>
        <p className="mt-4 truncate font-mono text-[10px] tracking-wider opacity-70">P&lt;LKA{name.toUpperCase().replace(/ /g, "&lt;&lt;")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
        <p className="mt-2 text-center text-[10px] tracking-widest text-[#f1d98f] uppercase">Sample preview · demo data</p>
      </div>
    );
  }
  if (doc.fileType === "image") {
    return (
      <div className="mx-auto flex aspect-[35/45] w-44 flex-col items-center justify-end overflow-hidden rounded-lg bg-gradient-to-b from-[#f4f6f5] to-white shadow-lg ring-1 ring-border">
        <div className="size-16 rounded-full bg-[#d6ded9]" />
        <div className="mt-2 h-20 w-32 rounded-t-full bg-[#c7d1cb]" />
      </div>
    );
  }
  return (
    <div className="mx-auto aspect-[1/1.3] w-full max-w-sm rounded-lg bg-white p-6 shadow-lg ring-1 ring-border">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded bg-[#e7f4ee]" />
        <div className="h-2.5 w-28 rounded bg-[#dfe6e2]" />
      </div>
      <p className="mt-5 text-[13px] font-semibold">{doc.name}</p>
      <p className="text-[11px] text-muted-foreground">{name}</p>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="h-2 rounded bg-[#eef1ef]" style={{ width: `${60 + ((i * 29) % 40)}%` }} />
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <div className="h-8 w-20 rounded border-2 border-dashed border-[#c9d6cf]" />
      </div>
    </div>
  );
}

export function DocumentPreview({ open, onClose, docId, customerView }: ModalProps & { docId: string; customerView?: boolean }) {
  const store = useStore();
  const { customerName, staffName } = useLookups();
  const doc = store.documents.find((d) => d.id === docId);
  if (!doc) return null;
  const preview = uploadedPreviews.get(doc.id);
  const name = customerName(doc.customerId);

  const set = (s: DocumentItem["status"], msg: string, note?: string) => {
    store.setDocumentStatus(doc.id, s, note);
    toast.success(msg);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">{doc.name}</DialogTitle>
        <DialogDescription className="sr-only">Document preview</DialogDescription>
        <div className="grid max-h-[calc(100dvh-2rem)] overflow-y-auto md:grid-cols-[1fr_300px]">
          <div className="flex min-h-72 items-center justify-center bg-[#eef1ef] p-6 sm:p-10">
            {preview ? <img src={preview} alt={doc.name} className="max-h-[60vh] rounded-lg object-contain shadow-lg" /> : <MockPage doc={doc} name={name} />}
          </div>
          <div className="flex flex-col border-t border-border p-5 md:border-t-0 md:border-l">
            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f4ee] text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{doc.name}</p>
                <p className="truncate text-xs text-muted-foreground">{doc.fileName}</p>
              </div>
            </div>
            <div className="mt-3">
              <StatusBadge status={doc.status} />
            </div>
            {doc.note && <p className="mt-3 rounded-lg bg-[#fff0e6] px-3 py-2 text-xs text-[#8f3d0a]">{doc.note}</p>}
            <dl className="mt-3 divide-y divide-border">
              <InfoRow label="Customer" value={name} />
              <InfoRow label="Application" value={doc.applicationId ?? "—"} />
              <InfoRow label="Category" value={doc.category} />
              <InfoRow label="Uploaded" value={formatDate(doc.uploadedAt)} />
              <InfoRow label="Uploaded by" value={doc.uploadedBy === "customer" ? "Customer (portal)" : "Staff"} />
              <InfoRow label="Size" value={formatBytes(doc.size)} />
              <InfoRow label="Expiry" value={formatDate(doc.expiry)} />
              {!customerView && <InfoRow label="Verified by" value={doc.verifiedBy ? staffName(doc.verifiedBy) : "—"} />}
            </dl>
            <div className="mt-auto space-y-2 pt-5">
              {!customerView && doc.status !== "Verified" && (
                <Button className="w-full" onClick={() => set("Verified", "Document verified.")}>
                  <CheckCircle2 /> Verify Document
                </Button>
              )}
              {!customerView && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => set("Re-upload Required", "Re-upload requested.", "Please upload a clearer, complete copy.")}>
                    <RotateCcw /> Re-upload
                  </Button>
                  <Button variant="outline" className="text-destructive" onClick={() => set("Rejected", "Document rejected.", "Document does not meet embassy requirements.")}>
                    <XCircle /> Reject
                  </Button>
                </div>
              )}
              <Button variant="ghost" className="w-full" onClick={() => toast.info("File downloads will be available after backend integration.")}>
                <Download /> Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
