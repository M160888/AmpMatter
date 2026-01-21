import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setConnectionStatus,
  setConnectionInfo,
  setError,
  setSelfId,
  handleDelta,
} from '../store/slices/navigationSlice';
import type { SignalKDelta, SignalKHello } from '@ampmatter/shared';

export type SignalKConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SignalKConnectionInfo {
  state: SignalKConnectionState;
  retryCount: number;
  nextRetryIn: number; // milliseconds until next retry
  reconnect: () => void;
}

export function useSignalK(): SignalKConnectionInfo {
  const dispatch = useAppDispatch();
  const signalkUrl = useAppSelector((state) => state.settings.signalkUrl);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const nextRetryTimeRef = useRef<number>(0);

  const [connectionState, setConnectionState] = useState<SignalKConnectionState>('idle');
  const [nextRetryIn, setNextRetryIn] = useState<number>(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    dispatch(setConnectionStatus('connecting'));

    try {
      const ws = new WebSocket(signalkUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        dispatch(setConnectionStatus('connected'));
        reconnectAttempts.current = 0;
        nextRetryTimeRef.current = 0;
        setNextRetryIn(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SignalKDelta | SignalKHello;

          // Check if it's a hello message
          if ('self' in data && typeof data.self === 'string') {
            dispatch(setSelfId(data.self));
            return;
          }

          // Handle delta updates
          if ('updates' in data && Array.isArray(data.updates)) {
            data.updates.forEach((update) => {
              update.values.forEach((valueObj) => {
                dispatch(handleDelta({
                  path: valueObj.path,
                  value: valueObj.value,
                }));
              });
            });
          }
        } catch (err) {
          console.error('Failed to parse SignalK message:', err);
        }
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        dispatch(setConnectionStatus('disconnected'));
        wsRef.current = null;

        // Exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        nextRetryTimeRef.current = Date.now() + delay;

        console.log(`SignalK reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('SignalK WebSocket error:', error);
        setConnectionState('error');
        dispatch(setError('Connection error'));
      };
    } catch (err) {
      setConnectionState('error');
      dispatch(setError(`Failed to connect: ${err}`));
    }
  }, [signalkUrl, dispatch]);

  // Update countdown timer
  useEffect(() => {
    if (nextRetryTimeRef.current === 0) {
      setNextRetryIn(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, nextRetryTimeRef.current - Date.now());
      setNextRetryIn(remaining);

      if (remaining === 0) {
        nextRetryTimeRef.current = 0;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [connectionState]);

  // Dispatch connection info to Redux
  useEffect(() => {
    dispatch(setConnectionInfo({
      state: connectionState,
      retryCount: reconnectAttempts.current,
      nextRetryIn,
    }));
  }, [connectionState, nextRetryIn, dispatch]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    state: connectionState,
    retryCount: reconnectAttempts.current,
    nextRetryIn,
    reconnect: connect,
  };
}
