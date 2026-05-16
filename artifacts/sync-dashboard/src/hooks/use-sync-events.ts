import { useEffect, useState } from "react";

export interface SyncEvent {
  id: string;
  type: string;
  connectorId?: string;
  status?: string;
  message?: string;
  timestamp: string;
}

export function useSyncEvents() {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = `/api/sync/events`;
    
    const source = new EventSource(url);

    source.onopen = () => {
      setConnected(true);
    };

    source.onerror = () => {
      setConnected(false);
    };

    source.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents(prev => [data, ...prev].slice(0, 100)); // keep last 100
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    return () => {
      source.close();
    };
  }, []);

  return { events, connected };
}
