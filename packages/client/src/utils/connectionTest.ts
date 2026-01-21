/**
 * Connection testing utilities
 */

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Validate WebSocket URL format
 */
export function validateWebSocketUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  const trimmedUrl = url.trim();

  // Check if it starts with ws:// or wss://
  if (!trimmedUrl.startsWith('ws://') && !trimmedUrl.startsWith('wss://')) {
    return { valid: false, error: 'URL must start with ws:// or wss://' };
  }

  // Try to parse as URL
  try {
    const parsed = new URL(trimmedUrl);
    if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
      return { valid: false, error: 'Invalid WebSocket protocol' };
    }
    if (!parsed.hostname) {
      return { valid: false, error: 'URL must include a hostname' };
    }
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
}

/**
 * Test SignalK WebSocket connection
 */
export async function testSignalKConnection(url: string, timeoutMs = 5000): Promise<ConnectionTestResult> {
  // Validate URL first
  const validation = validateWebSocketUrl(url);
  if (!validation.valid) {
    return {
      success: false,
      message: 'Connection failed',
      error: validation.error,
    };
  }

  return new Promise((resolve) => {
    let ws: WebSocket | null = null;
    let timeoutId: number | null = null;
    let resolved = false;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    };

    const resolveOnce = (result: ConnectionTestResult) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(result);
      }
    };

    // Set timeout
    timeoutId = window.setTimeout(() => {
      resolveOnce({
        success: false,
        message: 'Connection timeout',
        error: `Failed to connect within ${timeoutMs / 1000} seconds`,
      });
    }, timeoutMs);

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        resolveOnce({
          success: true,
          message: 'Connection successful',
        });
      };

      ws.onerror = () => {
        resolveOnce({
          success: false,
          message: 'Connection failed',
          error: 'Unable to establish WebSocket connection',
        });
      };

      ws.onclose = () => {
        if (!resolved) {
          resolveOnce({
            success: false,
            message: 'Connection failed',
            error: 'WebSocket closed before connection established',
          });
        }
      };
    } catch (err) {
      resolveOnce({
        success: false,
        message: 'Connection failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}

/**
 * Test MQTT WebSocket connection
 */
export async function testMqttConnection(url: string, timeoutMs = 5000): Promise<ConnectionTestResult> {
  // Validate URL first
  const validation = validateWebSocketUrl(url);
  if (!validation.valid) {
    return {
      success: false,
      message: 'Connection failed',
      error: validation.error,
    };
  }

  // MQTT over WebSocket test - similar to SignalK but we just test the WebSocket connection
  // Full MQTT protocol handshake would require the mqtt.js library
  return new Promise((resolve) => {
    let ws: WebSocket | null = null;
    let timeoutId: number | null = null;
    let resolved = false;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    };

    const resolveOnce = (result: ConnectionTestResult) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(result);
      }
    };

    // Set timeout
    timeoutId = window.setTimeout(() => {
      resolveOnce({
        success: false,
        message: 'Connection timeout',
        error: `Failed to connect within ${timeoutMs / 1000} seconds`,
      });
    }, timeoutMs);

    try {
      ws = new WebSocket(url, 'mqtt');

      ws.onopen = () => {
        resolveOnce({
          success: true,
          message: 'Connection successful',
        });
      };

      ws.onerror = () => {
        resolveOnce({
          success: false,
          message: 'Connection failed',
          error: 'Unable to establish WebSocket connection',
        });
      };

      ws.onclose = () => {
        if (!resolved) {
          resolveOnce({
            success: false,
            message: 'Connection failed',
            error: 'WebSocket closed before connection established',
          });
        }
      };
    } catch (err) {
      resolveOnce({
        success: false,
        message: 'Connection failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}
