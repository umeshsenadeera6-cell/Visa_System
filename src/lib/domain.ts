import {
  APP_STAGES,
  type AppStatus,
  type Application,
  type DocumentItem,
  type Invoice,
  type InvoiceStatus,
  type Payment,
  type Requirement,
} from "@/data/types";
import { daysUntil, todayISO } from "./utils";

/* Tone system for badges ------------------------------------------------ */
export type Tone = "emerald" | "green" | "gold" | "amber" | "blue" | "violet" | "slate" | "red" | "orange" | "teal";

export const toneClasses: Record<Tone, string> = {
  emerald: "bg-[#e7f4ee] text-[#0a6446] border-[#cfe8dc]",
  green: "bg-[#e9f7ef] text-[#177245] border-[#cdebd9]",
  teal: "bg-[#e6f5f5] text-[#11706f] border-[#c9e7e6]",
  gold: "bg-[#faf3e1] text-[#8a6412] border-[#f0e2bb]",
  amber: "bg-[#fff5e0] text-[#98600a] border-[#f7e1b0]",
  blue: "bg-[#ebf2fe] text-[#2856b8] border-[#d3e1fb]",
  violet: "bg-[#f3effd] text-[#6841b6] border-[#e2d8f8]",
  slate: "bg-[#f0f2f1] text-[#4d5a55] border-[#e1e6e3]",
  red: "bg-[#fdeeec] text-[#b4321f] border-[#f7d4ce]",
  orange: "bg-[#fff0e6] text-[#b24c0c] border-[#fbd9c2]",
};

export const dotClasses: Record<Tone, string> = {
  emerald: "bg-[#0a7d57]",
  green: "bg-[#1f9d5b]",
  teal: "bg-[#14908e]",
  gold: "bg-[#c2881c]",
  amber: "bg-[#d98b0b]",
  blue: "bg-[#3a6fd8]",
  violet: "bg-[#8a5cc9]",
  slate: "bg-[#8a9791]",
  red: "bg-[#cf4f3a]",
  orange: "bg-[#e2711d]",
};

const statusTones: Record<string, Tone> = {
  // lead
  New: "blue",
  Contacted: "teal",
  Consultation: "violet",
  Interested: "gold",
  "Documents Requested": "amber",
  Converted: "emerald",
  Lost: "slate",
  // application
  Inquiry: "slate",
  "Documents Pending": "amber",
  "Documents Uploaded": "gold",
  "Documents Verified": "teal",
  "Application Preparing": "blue",
  "Ready for Submission": "blue",
  Submitted: "violet",
  Biometrics: "violet",
  Interview: "violet",
  "Under Processing": "orange",
  "Decision Received": "teal",
  "Passport Returned": "emerald",
  Completed: "emerald",
  Approved: "emerald",
  Rejected: "red",
  // docs
  Pending: "amber",
  Uploaded: "blue",
  "Under Review": "violet",
  Verified: "emerald",
  "Re-upload Required": "orange",
  Missing: "slate",
  // payments / invoices
  Paid: "emerald",
  "Partially Paid": "gold",
  Overdue: "red",
  Refunded: "slate",
  // appointments
  Scheduled: "blue",
  Confirmed: "emerald",
  Cancelled: "slate",
  // generic
  Active: "emerald",
  Inactive: "slate",
  Prospect: "blue",
  // priority
  Low: "slate",
  Medium: "blue",
  High: "amber",
  Urgent: "red",
  // requirement levels
  Required: "emerald",
  Optional: "slate",
  Conditional: "gold",
};

export const toneFor = (status: string): Tone => statusTones[status] ?? "slate";

/* Application progress ------------------------------------------------ */
const PROGRESS: Record<AppStatus, number> = {
  Inquiry: 5,
  Consultation: 10,
  "Documents Pending": 18,
  "Documents Uploaded": 28,
  "Documents Verified": 38,
  "Application Preparing": 48,
  "Ready for Submission": 55,
  Submitted: 62,
  Biometrics: 68,
  Interview: 74,
  "Under Processing": 80,
  "Decision Received": 90,
  "Passport Returned": 96,
  Completed: 100,
};
export const appProgress = (s: AppStatus) => PROGRESS[s];
export const stageIndex = (s: AppStatus) => APP_STAGES.indexOf(s);

export const ACTIVE_STAGES = APP_STAGES.filter((s) => !["Completed", "Passport Returned", "Decision Received"].includes(s));

export const MILESTONES: { label: string; start: number; end: number; public: string }[] = [
  { label: "Application Created", start: 0, end: 0, public: "Application received" },
  { label: "Consultation", start: 1, end: 1, public: "Consultation completed" },
  { label: "Documents Uploaded", start: 2, end: 3, public: "Documents collected" },
  { label: "Documents Verified", start: 4, end: 4, public: "Documents verified" },
  { label: "Application Prepared", start: 5, end: 6, public: "Application prepared" },
  { label: "Submitted", start: 7, end: 7, public: "Submitted to embassy / VFS" },
  { label: "Biometrics", start: 8, end: 9, public: "Biometrics / interview" },
  { label: "Under Processing", start: 10, end: 10, public: "Under processing" },
  { label: "Decision", start: 11, end: 11, public: "Decision received" },
  { label: "Passport Collection", start: 12, end: 13, public: "Passport returned" },
];

export type MilestoneState = "done" | "current" | "upcoming";
export function milestoneStates(app: Application) {
  const s = stageIndex(app.status);
  return MILESTONES.map((m) => {
    let state: MilestoneState = "upcoming";
    if (s > m.end || s === 13) state = "done";
    else if (s >= m.start) state = "current";
    const entry = app.history.find((h) => {
      const hi = stageIndex(h.status);
      return hi >= m.start && hi <= m.end;
    });
    return { ...m, state, date: entry?.date, by: entry?.by, note: entry?.note };
  });
}

/* Document checklist -------------------------------------------------- */
export type ChecklistState = "complete" | "review" | "missing" | "action";
export interface ChecklistItem {
  requirement: Requirement;
  doc?: DocumentItem;
  state: ChecklistState;
}

export function buildChecklist(app: Application, reqs: Requirement[], docs: DocumentItem[]) {
  const appDocs = docs.filter((d) => d.applicationId === app.id);
  const items: ChecklistItem[] = reqs.map((r) => {
    const matching = appDocs.filter((d) => d.requirement === r.name);
    const doc = matching.sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""))[0];
    let state: ChecklistState = "missing";
    if (doc) {
      if (doc.status === "Verified") state = "complete";
      else if (doc.status === "Uploaded" || doc.status === "Under Review") state = "review";
      else if (doc.status === "Rejected" || doc.status === "Re-upload Required") state = "action";
      else state = "missing";
    }
    return { requirement: r, doc, state };
  });
  const completed = items.filter((i) => i.state === "complete").length;
  return { items, completed, total: items.length, percent: items.length ? Math.round((completed / items.length) * 100) : 0 };
}

/* Invoices ------------------------------------------------------------- */
export function invoiceTotals(inv: Invoice, payments: Payment[]) {
  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
  const total = Math.max(subtotal - inv.discount, 0);
  const paid = payments.filter((p) => p.invoiceId === inv.id && p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(total - paid, 0);
  let status: InvoiceStatus = "Pending";
  if (paid >= total && total > 0) status = "Paid";
  else if (inv.dueDate < todayISO()) status = "Overdue";
  else if (paid > 0) status = "Partially Paid";
  return { subtotal, total, paid, balance, status };
}

export const passportState = (expiry: string) => {
  const days = daysUntil(expiry);
  if (days < 0) return { days, tone: "red" as Tone, label: `Passport expired ${Math.abs(days)} days ago` };
  if (days < 180) return { days, tone: "amber" as Tone, label: `Passport expires in ${days} days` };
  return { days, tone: "emerald" as Tone, label: `Passport valid for ${days} days` };
};

export const DOC_CATEGORIES = [
  "Passport",
  "NIC",
  "Bank Statement",
  "Employment Letter",
  "Salary Slip",
  "Photo",
  "Invitation Letter",
  "Hotel Booking",
  "Flight Reservation",
  "Insurance",
  "Certificates",
  "Other",
] as const;

export const DOC_STATUSES = ["Pending", "Uploaded", "Under Review", "Verified", "Rejected", "Re-upload Required"] as const;
export const LEAD_STATUSES = ["New", "Contacted", "Consultation", "Interested", "Documents Requested", "Converted", "Lost"] as const;
export const LEAD_SOURCES = ["Website", "Facebook", "Instagram", "WhatsApp", "Walk-in", "Referral", "Google Ads", "Phone Call"] as const;
export const VISA_CATEGORIES = ["Tourist", "Business", "Student", "Work", "Family Visit", "Dependent", "Transit", "Medical"] as const;
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Card", "Online"] as const;
export const APPOINTMENT_TYPES = ["Consultation", "Embassy", "VFS", "Biometrics", "Interview", "Passport Collection"] as const;
