import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/students"
            element={
              <MainLayout>
                <Students />
              </MainLayout>
            }
          />
          <Route
            path="/payments"
            element={
              <MainLayout>
                <Payments />
              </MainLayout>
            }
          />
          <Route
            path="/invoices"
            element={
              <MainLayout>
                <Invoices />
              </MainLayout>
            }
          />
          <Route
            path="/staff"
            element={
              <MainLayout>
                <Staff />
              </MainLayout>
            }
          />
          <Route
            path="/expenses"
            element={
              <MainLayout>
                <Expenses />
              </MainLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <MainLayout>
                <Reports />
              </MainLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <MainLayout>
                <Settings />
              </MainLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
