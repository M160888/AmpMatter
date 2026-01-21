import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SensorState, TankData, TemperatureSensor, DigitalInput, ConnectionInfo } from '@ampmatter/shared';
import { initialConnectionInfo } from '@ampmatter/shared';

const initialState: SensorState = {
  connected: false,
  connectionInfo: initialConnectionInfo,
  tanks: [],
  temperatures: [],
  digitalInputs: [],
  lastUpdate: 0,
};

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
      state.connectionInfo.state = action.payload ? 'connected' : 'disconnected';
    },
    setConnectionInfo(state, action: PayloadAction<Partial<ConnectionInfo>>) {
      state.connectionInfo = { ...state.connectionInfo, ...action.payload };
      state.connected = state.connectionInfo.state === 'connected';
    },
    updateTank(state, action: PayloadAction<TankData>) {
      const index = state.tanks.findIndex((t) => t.id === action.payload.id);
      if (index >= 0) {
        state.tanks[index] = action.payload;
      } else {
        state.tanks.push(action.payload);
      }
      state.lastUpdate = Date.now();
    },
    updateTemperature(state, action: PayloadAction<TemperatureSensor>) {
      const index = state.temperatures.findIndex((t) => t.id === action.payload.id);
      if (index >= 0) {
        state.temperatures[index] = action.payload;
      } else {
        state.temperatures.push(action.payload);
      }
      state.lastUpdate = Date.now();
    },
    updateDigitalInput(state, action: PayloadAction<DigitalInput>) {
      const index = state.digitalInputs.findIndex((d) => d.id === action.payload.id);
      if (index >= 0) {
        state.digitalInputs[index] = action.payload;
      } else {
        state.digitalInputs.push(action.payload);
      }
      state.lastUpdate = Date.now();
    },
    // Handle MQTT message from Automation 2040W
    handleMqttMessage(state, action: PayloadAction<{ topic: string; payload: string }>) {
      const { topic, payload } = action.payload;
      const now = Date.now();

      // Parse topic: boat/tanks/{id}, boat/temp/{id}, boat/digital/{id}
      const parts = topic.split('/');
      if (parts.length < 3 || parts[0] !== 'boat') return;

      const type = parts[1];
      const id = parts[2];

      try {
        const value = JSON.parse(payload);

        switch (type) {
          case 'tanks': {
            const index = state.tanks.findIndex((t) => t.id === id);
            const tankData: TankData = {
              id,
              name: value.name ?? id,
              type: value.type ?? 'freshWater',
              capacity: value.capacity ?? 100,
              currentLevel: value.level ?? 0,
              rawValue: value.raw,
              lastUpdate: now,
            };
            if (index >= 0) {
              state.tanks[index] = tankData;
            } else {
              state.tanks.push(tankData);
            }
            break;
          }
          case 'temp': {
            const index = state.temperatures.findIndex((t) => t.id === id);
            const tempData: TemperatureSensor = {
              id,
              name: value.name ?? id,
              location: value.location ?? 'unknown',
              value: value.value ?? value,
              minAlarm: value.minAlarm,
              maxAlarm: value.maxAlarm,
              lastUpdate: now,
            };
            if (index >= 0) {
              state.temperatures[index] = tempData;
            } else {
              state.temperatures.push(tempData);
            }
            break;
          }
          case 'digital': {
            const index = state.digitalInputs.findIndex((d) => d.id === id);
            const digitalData: DigitalInput = {
              id,
              name: value.name ?? id,
              state: value.state ?? (value === 1 || value === true),
              inverted: value.inverted,
              lastChange: now,
            };
            if (index >= 0) {
              state.digitalInputs[index] = digitalData;
            } else {
              state.digitalInputs.push(digitalData);
            }
            break;
          }
          case 'status':
            state.connected = true;
            break;
        }

        state.lastUpdate = now;
      } catch {
        // Ignore parse errors
      }
    },
    resetState() {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setConnectionInfo,
  updateTank,
  updateTemperature,
  updateDigitalInput,
  handleMqttMessage,
  resetState,
} = sensorsSlice.actions;

export default sensorsSlice.reducer;
