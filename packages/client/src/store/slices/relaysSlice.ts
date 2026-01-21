import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RelayConfig, RelayState, DEFAULT_RELAYS } from '@ampmatter/shared';

export interface RelaysState {
  connected: boolean;
  relays: Record<string, RelayState>;
  configs: RelayConfig[];
  lastUpdate: number;
}

const initialState: RelaysState = {
  connected: false,
  relays: {},
  configs: DEFAULT_RELAYS,
  lastUpdate: Date.now(),
};

const relaysSlice = createSlice({
  name: 'relays',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },

    updateRelayState: (state, action: PayloadAction<{ id: string; relayState: boolean }>) => {
      const { id, relayState } = action.payload;
      state.relays[id] = {
        id,
        state: relayState,
        lastChanged: Date.now(),
      };
      state.lastUpdate = Date.now();
    },

    updateRelayConfig: (state, action: PayloadAction<{ id: string; config: Partial<RelayConfig> }>) => {
      const { id, config } = action.payload;
      const index = state.configs.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.configs[index] = { ...state.configs[index], ...config };
      }
    },

    setRelayConfigs: (state, action: PayloadAction<RelayConfig[]>) => {
      state.configs = action.payload;
    },

    handleRelayMqttMessage: (state, action: PayloadAction<{ topic: string; payload: string }>) => {
      const { topic, payload } = action.payload;

      // Parse topic: boat/relays/{id}/state
      const match = topic.match(/boat\/relays\/([^/]+)\/state/);
      if (match) {
        const id = match[1];
        const relayState = payload === '1' || payload === 'true' || payload === 'on';

        state.relays[id] = {
          id,
          state: relayState,
          lastChanged: Date.now(),
        };
        state.lastUpdate = Date.now();
      }
    },

    initializeRelays: (state) => {
      // Initialize relay states from configs
      state.configs.forEach((config) => {
        if (!state.relays[config.id]) {
          state.relays[config.id] = {
            id: config.id,
            state: false,
            lastChanged: Date.now(),
          };
        }
      });
    },

    resetRelays: (state) => {
      state.connected = false;
      state.relays = {};
      state.configs = DEFAULT_RELAYS;
      state.lastUpdate = Date.now();
    },
  },
});

export const {
  setConnected,
  updateRelayState,
  updateRelayConfig,
  setRelayConfigs,
  handleRelayMqttMessage,
  initializeRelays,
  resetRelays,
} = relaysSlice.actions;

export default relaysSlice.reducer;
