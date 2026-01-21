import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ThemeSetting } from '../../styles/theme';
import type { BatteryType } from '@ampmatter/shared';

interface SettingsState {
  theme: ThemeSetting;
  signalkUrl: string;
  mqttUrl: string;
  mapSettings: {
    autoCenter: boolean;
    showTrack: boolean;
    trackLength: number; // Number of points to keep
  };
  alarms: {
    lowBattery: number; // SOC percentage
    shallowDepth: number; // Meters
    highTemp: number; // Celsius
  };
  viewSettings: {
    navigationViewMapRatio: number; // 0.75-0.8 (75-80% map) - DEPRECATED: use infoPanelHeight instead
    infoPanelHeight: number; // Height of info panel in pixels (100-400)
    showSunTimes: boolean;
    showBarometer: boolean;
    speedUnit: 'kn' | 'km/h' | 'mph' | 'm/s'; // Speed display unit
  };
  relaySettings: {
    mqttTopicPrefix: string; // e.g., 'boat/relays'
  };
  victronSettings: {
    mqttTopicPrefix: string; // Venus OS portal ID prefix, e.g., 'W/venusdevice123'
    vebusInstance: number; // VE.Bus instance ID (usually 276 for MultiPlus)
  };
  batterySettings: {
    batteryType: 'auto' | BatteryType;
    socThresholds: {
      leadAcid: { green: number; orange: number }; // percentages
      lifepo4: { green: number; orange: number };
    };
  };
  displaySettings: {
    brightness: number; // 0-100
    autoDimEnabled: boolean;
    autoDimTimeout: number; // seconds before dimming
    dimmedBrightness: number; // 0-100 brightness when dimmed
    screenOffEnabled: boolean; // Allow screen to turn off completely
    screenOffTimeout: number; // seconds after dimming before screen off
  };
  gpsSettings: {
    signalkGpsEnabled: boolean; // Enable GPS from SignalK WebSocket
    networkGpsEnabled: boolean; // Enable GPS from MQTT network source
    mqttTopicPrefix: string; // MQTT topic prefix for GPS data (e.g., 'gps')
    gpsPriority: 'signalk' | 'network' | 'both'; // Which source to prefer
  };
}

const initialState: SettingsState = {
  theme: 'day',
  signalkUrl: 'ws://localhost:3000/signalk/v1/stream?subscribe=all',
  mqttUrl: 'ws://localhost:9001', // Mosquitto WebSocket port
  mapSettings: {
    autoCenter: true,
    showTrack: true,
    trackLength: 1000,
  },
  alarms: {
    lowBattery: 20,
    shallowDepth: 3,
    highTemp: 90,
  },
  viewSettings: {
    navigationViewMapRatio: 0.75, // 75% map, 25% info panel - DEPRECATED
    infoPanelHeight: 160, // Default height for info panel (2 rows of gauges)
    showSunTimes: true,
    showBarometer: true,
    speedUnit: 'kn', // Default to knots for marine use
  },
  relaySettings: {
    mqttTopicPrefix: 'boat/relays',
  },
  victronSettings: {
    mqttTopicPrefix: 'W/venus', // Default prefix - configure with actual portal ID
    vebusInstance: 276, // Default MultiPlus instance
  },
  batterySettings: {
    batteryType: 'auto', // Auto-detect from Victron
    socThresholds: {
      leadAcid: { green: 80, orange: 65 },
      lifepo4: { green: 70, orange: 30 },
    },
  },
  displaySettings: {
    brightness: 100,
    autoDimEnabled: true,
    autoDimTimeout: 60, // 1 minute
    dimmedBrightness: 30,
    screenOffEnabled: false,
    screenOffTimeout: 300, // 5 minutes after dimming
  },
  gpsSettings: {
    signalkGpsEnabled: true, // SignalK GPS enabled by default
    networkGpsEnabled: false, // Network GPS disabled by default
    mqttTopicPrefix: 'gps', // Default MQTT topic prefix
    gpsPriority: 'signalk', // Prefer SignalK by default
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeSetting>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      // Cycle through: day -> night -> auto -> day
      if (state.theme === 'day') {
        state.theme = 'night';
      } else if (state.theme === 'night') {
        state.theme = 'auto';
      } else {
        state.theme = 'day';
      }
    },
    setSignalkUrl(state, action: PayloadAction<string>) {
      state.signalkUrl = action.payload;
    },
    setMqttUrl(state, action: PayloadAction<string>) {
      state.mqttUrl = action.payload;
    },
    updateMapSettings(state, action: PayloadAction<Partial<SettingsState['mapSettings']>>) {
      state.mapSettings = { ...state.mapSettings, ...action.payload };
    },
    updateAlarms(state, action: PayloadAction<Partial<SettingsState['alarms']>>) {
      state.alarms = { ...state.alarms, ...action.payload };
    },
    updateViewSettings(state, action: PayloadAction<Partial<SettingsState['viewSettings']>>) {
      state.viewSettings = { ...state.viewSettings, ...action.payload };
    },
    updateRelaySettings(state, action: PayloadAction<Partial<SettingsState['relaySettings']>>) {
      state.relaySettings = { ...state.relaySettings, ...action.payload };
    },
    updateVictronSettings(state, action: PayloadAction<Partial<SettingsState['victronSettings']>>) {
      state.victronSettings = { ...state.victronSettings, ...action.payload };
    },
    updateBatterySettings(state, action: PayloadAction<Partial<SettingsState['batterySettings']>>) {
      state.batterySettings = { ...state.batterySettings, ...action.payload };
    },
    setBatteryType(state, action: PayloadAction<'auto' | BatteryType>) {
      state.batterySettings.batteryType = action.payload;
    },
    updateDisplaySettings(state, action: PayloadAction<Partial<SettingsState['displaySettings']>>) {
      state.displaySettings = { ...state.displaySettings, ...action.payload };
    },
    setBrightness(state, action: PayloadAction<number>) {
      state.displaySettings.brightness = Math.max(10, Math.min(100, action.payload));
    },
    updateGpsSettings(state, action: PayloadAction<Partial<SettingsState['gpsSettings']>>) {
      state.gpsSettings = { ...state.gpsSettings, ...action.payload };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSignalkUrl,
  setMqttUrl,
  updateMapSettings,
  updateAlarms,
  updateViewSettings,
  updateRelaySettings,
  updateVictronSettings,
  updateBatterySettings,
  setBatteryType,
  updateDisplaySettings,
  setBrightness,
  updateGpsSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
