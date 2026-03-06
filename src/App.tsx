import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/i18n/context";
import { AuthProvider } from "./hooks/useAuth";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicAppRoute } from "./components/PublicAppRoute";
import { ContentGate } from "./components/ContentGate";
import { CookieConsent } from "./components/CookieConsent";
import Dashboard from "./pages/app/Dashboard";
import AIAssistant from "./pages/app/AIAssistant";
import Patients from "./pages/app/Patients";
import PatientDetail from "./pages/app/PatientDetail";
import DigitalTwin from "./pages/app/DigitalTwin";
import Registry from "./pages/app/Registry";
import Education from "./pages/app/Education";
import Simulation from "./pages/app/Simulation";
import Network from "./pages/app/Network";
import Research from "./pages/app/Research";
import Compliance from "./pages/app/Compliance";
import Analytics from "./pages/app/Analytics";
import Team from "./pages/app/Team";
import Settings from "./pages/app/Settings";
import InnovationLab from "./pages/app/beta/InnovationLab";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="vascular-atlas-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <Toaster />
        <Sonner />
        <CookieConsent />
      <BrowserRouter>
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
            <Route path="beta/federated" element={<ContentGate><FederatedLearning /></ContentGate>} />
            <Route path="beta/ai-safety" element={<ContentGate><AISafety /></ContentGate>} />
            <Route path="beta/imaging" element={<ContentGate><Imaging /></ContentGate>} />
            <Route path="beta/wearables" element={<ContentGate><Wearables /></ContentGate>} />
            <Route path="beta/ar-training" element={<ContentGate><ARTraining /></ContentGate>} />
          </Route>

          {/* Fully protected: sensitive data */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </LanguageProvider>
);

export default App;
