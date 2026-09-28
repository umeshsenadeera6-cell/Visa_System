import {
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  CreditCard,
  FileStack,
  Globe2,
  LayoutDashboard,
  ListChecks,
  Plane,
  Receipt,
  Settings,
  Stamp,
  UserPlus,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/data/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
  badge?: "leads" | "followUps" | "notifications" | "documents";
}
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

const ALL: Role[] = ["Admin", "Manager", "Visa Consultant", "Documentation Officer", "Finance Officer"];
const OPS: Role[] = ["Admin", "Manager", "Visa Consultant"];

export const NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", to: "/app", icon: LayoutDashboard, roles: ALL },
      { label: "Leads & Inquiries", to: "/app/leads", icon: UserPlus, roles: OPS, badge: "leads" },
      { label: "Customers", to: "/app/customers", icon: Users, roles: ALL },
      { label: "Visa Applications", to: "/app/applications", icon: Plane, roles: ["Admin", "Manager", "Visa Consultant", "Documentation Officer"] },
      { label: "Documents", to: "/app/documents", icon: FileStack, roles: ["Admin", "Manager", "Visa Consultant", "Documentation Officer"], badge: "documents" },
      { label: "Appointments", to: "/app/appointments", icon: CalendarDays, roles: ["Admin", "Manager", "Visa Consultant", "Documentation Officer"] },
      { label: "Follow-ups", to: "/app/follow-ups", icon: CalendarClock, roles: OPS, badge: "followUps" },
      { label: "Payments", to: "/app/payments", icon: CreditCard, roles: ["Admin", "Manager", "Finance Officer"] },
      { label: "Invoices", to: "/app/invoices", icon: Receipt, roles: ["Admin", "Manager", "Finance Officer"] },
      { label: "Reports", to: "/app/reports", icon: BarChart3, roles: ["Admin", "Manager", "Finance Officer"] },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Countries", to: "/app/countries", icon: Globe2, roles: ["Admin", "Manager", "Visa Consultant"] },
      { label: "Visa Types", to: "/app/visa-types", icon: Stamp, roles: ["Admin", "Manager", "Visa Consultant"] },
      { label: "Requirements", to: "/app/requirements", icon: ListChecks, roles: ["Admin", "Manager", "Visa Consultant", "Documentation Officer"] },
      { label: "Staff", to: "/app/staff", icon: UsersRound, roles: ["Admin", "Manager"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", to: "/app/notifications", icon: Bell, roles: ALL, badge: "notifications" },
      { label: "Settings", to: "/app/settings", icon: Settings, roles: ALL },
    ],
  },
];


export const DEMO_ROLES: { role: Role; staffId?: string; customerId?: string; name: string; email: string; description: string }[] = [
  { role: "Admin", staffId: "STF-01", name: "Ruwan Jayasinghe", email: "ruwan@serendibvisa.lk", description: "Full access to every module" },
  { role: "Manager", staffId: "STF-02", name: "Nadeesha Perera", email: "nadeesha@serendibvisa.lk", description: "Operations, finance & team" },
  { role: "Visa Consultant", staffId: "STF-03", name: "Kasun Wickramasinghe", email: "kasun@serendibvisa.lk", description: "Leads, customers & applications" },
  { role: "Documentation Officer", staffId: "STF-06", name: "Tharushi Silva", email: "tharushi@serendibvisa.lk", description: "Documents & verification" },
  { role: "Finance Officer", staffId: "STF-08", name: "Malith Gunawardena", email: "malith@serendibvisa.lk", description: "Payments, invoices & reports" },
  { role: "Customer", customerId: "CUS-1001", name: "John Perera", email: "john.perera@gmail.com", description: "Customer self-service portal" },
];

export const canAccess = (role: Role, path: string) => {
  if (role === "Admin") return true;
  const items = NAV.flatMap((g) => g.items);
  const match = items
    .filter((i) => (i.to === "/app" ? path === "/app" : path.startsWith(i.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  if (!match) return true;
  return match.roles.includes(role);
};
