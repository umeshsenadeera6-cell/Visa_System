import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLookups } from "@/store/store";
import { appProgress } from "@/lib/domain";
import { formatDate } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalApplications() {
  const { apps } = usePortalCustomer();
  const { country, fullVisaLabel, staffName } = useLookups();
  return (
    <div>
      <h1 className="text-2xl font-bold">My Applications</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Track every application you have with us.</p>
      {apps.length === 0 ? (
        <Card>
          <EmptyState icon={Plane} title="No applications found" description="Once your consultant opens an application it will appear here." />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((a) => (
            <Link key={a.id} to={`/portal/applications/${a.id}`}>
              <Card className="group p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#f3f6f4] text-3xl">{country(a.countryCode)?.flag}</span>
                    <div>
                      <p className="font-semibold">{fullVisaLabel(a.visaTypeId)}</p>
                      <p className="text-xs text-muted-foreground">{a.id}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <StatusBadge status={a.status} />
                  <span className="font-display text-lg font-bold text-primary tabular">{appProgress(a.status)}%</span>
                </div>
                <Progress value={appProgress(a.status)} className="mt-2" />
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>Travel {formatDate(a.travelDate)}</span>
                  <span>Consultant: {staffName(a.consultantId)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
