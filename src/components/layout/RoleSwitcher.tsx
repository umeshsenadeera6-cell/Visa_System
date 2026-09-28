import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Repeat } from "lucide-react";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/store";
import { DEMO_ROLES } from "./nav";

export function useSwitchRole() {
  const store = useStore();
  const navigate = useNavigate();
  return (role: (typeof DEMO_ROLES)[number]["role"], customerId?: string) => {
    const r = DEMO_ROLES.find((x) => x.role === role)!;
    if (role === "Customer") {
      const c = store.customers.find((x) => x.id === (customerId ?? r.customerId)) ?? store.customers[0];
      store.signIn({ role, customerId: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email });
      navigate("/portal");
      toast.success(`Viewing customer portal as ${c.firstName} ${c.lastName}`);
    } else {
      store.signIn({ role, staffId: r.staffId, name: r.name, email: r.email });
      navigate("/app");
      toast.success(`Switched to ${role}`, { description: r.description });
    }
  };
}

export function RoleSwitcherSub() {
  const store = useStore();
  const switchRole = useSwitchRole();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Repeat /> Switch demo role
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-64">
        <DropdownMenuLabel>Demo roles</DropdownMenuLabel>
        {DEMO_ROLES.map((r) => (
          <DropdownMenuItem key={r.role} onClick={() => switchRole(r.role)} className="items-start">
            <div className="flex-1">
              <p className="font-medium">{r.role}</p>
              <p className="text-xs text-muted-foreground">{r.description}</p>
            </div>
            {store.session?.role === r.role && <Check className="mt-0.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
