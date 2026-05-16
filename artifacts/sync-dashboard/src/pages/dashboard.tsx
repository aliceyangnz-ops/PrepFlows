import { useListConnectors, useListSyncRecords } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle2, CloudOff, Server } from "lucide-react";
import { useSyncEvents } from "@/hooks/use-sync-events";

function Dashboard() {
  const { data: connectorsData, isLoading: connectorsLoading } = useListConnectors();
  const { data: syncData, isLoading: syncLoading } = useListSyncRecords({ limit: 10 });
  const { events, connected } = useSyncEvents();

  const connectors = connectorsData?.connectors || [];
  const recentSyncs = syncData?.records || [];

  const activeConnectors = connectors.filter(c => c.status === "active").length;
  const errorConnectors = connectors.filter(c => c.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground">Live monitoring of all connector data flows.</p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <Activity className="mr-1.5 h-3 w-3 animate-pulse" />
              Live Feed Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <CloudOff className="mr-1.5 h-3 w-3" />
              Connecting...
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connectors</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {connectorsLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold">{connectors.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {connectorsLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold">{activeConnectors}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failing Pipelines</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {connectorsLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{errorConnectors}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
             {syncLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold">{recentSyncs.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Syncs in last 24h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Sync Operations</CardTitle>
          </CardHeader>
          <CardContent>
            {syncLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {recentSyncs.slice(0, 5).map(sync => (
                  <div key={sync.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">{sync.connectorName}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {sync.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                         {sync.status === "completed" ? (
                            <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">Completed</Badge>
                          ) : sync.status === "failed" ? (
                            <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">Failed</Badge>
                          ) : (
                            <Badge variant="outline">{sync.status}</Badge>
                          )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(sync.startedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentSyncs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent sync operations
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Live Event Stream</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[400px]">
            <div className="space-y-4 font-mono text-xs">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Waiting for events...
                </div>
              ) : (
                events.map((event, i) => (
                  <div key={`${event.id}-${i}`} className="flex flex-col gap-1 p-2 rounded-md bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-primary">{event.type}</span>
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.connectorId && (
                      <div className="text-muted-foreground truncate">
                        Connector: {event.connectorId}
                      </div>
                    )}
                    {event.message && (
                      <div className="text-foreground mt-1">
                        {event.message}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
