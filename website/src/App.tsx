import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DistrictProvider } from "@/context/DistrictContext";
import DashboardLayout from "@/components/DashboardLayout";
import OverviewPage from "@/pages/OverviewPage";
import TransportPage from "@/pages/TransportPage";
import HousingPage from "@/pages/HousingPage";
import EcologyPage from "@/pages/EcologyPage";
import NotFound from "./pages/NotFound.tsx";
import FeedbackPage from "./pages/FeedbackPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DistrictProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/housing" element={<HousingPage />} />
              <Route path="/ecology" element={<EcologyPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DistrictProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
