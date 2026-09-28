import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock3, List, MapPin, CheckCircle2, XCircle, Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { useModals } from "@/components/modals/context";
import { useFakeLoading } from "@/hooks/useFakeLoading";
import { useLookups, useStore } from "@/store/store";
import { APPOINTMENT_TYPES } from "@/lib/domain";
import { cn, formatDate, parseDate, toISO, todayISO } from "@/lib/utils";
import type { Appointment, AppointmentType } from "@/data/types";

const typeColor: Record<AppointmentType, string> = {
  Consultation: "border-l-[#0a7d57] bg-[#eef7f2] text-[#0a4f38]",
  Embassy: "border-l-[#3a6fd8] bg-[#eef3fd] text-[#1f428b]",
  VFS: "border-l-[#8a5cc9] bg-[#f4effb] text-[#51307f]",
  Biometrics: "border-l-[#c2881c] bg-[#fbf5e6] text-[#6b4b0d]",
  Interview: "border-l-[#cf4f3a] bg-[#fdf0ed] text-[#8a2c1e]",
  "Passport Collection": "border-l-[#14908e] bg-[#e9f6f6] text-[#0d5b5a]",
};
const typeDot: Record<AppointmentType, string> = {
  Consultation: "bg-[#0a7d57]",
  Embassy: "bg-[#3a6fd8]",
  VFS: "bg-[#8a5cc9]",
  Biometrics: "bg-[#c2881c]",
  Interview: "bg-[#cf4f3a]",
  "Passport Collection": "bg-[#14908e]",
};

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 8:00 – 18:00
const ROW = 56;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export default function Appointments() {
  const store = useStore();
  const { customerName, staffName, application, country, visaLabel } = useLookups();
  const modals = useModals();
  const loading = useFakeLoading(450);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [mode, setMode] = useState<"month" | "week" | "day">("month");
  const [cursor, setCursor] = useState(new Date());
  const [types, setTypes] = useState<AppointmentType[]>([...APPOINTMENT_TYPES]);
  const today = todayISO();

  const appts = useMemo(() => store.appointments.filter((a) => types.includes(a.type)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [store.appointments, types]);
  const byDate = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    appts.forEach((a) => m.set(a.date, [...(m.get(a.date) ?? []), a]));
    return m;
  }, [appts]);

  const shift = (dir: number) => {
    const d = new Date(cursor);
    if (mode === "month") d.setMonth(d.getMonth() + dir);
    else if (mode === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  };
  const title =
    mode === "month"
      ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      : mode === "week"
        ? `${startOfWeek(cursor).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${addDays(startOfWeek(cursor), 6).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
        : cursor.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const setStatus = (a: Appointment, status: Appointment["status"]) => {
    store.update("appointments", a.id, { status });
    toast.success("Appointment updated.", { description: `${a.type} · ${status}` });
  };

  const Chip = ({ a, compact }: { a: Appointment; compact?: boolean }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        modals.open("appointment", { appointment: a });
      }}
      className={cn(
        "w-full truncate rounded-md border-l-[3px] px-1.5 py-0.5 text-left text-[11px] font-medium transition hover:brightness-95",
        typeColor[a.type],
        a.status === "Cancelled" && "line-through opacity-50",
      )}
      title={`${a.time} ${a.type} — ${customerName(a.customerId)}`}
    >
      {!compact && <span className="tabular opacity-70">{a.time} </span>}
      {customerName(a.customerId).split(" ")[0]}
    </button>
  );

  const ApptCard = ({ a }: { a: Appointment }) => {
    const app = application(a.applicationId);
    return (
      <Card className="group flex flex-col gap-3 p-4 transition hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-[#eef6f2] py-2 text-primary">
            <span className="text-[10px] font-semibold uppercase">{parseDate(a.date).toLocaleDateString("en", { month: "short" })}</span>
            <span className="font-display text-xl leading-none font-bold">{parseDate(a.date).getDate()}</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">{parseDate(a.date).toLocaleDateString("en", { weekday: "short" })}</span>
          </div>
          <div className="min-w-0 flex-1 sm:w-72">
            <p className="flex items-center gap-2 font-semibold">
              <span className={cn("size-2 rounded-full", typeDot[a.type])} />
              {a.type}
            </p>
            <p className="mt-0.5 truncate text-sm">{customerName(a.customerId)}</p>
            <p className="truncate text-xs text-muted-foreground">{app ? `${country(app.countryCode)?.flag} ${country(app.countryCode)?.name} · ${visaLabel(app.visaTypeId)}` : "General consultation"}</p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" /> {a.time} · {a.duration} min
          </span>
          <span className="col-span-2 flex items-center gap-1.5 truncate sm:col-span-1">
            <MapPin className="size-3.5 shrink-0" /> <span className="truncate">{a.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <UserAvatar name={staffName(a.staffId)} className="size-5 text-[8px]" /> {staffName(a.staffId)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <StatusBadge status={a.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => modals.open("appointment", { appointment: a })}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus(a, "Confirmed")}>
                <CheckCircle2 /> Confirm
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus(a, "Completed")}>
                <CheckCircle2 /> Mark completed
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setStatus(a, "Cancelled")}>
                <XCircle /> Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  /* ------- Timed grid (week/day) ------- */
  const TimeGrid = ({ days }: { days: Date[] }) => (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(${days.length > 1 ? 120 : 240}px, 1fr))` }}>
        <div className="sticky left-0 z-10 bg-card" />
        {days.map((d) => {
          const iso = toISO(d);
          return (
            <button key={iso} onClick={() => (setCursor(d), setMode("day"))} className={cn("border-b border-l border-border px-2 py-2 text-center", iso === today && "bg-[#f3f9f6]")}>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">{d.toLocaleDateString("en", { weekday: "short" })}</p>
              <p className={cn("mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full font-display text-sm font-bold", iso === today && "bg-primary text-white")}>{d.getDate()}</p>
            </button>
          );
        })}
        <div className="sticky left-0 z-10 bg-card">
          {HOURS.map((h) => (
            <div key={h} style={{ height: ROW }} className="pr-2 text-right text-[11px] text-muted-foreground tabular">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {days.map((d) => {
          const iso = toISO(d);
          const list = byDate.get(iso) ?? [];
          return (
            <div
              key={iso}
              className={cn("relative border-l border-border", iso === today && "bg-[#fafdfb]")}
              style={{ height: ROW * HOURS.length }}
              onDoubleClick={() => modals.open("appointment", { date: iso })}
            >
              {HOURS.map((h) => (
                <div key={h} style={{ top: (h - 8) * ROW }} className="absolute inset-x-0 border-t border-dashed border-[#edf0ee]" />
              ))}
              {list.map((a) => {
                const [hh, mm] = a.time.split(":").map(Number);
                const top = Math.max(0, (hh - 8) * ROW + (mm / 60) * ROW);
                const height = Math.max(34, (a.duration / 60) * ROW - 3);
                return (
                  <button
                    key={a.id}
                    onClick={() => modals.open("appointment", { appointment: a })}
                    style={{ top, height }}
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left shadow-xs transition hover:z-10 hover:shadow-md",
                      typeColor[a.type],
                      a.status === "Cancelled" && "opacity-50",
                    )}
                  >
                    <p className="truncate text-[11.5px] font-semibold">
                      {a.time} · {a.type}
                    </p>
                    <p className="truncate text-[11px] opacity-80">
                      {customerName(a.customerId)} · {staffName(a.staffId).split(" ")[0]}
                    </p>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ------- Month grid ------- */
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const upcoming = appts.filter((a) => a.date >= today);
  const past = appts.filter((a) => a.date < today).reverse();

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Consultations, VFS & embassy visits, biometrics, interviews and passport collections."
        actions={
          <>
            <ViewToggle
              value={view}
              onChange={setView}
              options={[
                { value: "calendar", label: "Calendar", icon: CalendarDays },
                { value: "list", label: "List", icon: List },
              ]}
            />
            <Button onClick={() => modals.open("appointment", { date: toISO(cursor) >= today ? toISO(cursor) : undefined })}>
              <CalendarPlus /> Add Appointment
            </Button>
          </>
        }
      />

      {/* Type legend / filter */}
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {APPOINTMENT_TYPES.map((t) => {
          const on = types.includes(t);
          return (
            <button
              key={t}
              onClick={() => setTypes((x) => (on ? x.filter((y) => y !== t) : [...x, t]))}
              className={cn("flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition", on ? "border-border bg-card" : "border-dashed border-border bg-transparent text-muted-foreground opacity-70")}
              aria-pressed={on}
            >
              <span className={cn("size-2 rounded-full", on ? typeDot[t] : "bg-[#c6cfca]")} />
              {t}
              <span className="text-xs text-muted-foreground tabular">{store.appointments.filter((a) => a.type === t).length}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : view === "list" ? (
        appts.length === 0 ? (
          <Card>
            <EmptyState icon={CalendarDays} title="No appointments found" description="Try enabling more appointment types or schedule a new one." action={<Button onClick={() => modals.open("appointment")}>Add Appointment</Button>} />
          </Card>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Upcoming · {upcoming.length}</h2>
              <div className="space-y-2.5">
                {upcoming.map((a) => (
                  <ApptCard key={a.id} a={a} />
                ))}
              </div>
            </section>
            {past.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Past · {past.length}</h2>
                <div className="space-y-2.5 opacity-90">
                  {past.map((a) => (
                    <ApptCard key={a.id} a={a} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => shift(1)} aria-label="Next">
                <ChevronRight />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
                Today
              </Button>
              <h2 className="ml-2 font-display text-base font-semibold sm:text-lg">{title}</h2>
            </div>
            <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
              {(["month", "week", "day"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn("rounded-md px-3 py-1 text-[13px] font-medium capitalize transition", mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode === "month" && (
            <div>
              <div className="grid grid-cols-7 border-b border-border bg-[#f8faf9]">
                {DOW.map((d) => (
                  <div key={d} className="py-2 text-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((d, i) => {
                  const iso = toISO(d);
                  const list = byDate.get(iso) ?? [];
                  const inMonth = d.getMonth() === cursor.getMonth();
                  return (
                    <div
                      key={iso}
                      onClick={() => (setCursor(d), setMode("day"))}
                      className={cn(
                        "group min-h-16 cursor-pointer border-border p-1 transition-colors hover:bg-[#f7faf8] sm:min-h-28 sm:p-1.5",
                        i % 7 !== 6 && "border-r",
                        i < 35 && "border-b",
                        !inMonth && "bg-[#fbfcfb] text-muted-foreground/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular", iso === today && "bg-primary text-white")}>{d.getDate()}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            modals.open("appointment", { date: iso });
                          }}
                          className="hidden rounded p-0.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted sm:block"
                          aria-label={`Add appointment on ${formatDate(iso)}`}
                        >
                          <CalendarPlus className="size-3.5" />
                        </button>
                      </div>
                      <div className="mt-1 hidden space-y-0.5 sm:block">
                        {list.slice(0, 3).map((a) => (
                          <Chip key={a.id} a={a} />
                        ))}
                        {list.length > 3 && <p className="px-1 text-[10.5px] font-medium text-muted-foreground">+{list.length - 3} more</p>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                        {list.map((a) => (
                          <span key={a.id} className={cn("size-1.5 rounded-full", typeDot[a.type])} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "week" && <TimeGrid days={Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))} />}

          {mode === "day" && (
            <div className="grid lg:grid-cols-[1fr_360px]">
              <TimeGrid days={[cursor]} />
              <div className="border-t border-border p-4 lg:border-t-0 lg:border-l">
                <p className="text-sm font-semibold">Agenda</p>
                <div className="mt-3 space-y-2">
                  {(byDate.get(toISO(cursor)) ?? []).map((a) => {
                    const app = application(a.applicationId);
                    return (
                      <button key={a.id} onClick={() => modals.open("appointment", { appointment: a })} className={cn("w-full rounded-xl border-l-[3px] p-3 text-left transition hover:shadow-sm", typeColor[a.type])}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{a.type}</p>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="mt-1 text-sm">{customerName(a.customerId)}</p>
                        <p className="text-xs opacity-80">{app ? `${country(app.countryCode)?.flag} ${visaLabel(app.visaTypeId)}` : "General"}</p>
                        <p className="mt-1 text-xs opacity-80">
                          {a.time} · {staffName(a.staffId)}
                        </p>
                      </button>
                    );
                  })}
                  {!(byDate.get(toISO(cursor)) ?? []).length && (
                    <EmptyState
                      compact
                      icon={CalendarDays}
                      title="Nothing scheduled"
                      action={
                        <Button size="sm" onClick={() => modals.open("appointment", { date: toISO(cursor) })}>
                          Add Appointment
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
