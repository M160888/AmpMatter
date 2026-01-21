import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setConnected, handleRelayMqttMessage, initializeRelays, updateRelayState } from '../store/slices/relaysSlice';
import { useMqttConnection } from './useMqttConnection';

export function useRelayControl() {
  const dispatch = useAppDispatch();
  const mqttUrl = useAppSelector((state) => state.settings.mqttUrl);
  const topicPrefix = useAppSelector((state) => state.settings.relaySettings.mqttTopicPrefix);

  // Initialize relay states
  useEffect(() => {
    dispatch(initializeRelays());
  }, [dispatch]);

  // Connect to MQTT and subscribe to relay state topics
  const { connected, publish, subscribe } = useMqttConnection({
    url: mqttUrl,
    clientId: `ampmatter-relays-${Math.random().toString(16).slice(2, 8)}`,
    onConnect: async () => {
      dispatch(setConnected(true));

      try {
        // Subscribe to all relay state topics
        const stateTopic = `${topicPrefix}/+/state`;
        await subscribe(stateTopic);
        console.log(`Subscribed to relay states: ${stateTopic}`);
      } catch (err) {
        console.error('Failed to subscribe to relay states:', err);
      }
    },
    onMessage: (topic, payload) => {
      dispatch(handleRelayMqttMessage({
        topic,
        payload,
      }));
    },
    onDisconnect: () => {
      dispatch(setConnected(false));
    },
    onError: (error) => {
      console.error('Relay MQTT error:', error);
      dispatch(setConnected(false));
    },
  });

  // Update connection status when it changes
  useEffect(() => {
    dispatch(setConnected(connected));
  }, [connected, dispatch]);

  // Store reference to dispatch for access in callback
  const stateRef = useRef<Record<string, { state: boolean }>>({});
  const relayStates = useAppSelector((state) => state.relays.relays);

  // Update ref when state changes (doesn't trigger re-renders)
  useEffect(() => {
    stateRef.current = relayStates;
  }, [relayStates]);

  // Function to toggle relay
  const toggleRelay = useCallback(async (id: string) => {
    // Get current state from ref (always up to date)
    const currentState = stateRef.current[id]?.state || false;
    const newState = !currentState;

    // Optimistic update - update UI immediately
    dispatch(updateRelayState({ id, relayState: newState }));

    if (!connected) {
      console.warn('MQTT client not connected - visual update only');
      return;
    }

    // Publish to relay set topic
    const setTopic = `${topicPrefix}/${id}/set`;
    const payload = newState ? '1' : '0';

    try {
      await publish(setTopic, payload, 1);
      console.log(`Relay ${id} set to ${newState ? 'ON' : 'OFF'}`);
    } catch (err) {
      console.error(`Failed to publish relay command to ${setTopic}:`, err);
      // Revert optimistic update on error
      dispatch(updateRelayState({ id, relayState: currentState }));
    }
  }, [topicPrefix, dispatch, connected, publish]);

  return { toggleRelay };
}
