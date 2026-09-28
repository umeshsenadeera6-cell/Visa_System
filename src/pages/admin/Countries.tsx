import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUpRight, Globe2, MoreHorizontal, Pencil, Plus, Stamp, Trash2, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/components/shared/Confirm";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useStore } from "@/store/store";

export default function Countries() {
  const store = useStore();
  const modals = useModals();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const loading = useFakeLoading(450);

  return (
    <div>
      <PageHeader
        title="Countries"
        subtitle="Destinations you process visas for, with live application counts."
        actions={
          <Button onClick={() => modals.open("country")}>
            <Plus /> Add Country
          </Button>
        }
      />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="size-12 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
              <Skeleton className="mt-6 h-2 w-full" />
            </Card>
          ))}
        </div>
      ) : store.countries.length === 0 ? (
        <Card>
          <EmptyState icon={Globe2} title="No countries configured" action={<Button onClick={() => modals.open("country")}>Add Country</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {store.countries.map((c) => {
            const apps = c.historicalApplications + store.applications.filter((a) => a.countryCode === c.code).length;
            const types = store.visaTypes.filter((v) => v.countryCode === c.code && v.status === "Active").length;
            const active = store.applications.filter((a) => a.countryCode === c.code && !["Completed", "Passport Returned"].includes(a.status)).length;
            return (
              <Card
                key={c.code}
                onClick={() => navigate(`/app/countries/${c.code}`)}
                className="group relative cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="pointer-events-none absolute -top-8 -right-8 text-[120px] leading-none opacity-[0.07] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{c.flag}</div>
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#f3f6f4] text-3xl shadow-inner">{c.flag}</div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Actions">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => modals.open("country", { country: c })}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => modals.open("visaType", { countryCode: c.code })}>
                          <Stamp /> Add visa type
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            confirm({
                              title: `Delete ${c.name}?`,
                              description: "Visa types for this country will be hidden from new applications.",
                              onConfirm: () => {
                                store.remove("countries", c.code);
                                toast.success("Deleted successfully.");
                              },
                            })
                          }
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <h3 className="mt-4 text-[17px] font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.region}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-display text-xl font-bold tabular">{apps}</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold tabular">{types}</p>
                    <p className="text-xs text-muted-foreground">Visa Types</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Approval rate</span>
                    <span className="font-semibold tabular">{c.successRate}%</span>
                  </div>
                  <Progress value={c.successRate} className="h-1.5" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Plane className="size-3.5" /> {active} active files
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <ArrowUpRight className="absolute right-4 bottom-14 size-4 text-primary opacity-0 transition group-hover:opacity-100" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
