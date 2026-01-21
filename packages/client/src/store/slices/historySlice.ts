import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface MetricHistory {
  data: DataPoint[];
  min: number;
  max: number;
  avg: number;
}

interface HistoryState {
  batterySOC: MetricHistory;
  batteryVoltage: MetricHistory;
  batteryCurrent: MetricHistory;
  solarPower: MetricHistory;
  depth: MetricHistory;
  // Settings
  maxDataPoints: number; // Keep last N points
  sampleInterval: number; // ms between samples
  lastSampleTime: number;
}

const createEmptyMetric = (): MetricHistory => ({
  data: [],
  min: 0,
  max: 0,
  avg: 0,
});

const initialState: HistoryState = {
  batterySOC: createEmptyMetric(),
  batteryVoltage: createEmptyMetric(),
  batteryCurrent: createEmptyMetric(),
  solarPower: createEmptyMetric(),
  depth: createEmptyMetric(),
  maxDataPoints: 360, // 6 hours at 1 sample per minute
  sampleInterval: 60000, // 1 minute
  lastSampleTime: 0,
};

function updateMetricStats(metric: MetricHistory): void {
  if (metric.data.length === 0) {
    metric.min = 0;
    metric.max = 0;
    metric.avg = 0;
    return;
  }

  const values = metric.data.map((d) => d.value);
  metric.min = Math.min(...values);
  metric.max = Math.max(...values);
  metric.avg = values.reduce((a, b) => a + b, 0) / values.length;
}

function addDataPoint(
  metric: MetricHistory,
  value: number,
  timestamp: number,
  maxPoints: number
): void {
  metric.data.push({ timestamp, value });

  // Trim old data
  if (metric.data.length > maxPoints) {
    metric.data = metric.data.slice(-maxPoints);
  }

  updateMetricStats(metric);
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    recordSample(
      state,
      action: PayloadAction<{
        batterySOC?: number;
        batteryVoltage?: number;
        batteryCurrent?: number;
        solarPower?: number;
        depth?: number;
      }>
    ) {
      const now = Date.now();

      // Check if enough time has passed since last sample
      if (now - state.lastSampleTime < state.sampleInterval) {
        return;
      }

      state.lastSampleTime = now;
      const { batterySOC, batteryVoltage, batteryCurrent, solarPower, depth } = action.payload;

      if (batterySOC !== undefined) {
        addDataPoint(state.batterySOC, batterySOC, now, state.maxDataPoints);
      }
      if (batteryVoltage !== undefined) {
        addDataPoint(state.batteryVoltage, batteryVoltage, now, state.maxDataPoints);
      }
      if (batteryCurrent !== undefined) {
        addDataPoint(state.batteryCurrent, batteryCurrent, now, state.maxDataPoints);
      }
      if (solarPower !== undefined) {
        addDataPoint(state.solarPower, solarPower, now, state.maxDataPoints);
      }
      if (depth !== undefined) {
        addDataPoint(state.depth, depth, now, state.maxDataPoints);
      }
    },

    setSampleInterval(state, action: PayloadAction<number>) {
      state.sampleInterval = Math.max(10000, action.payload); // Min 10 seconds
    },

    setMaxDataPoints(state, action: PayloadAction<number>) {
      state.maxDataPoints = Math.max(60, Math.min(1440, action.payload)); // 1 hour to 24 hours
    },

    clearHistory(state) {
      state.batterySOC = createEmptyMetric();
      state.batteryVoltage = createEmptyMetric();
      state.batteryCurrent = createEmptyMetric();
      state.solarPower = createEmptyMetric();
      state.depth = createEmptyMetric();
    },
  },
});

export const {
  recordSample,
  setSampleInterval,
  setMaxDataPoints,
  clearHistory,
} = historySlice.actions;

export default historySlice.reducer;
