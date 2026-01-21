import { useEffect, useRef, useCallback, useState } from 'react';
import mqtt, { MqttClient, IClientOptions } from 'mqtt';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface MqttConnectionOptions {
  url: string;
  clientId: string;
  onConnect?: (client: MqttClient) => void;
  onMessage?: (topic: string, payload: string) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface MqttConnectionState {
  state: ConnectionState;
  client: MqttClient | null;
  retryCount: number;
  lastError: Error | null;
}

const MIN_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 1.5;

/**
 * Enhanced MQTT connection hook with exponential backoff and detailed state tracking.
 * Provides robust reconnection handling for unreliable network environments.
 */
export function useMqttConnection(options: MqttConnectionOptions) {
  const { url, clientId, onConnect, onMessage, onDisconnect, onError } = options;

  const clientRef = useRef<MqttClient | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const isManualDisconnectRef = useRef(false);

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [lastError, setLastError] = useState<Error | null>(null);

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback((retryCount: number): number => {
    const delay = Math.min(
      MIN_RECONNECT_DELAY * Math.pow(BACKOFF_MULTIPLIER, retryCount),
      MAX_RECONNECT_DELAY
    );
    return delay;
  }, []);

  // Connect to MQTT broker
  const connect = useCallback(() => {
    // Don't reconnect if we're manually disconnected
    if (isManualDisconnectRef.current) {
      return;
    }

    // Don't create multiple connections
    if (clientRef.current?.connected) {
      return;
    }

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionState(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const mqttOptions: IClientOptions = {
        clientId,
        reconnectPeriod: 0, // We handle reconnection manually for better control
        connectTimeout: 10000,
        keepalive: 30,
        clean: true,
      };

      const client = mqtt.connect(url, mqttOptions);
      clientRef.current = client;

      client.on('connect', () => {
        console.log(`MQTT connected: ${clientId}`);
        setConnectionState('connected');
        setLastError(null);
        retryCountRef.current = 0; // Reset retry count on successful connection

        if (onConnect) {
          onConnect(client);
        }
      });

      client.on('message', (topic, payload) => {
        if (onMessage) {
          onMessage(topic, payload.toString());
        }
      });

      client.on('close', () => {
        console.log(`MQTT disconnected: ${clientId}`);

        if (!isManualDisconnectRef.current) {
          setConnectionState('disconnected');

          if (onDisconnect) {
            onDisconnect();
          }

          // Schedule reconnection with exponential backoff
          const delay = getReconnectDelay(retryCountRef.current);
          console.log(`MQTT reconnecting in ${delay}ms (attempt ${retryCountRef.current + 1})`);

          reconnectTimeoutRef.current = window.setTimeout(() => {
            retryCountRef.current++;
            connect();
          }, delay);
        }
      });

      client.on('error', (error) => {
        console.error(`MQTT error (${clientId}):`, error);
        setConnectionState('error');
        setLastError(error);

        if (onError) {
          onError(error);
        }
      });

      client.on('offline', () => {
        console.log(`MQTT offline: ${clientId}`);
        setConnectionState('disconnected');
      });

    } catch (error) {
      console.error(`Failed to create MQTT client (${clientId}):`, error);
      const err = error instanceof Error ? error : new Error(String(error));
      setConnectionState('error');
      setLastError(err);

      // Retry connection after delay
      const delay = getReconnectDelay(retryCountRef.current);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        retryCountRef.current++;
        connect();
      }, delay);
    }
  }, [url, clientId, onConnect, onMessage, onDisconnect, onError, getReconnectDelay]);

  // Disconnect from MQTT broker
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      if (clientRef.current.connected) {
        clientRef.current.end(false, () => {
          console.log(`MQTT manually disconnected: ${clientId}`);
        });
      }
      clientRef.current = null;
    }

    setConnectionState('disconnected');
    retryCountRef.current = 0;
  }, [clientId]);

  // Manually trigger reconnection
  const reconnect = useCallback(() => {
    disconnect();
    isManualDisconnectRef.current = false;
    retryCountRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Publish message
  const publish = useCallback((topic: string, payload: string, qos: 0 | 1 | 2 = 1): Promise<void> => {
    return new Promise((resolve, reject) => {
      const client = clientRef.current;

      if (!client || !client.connected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      client.publish(topic, payload, { qos }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }, []);

  // Subscribe to topics
  const subscribe = useCallback((topic: string | string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const client = clientRef.current;

      if (!client || !client.connected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      client.subscribe(topic, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    isManualDisconnectRef.current = false;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    state: connectionState,
    client: clientRef.current,
    retryCount: retryCountRef.current,
    lastError,
    connected: connectionState === 'connected',
    reconnect,
    disconnect,
    publish,
    subscribe,
  };
}
