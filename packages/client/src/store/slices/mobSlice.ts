import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MOBPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
  name?: string; // Optional label
}

interface MOBState {
  active: boolean;
  position: MOBPosition | null;
  history: MOBPosition[]; // Keep last 10 MOB positions
}

const initialState: MOBState = {
  active: false,
  position: null,
  history: [],
};

const mobSlice = createSlice({
  name: 'mob',
  initialState,
  reducers: {
    activateMOB(state, action: PayloadAction<{ latitude: number; longitude: number }>) {
      const mobPosition: MOBPosition = {
        ...action.payload,
        timestamp: Date.now(),
      };

      state.active = true;
      state.position = mobPosition;

      // Add to history
      state.history.unshift(mobPosition);
      if (state.history.length > 10) {
        state.history = state.history.slice(0, 10);
      }
    },

    deactivateMOB(state) {
      state.active = false;
      // Keep position in history but clear active state
      state.position = null;
    },

    updateMOBName(state, action: PayloadAction<string>) {
      if (state.position) {
        state.position.name = action.payload;
      }
    },

    clearHistory(state) {
      state.history = [];
    },
  },
});

export const {
  activateMOB,
  deactivateMOB,
  updateMOBName,
  clearHistory,
} = mobSlice.actions;

export default mobSlice.reducer;

// Utility: Calculate bearing between two points
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}
