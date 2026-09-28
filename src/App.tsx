import { lazy, Suspense } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/store/store";
import { ModalProvider } from "@/components/modals/ModalProvider";
import { ConfirmProvider } from "@/components/shared/Confirm";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PortalLayout } from "@/pages/portal/PortalLayout";
import Login from "@/pages/auth/Login";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";

const VisaTypes = lazy(() => import("@/pages/admin/VisaTypes"));
const Requirements = lazy(() => import("@/pages/admin/Requirements"));
const PortalVisaGuide = lazy(() => import("@/pages/portal/PortalVisaGuide"));

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
                  <Route index element={<Navigate to="/login" replace />} />
                  <Route path="login" element={<Login />} />
                  <Route path="app" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/app/visa-types" replace />} />
                    <Route path="visa-types" element={<VisaTypes />} />
                    <Route path="requirements" element={<Requirements />} />
                    <Route path="*" element={<NotFound inApp />} />
                  </Route>
                  <Route path="portal" element={<PortalLayout />}>
                    <Route index element={<Navigate to="/portal/visa-guide" replace />} />
                    <Route path="visa-guide" element={<PortalVisaGuide />} />
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
