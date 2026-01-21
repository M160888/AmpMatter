import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NetworkState, WiFiNetwork, SavedNetwork, ConnectionSettings } from '@ampmatter/shared';

const initialState: NetworkState = {
  scanning: false,
  connecting: false,
  availableNetworks: [],
  currentNetwork: null,
  savedNetworks: [],
  lastScan: 0,
  error: null,
};

const initialConnectionSettings: ConnectionSettings = {
  signalkUrl: 'ws://localhost:3000/signalk/v1/stream?subscribe=all',
  mqttUrl: 'ws://localhost:9001',
};

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    wifi: initialState,
    connection: initialConnectionSettings,
  },
  reducers: {
    // WiFi management
    startScan(state) {
      state.wifi.scanning = true;
      state.wifi.error = null;
    },
    setScanResults(state, action: PayloadAction<WiFiNetwork[]>) {
      state.wifi.availableNetworks = action.payload;
      state.wifi.scanning = false;
      state.wifi.lastScan = Date.now();
    },
    scanFailed(state, action: PayloadAction<string>) {
      state.wifi.scanning = false;
      state.wifi.error = action.payload;
    },
    startConnect(state) {
      state.wifi.connecting = true;
      state.wifi.error = null;
    },
    connectSuccess(state, action: PayloadAction<WiFiNetwork>) {
      state.wifi.connecting = false;
      state.wifi.currentNetwork = action.payload;
      state.wifi.error = null;

      // Update saved networks
      const existingIndex = state.wifi.savedNetworks.findIndex(
        (n) => n.ssid === action.payload.ssid
      );
      if (existingIndex >= 0) {
        state.wifi.savedNetworks[existingIndex].lastConnected = Date.now();
      } else {
        state.wifi.savedNetworks.push({
          ssid: action.payload.ssid,
          autoConnect: true,
          priority: state.wifi.savedNetworks.length,
          lastConnected: Date.now(),
        });
      }
    },
    connectFailed(state, action: PayloadAction<string>) {
      state.wifi.connecting = false;
      state.wifi.error = action.payload;
    },
    disconnect(state) {
      state.wifi.currentNetwork = null;
    },
    updateSavedNetwork(state, action: PayloadAction<SavedNetwork>) {
      const index = state.wifi.savedNetworks.findIndex(
        (n) => n.ssid === action.payload.ssid
      );
      if (index >= 0) {
        state.wifi.savedNetworks[index] = action.payload;
      }
    },
    removeSavedNetwork(state, action: PayloadAction<string>) {
      state.wifi.savedNetworks = state.wifi.savedNetworks.filter(
        (n) => n.ssid !== action.payload
      );
    },
    setCurrentNetwork(state, action: PayloadAction<WiFiNetwork | null>) {
      state.wifi.currentNetwork = action.payload;
    },

    // Connection settings
    updateConnectionSettings(state, action: PayloadAction<Partial<ConnectionSettings>>) {
      state.connection = {
        ...state.connection,
        ...action.payload,
      };
    },
    resetConnectionSettings(state) {
      state.connection = initialConnectionSettings;
    },
  },
});

export const {
  startScan,
  setScanResults,
  scanFailed,
  startConnect,
  connectSuccess,
  connectFailed,
  disconnect,
  updateSavedNetwork,
  removeSavedNetwork,
  setCurrentNetwork,
  updateConnectionSettings,
  resetConnectionSettings,
} = networkSlice.actions;

export default networkSlice.reducer;
