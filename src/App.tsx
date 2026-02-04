
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./components/AuthCallback";
import RoleSelector from "./components/RoleSelector";
import BrowseManufacturers from "./pages/BrowseManufacturers";
import ManufacturerRegistration from "./pages/ManufacturerRegistration";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import ManufacturerProfile from "./pages/ManufacturerProfile";
import CustomerDashboard from "./pages/CustomerDashboard";
import OrderConfirmation from "./pages/OrderConfirmation";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/role-selector" element={<RoleSelector />} />
            <Route path="/browse-manufacturers" element={<BrowseManufacturers />} />
            <Route path="/manufacturer-registration" element={<ManufacturerRegistration />} />
            <Route 
              path="/manufacturer-dashboard" 
              element={
                <ProtectedRoute requireRole="manufacturer">
                  <ManufacturerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manufacturer-profile" 
              element={
                <ProtectedRoute requireRole="manufacturer">
                  <ManufacturerProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-dashboard" 
              element={
                <ProtectedRoute requireRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation" 
              element={
                <ProtectedRoute requireRole="customer">
                  <OrderConfirmation />
                </ProtectedRoute>
              } 
            />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
