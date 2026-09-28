export type Role = "Admin" | "Manager" | "Visa Consultant" | "Documentation Officer" | "Finance Officer" | "Customer";
export type StaffRole = "Admin" | "Manager" | "Visa Consultant" | "Documentation Officer" | "Finance Officer" | "Receptionist";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  joinedAt: string;
  branch: string;
}

export interface Country {
  code: string; // UK, AU ...
  name: string;
  flag: string;
  region: string;
  capital: string;
  currency: string;
  description: string;
  historicalApplications: number;
  successRate: number;
  status: "Active" | "Inactive";
}

export type VisaCategory = "Tourist" | "Business" | "Student" | "Work" | "Family Visit" | "Dependent" | "Transit" | "Medical";

export interface VisaType {
  id: string;
  countryCode: string;
  category: VisaCategory;
  name: string;
  processingTime: string;
  validity: string;
  entry: "Single" | "Double" | "Multiple";
  fee: number; // service fee LKR
  governmentFee: number;
  status: "Active" | "Inactive";
}

export type RequirementLevel = "Required" | "Optional" | "Conditional";
export type DocCategory =
  | "Passport"
  | "NIC"
  | "Bank Statement"
  | "Employment Letter"
  | "Salary Slip"
  | "Photo"
  | "Invitation Letter"
  | "Hotel Booking"
  | "Flight Reservation"
  | "Insurance"
  | "Certificates"
  | "Other";

export interface Requirement {
  id: string;
  name: string;
  category: DocCategory;
  level: RequirementLevel;
  note?: string;
}

export type LeadStatus = "New" | "Contacted" | "Consultation" | "Interested" | "Documents Requested" | "Converted" | "Lost";
export type LeadSource = "Website" | "Facebook" | "Instagram" | "WhatsApp" | "Walk-in" | "Referral" | "Google Ads" | "Phone Call";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  countryCode: string;
  visaCategory: VisaCategory;
  travelDate: string;
  source: LeadSource;
  assignedTo: string;
  priority: Priority;
  status: LeadStatus;
  followUpDate: string;
  notes: string;
  createdAt: string;
  convertedCustomerId?: string;
}

export type CustomerStatus = "Active" | "Prospect" | "Completed" | "Inactive";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  dob: string;
  gender: "Male" | "Female";
  maritalStatus: "Single" | "Married";
  nationality: string;
  nic: string;
  address: string;
  city: string;
  occupation: string;
  employer: string;
  monthlyIncome: number;
  passport: { number: string; issueDate: string; expiryDate: string; placeOfIssue: string };
  travel: { preferredDestination: string; purpose: string; plannedDate: string; previousTravel: string[] };
  status: CustomerStatus;
  assignedTo: string;
  source: LeadSource;
  createdAt: string;
}

export const APP_STAGES = [
  "Inquiry",
  "Consultation",
  "Documents Pending",
  "Documents Uploaded",
  "Documents Verified",
  "Application Preparing",
  "Ready for Submission",
  "Submitted",
  "Biometrics",
  "Interview",
  "Under Processing",
  "Decision Received",
  "Passport Returned",
  "Completed",
] as const;
export type AppStatus = (typeof APP_STAGES)[number];

export interface AppHistory {
  status: AppStatus;
  date: string; // ISO datetime
  by: string; // staff id or "customer"
  note?: string;
}

export interface Application {
  id: string;
  customerId: string;
  countryCode: string;
  visaTypeId: string;
  travelDate: string;
  consultantId: string;
  status: AppStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  history: AppHistory[];
  decision?: "Approved" | "Rejected";
  purpose: string;
  notes?: string;
}

export type DocStatus = "Pending" | "Uploaded" | "Under Review" | "Verified" | "Rejected" | "Re-upload Required";

export interface DocumentItem {
  id: string;
  name: string;
  fileName: string;
  category: DocCategory;
  requirement?: string;
  customerId: string;
  applicationId?: string;
  uploadedAt?: string;
  status: DocStatus;
  expiry?: string;
  verifiedBy?: string;
  size: number;
  fileType: "pdf" | "image";
  uploadedBy: "staff" | "customer";
  note?: string;
}

export type PaymentMethod = "Cash" | "Bank Transfer" | "Card" | "Online";
export type PaymentStatus = "Paid" | "Pending" | "Overdue" | "Refunded";

export interface Payment {
  id: string;
  customerId: string;
  applicationId?: string;
  invoiceId?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
  receivedBy?: string;
  reference?: string;
  description: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  applicationId?: string;
  items: InvoiceItem[];
  discount: number;
  date: string;
  dueDate: string;
  notes?: string;
}

export type InvoiceStatus = "Paid" | "Partially Paid" | "Pending" | "Overdue";

export type AppointmentType = "Consultation" | "Embassy" | "VFS" | "Biometrics" | "Interview" | "Passport Collection";
export type AppointmentStatus = "Scheduled" | "Confirmed" | "Completed" | "Cancelled";

export interface Appointment {
  id: string;
  customerId: string;
  applicationId?: string;
  type: AppointmentType;
  date: string;
  time: string;
  duration: number;
  staffId: string;
  status: AppointmentStatus;
  location: string;
  notes?: string;
}

export interface FollowUp {
  id: string;
  customerId: string;
  applicationId?: string;
  task: string;
  dueDate: string;
  assignedTo: string;
  priority: Priority;
  status: "Pending" | "Completed";
  channel: "Call" | "WhatsApp" | "Email" | "Meeting";
}

export interface Message {
  id: string;
  customerId: string;
  from: "staff" | "customer";
  staffId?: string;
  text: string;
  time: string;
}

export type NotificationType = "document" | "payment" | "status" | "appointment" | "lead" | "system";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: NotificationType;
  link?: string;
  audience?: "staff" | "customer";
  customerId?: string;
}

export interface Activity {
  id: string;
  customerId?: string;
  applicationId?: string;
  text: string;
  by: string;
  time: string;
  type: "create" | "update" | "document" | "payment" | "status" | "appointment" | "message" | "note";
}
