import {useEffect, useRef} from 'react';
import {WS_BASE} from '@env';
import {useAppStore} from '../../store/useAppStore';
import {RiskFeedItem} from '../../types/models';

const LIVE_ENDPOINT = `${WS_BASE.replace(/\/$/, '')}/ws/live`;

export const useLiveRiskFeed = (enabled: boolean) => {
  const addRiskItem = useAppStore(state => state.addRiskItem);
  const clearRiskFeed = useAppStore(state => state.clearRiskFeed);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) {
      clearRiskFeed();
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const connect = () => {
      if (socketRef.current) {
        return;
      }
      const ws = new WebSocket(LIVE_ENDPOINT);
      socketRef.current = ws;

      ws.onopen = () => {
        console.info('[LiveFeed] connected');
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as RiskFeedItem;
          if (data?.patientId && data?.risk) {
            addRiskItem({
              ...data,
              receivedAt: data.receivedAt ?? new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('[LiveFeed] parse error', error);
        }
      };

      ws.onerror = error => {
        console.warn('[LiveFeed] error', error);
      };

      ws.onclose = () => {
        socketRef.current = null;
        reconnectTimeout.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [addRiskItem, clearRiskFeed, enabled]);
};
