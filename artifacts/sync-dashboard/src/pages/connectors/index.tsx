import { useListConnectors, useDeleteConnector, getListConnectorsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Trash2, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateConnectorDialog } from "@/components/connector-form-dialog";

const SOURCE_NAMES: Record<string, string> = {
  moments: "Moments",
  delphi: "Delphi",
  opera: "Opera",
  ivvy: "iVvy",
  tripleseat: "Tripleseat",
  priava: "Priava"
};

export default function ConnectorsList() {
  const { data, isLoading } = useListConnectors();
  const deleteConnector = useDeleteConnector();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connectors = data?.connectors || [];

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this connector?")) return;
    
    deleteConnector.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Connector deleted" });
        queryClient.invalidateQueries({ queryKey: getListConnectorsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete connector", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connectors</h1>
          <p className="text-muted-foreground">Manage PMS integrations and webhooks.</p>
        </div>
        <CreateConnectorDialog />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)
        ) : connectors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-4">No connectors configured</div>
              <Button variant="outline">Create your first connector</Button>
            </CardContent>
          </Card>
        ) : (
          connectors.map(connector => (
            <Card key={connector.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center font-bold text-lg text-primary">
                    {SOURCE_NAMES[connector.source]?.charAt(0) || connector.source.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/connectors/${connector.id}`} className="font-semibold text-lg hover:underline cursor-pointer">
                        {connector.name}
                      </Link>
                      <Badge variant="outline" className="text-xs bg-secondary">
                        {SOURCE_NAMES[connector.source] || connector.source}
                      </Badge>
                      {connector.status === "active" ? (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Active</Badge>
                      ) : connector.status === "error" ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Error</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {connector.id}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-muted-foreground flex gap-4">
                    <span>
                      Last sync: {connector.lastSyncAt ? formatDistanceToNow(new Date(connector.lastSyncAt), { addSuffix: true }) : "Never"}
                    </span>
                    {connector.lastSyncStatus && (
                       <span>Status: <span className={connector.lastSyncStatus === "failed" ? "text-destructive" : "text-accent"}>{connector.lastSyncStatus}</span></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/connectors/${connector.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <Edit className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(connector.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
