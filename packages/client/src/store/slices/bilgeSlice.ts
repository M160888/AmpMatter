import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BilgePumpCycle {
  startTime: number;
  endTime: number | null;
  duration: number; // seconds
}

interface BilgeState {
  // Configuration
  enabled: boolean;
  digitalInputId: string | null; // ID of the digital input monitoring the bilge pump
  invertState: boolean; // Some float switches are NO, some are NC

  // Current state
  isRunning: boolean;
  lastStateChange: number | null;

  // Statistics
  cycles: BilgePumpCycle[]; // Last 100 cycles
  totalCycles24h: number;
  totalRunTime24h: number; // seconds
  cyclesPerHour: number;

  // Alert thresholds
  maxCyclesPerHour: number; // Alert if exceeded
  maxContinuousRunTime: number; // seconds - alert if pump runs too long
  alertCooldown: number; // ms between alerts
  lastAlertTime: number | null;
}

const initialState: BilgeState = {
  enabled: true,
  digitalInputId: null, // Will be set when bilge input is detected
  invertState: false,

  isRunning: false,
  lastStateChange: null,

  cycles: [],
  totalCycles24h: 0,
  totalRunTime24h: 0,
  cyclesPerHour: 0,

  maxCyclesPerHour: 6, // More than 6 cycles per hour is concerning
  maxContinuousRunTime: 300, // 5 minutes continuous run is concerning
  alertCooldown: 300000, // 5 minutes between alerts
  lastAlertTime: null,
};

const bilgeSlice = createSlice({
  name: 'bilge',
  initialState,
  reducers: {
    setEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },

    setDigitalInputId(state, action: PayloadAction<string | null>) {
      state.digitalInputId = action.payload;
    },

    setInvertState(state, action: PayloadAction<boolean>) {
      state.invertState = action.payload;
    },

    pumpStarted(state) {
      const now = Date.now();
      state.isRunning = true;
      state.lastStateChange = now;

      // Start a new cycle
      state.cycles.push({
        startTime: now,
        endTime: null,
        duration: 0,
      });

      // Keep only last 100 cycles
      if (state.cycles.length > 100) {
        state.cycles = state.cycles.slice(-100);
      }
    },

    pumpStopped(state) {
      const now = Date.now();
      state.isRunning = false;

      // Complete the current cycle
      const currentCycle = state.cycles[state.cycles.length - 1];
      if (currentCycle && currentCycle.endTime === null) {
        currentCycle.endTime = now;
        currentCycle.duration = (now - currentCycle.startTime) / 1000;
      }

      state.lastStateChange = now;
    },

    updateStats(state) {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneHourAgo = now - 60 * 60 * 1000;

      // Calculate 24h stats
      const cycles24h = state.cycles.filter((c) => c.startTime > oneDayAgo);
      state.totalCycles24h = cycles24h.length;
      state.totalRunTime24h = cycles24h.reduce((sum, c) => sum + c.duration, 0);

      // Calculate cycles per hour (rolling average over last hour)
      const cyclesLastHour = state.cycles.filter((c) => c.startTime > oneHourAgo);
      state.cyclesPerHour = cyclesLastHour.length;
    },

    setMaxCyclesPerHour(state, action: PayloadAction<number>) {
      state.maxCyclesPerHour = action.payload;
    },

    setMaxContinuousRunTime(state, action: PayloadAction<number>) {
      state.maxContinuousRunTime = action.payload;
    },

    setLastAlertTime(state, action: PayloadAction<number>) {
      state.lastAlertTime = action.payload;
    },

    // Clean up old cycles (older than 24h)
    pruneOldCycles(state) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      state.cycles = state.cycles.filter((c) => c.startTime > oneDayAgo);
    },
  },
});

export const {
  setEnabled,
  setDigitalInputId,
  setInvertState,
  pumpStarted,
  pumpStopped,
  updateStats,
  setMaxCyclesPerHour,
  setMaxContinuousRunTime,
  setLastAlertTime,
  pruneOldCycles,
} = bilgeSlice.actions;

export default bilgeSlice.reducer;
