import { Eye, FileText, FolderOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DocumentChecklist } from "@/components/shared/ApplicationWidgets";
import { useModals } from "@/components/modals/context";
import { useLookups } from "@/store/store";
import { formatBytes, formatDate } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalDocuments() {
  const { customer, apps, store } = usePortalCustomer();
  const { country } = useLookups();
  const modals = useModals();
  const docs = store.documents.filter((d) => d.customerId === customer.id).sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));
  const active = apps.filter((a) => !["Completed", "Passport Returned"].includes(a.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload requested documents and see their verification status.</p>
        </div>
        <Button onClick={() => modals.open("upload", { customerId: customer.id, applicationId: active[0]?.id, asCustomer: true })}>
          <Upload /> Upload Document
        </Button>
      </div>

      {active.map((a) => (
        <SectionCard key={a.id} title={`${country(a.countryCode)?.flag} Checklist · ${a.id}`} description="Items marked missing need your attention.">
          <DocumentChecklist app={a} mode="customer" />
        </SectionCard>
      ))}

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <p className="font-semibold">All uploaded files</p>
        </div>
        {docs.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No documents yet" />
        ) : (
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <FileText className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.fileName} · {formatBytes(d.size)} · {formatDate(d.uploadedAt)}
                  </p>
                </div>
                <StatusBadge status={d.status} />
                <Button variant="ghost" size="sm" onClick={() => modals.open("document", { docId: d.id, customerView: true })}>
                  <Eye /> View
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
