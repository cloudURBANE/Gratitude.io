import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import ProfileSetup from "@/pages/profile-setup";
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
  return (
    <Switch>
      {/* Landing and main flows */}
      <Route path="/" component={Landing} />
      <Route path="/create" component={ProfileSetup} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Tip collection */}
      <Route path="/u/:handle" component={TipPage} />
      <Route path="/tip" component={TipFlow} />
      <Route path="/success" component={Success} />
      
      {/* Management pages */}
      <Route path="/analytics" component={Analytics} />
      <Route path="/qr" component={QRGenerator} />
      <Route path="/settings" component={ProfileSettings} />
      <Route path="/business" component={BusinessDashboard} />
      
      {/* Public pages */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/styleguide" component={StyleGuide} />
      
      {/* 404 */}
      <Route component={NotFound} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;