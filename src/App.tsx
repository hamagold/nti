import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedWebsiteRoute } from "@/components/ProtectedWebsiteRoute";
import { PublicWebsite } from "./pages/PublicWebsite";
import Login from "./pages/Login";
import WebsiteAdminLogin from "./pages/WebsiteAdminLogin";
import WebsiteAdminDashboard from "./pages/WebsiteAdminDashboard";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import Staff from "./pages/Staff";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<PublicWebsite />} />
            
            {/* Website Admin */}
            <Route path="/website-admin" element={<WebsiteAdminLogin />} />
            <Route path="/website-admin/dashboard" element={
              <ProtectedWebsiteRoute>
                <WebsiteAdminDashboard />
              </ProtectedWebsiteRoute>
            } />
            
            {/* Accounting System */}
            <Route path="/kurdistannti" element={<Login />} />
            <Route path="/kurdistannti/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/students" element={
              <ProtectedRoute>
                <MainLayout>
                  <Students />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/payments" element={
              <ProtectedRoute>
                <MainLayout>
                  <Payments />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/invoices" element={
              <ProtectedRoute>
                <MainLayout>
                  <Invoices />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/staff" element={
              <ProtectedRoute>
                <MainLayout>
                  <Staff />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/expenses" element={
              <ProtectedRoute>
                <MainLayout>
                  <Expenses />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kurdistannti/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
