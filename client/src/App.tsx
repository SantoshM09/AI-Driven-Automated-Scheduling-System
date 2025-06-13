import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Rooms from "@/pages/rooms";
import Faculty from "@/pages/faculty";
import Upload from "@/pages/upload";
import Insights from "@/pages/insights";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/rooms" component={Rooms} />
        <Route path="/rooms/:id" component={Rooms} />
        <Route path="/faculty" component={Faculty} />
        <Route path="/faculty/:id" component={Faculty} />
        <Route path="/upload" component={Upload} />
        <Route path="/insights" component={Insights} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
