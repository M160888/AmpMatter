import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setConnected, setConnectionInfo, handleMqttMessage } from '../store/slices/sensorsSlice';
import { updateBatteryType } from '../store/slices/victronSlice';
import type { BatteryType } from '@ampmatter/shared';
import { useMqttConnection } from './useMqttConnection';

export function useSensorData() {
  const dispatch = useAppDispatch();
  const mqttUrl = useAppSelector((state) => state.settings.mqttUrl);

  const { state, connected, retryCount, lastError, subscribe, reconnect } = useMqttConnection({
    url: mqttUrl,
    clientId: `ampmatter-sensors-${Math.random().toString(16).slice(2, 8)}`,
    onConnect: async () => {
      dispatch(setConnected(true));

      try {
        // Subscribe to boat sensor topics
        await subscribe('boat/#');
        console.log('Subscribed to boat sensor topics');

        // Subscribe to Victron battery type (for auto-detection)
        await subscribe('N/+/battery/Type');
        console.log('Subscribed to Victron battery type');
      } catch (err) {
        console.error('MQTT subscribe error:', err);
      }
    },
    onMessage: (topic, payload) => {
      // Handle battery type detection from Victron
      // Topic format: N/{portal-id}/battery/Type
      if (topic.includes('/battery/Type')) {
        try {
          const typeValue = parseInt(payload, 10);
          // Venus OS battery type enum: 0=Lead-acid, 1=AGM, 2=Gel, 3=LiFePO4
          const batteryTypeMap: Record<number, BatteryType> = {
            0: 'lead-acid',
            1: 'agm',
            2: 'gel',
            3: 'lifepo4',
          };
          const batteryType = batteryTypeMap[typeValue] || 'unknown';
          dispatch(updateBatteryType(batteryType));
          console.log(`Battery type detected: ${batteryType} (${typeValue})`);
        } catch (error) {
          console.error('Failed to parse battery type:', error);
        }
      }

      // Handle regular sensor messages
      dispatch(handleMqttMessage({
        topic,
        payload,
      }));
    },
    onDisconnect: () => {
      dispatch(setConnected(false));
    },
    onError: (error) => {
      console.error('Sensor MQTT error:', error);
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

  return {
    reconnect,
  };
}
