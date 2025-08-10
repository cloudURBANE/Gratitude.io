import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import TipFlow from "@/pages/tip-flow";  
import TipPage from "@/pages/tip-page";
import Success from "@/pages/success";
import StyleGuide from "@/pages/styleguide";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import QRGenerator from "@/pages/qr-generator";
import ProfileSettings from "@/pages/profile-settings";
import Pricing from "@/pages/pricing";
import BusinessDashboard from "@/pages/business-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/u/:handle" component={TipPage} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/styleguide" component={StyleGuide} />
          <Route path="/tip" component={TipFlow} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/u/:handle" component={TipPage} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/qr" component={QRGenerator} />
          <Route path="/settings" component={ProfileSettings} />
          <Route path="/business" component={BusinessDashboard} />
          <Route path="/styleguide" component={StyleGuide} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/success" component={Success} />
          <Route path="/tip" component={TipFlow} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Set dark mode class on document
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;