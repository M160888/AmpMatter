/**
 * Connection state for network connections (MQTT, WebSocket, etc.)
 */
export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

/**
 * Detailed connection information including retry state
 */
export interface ConnectionInfo {
  state: ConnectionState;
  retryCount: number;
  nextRetryIn: number; // milliseconds until next retry attempt
  lastError?: string;
}

/**
 * Default/initial connection info
 */
export const initialConnectionInfo: ConnectionInfo = {
  state: 'idle',
  retryCount: 0,
  nextRetryIn: 0,
};
