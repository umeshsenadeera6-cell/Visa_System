import { Suspense, useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CalendarPlus, ChevronsRight, FilePlus2, LayoutDashboard, Menu, MoreHorizontal, Plane, Plus, Search, UploadCloud, UserPlus, Users, CreditCard, ShieldAlert } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/EmptyState";
import { useModals } from "@/components/modals/context";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { NotificationCenter } from "./NotificationCenter";
import { canAccess } from "./nav";

function readCollapsed() {
  try {
    return localStorage.getItem("svs-sidebar-collapsed") === "1";
  } catch {
    return false;
  }
}

export function AdminLayout() {
  const store = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const modals = useModals();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("svs-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  if (!store.session) return <Navigate to="/login" replace />;
  if (store.session.role === "Customer") return <Navigate to="/portal" replace />;
  const allowed = canAccess(store.session.role, location.pathname);

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-black/5 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
          collapsed ? "w-[76px]" : "w-[264px]",
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(true)} />
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute top-5 -right-3 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        )}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] max-w-[85%] border-0 p-0 [&>button]:text-white">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
          <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </Button>

            <button
              onClick={() => setSearchOpen(true)}
              className="group flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-border bg-[#f7f9f8] px-3 text-sm text-muted-foreground transition hover:border-[#cfd8d3] hover:bg-white sm:max-w-md"
              aria-label="Open global search"
            >
              <Search className="size-4" />
              <span className="flex-1 truncate text-left">
                <span className="sm:hidden">Search…</span>
                <span className="hidden sm:inline">Search customers, applications, invoices…</span>
              </span>
              <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs sm:inline-flex">⌘ K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="hidden rounded-xl sm:inline-flex">
                    <Plus /> Create
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Quick create</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => modals.open("application")}>
                    <FilePlus2 /> New application
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => modals.open("lead")}>
                    <UserPlus /> Add lead
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => modals.open("customer")}>
                    <Users /> Add customer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => modals.open("upload")}>
                    <UploadCloud /> Upload document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => modals.open("payment")}>
                    <CreditCard /> Add payment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => modals.open("appointment")}>
                    <CalendarPlus /> Schedule appointment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NotificationCenter />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
          <div key={location.pathname} className="mx-auto w-full max-w-[1600px] page-enter">
            {allowed ? (
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="You don't have access to this page"
                description={`The ${store.session.role} role can't open this module. Switch demo role from the profile menu to explore it.`}
                action={<Button onClick={() => navigate("/app")}>Back to dashboard</Button>}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Bottom">
        <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2">
          {[
            { to: "/app", label: "Home", icon: LayoutDashboard },
            { to: "/app/applications", label: "Visas", icon: Plane },
          ].map((i) => (
            <BottomLink key={i.to} {...i} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => modals.open("application")}
              className="-mt-5 flex size-13 items-center justify-center rounded-2xl bg-gradient-to-b from-[#0f7a5a] to-[#0b5a42] text-white shadow-lg shadow-primary/30 transition active:scale-95"
              aria-label="New application"
            >
              <Plus className="size-6" />
            </button>
          </div>
          <BottomLink to="/app/customers" label="Customers" icon={Users} />
          <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium text-muted-foreground">
            <MoreHorizontal className="size-5" />
            More
          </button>
        </div>
      </nav>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function BottomLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Plus }) {
  return (
    <NavLink
      to={to}
      end={to === "/app"}
      className={({ isActive }) => cn("flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition", isActive ? "text-primary" : "text-muted-foreground")}
    >
      <Icon className="size-5" />
      {label}
    </NavLink>
  );
}

function RouteFallback() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-[#e9eeeb]" />
      <div className="h-64 animate-pulse rounded-2xl bg-[#eef2f0]" />
    </div>
  );
}
