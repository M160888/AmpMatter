import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { VictronSystemState, BatteryData, SolarData, InverterData, MultiplusData, MultiplusMode, BatteryType, ConnectionInfo } from '@ampmatter/shared';
import { initialConnectionInfo } from '@ampmatter/shared';

const initialState: VictronSystemState = {
  connected: false,
  connectionInfo: initialConnectionInfo,
  battery: {
    voltage: 0,
    current: 0,
    power: 0,
    soc: 0,
    state: 'idle',
  },
  solar: {
    totalPower: 0,
    totalDailyYield: 0,
    controllers: [],
  },
  inverter: undefined,
  multiplus: undefined,
  lastUpdate: 0,
};

const victronSlice = createSlice({
  name: 'victron',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
      state.connectionInfo.state = action.payload ? 'connected' : 'disconnected';
    },
    setConnectionInfo(state, action: PayloadAction<Partial<ConnectionInfo>>) {
      state.connectionInfo = { ...state.connectionInfo, ...action.payload };
      state.connected = state.connectionInfo.state === 'connected';
    },
    updateBattery(state, action: PayloadAction<Partial<BatteryData>>) {
      state.battery = { ...state.battery, ...action.payload };
      state.lastUpdate = Date.now();
    },
    updateBatteryType(state, action: PayloadAction<BatteryType>) {
      state.battery.batteryType = action.payload;
      state.lastUpdate = Date.now();
    },
    updateSolar(state, action: PayloadAction<Partial<SolarData>>) {
      state.solar = { ...state.solar, ...action.payload };
      state.lastUpdate = Date.now();
    },
    updateInverter(state, action: PayloadAction<InverterData>) {
      state.inverter = action.payload;
      state.lastUpdate = Date.now();
    },
    updateMultiplus(state, action: PayloadAction<MultiplusData>) {
      state.multiplus = action.payload;
      state.lastUpdate = Date.now();
    },
    setMultiplusMode(state, action: PayloadAction<MultiplusMode>) {
      if (state.multiplus) {
        state.multiplus.mode = action.payload;
      }
    },
    resetState() {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setConnectionInfo,
  updateBattery,
  updateBatteryType,
  updateSolar,
  updateInverter,
  updateMultiplus,
  setMultiplusMode,
  resetState,
} = victronSlice.actions;

export default victronSlice.reducer;
