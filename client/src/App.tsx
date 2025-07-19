import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import IconForge from "@/pages/icon-forge";
import MultiVariantForge from "@/pages/multi-variant-forge";
import OpenAIIconForge from "@/pages/openai-icon-forge";
import CreativeIconForge from "@/pages/creative-icon-forge";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MultiVariantForge} />
      <Route path="/openai" component={OpenAIIconForge} />
      <Route path="/creative" component={CreativeIconForge} />
      <Route path="/single" component={IconForge} />
      <Route component={NotFound} />
    </Switch>
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
