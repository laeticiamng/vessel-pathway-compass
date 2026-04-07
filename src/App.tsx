import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/i18n/context";
import { AuthProvider } from "./hooks/useAuth";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicAppRoute } from "./components/PublicAppRoute";
import { ContentGate } from "./components/ContentGate";
import { CookieConsent } from "./components/CookieConsent";

// Lazy-loaded routes
const Pricing = lazy(() => import("./pages/Pricing"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Legal = lazy(() => import("./pages/Legal"));
const Support = lazy(() => import("./pages/Support"));
const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const ProcedurePlanner = lazy(() => import("./pages/app/ProcedurePlanner"));
const FusionViewer = lazy(() => import("./pages/app/FusionViewer"));
const Patients = lazy(() => import("./pages/app/Patients"));
const PatientDetail = lazy(() => import("./pages/app/PatientDetail"));
const DigitalTwin = lazy(() => import("./pages/app/DigitalTwin"));
const CIAKIEngine = lazy(() => import("./pages/app/CIAKIEngine"));
const Registry = lazy(() => import("./pages/app/Registry"));
const Education = lazy(() => import("./pages/app/Education"));
const Simulation = lazy(() => import("./pages/app/Simulation"));
const Research = lazy(() => import("./pages/app/Research"));
const Analytics = lazy(() => import("./pages/app/Analytics"));
const Network = lazy(() => import("./pages/app/Network"));
const Logbook = lazy(() => import("./pages/app/Logbook"));
const Admin = lazy(() => import("./pages/app/Admin"));
const Settings = lazy(() => import("./pages/app/Settings"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const App = () => (
  <LanguageProvider>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="aquamr-flow-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CookieConsent />
        <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/legal/:section" element={<Legal />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/support" element={<Support />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />

          {/* Semi-public: visible with content gate */}
          <Route path="/app" element={<PublicAppRoute />}>
            <Route index element={<ContentGate><Dashboard /></ContentGate>} />
            <Route path="procedure-planner" element={<ContentGate><ProcedurePlanner /></ContentGate>} />
            <Route path="fusion-viewer" element={<ContentGate><FusionViewer /></ContentGate>} />
            <Route path="digital-twin" element={<ContentGate><DigitalTwin /></ContentGate>} />
            <Route path="ci-aki-engine" element={<ContentGate><CIAKIEngine /></ContentGate>} />
            <Route path="simulation" element={<ContentGate><Simulation /></ContentGate>} />
            <Route path="registry" element={<ContentGate><Registry /></ContentGate>} />
            <Route path="research" element={<ContentGate><Research /></ContentGate>} />
            <Route path="education" element={<ContentGate><Education /></ContentGate>} />
            <Route path="analytics" element={<ContentGate><Analytics /></ContentGate>} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/app/ai-assistant" element={<Navigate to="/app/procedure-planner" replace />} />
          <Route path="/app/risk-calculator" element={<Navigate to="/app/ci-aki-engine" replace />} />
          <Route path="/app/beta" element={<Navigate to="/app" replace />} />
          <Route path="/app/outcomes" element={<Navigate to="/app/registry" replace />} />
          <Route path="/app/performance" element={<Navigate to="/app/analytics" replace />} />
          <Route path="/app/compliance" element={<Navigate to="/app/settings" replace />} />
          <Route path="/app/compliance" element={<Navigate to="/app/settings" replace />} />
          <Route path="/app/team" element={<Navigate to="/app/settings" replace />} />

          {/* Fully protected: sensitive data */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="network" element={<Network />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </LanguageProvider>
);

export default App;
