import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  activitiesSeed,
  applicationsSeed,
  appointmentsSeed,
  countriesSeed,
  customersSeed,
  documentsSeed,
  followUpsSeed,
  invoicesSeed,
  leadsSeed,
  messagesSeed,
  notificationsSeed,
  paymentsSeed,
  requirementsSeed,
  staffSeed,
  visaTypesSeed,
} from "@/data/mock";
import type {
  Activity,
  AppNotification,
  AppStatus,
  Application,
  Appointment,
  Country,
  Customer,
  DocStatus,
  DocumentItem,
  FollowUp,
  Invoice,
  Lead,
  Message,
  Payment,
  Requirement,
  Role,
  Staff,
  VisaType,
} from "@/data/types";
import { dayOffset, todayISO } from "@/lib/utils";

export interface Session {
  role: Role;
  staffId?: string;
  customerId?: string;
  name: string;
  email: string;
}

export interface DataState {
  customers: Customer[];
  leads: Lead[];
  applications: Application[];
  documents: DocumentItem[];
  payments: Payment[];
  invoices: Invoice[];
  appointments: Appointment[];
  followUps: FollowUp[];
  notifications: AppNotification[];
  staff: Staff[];
  countries: Country[];
  visaTypes: VisaType[];
  requirements: Record<string, Requirement[]>;
  messages: Message[];
  activities: Activity[];
}

type CollectionKey = Exclude<keyof DataState, "requirements">;
type ItemOf<K extends CollectionKey> = DataState[K] extends (infer T)[] ? T : never;

const STORAGE_KEY = "svs-demo-state-v1";
const SESSION_KEY = "svs-demo-session-v1";

const seedState = (): DataState =>
  structuredClone({
    customers: customersSeed,
    leads: leadsSeed,
    applications: applicationsSeed,
    documents: documentsSeed,
    payments: paymentsSeed,
    invoices: invoicesSeed,
    appointments: appointmentsSeed,
    followUps: followUpsSeed,
    notifications: notificationsSeed,
    staff: staffSeed,
    countries: countriesSeed,
    visaTypes: visaTypesSeed,
    requirements: requirementsSeed,
    messages: messagesSeed,
    activities: activitiesSeed,
  });

function loadState(): DataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DataState;
  } catch {
    /* ignore */
  }
  return seedState();
}
function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    /* ignore */
  }
  return null;
}

const nowISO = () => new Date().toISOString();
const nextNum = (ids: string[], re: RegExp, fallback: number) =>
  Math.max(fallback, ...ids.map((id) => Number(id.match(re)?.[1] ?? 0))) + 1;

export interface NewApplicationInput {
  customerId: string;
  countryCode: string;
  visaTypeId: string;
  travelDate: string;
  consultantId: string;
  priority: Application["priority"];
  purpose: string;
  notes?: string;
}

export interface UploadInput {
  customerId: string;
  applicationId?: string;
  requirement?: string;
  category: DocumentItem["category"];
  name: string;
  fileName: string;
  size: number;
  fileType: DocumentItem["fileType"];
  expiry?: string;
  uploadedBy: "staff" | "customer";
}

function useStoreValue() {
  const [data, setData] = useState<DataState>(loadState);
  const [session, setSessionState] = useState<Session | null>(loadSession);
  const ref = useRef(data);
  ref.current = data;
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data]);
  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [session]);

  const actor = () => sessionRef.current?.staffId ?? (sessionRef.current?.role === "Customer" || sessionRef.current?.role === "Team Member" ? "customer" : "STF-01");

  /* generic CRUD ------------------------------------------------------- */
  const add = useCallback(<K extends CollectionKey>(key: K, item: ItemOf<K>) => {
    setData((s) => ({ ...s, [key]: [item, ...(s[key] as ItemOf<K>[])] }));
  }, []);
  const update = useCallback(<K extends CollectionKey>(key: K, id: string, patch: Partial<ItemOf<K>>) => {
    setData((s) => ({
      ...s,
      [key]: (s[key] as unknown as (ItemOf<K> & { id?: string; code?: string })[]).map((it) => ((it.id ?? it.code) === id ? { ...it, ...patch } : it)),
    }));
  }, []);
  const remove = useCallback(<K extends CollectionKey>(key: K, id: string) => {
    setData((s) => ({ ...s, [key]: (s[key] as unknown as (ItemOf<K> & { id?: string; code?: string })[]).filter((it) => (it.id ?? it.code) !== id) }));
  }, []);

  const log = useCallback((a: Omit<Activity, "id" | "time" | "by"> & { by?: string }) => {
    const entry: Activity = { id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: nowISO(), by: a.by ?? actor(), ...a };
    setData((s) => ({ ...s, activities: [entry, ...s.activities] }));
  }, []);

  const notify = useCallback((n: Omit<AppNotification, "id" | "time" | "read">) => {
    const entry: AppNotification = { id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: nowISO(), read: false, ...n };
    setData((s) => ({ ...s, notifications: [entry, ...s.notifications] }));
  }, []);

  /* ids ------------------------------------------------------------------ */
  const ids = {
    customer: () => `CUS-${nextNum(ref.current.customers.map((c) => c.id), /CUS-(\d+)/, 1000)}`,
    lead: () => `LD-${nextNum(ref.current.leads.map((c) => c.id), /LD-(\d+)/, 2026100)}`,
    application: (cc: string) =>
      `SVS-${cc}-${new Date().getFullYear()}-${String(nextNum(ref.current.applications.map((a) => a.id), /-(\d{5})$/, 200)).padStart(5, "0")}`,
    doc: () => `DOC-${nextNum(ref.current.documents.map((c) => c.id), /DOC-(\d+)/, 3000)}`,
    payment: () => `PAY-2026-${String(nextNum(ref.current.payments.map((c) => c.id), /PAY-\d+-(\d+)/, 1000)).padStart(4, "0")}`,
    invoice: () => `INV-2026-${String(nextNum(ref.current.invoices.map((c) => c.id), /INV-\d+-(\d+)/, 50)).padStart(5, "0")}`,
    appointment: () => `APT-${nextNum(ref.current.appointments.map((c) => c.id), /APT-(\d+)/, 5000)}`,
    followUp: () => `FU-${nextNum(ref.current.followUps.map((c) => c.id), /FU-(\d+)/, 7000)}`,
    staff: () => `STF-${String(nextNum(ref.current.staff.map((c) => c.id), /STF-(\d+)/, 0)).padStart(2, "0")}`,
  };

  /* domain actions ------------------------------------------------------ */
  const customerName = (id: string) => {
    const c = ref.current.customers.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Customer";
  };

  const convertLead = (leadId: string): string => {
    const lead = ref.current.leads.find((l) => l.id === leadId)!;
    if (lead.convertedCustomerId) return lead.convertedCustomerId;
    const id = ids.customer();
    const [first, ...rest] = lead.name.split(" ");
    const customer: Customer = {
      id,
      firstName: first,
      lastName: rest.join(" ") || "-",
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      dob: "1992-01-01",
      gender: "Male",
      maritalStatus: "Single",
      nationality: "Sri Lankan",
      nic: "",
      address: "",
      city: "Colombo",
      occupation: "",
      employer: "",
      monthlyIncome: 0,
      passport: { number: "", issueDate: "", expiryDate: dayOffset(365 * 5), placeOfIssue: "Colombo" },
      travel: { preferredDestination: lead.countryCode, purpose: lead.visaCategory, plannedDate: lead.travelDate, previousTravel: [] },
      status: "Active",
      assignedTo: lead.assignedTo,
      source: lead.source,
      createdAt: todayISO(),
    };
    setData((s) => ({
      ...s,
      customers: [customer, ...s.customers],
      leads: s.leads.map((l) => (l.id === leadId ? { ...l, status: "Converted", convertedCustomerId: id } : l)),
    }));
    log({ customerId: id, text: `Converted from lead ${lead.id}`, type: "create" });
    return id;
  };

  const createApplication = (input: NewApplicationInput): string => {
    const id = ids.application(input.countryCode);
    const by = actor();
    const now = nowISO();
    const app: Application = {
      id,
      ...input,
      status: "Documents Pending",
      createdAt: now,
      updatedAt: now,
      history: [
        { status: "Inquiry", date: now, by, note: "Application file opened" },
        { status: "Consultation", date: now, by, note: "Consultation completed" },
        { status: "Documents Pending", date: now, by, note: "Document checklist generated automatically" },
      ],
    };
    const vt = ref.current.visaTypes.find((v) => v.id === input.visaTypeId)!;
    const inv: Invoice = {
      id: ids.invoice(),
      customerId: input.customerId,
      applicationId: id,
      items: [
        { description: `Visa Processing Fee — ${vt.name}`, amount: vt.fee },
        ...(vt.governmentFee ? [{ description: "Government / Embassy Fee", amount: vt.governmentFee }] : []),
        { description: "Consultation Fee", amount: 7500 },
      ],
      discount: 0,
      date: todayISO(),
      dueDate: dayOffset(14),
      notes: "Thank you for choosing Serendib Visa Services.",
    };
    setData((s) => ({
      ...s,
      applications: [app, ...s.applications],
      invoices: [inv, ...s.invoices],
      customers: s.customers.map((c) => (c.id === input.customerId && c.status === "Prospect" ? { ...c, status: "Active" } : c)),
    }));
    log({ customerId: input.customerId, applicationId: id, text: `Application ${id} created`, type: "create" });
    log({ customerId: input.customerId, applicationId: id, text: `Invoice ${inv.id} generated`, type: "payment" });
    return id;
  };

  const changeStatus = (appId: string, status: AppStatus, note?: string, decision?: Application["decision"]) => {
    const app = ref.current.applications.find((a) => a.id === appId);
    if (!app) return;
    const by = actor();
    const now = nowISO();
    setData((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === appId
          ? { ...a, status, decision: decision ?? a.decision, updatedAt: now, history: [...a.history, { status, date: now, by, note: note || undefined }] }
          : a,
      ),
    }));
    log({ customerId: app.customerId, applicationId: appId, text: `Status changed to ${status}${note ? ` — ${note}` : ""}`, type: "status" });
    const country = ref.current.countries.find((c) => c.code === app.countryCode);
    notify({ title: `${country?.code ?? ""} application ${appId} changed status`, description: `Moved to ${status}.`, type: "status", link: `/app/applications/${appId}` });
    notify({
      title: `Your application is now ${status}`,
      description: `${appId} was updated by our team.`,
      type: "status",
      audience: "customer",
      customerId: app.customerId,
      link: `/portal/applications/${appId}`,
    });
  };

  const uploadDocument = (input: UploadInput): DocumentItem => {
    const existing = input.applicationId && input.requirement
      ? ref.current.documents.find((d) => d.applicationId === input.applicationId && d.requirement === input.requirement)
      : undefined;
    const status: DocStatus = "Uploaded";
    const doc: DocumentItem = {
      id: existing?.id ?? ids.doc(),
      name: input.name,
      fileName: input.fileName,
      category: input.category,
      requirement: input.requirement,
      customerId: input.customerId,
      applicationId: input.applicationId,
      uploadedAt: nowISO(),
      status,
      expiry: input.expiry,
      size: input.size,
      fileType: input.fileType,
      uploadedBy: input.uploadedBy,
    };
    setData((s) => ({
      ...s,
      documents: existing ? s.documents.map((d) => (d.id === existing.id ? doc : d)) : [doc, ...s.documents],
    }));
    const who = input.uploadedBy === "customer" ? "customer" : actor();
    log({ customerId: input.customerId, applicationId: input.applicationId, text: `${input.name} uploaded${input.uploadedBy === "customer" ? " by customer" : ""}`, type: "document", by: who });
    if (input.uploadedBy === "customer") {
      notify({
        title: `${customerName(input.customerId)} uploaded ${input.name}`,
        description: input.applicationId ? `New document on ${input.applicationId} awaiting review.` : "New document awaiting review.",
        type: "document",
        link: input.applicationId ? `/app/applications/${input.applicationId}` : "/app/documents",
      });
    }
    return doc;
  };

  const setDocumentStatus = (docId: string, status: DocStatus, note?: string) => {
    const doc = ref.current.documents.find((d) => d.id === docId);
    if (!doc) return;
    const by = actor();
    setData((s) => ({
      ...s,
      documents: s.documents.map((d) => (d.id === docId ? { ...d, status, verifiedBy: status === "Verified" ? by : d.verifiedBy, note: note ?? d.note } : d)),
    }));
    log({ customerId: doc.customerId, applicationId: doc.applicationId, text: `${doc.name} marked as ${status}`, type: "document" });
    if (status === "Re-upload Required" || status === "Rejected") {
      notify({
        title: `Action needed: ${doc.name}`,
        description: note || "Please upload a new copy of this document.",
        type: "document",
        audience: "customer",
        customerId: doc.customerId,
        link: "/portal/documents",
      });
    }
  };

  const addPayment = (p: Omit<Payment, "id">): string => {
    const id = ids.payment();
    setData((s) => ({ ...s, payments: [{ ...p, id }, ...s.payments] }));
    log({ customerId: p.customerId, applicationId: p.applicationId, text: `Payment of LKR ${p.amount.toLocaleString()} ${p.status === "Paid" ? "received" : "recorded"} via ${p.method}`, type: "payment" });
    return id;
  };

  const addAppointment = (a: Omit<Appointment, "id">): string => {
    const id = ids.appointment();
    setData((s) => ({ ...s, appointments: [{ ...a, id }, ...s.appointments] }));
    log({ customerId: a.customerId, applicationId: a.applicationId, text: `${a.type} appointment scheduled for ${a.date} at ${a.time}`, type: "appointment" });
    notify({
      title: `New appointment: ${a.type}`,
      description: `${a.date} at ${a.time} — ${a.location}`,
      type: "appointment",
      audience: "customer",
      customerId: a.customerId,
      link: "/portal/appointments",
    });
    return id;
  };

  const sendMessage = (customerId: string, text: string, from: "staff" | "customer") => {
    const m: Message = { id: `MSG-${Date.now()}`, customerId, from, staffId: from === "staff" ? actor() : undefined, text, time: nowISO() };
    setData((s) => ({ ...s, messages: [...s.messages, m] }));
    if (from === "customer") notify({ title: `New message from ${customerName(customerId)}`, description: text.slice(0, 80), type: "system", link: `/app/customers/${customerId}` });
  };

  const setRequirements = (visaTypeId: string, reqs: Requirement[]) => setData((s) => ({ ...s, requirements: { ...s.requirements, [visaTypeId]: reqs } }));

  const markAllRead = (audience: "staff" | "customer", customerId?: string) =>
    setData((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        (audience === "customer" ? n.audience === "customer" && n.customerId === customerId : n.audience !== "customer") ? { ...n, read: true } : n,
      ),
    }));

  const resetDemo = () => setData(seedState());

  const signIn = (s: Session) => setSessionState(s);
  const signOut = () => setSessionState(null);

  return {
    ...data,
    session,
    signIn,
    signOut,
    add,
    update,
    remove,
    log,
    notify,
    ids,
    convertLead,
    createApplication,
    changeStatus,
    uploadDocument,
    setDocumentStatus,
    addPayment,
    addAppointment,
    sendMessage,
    setRequirements,
    markAllRead,
    resetDemo,
  };
}

export type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Convenience lookups */
export function useLookups() {
  const s = useStore();
  return useMemo(() => {
    const customer = (id?: string) => s.customers.find((c) => c.id === id);
    const customerName = (id?: string) => {
      const c = customer(id);
      return c ? `${c.firstName} ${c.lastName}` : "—";
    };
    const staff = (id?: string) => s.staff.find((x) => x.id === id);
    const staffName = (id?: string) => (id === "customer" ? "Customer" : (staff(id)?.name ?? "—"));
    const country = (code?: string) => s.countries.find((c) => c.code === code);
    const visaType = (id?: string) => s.visaTypes.find((v) => v.id === id);
    const visaLabel = (id?: string) => {
      const v = visaType(id);
      return v ? `${v.category} Visa` : "—";
    };
    const fullVisaLabel = (id?: string) => {
      const v = visaType(id);
      if (!v) return "—";
      return `${v.countryCode === "AE" ? "Dubai" : v.countryCode} ${v.category} Visa`;
    };
    const application = (id?: string) => s.applications.find((a) => a.id === id);
    return { customer, customerName, staff, staffName, country, visaType, visaLabel, fullVisaLabel, application };
  }, [s.customers, s.staff, s.countries, s.visaTypes, s.applications]);
}

export const NO_OP = () => {};
