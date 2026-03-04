import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./i18n/context";
import { AuthProvider } from "./hooks/useAuth";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import Team from "./pages/app/Team";
import Settings from "./pages/app/Settings";
import FederatedLearning from "./pages/app/beta/FederatedLearning";
import AISafety from "./pages/app/beta/AISafety";
import Imaging from "./pages/app/beta/Imaging";
import Wearables from "./pages/app/beta/Wearables";
import ARTraining from "./pages/app/beta/ARTraining";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="vascular-atlas-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />

          {/* App (authenticated) */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="digital-twin" element={<DigitalTwin />} />
            <Route path="registry" element={<Registry />} />
            <Route path="education" element={<Education />} />
            <Route path="simulation" element={<Simulation />} />
            <Route path="network" element={<Network />} />
            <Route path="research" element={<Research />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="beta/federated" element={<FederatedLearning />} />
            <Route path="beta/ai-safety" element={<AISafety />} />
            <Route path="beta/imaging" element={<Imaging />} />
            <Route path="beta/wearables" element={<Wearables />} />
            <Route path="beta/ar-training" element={<ARTraining />} />
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
