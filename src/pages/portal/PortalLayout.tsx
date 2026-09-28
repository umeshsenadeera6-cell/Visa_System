import { Suspense, useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, CreditCard, FileText, Home, LogOut, MessageSquare, Plane, Receipt, Repeat, Search, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/Logo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { useSwitchRole } from "@/components/layout/RoleSwitcher";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/portal", label: "Dashboard", icon: Home },
  { to: "/portal/applications", label: "My Applications", icon: Plane },
  { to: "/portal/documents", label: "Documents", icon: FileText },
  { to: "/portal/payments", label: "Payments", icon: CreditCard },
  { to: "/portal/invoices", label: "Invoices", icon: Receipt },
  { to: "/portal/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/portal/messages", label: "Messages", icon: MessageSquare },
  { to: "/portal/profile", label: "Profile", icon: UserRound },
];
const MOBILE = [NAV[0], NAV[1], NAV[2], NAV[6], NAV[7]];

export function PortalLayout() {
  const store = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const switchRole = useSwitchRole();
  useEffect(() => window.scrollTo({ top: 0 }), [location.pathname]);

  if (!store.session) return <Navigate to="/login" replace />;
  if (store.session.role !== "Customer") return <Navigate to="/app" replace />;
  const c = store.customers.find((x) => x.id === store.session?.customerId);
  const unreadMsgs = store.messages.filter((m) => m.customerId === c?.id && m.from === "staff").length;

  return (
    <div className="min-h-dvh bg-[#f7f6f2]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <NavLink to="/portal" className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-gold-soft px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[#8a6412] uppercase sm:inline">Client Portal</span>
          </NavLink>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => navigate("/track")} className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground md:flex">
              <Search className="size-4" /> Track
            </button>
            <NotificationCenter audience="customer" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-muted" aria-label="Account menu">
                  <UserAvatar name={store.session.name} className="size-8" />
                  <span className="hidden text-sm font-medium sm:inline">{store.session.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold text-foreground">{store.session.name}</p>
                  <p className="text-xs">{c?.id}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/portal/profile")}>
                  <UserRound /> My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole("Admin")}>
                  <Repeat /> Back to admin (demo)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    store.signOut();
                    navigate("/login");
                  }}
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 scrollbar-none sm:px-6 md:flex" aria-label="Portal">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/portal"}
              className={({ isActive }) =>
                cn(
                  "relative flex shrink-0 items-center gap-2 px-3 py-3 text-[13.5px] font-medium transition",
                  isActive ? "text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <n.icon className="size-4" />
              {n.label}
              {n.to === "/portal/messages" && unreadMsgs > 0 && <span className="size-1.5 rounded-full bg-gold" />}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 md:pb-12">
        <div key={location.pathname} className="page-enter">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-[#eeede8]" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Portal bottom">
        <div className="grid grid-cols-5">
          {MOBILE.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/portal"}
              className={({ isActive }) => cn("flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}
            >
              <n.icon className="size-5" />
              {n.label.replace("My ", "")}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function usePortalCustomer() {
  const store = useStore();
  const id = store.session?.customerId ?? "CUS-1001";
  const customer = store.customers.find((c) => c.id === id) ?? store.customers[0];
  const apps = store.applications.filter((a) => a.customerId === customer?.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { customer, apps, store };
}
