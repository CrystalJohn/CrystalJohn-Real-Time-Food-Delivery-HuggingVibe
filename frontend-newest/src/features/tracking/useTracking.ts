'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { io, type Socket } from 'socket.io-client';
import {
  mergeTrackingData,
  normalizeTrackingData,
  trackingService,
  type TrackingData,
  type TrackingScope,
} from './tracking.service';

let socket: Socket | null = null;
let socketUsers = 0;

function getSocketBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
  }

  const explicitWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (explicitWsUrl) {
    return explicitWsUrl;
  }

  try {
    const parsed = new URL(API_URL, window.location.origin);
    return parsed.origin;
  } catch {
    return window.location.origin;
  }
}

function getSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(`${getSocketBaseUrl()}/tracking`, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  return socket;
}

interface UseTrackingOptions {
  enabled?: boolean;
  scope?: TrackingScope;
}

export function useTracking(orderId: string, options?: UseTrackingOptions) {
  const enabled = options?.enabled ?? Boolean(orderId);
  const scope = options?.scope ?? 'customer';

  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(Boolean(enabled && orderId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !orderId) {
      setLoading(false);
      setTracking(null);
      setConnected(false);
      setError(null);
      return;
    }

    let disposed = false;
    const client = getSocket();
    socketUsers += 1;

    const hydrateTracking = async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await trackingService.getTracking(orderId, scope);

        if (!disposed) {
          setTracking(snapshot);
        }
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : 'Failed to load tracking');
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    const joinRoom = () => {
      client.emit('tracking.join-order', { orderId });
    };

    const handleConnect = () => {
      if (disposed) return;
      setConnected(true);
      joinRoom();
    };

    const handleDisconnect = () => {
      if (disposed) return;
      setConnected(false);
    };

    const handleTrackingUpdate = (payload: unknown) => {
      if (disposed) return;

      const incoming = normalizeTrackingData(payload);

      if (incoming.orderId && incoming.orderId !== orderId) {
        return;
      }

      setTracking((current) => mergeTrackingData(current, incoming));
    };

    void hydrateTracking();

    client.on('connect', handleConnect);
    client.on('disconnect', handleDisconnect);
    client.on('order.location.updated', handleTrackingUpdate);
    client.on('order.status.updated', handleTrackingUpdate);
    client.on('order.tracking.updated', handleTrackingUpdate);

    if (client.connected) {
      handleConnect();
    } else {
      setConnected(false);
    }

    return () => {
      disposed = true;

      try {
        client.emit('tracking.leave-order', { orderId });
      } catch {
        void 0;
      }

      client.off('connect', handleConnect);
      client.off('disconnect', handleDisconnect);
      client.off('order.location.updated', handleTrackingUpdate);
      client.off('order.status.updated', handleTrackingUpdate);
      client.off('order.tracking.updated', handleTrackingUpdate);

      socketUsers -= 1;

      if (socketUsers <= 0 && socket) {
        socket.disconnect();
        socket = null;
        socketUsers = 0;
      }
    };
  }, [enabled, orderId, scope]);

  return { tracking, connected, loading, error };
}