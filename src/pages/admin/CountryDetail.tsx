import { Link, useNavigate, useParams } from "react-router-dom";
import { Globe2, Pencil, Plus, Stamp, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, InfoRow } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useLookups, useStore } from "@/store/store";
import { formatLKR, formatShortDate } from "@/lib/utils";

export default function CountryDetail() {
  const { code } = useParams();
  const store = useStore();
  const { customerName, visaLabel } = useLookups();
  const modals = useModals();
  const navigate = useNavigate();
  const loading = useFakeLoading(400, [code]);
  const c = store.countries.find((x) => x.code === code);
  if (loading) return <ProfileSkeleton />;
  if (!c) return <EmptyState icon={Globe2} title="Country not found" action={<Button onClick={() => navigate("/app/countries")}>Back</Button>} />;
  const types = store.visaTypes.filter((v) => v.countryCode === c.code);
  const apps = store.applications.filter((a) => a.countryCode === c.code);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Countries", to: "/app/countries" }, { label: c.name }]}
        title={
          <span className="flex items-center gap-3">
            <span className="text-4xl">{c.flag}</span> {c.name}
          </span>
        }
        subtitle={c.description}
        actions={
          <>
            <Button variant="outline" onClick={() => modals.open("country", { country: c })}>
              <Pencil /> Edit
            </Button>
            <Button onClick={() => modals.open("application", { countryCode: c.code })}>
              <Plus /> New Application
            </Button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Visa Types"
            icon={<Stamp />}
            bodyClassName="px-0 pb-0"
            action={
              <Button size="sm" variant="outline" onClick={() => modals.open("visaType", { countryCode: c.code })}>
                <Plus /> Add
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visa</TableHead>
                  <TableHead>Processing</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((v) => (
                  <TableRow key={v.id} className="cursor-pointer" onClick={() => modals.open("visaType", { visaType: v })}>
                    <TableCell>
                      <p className="font-medium">{v.category}</p>
                      <p className="text-xs text-muted-foreground">{v.name}</p>
                    </TableCell>
                    <TableCell className="text-[13px]">{v.processingTime}</TableCell>
                    <TableCell className="text-[13px]">
                      {v.validity} · {v.entry}
                    </TableCell>
                    <TableCell className="text-right tabular">{formatLKR(v.fee)}</TableCell>
                    <TableCell>
                      <Link to={`/app/requirements?vt=${v.id}`} onClick={(e) => e.stopPropagation()} className="text-[13px] text-primary hover:underline">
                        {(store.requirements[v.id] ?? []).length} documents
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
          <SectionCard title="Current Applications" icon={<Plane />} bodyClassName="px-0 pb-0">
            {apps.length === 0 ? (
              <EmptyState compact icon={Plane} title="No applications for this country" />
            ) : (
              <Table>
                <TableBody>
                  {apps.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer" onClick={() => navigate(`/app/applications/${a.id}`)}>
                      <TableCell className="font-medium text-primary">{a.id}</TableCell>
                      <TableCell>{customerName(a.customerId)}</TableCell>
                      <TableCell>{visaLabel(a.visaTypeId)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatShortDate(a.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </div>
        <Card className="h-fit p-5">
          <dl className="divide-y divide-border">
            <InfoRow label="Region" value={c.region} />
            <InfoRow label="Capital" value={c.capital} />
            <InfoRow label="Currency" value={c.currency} />
            <InfoRow label="Total applications" value={c.historicalApplications + apps.length} />
            <InfoRow label="Approval rate" value={`${c.successRate}%`} />
            <InfoRow label="Status" value={<StatusBadge status={c.status} />} />
          </dl>
        </Card>
      </div>
    </div>
  );
}
