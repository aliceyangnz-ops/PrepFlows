import { useListWebhookEvents } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function WebhooksList() {
  const { data, isLoading } = useListWebhookEvents({ limit: 50 });
  const events = data?.events || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhook Events</h1>
        <p className="text-muted-foreground">Live feed of incoming webhook payloads.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No webhook events recorded yet.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {events.map((event) => (
                <AccordionItem key={event.id} value={event.id} className="border-border">
                  <AccordionTrigger className="px-6 hover:bg-muted/30 hover:no-underline">
                    <div className="flex items-center gap-4 w-full text-left">
                      <div className="flex-1 flex items-center gap-3">
                        {event.processed ? (
                           event.error ? <AlertCircle className="h-5 w-5 text-destructive shrink-0" /> : <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        ) : (
                           <div className="h-5 w-5 rounded-full border-2 border-dashed border-primary animate-spin shrink-0" />
                        )}
                        <span className="font-mono text-sm font-medium">{event.id.slice(0, 12)}...</span>
                        <Badge variant="outline" className="bg-secondary">{event.source}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {formatDistanceToNow(new Date(event.receivedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0">
                    <div className="space-y-4 pt-4 border-t border-border">
                      {event.error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-mono">
                          {event.error}
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payload</h4>
                        <pre className="p-4 rounded-md bg-muted text-xs font-mono overflow-auto max-h-96 border border-border">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Headers</h4>
                        <pre className="p-4 rounded-md bg-muted text-xs font-mono overflow-auto max-h-48 border border-border text-muted-foreground">
                          {JSON.stringify(event.headers, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
