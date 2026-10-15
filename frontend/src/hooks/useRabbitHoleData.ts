
import { useEffect, useState } from "react";

export interface NavigationEvent {
  id: string;
  sessionId: string;
  tabId: number;
  url: string;
  title: string;
  fromUrl: string | null;
  timestamp: string;
}

export interface RabbitHoleSession {
  id: string;
  title: string;
  startedAt: string;
  active: boolean;
  stoppedAt?: string;
}

export function useRabbitHoleData() {
  const [session, setSession] =
    useState<RabbitHoleSession | null>(null);

  const [events, setEvents] =
    useState<NavigationEvent[]>([]);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "RABBITHOLE_DATA") return;

      setSession(event.data.currentSession);
      setEvents(event.data.navigationEvents);
      setConnected(true);
    }

    window.addEventListener("message", handleMessage);

    const requestData = () => {
      window.postMessage(
        { type: "RABBITHOLE_GET_DATA" },
        window.location.origin
      );
    };

    requestData();

    const interval = window.setInterval(requestData, 2000);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(interval);
    };
  }, []);

  return { session, events, connected };
}
