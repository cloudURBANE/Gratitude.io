import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import TipPage from "@/pages/tip-page";
import Home from "@/pages/home";
import { AppLayout } from "@/components/layout/AppLayout";

function Router() {
  return (
    <Switch>
      {/* Home/Landing page */}
      <Route path="/" component={Home} />
      
      {/* Tip page route - matches /u/:handle */}
      <Route path="/u/:handle" component={TipPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;