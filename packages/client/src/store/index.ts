import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import victronReducer from './slices/victronSlice';
import navigationReducer from './slices/navigationSlice';
import sensorsReducer from './slices/sensorsSlice';
import settingsReducer from './slices/settingsSlice';
import viewsReducer from './slices/viewsSlice';
import relaysReducer from './slices/relaysSlice';
import weatherReducer from './slices/weatherSlice';
import alertsReducer from './slices/alertsSlice';
import anchorReducer from './slices/anchorSlice';
import bilgeReducer from './slices/bilgeSlice';
import mobReducer from './slices/mobSlice';
import historyReducer from './slices/historySlice';
import networkReducer from './slices/networkSlice';
import sensorConfigReducer from './slices/sensorConfigSlice';
import { localStorageMiddleware, loadState } from './localStorageMiddleware';

// Load persisted state
const persistedState = loadState();

export const store = configureStore({
  reducer: {
    victron: victronReducer,
    navigation: navigationReducer,
    sensors: sensorsReducer,
    settings: settingsReducer,
    views: viewsReducer,
    relays: relaysReducer,
    weather: weatherReducer,
    alerts: alertsReducer,
    anchor: anchorReducer,
    bilge: bilgeReducer,
    mob: mobReducer,
    history: historyReducer,
    network: networkReducer,
    sensorConfig: sensorConfigReducer,
  },
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow dates in state
    }).concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
