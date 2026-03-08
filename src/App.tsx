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
const AIAssistant = lazy(() => import("./pages/app/AIAssistant"));
const Patients = lazy(() => import("./pages/app/Patients"));
const PatientDetail = lazy(() => import("./pages/app/PatientDetail"));
const DigitalTwin = lazy(() => import("./pages/app/DigitalTwin"));
const Registry = lazy(() => import("./pages/app/Registry"));
const Education = lazy(() => import("./pages/app/Education"));
const Simulation = lazy(() => import("./pages/app/Simulation"));
const Network = lazy(() => import("./pages/app/Network"));
const Research = lazy(() => import("./pages/app/Research"));
const Compliance = lazy(() => import("./pages/app/Compliance"));
const Analytics = lazy(() => import("./pages/app/Analytics"));
const Team = lazy(() => import("./pages/app/Team"));
const Settings = lazy(() => import("./pages/app/Settings"));
const InnovationLab = lazy(() => import("./pages/app/beta/InnovationLab"));

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
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="vascular-atlas-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
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

          {/* Semi-public: visible at 35% without auth */}
          <Route path="/app" element={<PublicAppRoute />}>
            <Route index element={<ContentGate><Dashboard /></ContentGate>} />
            <Route path="ai-assistant" element={<ContentGate><AIAssistant /></ContentGate>} />
            <Route path="digital-twin" element={<ContentGate><DigitalTwin /></ContentGate>} />
            <Route path="registry" element={<ContentGate><Registry /></ContentGate>} />
            <Route path="education" element={<ContentGate><Education /></ContentGate>} />
            <Route path="simulation" element={<ContentGate><Simulation /></ContentGate>} />
            <Route path="network" element={<ContentGate><Network /></ContentGate>} />
            <Route path="research" element={<ContentGate><Research /></ContentGate>} />
            <Route path="compliance" element={<ContentGate><Compliance /></ContentGate>} />
            <Route path="analytics" element={<ContentGate><Analytics /></ContentGate>} />
            <Route path="team" element={<ContentGate><Team /></ContentGate>} />
            <Route path="beta" element={<ContentGate><InnovationLab /></ContentGate>} />
          </Route>

          {/* Fully protected: sensitive data */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
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
