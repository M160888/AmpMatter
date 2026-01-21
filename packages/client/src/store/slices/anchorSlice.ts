import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AnchorPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface AnchorState {
  // Anchor watch state
  isAnchored: boolean;
  anchorPosition: AnchorPosition | null;
  watchRadius: number; // meters
  watchEnabled: boolean;

  // Tracking
  maxDrift: number; // Maximum drift recorded (meters)
  currentDrift: number; // Current distance from anchor (meters)
  driftHistory: { timestamp: number; distance: number }[]; // Last 100 readings
  lastAlertTime: number | null; // Prevent alert spam

  // Settings
  defaultRadius: number;
  alertCooldown: number; // ms between alerts
}

const initialState: AnchorState = {
  isAnchored: false,
  anchorPosition: null,
  watchRadius: 30, // 30 meters default
  watchEnabled: false,

  maxDrift: 0,
  currentDrift: 0,
  driftHistory: [],
  lastAlertTime: null,

  defaultRadius: 30,
  alertCooldown: 60000, // 1 minute between alerts
};

const anchorSlice = createSlice({
  name: 'anchor',
  initialState,
  reducers: {
    dropAnchor(state, action: PayloadAction<{ latitude: number; longitude: number }>) {
      state.isAnchored = true;
      state.anchorPosition = {
        ...action.payload,
        timestamp: Date.now(),
      };
      state.watchEnabled = true;
      state.maxDrift = 0;
      state.currentDrift = 0;
      state.driftHistory = [];
      state.lastAlertTime = null;
    },

    raiseAnchor(state) {
      state.isAnchored = false;
      state.anchorPosition = null;
      state.watchEnabled = false;
      state.maxDrift = 0;
      state.currentDrift = 0;
      state.driftHistory = [];
      state.lastAlertTime = null;
    },

    setWatchRadius(state, action: PayloadAction<number>) {
      state.watchRadius = Math.max(10, Math.min(500, action.payload)); // 10-500m range
    },

    setWatchEnabled(state, action: PayloadAction<boolean>) {
      state.watchEnabled = action.payload;
    },

    updateDrift(state, action: PayloadAction<number>) {
      const distance = action.payload;
      state.currentDrift = distance;

      if (distance > state.maxDrift) {
        state.maxDrift = distance;
      }

      // Add to history (keep last 100)
      state.driftHistory.push({
        timestamp: Date.now(),
        distance,
      });
      if (state.driftHistory.length > 100) {
        state.driftHistory = state.driftHistory.slice(-100);
      }
    },

    setLastAlertTime(state, action: PayloadAction<number>) {
      state.lastAlertTime = action.payload;
    },

    setDefaultRadius(state, action: PayloadAction<number>) {
      state.defaultRadius = Math.max(10, Math.min(500, action.payload));
    },

    setAlertCooldown(state, action: PayloadAction<number>) {
      state.alertCooldown = action.payload;
    },
  },
});

export const {
  dropAnchor,
  raiseAnchor,
  setWatchRadius,
  setWatchEnabled,
  updateDrift,
  setLastAlertTime,
  setDefaultRadius,
  setAlertCooldown,
} = anchorSlice.actions;

export default anchorSlice.reducer;

// Utility: Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
