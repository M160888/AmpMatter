import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setMultiplusMode, setConnected, setConnectionInfo } from '../store/slices/victronSlice';
import type { MultiplusMode } from '@ampmatter/shared';
import { useMqttConnection } from './useMqttConnection';

// Venus OS Mode values
const MODE_VALUES: Record<MultiplusMode, number> = {
  charger_only: 1,
  inverter_only: 2,
  on: 3,
  off: 4,
};

export function useVictronControl() {
  const dispatch = useAppDispatch();
  const mqttUrl = useAppSelector((state) => state.settings.mqttUrl);
  const { mqttTopicPrefix, vebusInstance } = useAppSelector(
    (state) => state.settings.victronSettings
  );

  // Connect to MQTT for Victron control
  const { state, connected, retryCount, lastError, publish } = useMqttConnection({
    url: mqttUrl,
    clientId: `ampmatter-victron-${Math.random().toString(16).slice(2, 8)}`,
    onConnect: () => {
      console.log('Victron MQTT control connected');
      dispatch(setConnected(true));
    },
    onDisconnect: () => {
      console.log('Victron MQTT control disconnected');
      dispatch(setConnected(false));
    },
    onError: (error) => {
      console.error('Victron MQTT control error:', error);
      dispatch(setConnected(false));
    },
  });

  // Update connection status when it changes
  useEffect(() => {
    dispatch(setConnected(connected));
    dispatch(setConnectionInfo({
      state,
      retryCount,
      lastError: lastError?.message,
    }));
  }, [connected, state, retryCount, lastError, dispatch]);

  // Function to set MultiPlus mode
  const setMode = useCallback(async (mode: MultiplusMode) => {
    if (!connected) {
      console.error('MQTT client not connected for Victron control');
      return;
    }

    // Venus OS topic format: W/{portalId}/vebus/{instance}/Mode
    const topic = `${mqttTopicPrefix}/vebus/${vebusInstance}/Mode`;
    const value = MODE_VALUES[mode];

    // Venus OS expects JSON payload: {"value": <number>}
    const payload = JSON.stringify({ value });

    try {
      await publish(topic, payload, 1);
      console.log(`MultiPlus mode set to ${mode} (${value}) via ${topic}`);
      // Update local state optimistically
      dispatch(setMultiplusMode(mode));
    } catch (err) {
      console.error(`Failed to set MultiPlus mode to ${mode}:`, err);
    }
  }, [mqttTopicPrefix, vebusInstance, dispatch, connected, publish]);

  return { setMode };
}
