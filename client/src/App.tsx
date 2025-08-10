import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ProfileSetup from "@/pages/profile-setup";
import TipFlow from "@/pages/tip-flow";  
import TipPage from "@/pages/tip-page";
import Success from "@/pages/success";
import StyleGuide from "@/pages/styleguide";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import WelcomeDashboard from "@/pages/welcome-dashboard";
import Analytics from "@/pages/analytics";
import QRGenerator from "@/pages/qr-generator";
import ProfileSettings from "@/pages/profile-settings";
import AccountSettings from "@/pages/account-settings";
import Pricing from "@/pages/pricing";
import BusinessDashboard from "@/pages/business-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  // Enable view transitions for route changes
  useEffect(() => {
    if (location !== prevLocationRef.current && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        prevLocationRef.current = location;
      });
    } else {
      prevLocationRef.current = location;
    }
  }, [location]);

  // Show loading with Neo-Glass design
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-background" />
        <div className="neo-card p-8 flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
          <p className="text-sm text-secondary">Loading TipVault...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - available to everyone */}
      <Route path="/" component={isAuthenticated ? WelcomeDashboard : Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/styleguide" component={StyleGuide} />
      
      {/* Public tip collection - no auth required */}
      <Route path="/u/:handle" component={TipPage} />
      <Route path="/tip" component={TipFlow} />
      <Route path="/success" component={Success} />
      <Route path="/checkout" component={Checkout} />
      
      {/* Protected routes - require authentication */}
      {isAuthenticated ? (
        <>
          <Route path="/profile-setup" component={ProfileSetup} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/qr" component={QRGenerator} />
          <Route path="/settings" component={ProfileSettings} />
          <Route path="/account-settings" component={AccountSettings} />
          <Route path="/business" component={BusinessDashboard} />
        </>
      ) : (
        // Redirect unauthenticated users to login for protected routes
        <Route>
          {() => {
            window.location.href = '/login';
            return null;
          }}
        </Route>
      )}
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Set dark mode class on document
    document.documentElement.classList.add('dark');
    
    // Add Neo-Glass background to body
    if (!document.querySelector('.app-background')) {
      const bgDiv = document.createElement('div');
      bgDiv.className = 'app-background';
      document.body.prepend(bgDiv);
    }

    // Enable smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <div className="dark min-h-screen">
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