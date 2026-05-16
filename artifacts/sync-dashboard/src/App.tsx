import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import ConnectorsList from "@/pages/connectors/index";
import ConnectorDetail from "@/pages/connectors/detail";
import SyncHistory from "@/pages/sync/index";
import SyncDetail from "@/pages/sync/detail";
import WebhooksList from "@/pages/webhooks/index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/connectors" component={ConnectorsList} />
        <Route path="/connectors/:id" component={ConnectorDetail} />
        <Route path="/sync" component={SyncHistory} />
        <Route path="/sync/:id" component={SyncDetail} />
        <Route path="/webhooks" component={WebhooksList} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
