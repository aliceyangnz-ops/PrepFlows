import { useGetConnector, useTriggerSync, getGetConnectorQueryKey, useListSyncRecords } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, AlertCircle, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { UpdateConnectorDialog } from "@/components/connector-form-dialog";

export default function ConnectorDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: connectorData, isLoading: connectorLoading } = useGetConnector(id, { query: { enabled: !!id, queryKey: getGetConnectorQueryKey(id) } });
  const { data: syncData } = useListSyncRecords({ limit: 5, connectorId: id });
  
  const triggerSync = useTriggerSync();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [manualRows, setManualRows] = useState("");

  const connector = connectorData?.connector;
  const recentSyncs = syncData?.records || [];

  const handleCopyWebhook = () => {
    if (!connector) return;
    const url = `${window.location.origin}${connector.webhookPath}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Webhook URL copied to clipboard" });
  };

  const handleManualSync = () => {
    if (!manualRows.trim()) {
      toast({ title: "Please enter JSON array of rows", variant: "destructive" });
      return;
    }

    try {
      const rows = JSON.parse(manualRows);
      if (!Array.isArray(rows)) throw new Error("Must be an array");

      triggerSync.mutate({ connectorId: id, data: { rows } }, {
        onSuccess: () => {
          toast({ title: "Sync triggered successfully" });
          setManualRows("");
          queryClient.invalidateQueries({ queryKey: getGetConnectorQueryKey(id) });
        },
        onError: (err) => {
          toast({ title: "Sync failed", description: String(err), variant: "destructive" });
        }
      });
    } catch (e) {
      toast({ title: "Invalid JSON format", description: String(e), variant: "destructive" });
    }
  };

  if (connectorLoading) {
    return <div className="space-y-6"><Skeleton className="h-[200px] w-full" /></div>;
  }

  if (!connector) {
    return <div>Connector not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{connector.name}</h1>
            <Badge variant="outline" className="bg-secondary">{connector.source}</Badge>
            {connector.status === "active" ? (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Active</Badge>
            ) : connector.status === "error" ? (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Error</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
          <p className="text-sm font-mono text-muted-foreground">{connector.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <UpdateConnectorDialog connector={connector} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Webhook URL</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {window.location.origin}{connector.webhookPath}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyWebhook}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {connector.apiEndpoint && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">API Endpoint</div>
                <code className="block w-full p-2 bg-muted rounded text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {connector.apiEndpoint}
                </code>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
                  <div className="text-sm">{new Date(connector.createdAt).toLocaleString()}</div>
               </div>
               <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Schedule</div>
                  <div className="text-sm">{connector.schedule || 'None'}</div>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Last Sync
                </div>
                <div className="font-semibold mt-2">
                  {connector.lastSyncAt ? formatDistanceToNow(new Date(connector.lastSyncAt), { addSuffix: true }) : "Never"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Status: <span className={connector.lastSyncStatus === 'failed' ? 'text-destructive' : 'text-accent'}>{connector.lastSyncStatus || 'N/A'}</span>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Errors
                </div>
                {connector.lastSyncError ? (
                  <div className="text-sm text-destructive mt-2 line-clamp-3" title={connector.lastSyncError}>
                    {connector.lastSyncError}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2">
                    No recent errors
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Manual Sync Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Provide JSON array of rows to manually push data through the sync engine for testing.
            </p>
            <Textarea 
              placeholder='[ { "id": "123", "name": "Event" } ]'
              className="font-mono text-sm h-32"
              value={manualRows}
              onChange={(e) => setManualRows(e.target.value)}
            />
            <Button onClick={handleManualSync} disabled={triggerSync.isPending}>
              {triggerSync.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Run Sync
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
