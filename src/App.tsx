import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import CountriesPage from "./pages/admin/CountriesPage";
import VisaTypesPage from "./pages/admin/VisaTypesPage";
import ChecklistsPage from "./pages/admin/ChecklistsPage";
import PlaceholderPage from "./pages/admin/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/countries" element={<CountriesPage />} />
          <Route path="/admin/visa-types" element={<VisaTypesPage />} />
          <Route path="/admin/checklists" element={<ChecklistsPage />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="Settings" description="Configure admin panel settings" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;