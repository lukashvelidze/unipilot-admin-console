import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import { PublicLayout } from "./components/public/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { FAQsPage } from "./pages/public/FAQsPage";
import { TermsPage } from "./pages/public/TermsPage";
import { LoginPage } from "./pages/public/LoginPage";
import { ArticlesFeedPage } from "./pages/public/ArticlesFeedPage";
import { ArticleDetailPage } from "./pages/public/ArticleDetailPage";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import CountriesPage from "./pages/admin/CountriesPage";
import VisaTypesPage from "./pages/admin/VisaTypesPage";
import ChecklistsPage from "./pages/admin/ChecklistsPage";
import PlaceholderPage from "./pages/admin/PlaceholderPage";
import ArticlesPage from "./pages/admin/ArticlesPage";
import ArticleCreatePage from "./pages/admin/ArticleCreatePage";
import ArticleEditPage from "./pages/admin/ArticleEditPage";
import ArticleCategoriesPage from "./pages/admin/ArticleCategoriesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes with marketing layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/articles" element={<ArticlesFeedPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/countries" element={<CountriesPage />} />
          <Route path="/admin/visa-types" element={<VisaTypesPage />} />
          <Route path="/admin/checklists" element={<ChecklistsPage />} />
          <Route path="/admin/article-categories" element={<ArticleCategoriesPage />} />
          <Route path="/admin/articles" element={<ArticlesPage />} />
          <Route path="/admin/articles/new" element={<ArticleCreatePage />} />
          <Route path="/admin/articles/:slug" element={<ArticleEditPage />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="Settings" description="Configure admin panel settings" />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
