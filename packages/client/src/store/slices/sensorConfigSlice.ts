import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  SensorConfigState,
  SensorDefinition,
  Automation2040WDevice,
} from '@ampmatter/shared';

const initialState: SensorConfigState = {
  sensors: [],
  automation2040wDevices: [],
};

const sensorConfigSlice = createSlice({
  name: 'sensorConfig',
  initialState,
  reducers: {
    // Sensor CRUD operations
    addSensor(state, action: PayloadAction<SensorDefinition>) {
      state.sensors.push(action.payload);
    },
    updateSensor(state, action: PayloadAction<{ id: string; updates: Partial<SensorDefinition> }>) {
      const index = state.sensors.findIndex((s) => s.id === action.payload.id);
      if (index >= 0) {
        state.sensors[index] = {
          ...state.sensors[index],
          ...action.payload.updates,
          lastModified: Date.now(),
        };
      }
    },
    removeSensor(state, action: PayloadAction<string>) {
      state.sensors = state.sensors.filter((s) => s.id !== action.payload);
    },
    toggleSensor(state, action: PayloadAction<string>) {
      const sensor = state.sensors.find((s) => s.id === action.payload);
      if (sensor) {
        sensor.enabled = !sensor.enabled;
        sensor.lastModified = Date.now();
      }
    },

    // Automation 2040W device management
    addAutomation2040WDevice(state, action: PayloadAction<Automation2040WDevice>) {
      const existing = state.automation2040wDevices.find((d) => d.id === action.payload.id);
      if (!existing) {
        state.automation2040wDevices.push(action.payload);
      }
    },
    updateAutomation2040WDevice(
      state,
      action: PayloadAction<{ id: string; updates: Partial<Automation2040WDevice> }>
    ) {
      const index = state.automation2040wDevices.findIndex((d) => d.id === action.payload.id);
      if (index >= 0) {
        state.automation2040wDevices[index] = {
          ...state.automation2040wDevices[index],
          ...action.payload.updates,
        };
      }
    },
    removeAutomation2040WDevice(state, action: PayloadAction<string>) {
      state.automation2040wDevices = state.automation2040wDevices.filter(
        (d) => d.id !== action.payload
      );
    },
    setAutomation2040WDeviceConnected(
      state,
      action: PayloadAction<{ id: string; connected: boolean }>
    ) {
      const device = state.automation2040wDevices.find((d) => d.id === action.payload.id);
      if (device) {
        device.connected = action.payload.connected;
        if (action.payload.connected) {
          device.lastSeen = Date.now();
        }
      }
    },

    // Bulk operations
    importSensors(state, action: PayloadAction<SensorDefinition[]>) {
      state.sensors = action.payload;
    },
    resetSensorConfig() {
      return initialState;
    },
  },
});

export const {
  addSensor,
  updateSensor,
  removeSensor,
  toggleSensor,
  addAutomation2040WDevice,
  updateAutomation2040WDevice,
  removeAutomation2040WDevice,
  setAutomation2040WDeviceConnected,
  importSensors,
  resetSensorConfig,
} = sensorConfigSlice.actions;

export default sensorConfigSlice.reducer;
