import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WidgetType =
  | 'battery_soc'
  | 'battery_voltage'
  | 'solar_power'
  | 'depth'
  | 'speed'
  | 'heading'
  | 'wind'
  | 'water_tank'
  | 'fuel_tank'
  | 'temperature'
  | 'anchor_drift'
  | 'bilge_status';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  size: 'sm' | 'md' | 'lg';
  order: number;
}

interface DashboardState {
  widgets: DashboardWidget[];
  editMode: boolean;
}

const initialState: DashboardState = {
  widgets: [
    { id: 'w1', type: 'battery_soc', size: 'lg', order: 0 },
    { id: 'w2', type: 'solar_power', size: 'md', order: 1 },
    { id: 'w3', type: 'depth', size: 'md', order: 2 },
    { id: 'w4', type: 'speed', size: 'md', order: 3 },
    { id: 'w5', type: 'water_tank', size: 'sm', order: 4 },
    { id: 'w6', type: 'fuel_tank', size: 'sm', order: 5 },
  ],
  editMode: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addWidget(state, action: PayloadAction<{ type: WidgetType; size?: 'sm' | 'md' | 'lg' }>) {
      const maxOrder = Math.max(...state.widgets.map((w) => w.order), -1);
      state.widgets.push({
        id: `w${Date.now()}`,
        type: action.payload.type,
        size: action.payload.size || 'md',
        order: maxOrder + 1,
      });
    },

    removeWidget(state, action: PayloadAction<string>) {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload);
    },

    updateWidgetSize(state, action: PayloadAction<{ id: string; size: 'sm' | 'md' | 'lg' }>) {
      const widget = state.widgets.find((w) => w.id === action.payload.id);
      if (widget) {
        widget.size = action.payload.size;
      }
    },

    reorderWidgets(state, action: PayloadAction<string[]>) {
      // Update order based on provided ID array
      action.payload.forEach((id, index) => {
        const widget = state.widgets.find((w) => w.id === id);
        if (widget) {
          widget.order = index;
        }
      });
    },

    setEditMode(state, action: PayloadAction<boolean>) {
      state.editMode = action.payload;
    },

    resetToDefault(state) {
      state.widgets = initialState.widgets;
    },
  },
});

export const {
  addWidget,
  removeWidget,
  updateWidgetSize,
  reorderWidgets,
  setEditMode,
  resetToDefault,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Widget metadata
export const widgetMeta: Record<WidgetType, { label: string; icon: string }> = {
  battery_soc: { label: 'Battery SOC', icon: '🔋' },
  battery_voltage: { label: 'Battery Voltage', icon: '⚡' },
  solar_power: { label: 'Solar Power', icon: '☀️' },
  depth: { label: 'Depth', icon: '🌊' },
  speed: { label: 'Speed', icon: '🚀' },
  heading: { label: 'Heading', icon: '🧭' },
  wind: { label: 'Wind', icon: '💨' },
  water_tank: { label: 'Water Tank', icon: '💧' },
  fuel_tank: { label: 'Fuel Tank', icon: '⛽' },
  temperature: { label: 'Temperature', icon: '🌡️' },
  anchor_drift: { label: 'Anchor Drift', icon: '⚓' },
  bilge_status: { label: 'Bilge Status', icon: '🚰' },
};
