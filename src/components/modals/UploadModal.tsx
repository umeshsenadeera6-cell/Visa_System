import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormGrid } from "@/components/shared/Form";
import { FileDropzone, type QueuedFile } from "@/components/shared/FileDropzone";
import { useStore } from "@/store/store";
import { DOC_CATEGORIES, buildChecklist } from "@/lib/domain";
import type { DocCategory } from "@/data/types";
import { uploadedPreviews, type ModalProps } from "./context";

export function UploadModal({
  open,
  onClose,
  customerId: presetCustomer,
  applicationId: presetApp,
  requirement: presetReq,
  category: presetCat,
  asCustomer,
}: ModalProps & { customerId?: string; applicationId?: string; requirement?: string; category?: DocCategory; asCustomer?: boolean }) {
  const store = useStore();
  const [customerId, setCustomerId] = useState(presetCustomer ?? store.applications.find((a) => a.id === presetApp)?.customerId ?? "");
  const [applicationId, setApplicationId] = useState(presetApp ?? "none");
  const [requirement, setRequirement] = useState(presetReq ?? "none");
  const [category, setCategory] = useState<DocCategory>(presetCat ?? "Other");
  const [expiry, setExpiry] = useState("");
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const onFilesChange = useCallback((u: (p: QueuedFile[]) => QueuedFile[]) => setFiles(u), []);

  const apps = store.applications.filter((a) => a.customerId === customerId);
  const app = store.applications.find((a) => a.id === applicationId);
  const checklist = useMemo(() => (app ? buildChecklist(app, store.requirements[app.visaTypeId] ?? [], store.documents) : null), [app, store.requirements, store.documents]);

  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const reqLocked = !!presetReq;

  const submit = () => {
    if (!customerId) return toast.error("Please select a customer.");
    files.forEach((f, i) => {
      const reqName = requirement !== "none" ? requirement : undefined;
      const reqObj = checklist?.items.find((it) => it.requirement.name === reqName)?.requirement;
      const doc = store.uploadDocument({
        customerId,
        applicationId: applicationId !== "none" ? applicationId : undefined,
        requirement: i === 0 ? reqName : undefined,
        category: reqObj?.category ?? category,
        name: i === 0 && reqName ? reqName : f.file.name.replace(/\.[^.]+$/, ""),
        fileName: f.file.name,
        size: f.file.size,
        fileType: f.file.type.startsWith("image/") ? "image" : "pdf",
        expiry: expiry || undefined,
        uploadedBy: asCustomer ? "customer" : "staff",
      });
      if (f.previewUrl) uploadedPreviews.set(doc.id, f.previewUrl);
    });
    toast.success(files.length > 1 ? `${files.length} documents uploaded.` : "Document uploaded.", {
      description: asCustomer ? "Our documentation team will review it shortly." : "Status set to Uploaded — ready for verification.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{presetReq ? `Upload ${presetReq}` : "Upload Document"}</DialogTitle>
          <DialogDescription>{asCustomer ? "Upload a clear scan or photo. Files are simulated in this demo." : "Attach documents to a customer or application checklist."}</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {!asCustomer && (
            <FormGrid>
              <Field label="Customer" required className="sm:col-span-2">
                <Select
                  value={customerId}
                  onValueChange={(v) => {
                    setCustomerId(v);
                    setApplicationId("none");
                    setRequirement("none");
                  }}
                  disabled={!!presetCustomer || !!presetApp}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {store.customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} · {c.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Application">
                <Select value={applicationId} onValueChange={(v) => (setApplicationId(v), setRequirement("none"))} disabled={!!presetApp || !customerId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not linked</SelectItem>
                    {apps.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Checklist Item">
                <Select value={requirement} onValueChange={setRequirement} disabled={reqLocked || !checklist}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General document</SelectItem>
                    {checklist?.items.map((it) => (
                      <SelectItem key={it.requirement.id} value={it.requirement.name}>
                        {it.requirement.name} {it.state === "complete" ? "✓" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {requirement === "none" && (
                <Field label="Category">
                  <Select value={category} onValueChange={(v) => setCategory(v as DocCategory)}>
                    <SelectTrigger>
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
                </Field>
              )}
              <Field label="Expiry Date" hint="Optional — for passports, insurance, etc.">
                <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </Field>
            </FormGrid>
          )}
          <FileDropzone files={files} onChange={onFilesChange} multiple={!presetReq} />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!allDone}>
            {files.length && !allDone ? "Uploading…" : files.length > 1 ? `Save ${files.length} Documents` : "Save Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
