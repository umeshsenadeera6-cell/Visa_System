import { dayOffset } from "@/lib/utils";
import {
  APP_STAGES,
  type Activity,
  type AppHistory,
  type AppNotification,
  type AppStatus,
  type Application,
  type Appointment,
  type Country,
  type Customer,
  type DocCategory,
  type DocumentItem,
  type FollowUp,
  type Invoice,
  type Lead,
  type Message,
  type Payment,
  type Requirement,
  type RequirementLevel,
  type Staff,
  type VisaCategory,
  type VisaType,
} from "./types";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** ISO datetime n days from now at a given hour */
export const dt = (days: number, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const d = dayOffset;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260925);

/* ------------------------------------------------------------------ */
/* Staff                                                              */
/* ------------------------------------------------------------------ */

export const staffSeed: Staff[] = [
  { id: "STF-01", name: "Ruwan Jayasinghe", role: "Admin", email: "ruwan@serendibvisa.lk", phone: "+94 77 210 4455", status: "Active", joinedAt: "2019-02-11", branch: "Colombo 03" },
  { id: "STF-02", name: "Nadeesha Perera", role: "Manager", email: "nadeesha@serendibvisa.lk", phone: "+94 77 318 9021", status: "Active", joinedAt: "2020-06-01", branch: "Colombo 03" },
  { id: "STF-03", name: "Kasun Wickramasinghe", role: "Visa Consultant", email: "kasun@serendibvisa.lk", phone: "+94 71 552 0183", status: "Active", joinedAt: "2021-01-18", branch: "Colombo 03" },
  { id: "STF-04", name: "Amaya Fernando", role: "Visa Consultant", email: "amaya@serendibvisa.lk", phone: "+94 76 440 7712", status: "Active", joinedAt: "2021-09-06", branch: "Kandy" },
  { id: "STF-05", name: "Shehan Mendis", role: "Visa Consultant", email: "shehan@serendibvisa.lk", phone: "+94 70 118 3390", status: "Active", joinedAt: "2022-03-14", branch: "Colombo 03" },
  { id: "STF-06", name: "Tharushi Silva", role: "Documentation Officer", email: "tharushi@serendibvisa.lk", phone: "+94 77 902 6654", status: "Active", joinedAt: "2022-07-25", branch: "Colombo 03" },
  { id: "STF-07", name: "Pradeep Kumara", role: "Documentation Officer", email: "pradeep@serendibvisa.lk", phone: "+94 71 334 8876", status: "Active", joinedAt: "2023-02-02", branch: "Kandy" },
  { id: "STF-08", name: "Malith Gunawardena", role: "Finance Officer", email: "malith@serendibvisa.lk", phone: "+94 77 661 2045", status: "Active", joinedAt: "2020-11-09", branch: "Colombo 03" },
  { id: "STF-09", name: "Dilini Rathnayake", role: "Receptionist", email: "dilini@serendibvisa.lk", phone: "+94 76 209 5518", status: "Active", joinedAt: "2024-01-15", branch: "Colombo 03" },
  { id: "STF-10", name: "Chanaka Wijesuriya", role: "Visa Consultant", email: "chanaka@serendibvisa.lk", phone: "+94 70 845 1127", status: "Inactive", joinedAt: "2021-05-30", branch: "Galle" },
];

export const CONSULTANT_IDS = ["STF-03", "STF-04", "STF-05"];

/* ------------------------------------------------------------------ */
/* Countries & visa types                                             */
/* ------------------------------------------------------------------ */

export const countriesSeed: Country[] = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", region: "Europe", capital: "London", currency: "GBP", description: "Visitor, study and work routes processed via VFS Global Colombo.", historicalApplications: 120, successRate: 91, status: "Active" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Oceania", capital: "Canberra", currency: "AUD", description: "Online ImmiAccount lodgement with biometrics at the Colombo AVAC.", historicalApplications: 95, successRate: 88, status: "Active" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "North America", capital: "Ottawa", currency: "CAD", description: "IRCC online submissions with VAC biometrics appointments.", historicalApplications: 74, successRate: 82, status: "Active" },
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia", capital: "Tokyo", currency: "JPY", description: "Short-term stay visas submitted through the Embassy of Japan.", historicalApplications: 52, successRate: 94, status: "Active" },
  { code: "US", name: "United States", flag: "🇺🇸", region: "North America", capital: "Washington, D.C.", currency: "USD", description: "DS-160 preparation, fee payment and interview scheduling support.", historicalApplications: 61, successRate: 76, status: "Active" },
  { code: "AE", name: "Dubai (UAE)", flag: "🇦🇪", region: "Middle East", capital: "Abu Dhabi", currency: "AED", description: "Fast-track tourist and business e-visas for the Emirates.", historicalApplications: 88, successRate: 97, status: "Active" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Asia", capital: "Singapore", currency: "SGD", description: "Entry visas lodged through authorised local agents.", historicalApplications: 43, successRate: 95, status: "Active" },
];

const visaCatalog: Record<string, { cat: VisaCategory; name: string; time: string; validity: string; entry: VisaType["entry"]; fee: number; gov: number }[]> = {
  UK: [
    { cat: "Tourist", name: "Standard Visitor Visa", time: "15 working days", validity: "6 months", entry: "Multiple", fee: 45000, gov: 48500 },
    { cat: "Business", name: "Business Visitor Visa", time: "15 working days", validity: "6 months", entry: "Multiple", fee: 55000, gov: 48500 },
    { cat: "Student", name: "Student Visa (Tier 4)", time: "3 weeks", validity: "Course length", entry: "Multiple", fee: 95000, gov: 197000 },
    { cat: "Work", name: "Skilled Worker Visa", time: "3 weeks", validity: "Up to 5 years", entry: "Multiple", fee: 150000, gov: 265000 },
    { cat: "Family Visit", name: "Family Visitor Visa", time: "15 working days", validity: "6 months", entry: "Multiple", fee: 45000, gov: 48500 },
    { cat: "Dependent", name: "Dependant Visa", time: "3 weeks", validity: "Linked to sponsor", entry: "Multiple", fee: 85000, gov: 197000 },
    { cat: "Transit", name: "Direct Airside Transit", time: "10 working days", validity: "24 hours", entry: "Single", fee: 20000, gov: 13500 },
    { cat: "Medical", name: "Visitor (Private Medical)", time: "15 working days", validity: "11 months", entry: "Multiple", fee: 60000, gov: 48500 },
  ],
  AU: [
    { cat: "Tourist", name: "Visitor Visa (Subclass 600)", time: "20–30 days", validity: "12 months", entry: "Multiple", fee: 50000, gov: 58000 },
    { cat: "Business", name: "Business Visitor (Subclass 600)", time: "20 days", validity: "12 months", entry: "Multiple", fee: 60000, gov: 58000 },
    { cat: "Student", name: "Student Visa (Subclass 500)", time: "4–6 weeks", validity: "Course length", entry: "Multiple", fee: 110000, gov: 340000 },
    { cat: "Work", name: "Skills in Demand (Subclass 482)", time: "6–8 weeks", validity: "Up to 4 years", entry: "Multiple", fee: 175000, gov: 690000 },
    { cat: "Family Visit", name: "Sponsored Family Visitor", time: "25 days", validity: "12 months", entry: "Multiple", fee: 50000, gov: 58000 },
    { cat: "Dependent", name: "Subsequent Entrant", time: "6 weeks", validity: "Linked to sponsor", entry: "Multiple", fee: 90000, gov: 340000 },
  ],
  CA: [
    { cat: "Tourist", name: "Temporary Resident Visa", time: "45–60 days", validity: "Up to 10 years", entry: "Multiple", fee: 55000, gov: 30500 },
    { cat: "Business", name: "Business Visitor TRV", time: "45 days", validity: "Up to 10 years", entry: "Multiple", fee: 65000, gov: 30500 },
    { cat: "Student", name: "Study Permit", time: "8 weeks", validity: "Course length", entry: "Multiple", fee: 120000, gov: 45000 },
    { cat: "Work", name: "Work Permit (LMIA)", time: "10–14 weeks", validity: "Up to 3 years", entry: "Multiple", fee: 165000, gov: 47500 },
    { cat: "Family Visit", name: "Super Visa", time: "60 days", validity: "Up to 10 years", entry: "Multiple", fee: 70000, gov: 30500 },
    { cat: "Dependent", name: "Open Work Permit (Spouse)", time: "12 weeks", validity: "Linked to sponsor", entry: "Multiple", fee: 95000, gov: 76000 },
    { cat: "Transit", name: "Transit Visa", time: "14 days", validity: "48 hours", entry: "Single", fee: 20000, gov: 0 },
  ],
  JP: [
    { cat: "Tourist", name: "Temporary Visitor (Tourism)", time: "5–7 working days", validity: "3 months", entry: "Single", fee: 30000, gov: 0 },
    { cat: "Business", name: "Temporary Visitor (Business)", time: "5–7 working days", validity: "3 months", entry: "Single", fee: 38000, gov: 0 },
    { cat: "Student", name: "College Student Visa", time: "4 weeks", validity: "Course length", entry: "Single", fee: 90000, gov: 0 },
    { cat: "Work", name: "Specified Skilled Worker", time: "4–6 weeks", validity: "Up to 5 years", entry: "Multiple", fee: 140000, gov: 0 },
    { cat: "Family Visit", name: "Visiting Relatives", time: "7 working days", validity: "3 months", entry: "Single", fee: 30000, gov: 0 },
  ],
  US: [
    { cat: "Tourist", name: "B1/B2 Visitor Visa", time: "Interview based", validity: "Up to 5 years", entry: "Multiple", fee: 45000, gov: 55500 },
    { cat: "Business", name: "B1 Business Visa", time: "Interview based", validity: "Up to 5 years", entry: "Multiple", fee: 55000, gov: 55500 },
    { cat: "Student", name: "F-1 Student Visa", time: "Interview based", validity: "Course length", entry: "Multiple", fee: 110000, gov: 55500 },
    { cat: "Work", name: "H-1B Specialty Occupation", time: "Petition based", validity: "3 years", entry: "Multiple", fee: 180000, gov: 61500 },
    { cat: "Transit", name: "C-1 Transit Visa", time: "Interview based", validity: "29 days", entry: "Single", fee: 25000, gov: 55500 },
    { cat: "Medical", name: "B-2 Medical Treatment", time: "Interview based", validity: "6 months", entry: "Multiple", fee: 60000, gov: 55500 },
  ],
  AE: [
    { cat: "Tourist", name: "30-Day Tourist e-Visa", time: "3–5 working days", validity: "60 days", entry: "Single", fee: 18000, gov: 32000 },
    { cat: "Business", name: "Business Visit e-Visa", time: "5 working days", validity: "60 days", entry: "Single", fee: 25000, gov: 38000 },
    { cat: "Work", name: "Employment Entry Permit", time: "2–3 weeks", validity: "2 years", entry: "Multiple", fee: 75000, gov: 95000 },
    { cat: "Family Visit", name: "Family Visit Visa", time: "5 working days", validity: "60 days", entry: "Single", fee: 20000, gov: 32000 },
    { cat: "Transit", name: "96-Hour Transit Visa", time: "2 working days", validity: "96 hours", entry: "Single", fee: 10000, gov: 12000 },
  ],
  SG: [
    { cat: "Tourist", name: "Tourist Entry Visa", time: "3–5 working days", validity: "30 days", entry: "Single", fee: 16000, gov: 7500 },
    { cat: "Business", name: "Business Entry Visa", time: "3–5 working days", validity: "30 days", entry: "Multiple", fee: 22000, gov: 7500 },
    { cat: "Student", name: "Student's Pass", time: "4 weeks", validity: "Course length", entry: "Multiple", fee: 85000, gov: 22000 },
    { cat: "Medical", name: "Medical Visit Visa", time: "5 working days", validity: "30 days", entry: "Single", fee: 20000, gov: 7500 },
  ],
};

export const visaTypesSeed: VisaType[] = Object.entries(visaCatalog).flatMap(([cc, list]) =>
  list.map((v, i) => ({
    id: `VT-${cc}-${String(i + 1).padStart(2, "0")}`,
    countryCode: cc,
    category: v.cat,
    name: v.name,
    processingTime: v.time,
    validity: v.validity,
    entry: v.entry,
    fee: v.fee,
    governmentFee: v.gov,
    status: cc === "US" && v.cat === "Transit" ? "Inactive" : "Active",
  })),
);

export const vt = (cc: string, cat: VisaCategory) => visaTypesSeed.find((v) => v.countryCode === cc && v.category === cat)!.id;

/* ------------------------------------------------------------------ */
/* Requirements                                                        */
/* ------------------------------------------------------------------ */

type R = [string, DocCategory, RequirementLevel, string?];
const base: R[] = [
  ["Passport", "Passport", "Required", "Valid for at least 6 months beyond travel date"],
  ["Passport Photos", "Photo", "Required", "2 recent photos, 35×45mm, white background"],
  ["NIC Copy", "NIC", "Required"],
  ["Bank Statement", "Bank Statement", "Required", "Last 6 months, bank-certified"],
];
const templates: Record<VisaCategory, R[]> = {
  Tourist: [
    ...base,
    ["Employment Letter", "Employment Letter", "Required", "On company letterhead with leave dates"],
    ["Salary Slips", "Salary Slip", "Required", "Last 3 months"],
    ["Leave Approval", "Employment Letter", "Required"],
    ["Travel Insurance", "Insurance", "Required"],
    ["Hotel Booking", "Hotel Booking", "Required"],
    ["Flight Reservation", "Flight Reservation", "Optional", "Reservation only — do not purchase ticket"],
    ["Invitation Letter", "Invitation Letter", "Conditional", "Only if staying with friends or family"],
  ],
  Business: [
    ...base,
    ["Company Cover Letter", "Employment Letter", "Required"],
    ["Business Registration", "Certificates", "Required"],
    ["Invitation Letter", "Invitation Letter", "Required", "From the host company abroad"],
    ["Travel Insurance", "Insurance", "Required"],
    ["Flight Reservation", "Flight Reservation", "Optional"],
  ],
  Student: [
    ...base,
    ["Offer Letter / CAS", "Certificates", "Required"],
    ["Academic Certificates", "Certificates", "Required"],
    ["English Test Results", "Certificates", "Required", "IELTS / PTE / TOEFL"],
    ["Sponsor Letter", "Other", "Conditional", "If financially sponsored"],
    ["Medical Report", "Other", "Conditional", "TB test where applicable"],
  ],
  Work: [
    ...base,
    ["Job Offer / Contract", "Employment Letter", "Required"],
    ["Educational Certificates", "Certificates", "Required"],
    ["Experience Letters", "Employment Letter", "Required"],
    ["Police Clearance", "Certificates", "Required"],
    ["Medical Report", "Other", "Required"],
  ],
  "Family Visit": [
    ...base,
    ["Invitation Letter", "Invitation Letter", "Required"],
    ["Sponsor's Residence Proof", "Other", "Required"],
    ["Relationship Proof", "Certificates", "Required", "Birth / marriage certificates"],
    ["Travel Insurance", "Insurance", "Required"],
  ],
  Dependent: [
    ...base,
    ["Marriage / Birth Certificate", "Certificates", "Required"],
    ["Sponsor's Visa Copy", "Other", "Required"],
    ["Sponsor's Financial Proof", "Bank Statement", "Required"],
  ],
  Transit: [
    ["Passport", "Passport", "Required"],
    ["Passport Photos", "Photo", "Required"],
    ["Onward Ticket", "Flight Reservation", "Required"],
    ["Destination Visa", "Other", "Required"],
  ],
  Medical: [
    ...base,
    ["Hospital Appointment Letter", "Other", "Required"],
    ["Medical Reports", "Other", "Required"],
    ["Proof of Treatment Funds", "Bank Statement", "Required"],
    ["Travel Insurance", "Insurance", "Optional"],
  ],
};

export const requirementsSeed: Record<string, Requirement[]> = Object.fromEntries(
  visaTypesSeed.map((v) => [
    v.id,
    templates[v.category].map(([name, category, level, note], i) => ({ id: `${v.id}-R${i + 1}`, name, category, level, note })),
  ]),
);

/* ------------------------------------------------------------------ */
/* Customers                                                          */
/* ------------------------------------------------------------------ */

type CSeed = [string, string, "Male" | "Female", string, string, string, string, number, number]; // first,last,gender,city,occupation,employer,destination,passportExpiryOffset,createdOffset
const cSeeds: CSeed[] = [
  ["John", "Perera", "Male", "Colombo 05", "Senior Software Engineer", "Lumina Tech (Pvt) Ltd", "UK", 142, -48],
  ["Sarah", "Silva", "Female", "Dehiwala", "Marketing Manager", "Blue Orchid Holdings", "AU", 610, -40],
  ["Nimal", "Fernando", "Male", "Negombo", "Hotel Operations Lead", "Lagoon Crest Hotels", "CA", 85, -65],
  ["Ayesha", "Rahman", "Female", "Kandy", "Postgraduate Student", "University of Peradeniya", "UK", 1210, -30],
  ["Dinesh", "Kumaran", "Male", "Jaffna", "Civil Engineer", "Northline Constructions", "AU", 930, -90],
  ["Kavindi", "Herath", "Female", "Kurunegala", "Pharmacist", "MediCare Pharmacies", "JP", 402, -22],
  ["Imran", "Farook", "Male", "Colombo 12", "Import / Export Owner", "Farook Trading Co.", "AE", 55, -15],
  ["Tharindu", "Bandara", "Male", "Matara", "Chef", "Ceylon Spice Kitchen", "CA", 1520, -120],
  ["Shalini", "Ratnayake", "Female", "Nugegoda", "Chartered Accountant", "Harbour & Co. Chartered Accountants", "US", 720, -35],
  ["Chamath", "Weerasinghe", "Male", "Galle", "Tour Guide", "Southern Trails", "JP", 300, -12],
  ["Priyanka", "Nair", "Female", "Wattala", "Nurse", "Asiri Care Hospital", "UK", 890, -75],
  ["Hasini", "Abeysekara", "Female", "Rajagiriya", "Graphic Designer", "Freelance", "SG", 1300, -8],
  ["Lahiru", "Dissanayake", "Male", "Anuradhapura", "Bank Officer", "Commercial Credit Bank", "AU", 45, -27],
  ["Fathima Nuha", "Cassim", "Female", "Colombo 06", "Dental Surgeon", "SmileWorks Dental", "US", 1100, -55],
  ["Sanjeewa", "Karunaratne", "Male", "Kiribathgoda", "Logistics Supervisor", "Island Freight Lines", "AE", 510, -18],
  ["Nethmi", "Gunasekara", "Female", "Moratuwa", "Undergraduate", "University of Moratuwa", "CA", 1640, -5],
  ["Arjun", "Pillai", "Male", "Trincomalee", "Marine Engineer", "Oceanic Shipping", "SG", 260, -140],
  ["Rashmi", "Ekanayake", "Female", "Kandy", "School Teacher", "Kandy Girls' College", "UK", 380, -60],
  ["Isuru", "Samarakoon", "Male", "Panadura", "Sales Executive", "Nova Electronics", "AE", 1050, -3],
  ["Michelle", "Jansz", "Female", "Mount Lavinia", "Interior Designer", "Studio Jansz", "JP", 700, -95],
];

const phone = (i: number) => `+94 7${[7, 1, 6, 0, 5][i % 5]} ${String(200 + i * 37).padStart(3, "0")} ${String(1000 + i * 413).slice(-4)}`;

export const customersSeed: Customer[] = cSeeds.map(([first, last, gender, city, occupation, employer, dest, expOff, created], i) => {
  const id = `CUS-${1001 + i}`;
  const num = `N${String(8812345 + i * 7919).slice(0, 7)}`;
  const issueYear = new Date().getFullYear() - (i % 5) - 4;
  const email = `${first.split(" ")[0].toLowerCase()}.${last.toLowerCase()}@${["gmail.com", "outlook.com", "yahoo.com"][i % 3]}`;
  const tel = phone(i);
  return {
    id,
    firstName: first,
    lastName: last,
    email,
    phone: tel,
    whatsapp: tel,
    dob: `${1978 + ((i * 3) % 22)}-${String((i % 12) + 1).padStart(2, "0")}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
    gender,
    maritalStatus: i % 3 === 0 ? "Single" : "Married",
    nationality: "Sri Lankan",
    nic: `${1978 + ((i * 3) % 22)}${String(10245678 + i * 1301).slice(0, 7)}`,
    address: `${12 + i * 3}/${(i % 4) + 1}, ${["Temple Road", "Lake Drive", "Galle Road", "Park Avenue", "Station Lane"][i % 5]}, ${city}`,
    city,
    occupation,
    employer,
    monthlyIncome: 150000 + ((i * 53000) % 600000),
    passport: { number: num, issueDate: `${issueYear}-0${(i % 9) + 1}-1${i % 9}`, expiryDate: d(expOff), placeOfIssue: "Colombo" },
    travel: {
      preferredDestination: dest,
      purpose: ["Tourism", "Higher Studies", "Employment", "Family Visit", "Business"][i % 5],
      plannedDate: d(30 + i * 6),
      previousTravel: i % 3 === 0 ? ["India (2023)", "Thailand (2024)"] : i % 3 === 1 ? ["Maldives (2022)"] : [],
    },
    status: "Active",
    assignedTo: CONSULTANT_IDS[i % 3],
    source: (["Website", "Facebook", "Referral", "Walk-in", "WhatsApp", "Instagram", "Google Ads"] as const)[i % 7],
    createdAt: d(created),
  };
});
customersSeed[16].status = "Completed";
customersSeed[19].status = "Completed";
customersSeed[15].status = "Prospect";
customersSeed[18].status = "Prospect";

/* ------------------------------------------------------------------ */
/* Applications                                                       */
/* ------------------------------------------------------------------ */

type ASeed = [string, number, string, VisaCategory, AppStatus, number, AppHistory["by"], Application["priority"], number, ("Approved" | "Rejected")?];
// [id, customerIdx, cc, cat, status, createdOffset, consultant, priority, travelOffset, decision]
const aSeeds: ASeed[] = [
  ["SVS-UK-2026-00125", 0, "UK", "Tourist", "Under Processing", -46, "STF-03", "High", 38],
  ["SVS-AU-2026-00098", 1, "AU", "Tourist", "Documents Pending", -12, "STF-04", "Medium", 64],
  ["SVS-CA-2026-00076", 2, "CA", "Work", "Documents Verified", -58, "STF-05", "Urgent", 90],
  ["SVS-UK-2026-00131", 3, "UK", "Student", "Ready for Submission", -26, "STF-03", "High", 55],
  ["SVS-AU-2026-00102", 4, "AU", "Work", "Biometrics", -80, "STF-04", "Medium", 120],
  ["SVS-JP-2026-00054", 5, "JP", "Tourist", "Submitted", -18, "STF-05", "Medium", 30],
  ["SVS-AE-2026-00211", 6, "AE", "Business", "Documents Uploaded", -9, "STF-03", "Urgent", 14],
  ["SVS-CA-2026-00081", 7, "CA", "Work", "Interview", -110, "STF-04", "High", 75],
  ["SVS-US-2026-00047", 8, "US", "Tourist", "Application Preparing", -30, "STF-05", "Medium", 70],
  ["SVS-JP-2026-00057", 9, "JP", "Business", "Consultation", -6, "STF-03", "Low", 45],
  ["SVS-UK-2026-00119", 10, "UK", "Work", "Decision Received", -70, "STF-04", "High", 20, "Approved"],
  ["SVS-SG-2026-00033", 11, "SG", "Tourist", "Inquiry", -2, "STF-05", "Low", 40],
  ["SVS-AU-2026-00091", 12, "AU", "Tourist", "Documents Pending", -24, "STF-03", "Medium", 33],
  ["SVS-SG-2026-00029", 16, "SG", "Business", "Completed", -130, "STF-05", "Medium", -20, "Approved"],
  ["SVS-JP-2026-00049", 19, "JP", "Tourist", "Passport Returned", -85, "STF-04", "Low", -5, "Rejected"],
];

const stageNotes: Partial<Record<AppStatus, string>> = {
  Inquiry: "Inquiry received and application file opened",
  Consultation: "Initial consultation completed",
  "Documents Pending": "Document checklist shared with customer",
  "Documents Uploaded": "All mandatory documents uploaded",
  "Documents Verified": "Documents verified by documentation team",
  "Application Preparing": "Application form preparation started",
  "Ready for Submission": "Application reviewed and ready",
  Submitted: "Application submitted to VFS / embassy",
  Biometrics: "Biometrics captured at visa centre",
  Interview: "Interview attended",
  "Under Processing": "Application under processing by the embassy",
  "Decision Received": "Decision received from the embassy",
  "Passport Returned": "Passport returned to customer",
  Completed: "File closed",
};

function buildHistory(status: AppStatus, createdOffset: number, consultant: string): AppHistory[] {
  const idx = APP_STAGES.indexOf(status);
  const span = Math.abs(createdOffset) - 1;
  return APP_STAGES.slice(0, idx + 1).map((s, i) => {
    const day = createdOffset + Math.round((span * i) / Math.max(idx, 1));
    const by = ["Documents Verified", "Documents Uploaded"].includes(s) ? "STF-06" : s === "Submitted" || s === "Biometrics" ? "STF-07" : consultant;
    return { status: s, date: dt(Math.min(day, 0), 9 + (i % 7), (i * 13) % 60), by, note: stageNotes[s] };
  });
}

export const applicationsSeed: Application[] = aSeeds.map(([id, ci, cc, cat, status, created, consultant, priority, travel, decision]) => {
  const history = buildHistory(status, created, consultant);
  return {
    id,
    customerId: customersSeed[ci].id,
    countryCode: cc,
    visaTypeId: vt(cc, cat),
    travelDate: d(travel),
    consultantId: consultant,
    status,
    priority,
    createdAt: history[0].date,
    updatedAt: history[history.length - 1].date,
    history,
    decision,
    purpose: cat === "Tourist" ? "Holiday & sightseeing" : cat === "Business" ? "Business meetings" : cat === "Student" ? "Higher education" : cat === "Work" ? "Employment" : "Family visit",
  };
});

/* ------------------------------------------------------------------ */
/* Documents                                                          */
/* ------------------------------------------------------------------ */

const fileNameFor = (req: string, cust: Customer) => `${cust.firstName.split(" ")[0]}_${req.replace(/[^a-z]/gi, "_")}.${req.includes("Photo") ? "jpg" : "pdf"}`.replace(/_+/g, "_");

export const documentsSeed: DocumentItem[] = [];
let docSeq = 3001;
applicationsSeed.forEach((app) => {
  const reqs = requirementsSeed[app.visaTypeId];
  const cust = customersSeed.find((c) => c.id === app.customerId)!;
  const stage = APP_STAGES.indexOf(app.status);
  reqs.forEach((r, i) => {
    let status: DocumentItem["status"] | null;
    if (app.id === "SVS-UK-2026-00125") {
      status = r.name === "Invitation Letter" ? null : r.name === "Travel Insurance" ? "Under Review" : r.name === "Hotel Booking" ? "Uploaded" : "Verified";
    } else if (stage >= 4) status = "Verified";
    else if (stage === 3) status = i % 4 === 0 ? "Under Review" : i % 5 === 1 ? "Uploaded" : "Verified";
    else if (stage === 2) status = i < 3 ? "Verified" : i === 3 ? "Re-upload Required" : i === 4 ? "Uploaded" : null;
    else status = i < 1 ? "Uploaded" : null;
    if (r.level === "Optional" && status === null) return;
    if (!status) return;
    const uploadedOffset = Math.min(-1, Math.round((new Date(app.createdAt).getTime() - Date.now()) / 86400000) + 3 + i);
    documentsSeed.push({
      id: `DOC-${docSeq++}`,
      name: r.name,
      fileName: fileNameFor(r.name, cust),
      category: r.category,
      requirement: r.name,
      customerId: cust.id,
      applicationId: app.id,
      uploadedAt: dt(uploadedOffset, 11, (i * 7) % 60),
      status,
      expiry: r.category === "Passport" ? cust.passport.expiryDate : r.category === "Insurance" ? d(120) : r.category === "Bank Statement" ? d(60) : undefined,
      verifiedBy: status === "Verified" ? (i % 2 ? "STF-06" : "STF-07") : undefined,
      size: 180_000 + Math.floor(rand() * 2_400_000),
      fileType: r.category === "Photo" ? "image" : "pdf",
      uploadedBy: i % 3 === 0 ? "customer" : "staff",
      note: status === "Re-upload Required" ? "Statement is not bank-certified. Please re-upload." : undefined,
    });
  });
});

/* ------------------------------------------------------------------ */
/* Invoices & payments                                                */
/* ------------------------------------------------------------------ */

export const invoicesSeed: Invoice[] = [];
export const paymentsSeed: Payment[] = [];
let invSeq = 41;
let paySeq = 1180;
const methods = ["Bank Transfer", "Card", "Cash", "Online"] as const;

applicationsSeed.forEach((app, idx) => {
  const v = visaTypesSeed.find((x) => x.id === app.visaTypeId)!;
  const isJohn = app.id === "SVS-UK-2026-00125";
  let invId = "INV-2026-00052";
  if (!isJohn) {
    if (invSeq === 52) invSeq++;
    invId = `INV-2026-${String(invSeq++).padStart(5, "0")}`;
  }
  const items = [
    { description: `Visa Processing Fee — ${v.name}`, amount: v.fee },
    { description: "Government / Embassy Fee", amount: v.governmentFee },
    { description: "Consultation Fee", amount: 7500 },
    ...(idx % 3 === 0 ? [{ description: "Courier & Document Handling", amount: 4500 }] : []),
  ].filter((i) => i.amount > 0);
  const total = items.reduce((s, i) => s + i.amount, 0);
  const discount = idx % 4 === 0 ? 5000 : 0;
  const created = Math.round((new Date(app.createdAt).getTime() - Date.now()) / 86400000);
  invoicesSeed.push({ id: invId, customerId: app.customerId, applicationId: app.id, items, discount, date: d(created + 1), dueDate: isJohn ? d(5) : d(created + 15), notes: "Thank you for choosing Serendib Visa Services." });

  const net = total - discount;
  const stage = APP_STAGES.indexOf(app.status);
  // payment pattern
  const plan: { amt: number; status: Payment["status"]; off: number }[] = [];
  if (isJohn) plan.push({ amt: 50000, status: "Paid", off: created + 2 }, { amt: 40000, status: "Paid", off: -10 }, { amt: net - 90000, status: "Pending", off: 5 });
  else if (stage >= 7) plan.push({ amt: Math.round(net * 0.6), status: "Paid", off: created + 2 }, { amt: net - Math.round(net * 0.6), status: "Paid", off: created + 20 });
  else if (stage >= 3) plan.push({ amt: Math.round(net * 0.5), status: "Paid", off: created + 2 }, { amt: net - Math.round(net * 0.5), status: idx % 2 ? "Overdue" : "Pending", off: created + 15 });
  else plan.push({ amt: Math.round(net * 0.3), status: idx % 2 ? "Paid" : "Pending", off: created + 1 }, { amt: net - Math.round(net * 0.3), status: "Pending", off: created + 25 });
  plan.forEach((p, k) => {
    paymentsSeed.push({
      id: `PAY-2026-${String(paySeq++).padStart(4, "0")}`,
      customerId: app.customerId,
      applicationId: app.id,
      invoiceId: invId,
      amount: p.amt,
      method: methods[(idx + k) % 4],
      date: d(Math.min(p.off, p.status === "Paid" ? -1 : 30)),
      status: p.status,
      receivedBy: p.status === "Paid" ? "STF-08" : undefined,
      reference: p.status === "Paid" ? `TXN${(783421 + idx * 97 + k * 13).toString()}` : undefined,
      description: k === 0 ? "Advance payment" : "Balance payment",
    });
  });
});
// Sarah Silva overdue payment (for notification)
const sarah = paymentsSeed.find((p) => p.customerId === "CUS-1002" && p.status !== "Paid");
if (sarah) {
  sarah.status = "Overdue";
  sarah.date = d(-4);
}

/* ------------------------------------------------------------------ */
/* Leads                                                              */
/* ------------------------------------------------------------------ */

type LSeed = [string, string, VisaCategory, Lead["source"], Lead["status"], Lead["priority"], number, number];
const lSeeds: LSeed[] = [
  ["Harsha Wijeratne", "UK", "Tourist", "Website", "New", "Medium", 0, 0],
  ["Nirosha Pathirana", "AU", "Student", "Facebook", "New", "High", -1, 1],
  ["Ramesh Thiagarajah", "CA", "Work", "Referral", "Contacted", "High", -3, 0],
  ["Dulani Kodikara", "JP", "Tourist", "Instagram", "Contacted", "Low", -4, 2],
  ["Asanka Premaratne", "AE", "Business", "WhatsApp", "Consultation", "Urgent", -6, 0],
  ["Mariam Hussain", "UK", "Family Visit", "Walk-in", "Consultation", "Medium", -5, 1],
  ["Gayan Liyanage", "US", "Tourist", "Google Ads", "Interested", "Medium", -8, 3],
  ["Oshadi Wickramaratne", "SG", "Tourist", "Website", "Interested", "Low", -9, -1],
  ["Pradeepa Selvarajah", "CA", "Student", "Referral", "Documents Requested", "High", -12, 0],
  ["Kelum Hettiarachchi", "AU", "Work", "Phone Call", "Documents Requested", "High", -14, -2],
  ["Sachini Amarasekara", "UK", "Student", "Instagram", "Converted", "Medium", -20, 4],
  ["Ruvini De Alwis", "JP", "Business", "Website", "Converted", "Low", -25, 6],
  ["Nuwan Rodrigo", "AE", "Tourist", "Facebook", "Lost", "Low", -18, -6],
  ["Thilini Jayamanne", "AU", "Family Visit", "WhatsApp", "New", "Medium", 0, 1],
  ["Faiz Mohamed", "SG", "Business", "Google Ads", "Contacted", "Medium", -2, 0],
];
export const leadsSeed: Lead[] = lSeeds.map(([name, cc, cat, source, status, priority, created, fu], i) => {
  const tel = `+94 7${[1, 7, 6, 0][i % 4]} ${String(430 + i * 29)} ${String(2000 + i * 367).slice(-4)}`;
  return {
    id: `LD-${2026}${String(101 + i).padStart(3, "0")}`,
    name,
    phone: tel,
    whatsapp: tel,
    email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ")[1].toLowerCase()}@gmail.com`,
    countryCode: cc,
    visaCategory: cat,
    travelDate: d(40 + i * 9),
    source,
    assignedTo: CONSULTANT_IDS[i % 3],
    priority,
    status,
    followUpDate: d(fu),
    notes: [
      "Interested in a 2-week holiday with family in December.",
      "Asked about intakes for February and scholarship options.",
      "Has a job offer; needs guidance on sponsorship documents.",
      "Wants cherry-blossom season travel next spring.",
      "Attending a trade fair; needs a fast turnaround.",
    ][i % 5],
    createdAt: d(created),
  };
});

/* ------------------------------------------------------------------ */
/* Appointments                                                       */
/* ------------------------------------------------------------------ */

type ApSeed = [number, string | null, Appointment["type"], number, string, string, Appointment["status"], string];
const apSeeds: ApSeed[] = [
  [0, "SVS-UK-2026-00125", "Consultation", -40, "10:00", "STF-03", "Completed", "Serendib Office — Colombo 03"],
  [0, "SVS-UK-2026-00125", "Biometrics", -12, "09:30", "STF-07", "Completed", "VFS Global — Colombo"],
  [0, "SVS-UK-2026-00125", "Passport Collection", 12, "14:00", "STF-06", "Scheduled", "VFS Global — Colombo"],
  [1, "SVS-AU-2026-00098", "Consultation", 0, "10:30", "STF-04", "Confirmed", "Serendib Office — Colombo 03"],
  [6, "SVS-AE-2026-00211", "Consultation", 0, "14:00", "STF-03", "Scheduled", "Online — Google Meet"],
  [3, "SVS-UK-2026-00131", "VFS", 1, "09:00", "STF-06", "Confirmed", "VFS Global — Colombo"],
  [4, "SVS-AU-2026-00102", "Biometrics", 1, "11:15", "STF-07", "Scheduled", "AVAC — Colombo 04"],
  [7, "SVS-CA-2026-00081", "Interview", 1, "15:30", "STF-04", "Confirmed", "High Commission of Canada"],
  [8, "SVS-US-2026-00047", "Embassy", 3, "08:30", "STF-05", "Scheduled", "U.S. Embassy — Colombo 03"],
  [9, "SVS-JP-2026-00057", "Consultation", 2, "16:00", "STF-03", "Scheduled", "Serendib Office — Colombo 03"],
  [5, "SVS-JP-2026-00054", "Passport Collection", 6, "13:00", "STF-06", "Scheduled", "Embassy of Japan"],
  [11, "SVS-SG-2026-00033", "Consultation", 4, "11:00", "STF-05", "Scheduled", "Serendib Office — Colombo 03"],
  [10, "SVS-UK-2026-00119", "Passport Collection", -1, "10:00", "STF-06", "Completed", "VFS Global — Colombo"],
  [12, "SVS-AU-2026-00091", "Consultation", -3, "15:00", "STF-03", "Cancelled", "Online — Zoom"],
  [2, "SVS-CA-2026-00076", "Biometrics", 9, "10:00", "STF-07", "Scheduled", "VFS Canada — Colombo"],
  [13, null, "Consultation", 8, "12:00", "STF-05", "Scheduled", "Serendib Office — Colombo 03"],
  [14, null, "Consultation", 15, "10:30", "STF-03", "Scheduled", "Serendib Office — Colombo 03"],
];
export const appointmentsSeed: Appointment[] = apSeeds.map(([ci, app, type, off, time, staff, status, loc], i) => ({
  id: `APT-${5001 + i}`,
  customerId: customersSeed[ci].id,
  applicationId: app ?? undefined,
  type,
  date: d(off),
  time,
  duration: type === "Consultation" ? 45 : 30,
  staffId: staff,
  status,
  location: loc,
}));

/* ------------------------------------------------------------------ */
/* Follow-ups                                                         */
/* ------------------------------------------------------------------ */

type FSeed = [number, string | null, string, number, string, FollowUp["priority"], FollowUp["status"], FollowUp["channel"]];
const fSeeds: FSeed[] = [
  [0, "SVS-UK-2026-00125", "Request invitation letter from host", 0, "STF-03", "High", "Pending", "WhatsApp"],
  [1, "SVS-AU-2026-00098", "Remind about pending bank statement", 0, "STF-04", "Medium", "Pending", "Call"],
  [6, "SVS-AE-2026-00211", "Confirm hotel booking dates", 0, "STF-03", "Urgent", "Pending", "Call"],
  [12, "SVS-AU-2026-00091", "Collect updated salary slips", 0, "STF-03", "Medium", "Pending", "Email"],
  [8, "SVS-US-2026-00047", "Review DS-160 draft with customer", 1, "STF-05", "High", "Pending", "Meeting"],
  [3, "SVS-UK-2026-00131", "Share VFS appointment checklist", 1, "STF-03", "Medium", "Pending", "Email"],
  [9, "SVS-JP-2026-00057", "Send business visa requirements", 2, "STF-03", "Low", "Pending", "WhatsApp"],
  [11, "SVS-SG-2026-00033", "Follow up on consultation booking", 4, "STF-05", "Low", "Pending", "Call"],
  [2, "SVS-CA-2026-00076", "Confirm LMIA copy received", 5, "STF-05", "High", "Pending", "Email"],
  [1, "SVS-AU-2026-00098", "Overdue balance payment reminder", -2, "STF-08", "Urgent", "Pending", "Call"],
  [7, "SVS-CA-2026-00081", "Interview preparation session", -1, "STF-04", "High", "Pending", "Meeting"],
  [14, null, "Call back about Dubai business visa", -3, "STF-03", "Medium", "Pending", "Call"],
  [10, "SVS-UK-2026-00119", "Congratulate & collect feedback", -1, "STF-04", "Low", "Completed", "WhatsApp"],
  [5, "SVS-JP-2026-00054", "Confirm submission receipt", -5, "STF-05", "Medium", "Completed", "Email"],
  [4, "SVS-AU-2026-00102", "Biometrics reminder", -6, "STF-04", "Medium", "Completed", "WhatsApp"],
  [13, "SVS-US-2026-00047", "Share interview tips", 7, "STF-05", "Low", "Pending", "Email"],
];
export const followUpsSeed: FollowUp[] = fSeeds.map(([ci, app, task, off, staff, prio, status, ch], i) => ({
  id: `FU-${7001 + i}`,
  customerId: customersSeed[ci].id,
  applicationId: app ?? undefined,
  task,
  dueDate: d(off),
  assignedTo: staff,
  priority: prio,
  status,
  channel: ch,
}));

/* ------------------------------------------------------------------ */
/* Messages, notifications, activity                                   */
/* ------------------------------------------------------------------ */

export const messagesSeed: Message[] = [
  { id: "MSG-1", customerId: "CUS-1001", from: "staff", staffId: "STF-03", text: "Hi John, your UK application has been submitted successfully. Biometrics are booked — details are in your portal.", time: dt(-20, 10, 12) },
  { id: "MSG-2", customerId: "CUS-1001", from: "customer", text: "Thank you Kasun! Do I need to bring the original bank statement to VFS?", time: dt(-20, 11, 3) },
  { id: "MSG-3", customerId: "CUS-1001", from: "staff", staffId: "STF-03", text: "Yes please bring originals of all financial documents along with your passport.", time: dt(-20, 11, 20) },
  { id: "MSG-4", customerId: "CUS-1001", from: "staff", staffId: "STF-06", text: "We still need the invitation letter from your host in London. Please upload it from the portal when ready.", time: dt(-2, 15, 40) },
  { id: "MSG-5", customerId: "CUS-1002", from: "staff", staffId: "STF-04", text: "Hi Sarah, a gentle reminder that the balance payment for your Australia application is overdue.", time: dt(-1, 9, 30) },
];

export const notificationsSeed: AppNotification[] = [
  { id: "N-1", title: "John Perera uploaded Passport", description: "New document on SVS-UK-2026-00125 awaiting review.", time: dt(0, new Date().getHours(), Math.max(new Date().getMinutes() - 12, 0)), read: false, type: "document", link: "/app/applications/SVS-UK-2026-00125" },
  { id: "N-2", title: "Sarah Silva's payment is overdue", description: "Balance payment for SVS-AU-2026-00098 is 4 days overdue.", time: dt(0, Math.max(new Date().getHours() - 2, 0)), read: false, type: "payment", link: "/app/payments" },
  { id: "N-3", title: "UK application SVS-UK-2026-00125 changed status", description: "Moved to Under Processing by Kasun Wickramasinghe.", time: dt(-1, 16, 20), read: false, type: "status", link: "/app/applications/SVS-UK-2026-00125" },
  { id: "N-4", title: "Tomorrow: 3 appointments scheduled", description: "VFS, biometrics and an interview are booked for tomorrow.", time: dt(-1, 8, 0), read: false, type: "appointment", link: "/app/appointments" },
  { id: "N-5", title: "New lead from Website", description: "Harsha Wijeratne enquired about a UK Tourist visa.", time: dt(-1, 7, 45), read: true, type: "lead", link: "/app/leads" },
  { id: "N-6", title: "Imran Farook uploaded Hotel Booking", description: "Document ready for verification on SVS-AE-2026-00211.", time: dt(-2, 13, 10), read: true, type: "document", link: "/app/applications/SVS-AE-2026-00211" },
  { id: "N-7", title: "Decision received: SVS-UK-2026-00119", description: "Priyanka Nair's Skilled Worker visa was approved.", time: dt(-3, 11, 0), read: true, type: "status", link: "/app/applications/SVS-UK-2026-00119" },
  { id: "N-8", title: "Weekly report is ready", description: "Applications and revenue report for last week is available.", time: dt(-4, 9, 0), read: true, type: "system", link: "/app/reports" },
  { id: "C-1", title: "Your application is Under Processing", description: "The embassy is now reviewing SVS-UK-2026-00125.", time: dt(-1, 16, 22), read: false, type: "status", audience: "customer", customerId: "CUS-1001", link: "/portal/applications/SVS-UK-2026-00125" },
  { id: "C-2", title: "Document requested: Invitation Letter", description: "Please upload the invitation letter from your host.", time: dt(-2, 15, 41), read: false, type: "document", audience: "customer", customerId: "CUS-1001", link: "/portal/documents" },
];

export const activitiesSeed: Activity[] = [
  ...applicationsSeed.flatMap((a) =>
    a.history.map((h, i) => ({
      id: `ACT-${a.id}-${i}`,
      customerId: a.customerId,
      applicationId: a.id,
      text: i === 0 ? `Application ${a.id} created` : `Status changed to ${h.status}`,
      by: h.by,
      time: h.date,
      type: (i === 0 ? "create" : "status") as Activity["type"],
    })),
  ),
  { id: "ACT-X1", customerId: "CUS-1001", applicationId: "SVS-UK-2026-00125", text: "Payment of LKR 40,000 received via Card", by: "STF-08", time: dt(-10, 14, 5), type: "payment" },
  { id: "ACT-X2", customerId: "CUS-1001", applicationId: "SVS-UK-2026-00125", text: "Hotel Booking uploaded by customer", by: "customer", time: dt(-3, 19, 22), type: "document" },
];

/* ------------------------------------------------------------------ */
/* Static analytics series                                            */
/* ------------------------------------------------------------------ */

export const monthlyApplications = [
  { month: "Jan", applications: 212, approved: 168 },
  { month: "Feb", applications: 238, approved: 190 },
  { month: "Mar", applications: 276, approved: 221 },
  { month: "Apr", applications: 254, approved: 207 },
  { month: "May", applications: 301, approved: 249 },
  { month: "Jun", applications: 342, approved: 280 },
  { month: "Jul", applications: 318, approved: 262 },
  { month: "Aug", applications: 365, approved: 301 },
  { month: "Sep", applications: 394, approved: 318 },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 5.8 },
  { month: "Feb", revenue: 6.4 },
  { month: "Mar", revenue: 7.9 },
  { month: "Apr", revenue: 7.1 },
  { month: "May", revenue: 8.6 },
  { month: "Jun", revenue: 9.8 },
  { month: "Jul", revenue: 9.2 },
  { month: "Aug", revenue: 10.7 },
  { month: "Sep", revenue: 11.9 },
];
