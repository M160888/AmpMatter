import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SignalKState, SignalKConnectionStatus, Position, NavigationData, SunTimes, ConnectionInfo } from '@ampmatter/shared';
import { initialConnectionInfo } from '@ampmatter/shared';

const initialState: SignalKState = {
  status: 'disconnected',
  connectionInfo: initialConnectionInfo,
  selfId: null,
  navigation: {
    position: null,
    courseOverGround: null,
    speedOverGround: null,
    speedThroughWater: null,
    headingMagnetic: null,
    headingTrue: null,
    depth: undefined,
    wind: undefined,
  },
  sunTimes: null,
  lastUpdate: 0,
  error: undefined,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<SignalKConnectionStatus>) {
      state.status = action.payload;
      state.connectionInfo.state = action.payload === 'connected' ? 'connected' :
                                   action.payload === 'connecting' ? 'connecting' :
                                   action.payload === 'error' ? 'error' : 'disconnected';
      if (action.payload === 'connected') {
        state.error = undefined;
      }
    },
    setConnectionInfo(state, action: PayloadAction<Partial<ConnectionInfo>>) {
      state.connectionInfo = { ...state.connectionInfo, ...action.payload };
      // Sync status field for backwards compatibility
      if (action.payload.state === 'connected') {
        state.status = 'connected';
      } else if (action.payload.state === 'connecting') {
        state.status = 'connecting';
      } else if (action.payload.state === 'error') {
        state.status = 'error';
      } else {
        state.status = 'disconnected';
      }
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = 'error';
      state.connectionInfo.state = 'error';
      state.connectionInfo.lastError = action.payload;
    },
    setSelfId(state, action: PayloadAction<string>) {
      state.selfId = action.payload;
    },
    updatePosition(state, action: PayloadAction<Position>) {
      state.navigation.position = action.payload;
      state.lastUpdate = Date.now();
    },
    updateNavigation(state, action: PayloadAction<Partial<NavigationData>>) {
      state.navigation = { ...state.navigation, ...action.payload };
      state.lastUpdate = Date.now();
    },
    // Handle SignalK delta path updates
    handleDelta(state, action: PayloadAction<{ path: string; value: unknown }>) {
      const { path, value } = action.payload;

      // Convert SignalK paths to state updates
      // SignalK uses radians, we store degrees
      const radToDeg = (rad: number) => (rad * 180) / Math.PI;
      // SignalK uses m/s, we store knots
      const msToKnots = (ms: number) => ms * 1.94384;

      switch (path) {
        case 'navigation.position':
          if (value && typeof value === 'object') {
            const pos = value as { latitude?: number; longitude?: number };
            if (pos.latitude !== undefined && pos.longitude !== undefined) {
              state.navigation.position = {
                latitude: pos.latitude,
                longitude: pos.longitude,
              };
            }
          }
          break;
        case 'navigation.courseOverGroundTrue':
          state.navigation.courseOverGround = radToDeg(value as number);
          break;
        case 'navigation.speedOverGround':
          state.navigation.speedOverGround = msToKnots(value as number);
          break;
        case 'navigation.speedThroughWater':
          state.navigation.speedThroughWater = msToKnots(value as number);
          break;
        case 'navigation.headingMagnetic':
          state.navigation.headingMagnetic = radToDeg(value as number);
          break;
        case 'navigation.headingTrue':
          state.navigation.headingTrue = radToDeg(value as number);
          break;
        case 'environment.depth.belowTransducer':
          state.navigation.depth = {
            ...state.navigation.depth,
            belowTransducer: value as number,
          };
          break;
        case 'environment.wind.speedApparent':
          state.navigation.wind = {
            ...state.navigation.wind,
            speedApparent: msToKnots(value as number),
            angleApparent: state.navigation.wind?.angleApparent ?? 0,
          };
          break;
        case 'environment.wind.angleApparent':
          state.navigation.wind = {
            ...state.navigation.wind,
            angleApparent: radToDeg(value as number),
            speedApparent: state.navigation.wind?.speedApparent ?? 0,
          };
          break;
      }

      state.lastUpdate = Date.now();
    },
    updateSunTimes(state, action: PayloadAction<SunTimes>) {
      state.sunTimes = action.payload;
      state.lastUpdate = Date.now();
    },
    resetState() {
      return initialState;
    },
  },
});

export const {
  setConnectionStatus,
  setConnectionInfo,
  setError,
  setSelfId,
  updatePosition,
  updateNavigation,
  handleDelta,
  updateSunTimes,
  resetState,
} = navigationSlice.actions;

export default navigationSlice.reducer;
