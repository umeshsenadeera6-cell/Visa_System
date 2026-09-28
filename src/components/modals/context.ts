import { createContext, useContext } from "react";
import type { Country, Customer, DocCategory, FollowUp, Lead, Staff, VisaType, Appointment } from "@/data/types";

export interface ModalRegistry {
  lead: { lead?: Lead };
  customer: { customer?: Customer };
  application: { customerId?: string; countryCode?: string };
  upload: { customerId?: string; applicationId?: string; requirement?: string; category?: DocCategory; asCustomer?: boolean };
  payment: { customerId?: string; applicationId?: string; invoiceId?: string };
  appointment: { customerId?: string; applicationId?: string; date?: string; appointment?: Appointment };
  followUp: { customerId?: string; applicationId?: string; followUp?: FollowUp };
  visaType: { visaType?: VisaType; countryCode?: string };
  country: { country?: Country };
  staff: { staff?: Staff };
  status: { applicationId: string };
  invoice: { invoiceId: string; customerView?: boolean };
  document: { docId: string; customerView?: boolean };
}
export type ModalName = keyof ModalRegistry;

export interface ModalContextValue {
  open: <K extends ModalName>(name: K, props?: ModalRegistry[K]) => void;
  close: () => void;
}

export const ModalContext = createContext<ModalContextValue>({ open: () => {}, close: () => {} });
export const useModals = () => useContext(ModalContext);

export interface ModalProps {
  open: boolean;
  onClose: () => void;
}

/** In-memory object URLs for files uploaded during the demo (for previews). */
export const uploadedPreviews = new Map<string, string>();
