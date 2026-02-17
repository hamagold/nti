import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Permission } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import Staff from "./pages/Staff";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AddStudent from "./pages/AddStudent";
import AddStaff from "./pages/AddStaff";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize dark mode and auth on first load
function AppInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth
    initialize();

    // Initialize theme
    const stored = localStorage.getItem('theme');
    const root = document.documentElement;

    if (!stored) {
      localStorage.setItem('theme', 'dark');
      root.classList.add('dark');
    } else if (stored === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [initialize]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppInitializer />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute
                requiredPermission={'view_students' as Permission}
                fallbackPath="/students/add"
              >
                <MainLayout>
                  <Students />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute requiredPermission={'view_payments' as Permission}>
                <MainLayout>
                  <Payments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute requiredPermission={'view_invoices' as Permission}>
                <MainLayout>
                  <Invoices />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute
                requiredPermission={'view_staff' as Permission}
                fallbackPath="/staff/add"
              >
                <MainLayout>
                  <Staff />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute requiredPermission={'view_expenses' as Permission}>
                <MainLayout>
                  <Expenses />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission={'view_reports' as Permission}>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredPermission={'view_settings' as Permission}>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/add"
            element={
              <ProtectedRoute requiredPermission={'add_student' as Permission}>
                <MainLayout>
                  <AddStudent />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/add"
            element={
              <ProtectedRoute requiredPermission={'add_staff' as Permission}>
                <MainLayout>
                  <AddStaff />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
