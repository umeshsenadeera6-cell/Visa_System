import { toast } from "sonner";
import { CalendarDays, Clock3, MapPin, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useLookups } from "@/store/store";
import { cn, parseDate, todayISO } from "@/lib/utils";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalAppointments() {
  const { customer, store } = usePortalCustomer();
  const { staffName } = useLookups();
  const today = todayISO();
  const list = store.appointments.filter((a) => a.customerId === customer.id).sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = list.filter((a) => a.date >= today);
  const past = list.filter((a) => a.date < today).reverse();

  const Item = ({ a, dim }: { a: (typeof list)[number]; dim?: boolean }) => (
    <Card className={cn("flex flex-col gap-4 p-5 sm:flex-row sm:items-center", dim && "opacity-75")}>
      <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-[#eef6f2] py-2 text-primary">
        <span className="text-[11px] font-semibold uppercase">{parseDate(a.date).toLocaleDateString("en", { month: "short" })}</span>
        <span className="font-display text-2xl leading-none font-bold">{parseDate(a.date).getDate()}</span>
        <span className="text-[10.5px] text-muted-foreground">{parseDate(a.date).toLocaleDateString("en", { weekday: "short" })}</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold">{a.type}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock3 className="size-3.5" /> {a.time} · {a.duration} min
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {a.location}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-sm">
          <UserAvatar name={staffName(a.staffId)} className="size-7 text-[10px]" /> {staffName(a.staffId)}
        </span>
        <StatusBadge status={a.status} />
      </div>
    </Card>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your consultations, VFS visits and collections.</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Consultation request sent.", { description: "Your consultant will confirm a time shortly." })}>
          <CalendarPlus /> Request a consultation
        </Button>
      </div>
      {list.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarDays} title="No appointments" />
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Upcoming</h2>
            {upcoming.length ? upcoming.map((a) => <Item key={a.id} a={a} />) : <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
          </section>
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Past</h2>
              {past.map((a) => (
                <Item key={a.id} a={a} dim />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
