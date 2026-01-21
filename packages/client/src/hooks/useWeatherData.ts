import { useAppDispatch, useAppSelector } from '../store';
import { handleWeatherMqttMessage } from '../store/slices/weatherSlice';
import { useMqttConnection } from './useMqttConnection';

export function useWeatherData() {
  const dispatch = useAppDispatch();
  const mqttUrl = useAppSelector((state) => state.settings.mqttUrl);

  const { subscribe } = useMqttConnection({
    url: mqttUrl,
    clientId: `ampmatter-weather-${Math.random().toString(16).slice(2, 8)}`,
    onConnect: async () => {
      console.log('Weather MQTT connected');

      // Subscribe to weather topics
      const topics = [
        'boat/weather/pressure',
        'boat/weather/temperature',
        'boat/weather/humidity',
      ];

      for (const topic of topics) {
        try {
          await subscribe(topic);
          console.log(`Subscribed to ${topic}`);
        } catch (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        }
      }
    },
    onMessage: (topic, payload) => {
      dispatch(handleWeatherMqttMessage({
        topic,
        payload,
      }));
    },
    onDisconnect: () => {
      console.log('Weather MQTT disconnected');
    },
    onError: (error) => {
      console.error('Weather MQTT error:', error);
    },
  });
}
