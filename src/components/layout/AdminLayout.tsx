import { Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronsRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShieldAlert } from "lucide-react";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./Sidebar";
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
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

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
  if (store.session.role === "Team Member" || store.session.role === "Customer") return <Navigate to="/portal" replace />;
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
            <div className="flex-1" />
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
                description={`The ${store.session.role} role can't open this module.`}
                action={<Button onClick={() => navigate("/app/visa-types")}>Go to Visa Types</Button>}
              />
            )}
          </div>
        </main>
      </div>
    </div>
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
