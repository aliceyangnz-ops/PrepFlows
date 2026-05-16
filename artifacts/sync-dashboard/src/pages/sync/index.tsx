import { useListSyncRecords } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function SyncHistory() {
  const { data, isLoading } = useListSyncRecords({ limit: 50 });
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sync History</h1>
        <p className="text-muted-foreground">View and filter execution records across all pipelines.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Record ID</th>
                <th className="px-6 py-3 font-medium">Connector</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Trigger</th>
                <th className="px-6 py-3 font-medium">Results (C/U/S/E)</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No sync records found</td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono">
                      <Link href={`/sync/${record.id}`} className="hover:underline text-primary">
                        {record.id.slice(0,8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{record.connectorName}</div>
                      <div className="text-xs text-muted-foreground">{record.source}</div>
                    </td>
                    <td className="px-6 py-4">
                       {record.status === "completed" ? (
                          <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">Completed</Badge>
                        ) : record.status === "failed" ? (
                          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">Failed</Badge>
                        ) : (
                          <Badge variant="outline">{record.status}</Badge>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-secondary">{record.trigger}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="text-accent">{record.eventsCreated}</span> /{' '}
                      <span className="text-primary">{record.eventsUpdated}</span> /{' '}
                      <span className="text-muted-foreground">{record.eventsSkipped}</span> /{' '}
                      <span className={record.errors.length > 0 ? "text-destructive" : ""}>{record.errors.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      {record.durationMs ? `${(record.durationMs / 1000).toFixed(2)}s` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(record.startedAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
