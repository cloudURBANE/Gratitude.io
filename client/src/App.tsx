import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import Home from "@/pages/home";
import TipFlow from "@/pages/tip-flow";  
import Success from "@/pages/success";
import StyleGuide from "@/pages/styleguide";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import QRGenerator from "@/pages/qr-generator";
import ProfileSettings from "@/pages/profile-settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/u/:handle" component={TipFlow} />
      <Route path="/u/:handle/checkout" component={Checkout} />
      <Route path="/u/:handle/dashboard" component={Dashboard} />
      <Route path="/u/:handle/analytics" component={Analytics} />
      <Route path="/u/:handle/qr" component={QRGenerator} />
      <Route path="/u/:handle/settings" component={ProfileSettings} />
      <Route path="/success" component={Success} />
      <Route path="/styleguide" component={StyleGuide} />
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
