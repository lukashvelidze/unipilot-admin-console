import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import DocumentsPage from "./pages/admin/DocumentsPage";
import CountriesPage from "./pages/admin/CountriesPage";
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
          <Route path="/admin/documents" element={<DocumentsPage />} />
          <Route path="/admin/countries" element={<CountriesPage />} />
          <Route path="/admin/checklists" element={<PlaceholderPage title="Checklists" description="Manage visa checklists and checklist items" />} />
          <Route path="/admin/subscriptions" element={<PlaceholderPage title="Subscriptions" description="View and manage user subscriptions" />} />
          <Route path="/admin/storage" element={<PlaceholderPage title="Storage" description="Manage storage buckets and files" />} />
          <Route path="/admin/auth" element={<PlaceholderPage title="Auth & Security" description="Manage authentication, sessions, and security settings" />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="Settings" description="Configure admin panel settings" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;