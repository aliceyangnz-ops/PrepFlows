import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface SyncEvent {
  id: string;
  type: string;
  connectorId?: string;
  status?: string;
  message?: string;
  timestamp: string;
}

/**
 * Subscribes to sync events from two sources:
 *  1. SSE stream from the API server (/api/sync/events) — live connector activity
 *  2. Supabase Realtime on sync_records — cross-device database changes
 *
 * Events from both sources are merged into a single list, newest first.
 * When Supabase is not yet configured, only the SSE stream is used.
 */
export function useSyncEvents() {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // ── Source 1: SSE stream from API server ────────────────────────────────────
  useEffect(() => {
    const source = new EventSource(`/api/sync/events`);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SyncEvent;
        setEvents((prev) => [data, ...prev].slice(0, 100));
      } catch {
        // ignore malformed messages
      }
    };

    return () => source.close();
  }, []);

  // ── Source 2: Supabase Realtime on sync_records ──────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel("sync-records-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sync_records" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const event: SyncEvent = {
            id: row.id as string,
            type: "sync_record",
            connectorId: row.connector_config_id as string | undefined,
            status: row.status as string | undefined,
            message: `Sync ${row.status ?? "started"} — ${row.events_processed ?? 0} events processed`,
            timestamp: (row.started_at as string) ?? new Date().toISOString(),
          };
          setEvents((prev) => [event, ...prev].slice(0, 100));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sync_records" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setEvents((prev) => {
            const existing = prev.find((e) => e.id === row.id);
            if (existing) {
              return prev.map((e) =>
                e.id === row.id
                  ? {
                      ...e,
                      status: row.status as string,
                      message: `Sync ${row.status ?? "updated"} — ${row.events_processed ?? 0} events processed`,
                    }
                  : e,
              );
            }
            const event: SyncEvent = {
              id: row.id as string,
              type: "sync_record",
              connectorId: row.connector_config_id as string | undefined,
              status: row.status as string | undefined,
              message: `Sync ${row.status ?? "updated"} — ${row.events_processed ?? 0} events processed`,
              timestamp: (row.started_at as string) ?? new Date().toISOString(),
            };
            return [event, ...prev].slice(0, 100);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "connector_configs" },
        (payload) => {
          const type = payload.eventType;
          const row = (type === "DELETE" ? payload.old : payload.new) as Record<string, unknown>;
          const event: SyncEvent = {
            id: (row.id as string) ?? crypto.randomUUID(),
            type: "connector_config",
            connectorId: row.id as string | undefined,
            status: row.status as string | undefined,
            message:
              type === "DELETE"
                ? `Connector removed`
                : `Connector "${(row.name as string) ?? row.id}" ${type === "INSERT" ? "added" : "updated"} — status: ${(row.status as string) ?? "unknown"}`,
            timestamp: (row.updated_at as string) ?? new Date().toISOString(),
          };
          setEvents((prev) => [event, ...prev].slice(0, 100));
        },
      )
      .subscribe((status) => {
        setSupabaseConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase?.removeChannel(channel);
      setSupabaseConnected(false);
    };
  }, []);

  return { events, connected, supabaseConnected };
}
