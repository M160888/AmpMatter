import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updatePosition, updateNavigation } from '../store/slices/navigationSlice';
import { useMqttConnection } from './useMqttConnection';

/**
 * Hook to receive GPS data over MQTT network connection
 *
 * MQTT Topic Structure:
 * - gps/position        - {"latitude": 37.7749, "longitude": -122.4194, "altitude": 10}
 * - gps/course          - Course over ground in degrees (0-360)
 * - gps/speed           - Speed over ground in knots
 * - gps/heading         - Magnetic heading in degrees
 *
 * This allows GPS data from:
 * - Mobile phone apps publishing to MQTT
 * - Standalone GPS devices
 * - NMEA-to-MQTT bridges
 * - Remote GPS servers
 */
export function useNetworkGPS() {
  const dispatch = useAppDispatch();
  const mqttUrl = useAppSelector((state) => state.settings.mqttUrl);
  const gpsEnabled = useAppSelector((state) => state.settings.gpsSettings?.networkGpsEnabled ?? false);
  const gpsTopic = useAppSelector((state) => state.settings.gpsSettings?.mqttTopicPrefix ?? 'gps');

  const { state, connected, retryCount, lastError, subscribe } = useMqttConnection({
    url: mqttUrl,
    clientId: `ampmatter-gps-${Math.random().toString(16).slice(2, 8)}`,
    onConnect: async () => {
      if (!gpsEnabled) {
        console.log('Network GPS is disabled in settings');
        return;
      }

      try {
        // Subscribe to all GPS topics
        await subscribe(`${gpsTopic}/#`);
        console.log(`Subscribed to network GPS topics: ${gpsTopic}/#`);
      } catch (err) {
        console.error('MQTT GPS subscribe error:', err);
      }
    },
    onMessage: (topic, payload) => {
      if (!gpsEnabled) return;

      try {
        // Parse topic to determine data type
        const topicParts = topic.split('/');
        const dataType = topicParts[topicParts.length - 1];

        switch (dataType) {
          case 'position': {
            const data = JSON.parse(payload);
            if (data.latitude !== undefined && data.longitude !== undefined) {
              dispatch(updatePosition({
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.altitude,
              }));
              console.log(`Network GPS position: ${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`);
            }
            break;
          }

          case 'course': {
            const courseOverGround = parseFloat(payload);
            if (!isNaN(courseOverGround)) {
              dispatch(updateNavigation({ courseOverGround }));
            }
            break;
          }

          case 'speed': {
            const speedOverGround = parseFloat(payload);
            if (!isNaN(speedOverGround)) {
              dispatch(updateNavigation({ speedOverGround }));
            }
            break;
          }

          case 'heading': {
            const headingMagnetic = parseFloat(payload);
            if (!isNaN(headingMagnetic)) {
              dispatch(updateNavigation({ headingMagnetic }));
            }
            break;
          }

          case 'depth': {
            const depthData = JSON.parse(payload);
            dispatch(updateNavigation({
              depth: {
                belowTransducer: depthData.belowTransducer || depthData.value || depthData,
                belowKeel: depthData.belowKeel,
                belowSurface: depthData.belowSurface,
              },
            }));
            break;
          }

          case 'wind': {
            const windData = JSON.parse(payload);
            dispatch(updateNavigation({
              wind: {
                speedApparent: windData.speedApparent || windData.speed || 0,
                angleApparent: windData.angleApparent || windData.angle || 0,
                speedTrue: windData.speedTrue,
                angleTrue: windData.angleTrue,
              },
            }));
            break;
          }

          default:
            // Ignore unknown topics
            break;
        }
      } catch (err) {
        console.error(`Failed to parse network GPS message from ${topic}:`, err);
      }
    },
    onDisconnect: () => {
      console.log('Network GPS MQTT disconnected');
    },
    onError: (error) => {
      console.error('Network GPS MQTT error:', error);
    },
  });

  // Don't connect if network GPS is disabled
  useEffect(() => {
    if (!gpsEnabled) {
      console.log('Network GPS is disabled, skipping MQTT connection');
    }
  }, [gpsEnabled]);

  return {
    enabled: gpsEnabled,
    connected,
    state,
    retryCount,
    lastError,
  };
}
