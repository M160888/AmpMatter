import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BarometricPressure } from '@ampmatter/shared';

export interface WeatherState {
  barometricPressure: BarometricPressure | null;
  lastUpdate: number;
}

const initialState: WeatherState = {
  barometricPressure: null,
  lastUpdate: Date.now(),
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    updatePressure: (state, action: PayloadAction<BarometricPressure>) => {
      state.barometricPressure = action.payload;
      state.lastUpdate = Date.now();
    },

    handleWeatherMqttMessage: (state, action: PayloadAction<{ topic: string; payload: string }>) => {
      const { topic, payload } = action.payload;

      try {
        if (topic === 'boat/weather/pressure') {
          const data = JSON.parse(payload) as { value: number; trend?: 'rising' | 'steady' | 'falling' };
          state.barometricPressure = {
            value: data.value,
            trend: data.trend,
            lastUpdate: Date.now(),
          };
          state.lastUpdate = Date.now();
        }
      } catch (error) {
        console.error('Error parsing weather MQTT message:', error);
      }
    },

    resetWeather: (state) => {
      state.barometricPressure = null;
      state.lastUpdate = Date.now();
    },
  },
});

export const { updatePressure, handleWeatherMqttMessage, resetWeather } = weatherSlice.actions;

export default weatherSlice.reducer;
