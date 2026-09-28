import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ModalContext, type ModalName, type ModalRegistry } from "./context";
import { LeadModal } from "./LeadModal";
import { CustomerModal } from "./CustomerModal";
import { ApplicationModal } from "./ApplicationModal";
import { UploadModal } from "./UploadModal";
import { PaymentModal } from "./PaymentModal";
import { AppointmentModal } from "./AppointmentModal";
import { FollowUpModal } from "./FollowUpModal";
import { CountryModal, StaffModal, VisaTypeModal } from "./AdminModals";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { InvoicePreview } from "./InvoicePreview";
import { DocumentPreview } from "./DocumentPreview";

const REGISTRY = {
  lead: LeadModal,
  customer: CustomerModal,
  application: ApplicationModal,
  upload: UploadModal,
  payment: PaymentModal,
  appointment: AppointmentModal,
  followUp: FollowUpModal,
  visaType: VisaTypeModal,
  country: CountryModal,
  staff: StaffModal,
  status: ChangeStatusModal,
  invoice: InvoicePreview,
  document: DocumentPreview,
} as const;

interface ActiveModal {
  name: ModalName;
  props: ModalRegistry[ModalName];
  open: boolean;
  key: number;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveModal | null>(null);

  const open = useCallback(<K extends ModalName>(name: K, props?: ModalRegistry[K]) => {
    // defer so dropdown menus can close and release focus first
    setTimeout(() => setActive({ name, props: (props ?? {}) as ModalRegistry[K], open: true, key: Date.now() }), 0);
  }, []);
  const close = useCallback(() => {
    setActive((a) => (a ? { ...a, open: false } : a));
    setTimeout(() => setActive((a) => (a && !a.open ? null : a)), 220);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = active ? (REGISTRY[active.name] as any) : null;

  return (
    <ModalContext.Provider value={value}>
      {children}
      {active && Comp && <Comp key={active.key} open={active.open} onClose={close} {...active.props} />}
    </ModalContext.Provider>
  );
}
