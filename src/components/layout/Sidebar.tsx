import { NavLink, useNavigate } from "react-router-dom";
import { ChevronsLeft, ChevronsUpDown, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo, LogoMark } from "@/components/shared/Logo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";
import { useNavBadges } from "./useNavBadges";

export function SidebarContent({ collapsed = false, onNavigate, onToggle }: { collapsed?: boolean; onNavigate?: () => void; onToggle?: () => void }) {
  const store = useStore();
  const navigate = useNavigate();
  const badges = useNavBadges();
  const role = store.session?.role ?? "Admin";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      {/* ambient decoration */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-[#14704f] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-24 size-40 rounded-full bg-[#c9a14a] opacity-[0.07] blur-3xl" />

      <div className={cn("relative flex h-16 shrink-0 items-center", collapsed ? "justify-center px-2" : "justify-between px-5")}>
        {collapsed ? <LogoMark /> : <Logo light />}
        {onToggle && !collapsed && (
          <button onClick={onToggle} className="rounded-md p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Collapse sidebar">
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 py-3 scrollbar-none" aria-label="Main">
        {NAV.map((group, gi) => {
          const items = group.items.filter((i) => i.roles.includes(role) || role === "Admin");
          if (!items.length) return null;
          return (
            <div key={gi}>
              {group.label &&
                (collapsed ? (
                  <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
                ) : (
                  <p className="mb-1.5 px-3 text-[10.5px] font-semibold tracking-[0.16em] text-white/35 uppercase">{group.label}</p>
                ))}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const count = item.badge ? badges[item.badge] : 0;
                  const link = (
                    <NavLink
                      to={item.to}
                      end={item.to === "/app"}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex h-10 items-center gap-3 rounded-xl text-[13.5px] font-medium transition-all duration-200",
                          collapsed ? "justify-center px-0" : "px-3",
                          isActive ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" : "text-white/65 hover:bg-white/[0.05] hover:text-white",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-gold" />}
                          <item.icon className={cn("size-[18px] shrink-0 transition-colors", isActive ? "text-[#e2c47c]" : "text-white/55 group-hover:text-white/80")} />
                          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                          {count > 0 && !collapsed && (
                            <span className={cn("rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular", isActive ? "bg-gold text-forest" : "bg-white/10 text-white/80")}>{count}</span>
                          )}
                          {count > 0 && collapsed && <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-gold" />}
                        </>
                      )}
                    </NavLink>
                  );
                  return (
                    <li key={item.to}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                            {count > 0 ? ` · ${count}` : ""}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
                collapsed && "justify-center",
              )}
            >
              <UserAvatar name={store.session?.name ?? "Admin"} className="size-9 bg-[#e2c47c] text-forest" />
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{store.session?.name}</p>
                    <p className="truncate text-[11.5px] text-white/50">{role === "Admin" ? "Visa Officer" : role}</p>
                  </div>
                  <ChevronsUpDown className="size-4 text-white/40" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={collapsed ? "right" : "top"} align="start" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold text-foreground">{store.session?.name}</p>
              <p className="text-xs">{store.session?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                onNavigate?.();
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
  );
}
