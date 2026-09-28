import { lazy, Suspense } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/store/store";
import { ModalProvider } from "@/components/modals/ModalProvider";
import { ConfirmProvider } from "@/components/shared/Confirm";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PortalLayout } from "@/pages/portal/PortalLayout";
import { PublicLayout } from "@/pages/public/PublicLayout";
import Login from "@/pages/auth/Login";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/admin/Dashboard";
import { Loader2 } from "lucide-react";

const Leads = lazy(() => import("@/pages/admin/Leads"));
const Customers = lazy(() => import("@/pages/admin/Customers"));
const CustomerProfile = lazy(() => import("@/pages/admin/CustomerProfile"));
const Applications = lazy(() => import("@/pages/admin/Applications"));
const ApplicationDetail = lazy(() => import("@/pages/admin/ApplicationDetail"));
const Documents = lazy(() => import("@/pages/admin/Documents"));
const Appointments = lazy(() => import("@/pages/admin/Appointments"));
const FollowUps = lazy(() => import("@/pages/admin/FollowUps"));
const Payments = lazy(() => import("@/pages/admin/Payments"));
const Invoices = lazy(() => import("@/pages/admin/Invoices"));
const Reports = lazy(() => import("@/pages/admin/Reports"));
const Countries = lazy(() => import("@/pages/admin/Countries"));
const CountryDetail = lazy(() => import("@/pages/admin/CountryDetail"));
const VisaTypes = lazy(() => import("@/pages/admin/VisaTypes"));
const Requirements = lazy(() => import("@/pages/admin/Requirements"));
const StaffPage = lazy(() => import("@/pages/admin/Staff"));
const Notifications = lazy(() => import("@/pages/admin/Notifications"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

const PortalDashboard = lazy(() => import("@/pages/portal/PortalDashboard"));
const PortalApplications = lazy(() => import("@/pages/portal/PortalApplications"));
const PortalApplicationDetail = lazy(() => import("@/pages/portal/PortalApplicationDetail"));
const PortalDocuments = lazy(() => import("@/pages/portal/PortalDocuments"));
const PortalPayments = lazy(() => import("@/pages/portal/PortalPayments"));
const PortalInvoices = lazy(() => import("@/pages/portal/PortalInvoices"));
const PortalAppointments = lazy(() => import("@/pages/portal/PortalAppointments"));
const PortalMessages = lazy(() => import("@/pages/portal/PortalMessages"));
const PortalProfile = lazy(() => import("@/pages/portal/PortalProfile"));

const Home = lazy(() => import("@/pages/public/Home"));
const About = lazy(() => import("@/pages/public/About"));
const Services = lazy(() => import("@/pages/public/Services"));
const Destinations = lazy(() => import("@/pages/public/Destinations"));
const PublicRequirements = lazy(() => import("@/pages/public/PublicRequirements"));
const Eligibility = lazy(() => import("@/pages/public/Eligibility"));
const Track = lazy(() => import("@/pages/public/Track"));
const Faq = lazy(() => import("@/pages/public/Faq"));
const Contact = lazy(() => import("@/pages/public/Contact"));

// Hash routing can be enabled for static hosting without rewrite rules: VITE_HASH_ROUTER=true
const Router = import.meta.env.VITE_HASH_ROUTER === "true" ? HashRouter : BrowserRouter;

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <TooltipProvider delayDuration={200}>
          <ConfirmProvider>
            <ModalProvider>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="services" element={<Services />} />
                    <Route path="destinations" element={<Destinations />} />
                    <Route path="visa-requirements" element={<PublicRequirements />} />
                    <Route path="eligibility" element={<Eligibility />} />
                    <Route path="track" element={<Track />} />
                    <Route path="faq" element={<Faq />} />
                    <Route path="contact" element={<Contact />} />
                  </Route>
                  <Route path="login" element={<Login />} />
                  <Route path="app" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="customers/:id" element={<CustomerProfile />} />
                    <Route path="applications" element={<Applications />} />
                    <Route path="applications/:id" element={<ApplicationDetail />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="follow-ups" element={<FollowUps />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="countries" element={<Countries />} />
                    <Route path="countries/:code" element={<CountryDetail />} />
                    <Route path="visa-types" element={<VisaTypes />} />
                    <Route path="requirements" element={<Requirements />} />
                    <Route path="staff" element={<StaffPage />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound inApp />} />
                  </Route>
                  <Route path="portal" element={<PortalLayout />}>
                    <Route index element={<PortalDashboard />} />
                    <Route path="applications" element={<PortalApplications />} />
                    <Route path="applications/:id" element={<PortalApplicationDetail />} />
                    <Route path="documents" element={<PortalDocuments />} />
                    <Route path="payments" element={<PortalPayments />} />
                    <Route path="invoices" element={<PortalInvoices />} />
                    <Route path="appointments" element={<PortalAppointments />} />
                    <Route path="messages" element={<PortalMessages />} />
                    <Route path="profile" element={<PortalProfile />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster
                position="top-right"
                closeButton
                toastOptions={{
                  classNames: {
                    toast: "!rounded-xl !border-border !shadow-[var(--shadow-lift)] !font-sans",
                    title: "!font-semibold !text-[13.5px]",
                    description: "!text-muted-foreground !text-[12.5px]",
                    success: "[&_[data-icon]]:!text-[#0a7d57]",
                    error: "[&_[data-icon]]:!text-[#cf4f3a]",
                    info: "[&_[data-icon]]:!text-[#3a6fd8]",
                    actionButton: "!bg-primary !text-white !rounded-md",
                  },
                }}
              />
            </ModalProvider>
          </ConfirmProvider>
        </TooltipProvider>
      </Router>
    </StoreProvider>
  );
}
