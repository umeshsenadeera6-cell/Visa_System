import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plane, Plus, Receipt, UserPlus, Users, ArrowRight, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useModals } from "@/components/modals/context";
import { useLookups, useStore } from "@/store/store";
import { NAV } from "./nav";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const store = useStore();
  const { customerName, country, visaLabel } = useLookups();
  const navigate = useNavigate();
  const modals = useModals();
  const role = store.session?.role ?? "Admin";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };
  const act = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-2xl translate-y-0 p-0" hideClose>
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <DialogDescription className="sr-only">Search customers, applications, leads, invoices and documents</DialogDescription>
        <Command loop>
          <CommandInput placeholder="Search customers, applications, leads, invoices, documents…" />
          <CommandList>
            <CommandEmpty>
              <p className="font-medium text-foreground">No results found</p>
              <p className="mt-1">Try a name, application ID like SVS-UK-2026-00125, or invoice number.</p>
            </CommandEmpty>

            <CommandGroup heading="Quick actions">
              <CommandItem value="action new application create" onSelect={() => act(() => modals.open("application"))}>
                <Plus className="text-primary" /> New visa application
              </CommandItem>
              <CommandItem value="action add lead create" onSelect={() => act(() => modals.open("lead"))}>
                <UserPlus className="text-primary" /> Add lead
              </CommandItem>
              <CommandItem value="action add customer create" onSelect={() => act(() => modals.open("customer"))}>
                <Users className="text-primary" /> Add customer
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />

            <CommandGroup heading="Customers">
              {store.customers.map((c) => (
                <CommandItem key={c.id} value={`customer ${c.firstName} ${c.lastName} ${c.id} ${c.email} ${c.phone} ${c.passport.number}`} onSelect={() => go(`/app/customers/${c.id}`)}>
                  <UserAvatar name={`${c.firstName} ${c.lastName}`} className="size-7 text-[10px]" />
                  <span className="flex-1 truncate">
                    {c.firstName} {c.lastName}
                    <span className="ml-2 text-xs text-muted-foreground">{c.id}</span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{c.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Applications">
              {store.applications.map((a) => (
                <CommandItem key={a.id} value={`application ${a.id} ${customerName(a.customerId)} ${country(a.countryCode)?.name} ${a.status}`} onSelect={() => go(`/app/applications/${a.id}`)}>
                  <Plane className="text-muted-foreground" />
                  <span className="flex-1 truncate">
                    <span className="font-medium">{a.id}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {customerName(a.customerId)} · {country(a.countryCode)?.flag} {visaLabel(a.visaTypeId)}
                    </span>
                  </span>
                  <StatusBadge status={a.status} className="hidden sm:inline-flex" />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Leads">
              {store.leads.map((l) => (
                <CommandItem key={l.id} value={`lead ${l.name} ${l.id} ${l.phone} ${l.email}`} onSelect={() => go(`/app/leads?q=${encodeURIComponent(l.name)}`)}>
                  <UserPlus className="text-muted-foreground" />
                  <span className="flex-1 truncate">
                    {l.name} <span className="ml-2 text-xs text-muted-foreground">{l.id}</span>
                  </span>
                  <StatusBadge status={l.status} className="hidden sm:inline-flex" />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Invoices">
              {store.invoices.map((i) => (
                <CommandItem key={i.id} value={`invoice ${i.id} ${customerName(i.customerId)}`} onSelect={() => act(() => modals.open("invoice", { invoiceId: i.id }))}>
                  <Receipt className="text-muted-foreground" />
                  <span className="flex-1 truncate">
                    {i.id} <span className="ml-2 text-xs text-muted-foreground">{customerName(i.customerId)}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Documents">
              {store.documents.slice(0, 60).map((d) => (
                <CommandItem key={d.id} value={`document ${d.name} ${d.fileName} ${customerName(d.customerId)} ${d.id}`} onSelect={() => act(() => modals.open("document", { docId: d.id }))}>
                  <FileText className="text-muted-foreground" />
                  <span className="flex-1 truncate">
                    {d.name} <span className="ml-2 text-xs text-muted-foreground">{customerName(d.customerId)}</span>
                  </span>
                  <StatusBadge status={d.status} className="hidden sm:inline-flex" />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Pages">
              {NAV.flatMap((g) => g.items)
                .filter((i) => role === "Admin" || i.roles.includes(role))
                .map((i) => (
                  <CommandItem key={i.to} value={`page ${i.label}`} onSelect={() => go(i.to)}>
                    <i.icon className="text-muted-foreground" />
                    <span className="flex-1">{i.label}</span>
                    <ArrowRight className="text-muted-foreground" />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center gap-4 border-t border-border bg-[#fafbfa] px-4 py-2.5 text-[11.5px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-sans">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-sans">
                <CornerDownLeft className="inline size-3" />
              </kbd>{" "}
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-sans">esc</kbd> close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
