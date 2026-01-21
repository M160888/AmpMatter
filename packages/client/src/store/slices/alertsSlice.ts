import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'low_battery'
  | 'shallow_depth'
  | 'high_temp'
  | 'low_fresh_water'
  | 'high_black_water'
  | 'anchor_drag'
  | 'bilge_active'
  | 'connection_lost'
  | 'custom';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  autoAcknowledge?: boolean; // Auto-dismiss when condition clears
  soundEnabled?: boolean;
}

export interface AlertRule {
  id: string;
  type: AlertType;
  enabled: boolean;
  threshold?: number;
  severity: AlertSeverity;
  soundEnabled: boolean;
}

interface AlertsState {
  active: Alert[];
  history: Alert[]; // Last 50 alerts
  rules: AlertRule[];
  soundEnabled: boolean; // Global sound toggle
  maxHistory: number;
}

const initialState: AlertsState = {
  active: [],
  history: [],
  soundEnabled: true,
  maxHistory: 50,
  rules: [
    {
      id: 'low_battery',
      type: 'low_battery',
      enabled: true,
      threshold: 20, // SOC %
      severity: 'warning',
      soundEnabled: true,
    },
    {
      id: 'low_battery_critical',
      type: 'low_battery',
      enabled: true,
      threshold: 10, // SOC %
      severity: 'critical',
      soundEnabled: true,
    },
    {
      id: 'shallow_depth',
      type: 'shallow_depth',
      enabled: true,
      threshold: 3, // meters
      severity: 'warning',
      soundEnabled: true,
    },
    {
      id: 'shallow_depth_critical',
      type: 'shallow_depth',
      enabled: true,
      threshold: 1.5, // meters
      severity: 'critical',
      soundEnabled: true,
    },
    {
      id: 'high_temp',
      type: 'high_temp',
      enabled: true,
      threshold: 50, // Celsius (engine/cabin temp)
      severity: 'warning',
      soundEnabled: true,
    },
    {
      id: 'low_fresh_water',
      type: 'low_fresh_water',
      enabled: true,
      threshold: 15, // %
      severity: 'warning',
      soundEnabled: false,
    },
    {
      id: 'high_black_water',
      type: 'high_black_water',
      enabled: true,
      threshold: 85, // %
      severity: 'warning',
      soundEnabled: false,
    },
    {
      id: 'anchor_drag',
      type: 'anchor_drag',
      enabled: true,
      severity: 'critical',
      soundEnabled: true,
    },
    {
      id: 'bilge_active',
      type: 'bilge_active',
      enabled: true,
      severity: 'warning',
      soundEnabled: true,
    },
    {
      id: 'connection_lost',
      type: 'connection_lost',
      enabled: true,
      severity: 'info',
      soundEnabled: false,
    },
  ],
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert(state, action: PayloadAction<Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>>) {
      const alert: Alert = {
        ...action.payload,
        id: `${action.payload.type}-${Date.now()}`,
        timestamp: Date.now(),
        acknowledged: false,
      };

      // Don't add duplicate active alerts of the same type (unless it's cleared first)
      const existingIndex = state.active.findIndex(
        (a) => a.type === alert.type && !a.acknowledged
      );

      if (existingIndex === -1) {
        state.active.push(alert);

        // Add to history
        state.history.unshift(alert);
        if (state.history.length > state.maxHistory) {
          state.history = state.history.slice(0, state.maxHistory);
        }
      }
    },

    acknowledgeAlert(state, action: PayloadAction<string>) {
      const alert = state.active.find((a) => a.id === action.payload);
      if (alert) {
        alert.acknowledged = true;
      }
    },

    dismissAlert(state, action: PayloadAction<string>) {
      state.active = state.active.filter((a) => a.id !== action.payload);
    },

    clearAlertByType(state, action: PayloadAction<AlertType>) {
      // Remove alerts of this type that are auto-acknowledge enabled
      state.active = state.active.filter(
        (a) => !(a.type === action.payload && a.autoAcknowledge)
      );
    },

    acknowledgeAll(state) {
      state.active.forEach((alert) => {
        alert.acknowledged = true;
      });
    },

    dismissAllAcknowledged(state) {
      state.active = state.active.filter((a) => !a.acknowledged);
    },

    updateRule(state, action: PayloadAction<{ id: string; updates: Partial<AlertRule> }>) {
      const rule = state.rules.find((r) => r.id === action.payload.id);
      if (rule) {
        Object.assign(rule, action.payload.updates);
      }
    },

    setGlobalSound(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },

    clearHistory(state) {
      state.history = [];
    },
  },
});

export const {
  addAlert,
  acknowledgeAlert,
  dismissAlert,
  clearAlertByType,
  acknowledgeAll,
  dismissAllAcknowledged,
  updateRule,
  setGlobalSound,
  clearHistory,
} = alertsSlice.actions;

export default alertsSlice.reducer;
