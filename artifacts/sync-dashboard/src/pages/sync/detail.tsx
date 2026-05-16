import { useGetSyncRecord, getGetSyncRecordQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export default function SyncDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGetSyncRecord(id, { query: { enabled: !!id, queryKey: getGetSyncRecordQueryKey(id) } });

  const record = data?.record;

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!record) {
    return <div>Record not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sync">
          <div className="p-2 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">Sync: {record.id}</h1>
            {record.status === "completed" ? (
              <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">Completed</Badge>
            ) : record.status === "failed" ? (
              <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">Failed</Badge>
            ) : (
              <Badge variant="outline">{record.status}</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            Started: {new Date(record.startedAt).toLocaleString()}
            {record.completedAt && ` • Completed: ${new Date(record.completedAt).toLocaleString()}`}
            {record.durationMs && ` • Duration: ${(record.durationMs/1000).toFixed(2)}s`}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Connector Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <Link href={`/connectors/${record.connectorConfigId}`} className="text-lg font-semibold hover:underline text-primary">
                {record.connectorName}
              </Link>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Source</div>
              <Badge variant="outline" className="bg-secondary mt-1">{record.source}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Trigger Type</div>
              <Badge variant="outline" className="bg-secondary mt-1">{record.trigger}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 bg-muted/30 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                 <div className="text-3xl font-bold text-foreground">{record.eventsProcessed}</div>
                 <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Processed</div>
               </div>
               <div className="p-4 bg-accent/5 rounded-lg border border-accent/20 flex flex-col items-center justify-center text-center">
                 <div className="text-3xl font-bold text-accent">{record.eventsCreated + record.eventsUpdated}</div>
                 <div className="text-xs text-accent/80 font-medium uppercase tracking-wider mt-1">Written</div>
               </div>
               <div className="p-4 bg-muted/30 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                 <div className="text-3xl font-bold text-muted-foreground">{record.eventsSkipped}</div>
                 <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Skipped</div>
               </div>
               <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 flex flex-col items-center justify-center text-center">
                 <div className="text-3xl font-bold text-destructive">{record.errors.length}</div>
                 <div className="text-xs text-destructive/80 font-medium uppercase tracking-wider mt-1">Errors</div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" /> 
            Error Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {record.errors && record.errors.length > 0 ? (
            <div className="space-y-3">
              {record.errors.map((err, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-md border border-destructive/30 bg-destructive/5 font-mono text-sm">
                  <div className="flex-1">
                    <span className="text-destructive font-bold">ERROR:</span> {err.message}
                  </div>
                  <div className="flex gap-4 text-muted-foreground text-xs">
                    {err.row !== undefined && <div>Row: {err.row}</div>}
                    {err.field && <div>Field: {err.field}</div>}
                    {err.severity && (
                      <Badge variant="outline" className="border-destructive/30 text-destructive">{err.severity}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center border rounded-md bg-muted/10 border-dashed">
              <CheckCircle2 className="h-8 w-8 text-accent mb-2" />
              <div>No errors encountered during this sync operation.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
