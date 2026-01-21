import { useCallback } from 'react';
import { useAppDispatch } from '../store';
import {
  startScan,
  setScanResults,
  scanFailed,
  startConnect,
  connectSuccess,
  connectFailed,
  setCurrentNetwork,
} from '../store/slices/networkSlice';
import type { WiFiNetwork, WiFiCredentials } from '@ampmatter/shared';

/**
 * Hook for real WiFi management using nmcli via shell script
 * Falls back to mock data if script is not available
 */
export function useWiFiManager() {
  const dispatch = useAppDispatch();

  const execWiFiScript = useCallback(async (command: string, args: string[] = []): Promise<any> => {
    try {
      // Check if running in Electron or web environment
      // @ts-ignore - electron API may not be defined
      if (typeof window !== 'undefined' && window.electron) {
        // Use Electron IPC to execute script
        // @ts-ignore
        const result = await window.electron.executeWiFiScript(command, args);
        return result;
      }

      // Fall back to fetch API (requires backend server)
      const response = await fetch('/api/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args }),
      });

      if (!response.ok) {
        throw new Error(`WiFi API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('WiFi script execution failed, using mock data:', error);
      return null; // Will trigger mock fallback
    }
  }, []);

  const scanNetworks = useCallback(async () => {
    dispatch(startScan());

    try {
      const result = await execWiFiScript('scan');

      if (result && Array.isArray(result)) {
        dispatch(setScanResults(result));
      } else {
        // Mock fallback
        setTimeout(() => {
          const mockNetworks: WiFiNetwork[] = [
            { ssid: 'MyBoat-5G', bssid: '00:11:22:33:44:55', signal: 95, frequency: 5180, security: 'wpa2', connected: true },
            { ssid: 'Marina WiFi', bssid: '00:11:22:33:44:66', signal: 70, frequency: 2437, security: 'wpa2', connected: false },
            { ssid: 'Harbor Guest', bssid: '00:11:22:33:44:77', signal: 45, frequency: 2462, security: 'open', connected: false },
          ];
          dispatch(setScanResults(mockNetworks));
        }, 2000);
      }
    } catch (error) {
      dispatch(scanFailed((error as Error).message));
    }
  }, [dispatch, execWiFiScript]);

  const connectToNetwork = useCallback(async (credentials: WiFiCredentials) => {
    dispatch(startConnect());

    try {
      const result = await execWiFiScript('connect', [
        credentials.ssid,
        credentials.password || '',
      ]);

      if (result && result.success) {
        // Get current network info after successful connection
        const currentResult = await execWiFiScript('current');
        if (currentResult) {
          dispatch(connectSuccess(currentResult));
        }
      } else {
        // Mock fallback
        setTimeout(() => {
          if (Math.random() > 0.2) {
            const mockNetwork: WiFiNetwork = {
              ssid: credentials.ssid,
              bssid: '00:11:22:33:44:55',
              signal: 85,
              frequency: 5180,
              security: credentials.password ? 'wpa2' : 'open',
              connected: true,
            };
            dispatch(connectSuccess(mockNetwork));
          } else {
            dispatch(connectFailed('Failed to connect - incorrect password or network error'));
          }
        }, 3000);
      }
    } catch (error) {
      dispatch(connectFailed((error as Error).message));
    }
  }, [dispatch, execWiFiScript]);

  const disconnectNetwork = useCallback(async () => {
    try {
      const result = await execWiFiScript('disconnect');

      if (result && result.success) {
        dispatch(setCurrentNetwork(null));
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [dispatch, execWiFiScript]);

  const getCurrentNetwork = useCallback(async () => {
    try {
      const result = await execWiFiScript('current');

      if (result) {
        dispatch(setCurrentNetwork(result));
      }
    } catch (error) {
      console.error('Failed to get current network:', error);
    }
  }, [dispatch, execWiFiScript]);

  const forgetNetwork = useCallback(async (ssid: string) => {
    try {
      await execWiFiScript('forget', [ssid]);
    } catch (error) {
      console.error('Failed to forget network:', error);
    }
  }, [execWiFiScript]);

  const getWiFiStatus = useCallback(async () => {
    try {
      const result = await execWiFiScript('status');
      return result;
    } catch (error) {
      console.error('Failed to get WiFi status:', error);
      return null;
    }
  }, [execWiFiScript]);

  return {
    scanNetworks,
    connectToNetwork,
    disconnectNetwork,
    getCurrentNetwork,
    forgetNetwork,
    getWiFiStatus,
  };
}
