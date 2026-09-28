import { MessageThread } from "@/components/shared/MessageThread";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Card } from "@/components/ui/card";
import { useLookups } from "@/store/store";
import { usePortalCustomer } from "./PortalLayout";

export default function PortalMessages() {
  const { customer } = usePortalCustomer();
  const { staffName } = useLookups();
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">Chat with your consultant and documentation team.</p>
        <MessageThread customerId={customer.id} as="customer" />
      </div>
      <Card className="h-fit p-5 lg:mt-[76px]">
        <p className="text-sm font-semibold">Your team</p>
        <ul className="mt-3 space-y-3">
          {[customer.assignedTo, "STF-06"].map((id, i) => (
            <li key={id} className="flex items-center gap-3">
              <UserAvatar name={staffName(id)} className="size-9" />
              <div>
                <p className="text-sm font-medium">{staffName(id)}</p>
                <p className="text-xs text-muted-foreground">{i === 0 ? "Visa Consultant" : "Documentation Officer"}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">Typical reply time: within 2 business hours (Mon–Sat, 9:00–17:30).</p>
      </Card>
    </div>
  );
}
