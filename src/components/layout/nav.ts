import {
  ListChecks,
  Stamp,
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

export const NAV: NavGroup[] = [
  {
    label: "Visa Management",
    items: [
      { label: "Visa Types", to: "/app/visa-types", icon: Stamp, roles: ALL },
      { label: "Requirements", to: "/app/requirements", icon: ListChecks, roles: ALL },
    ],
  },
];

export const DEMO_ROLES: { role: Role; staffId?: string; customerId?: string; name: string; email: string; description: string }[] = [
  { role: "Admin", staffId: "STF-01", name: "Ruwan Jayasinghe", email: "ruwan@serendibvisa.lk", description: "Manage visa types & document requirements" },
  { role: "Customer", customerId: "CUS-1001", name: "John Perera", email: "john.perera@gmail.com", description: "Browse visa guide & download checklists" },
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
