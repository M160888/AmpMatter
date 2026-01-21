import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Keys for slices that should be persisted
const STORAGE_KEY = 'ampmatter_state';

// Slices to persist (don't persist real-time data like navigation, victron)
const PERSIST_SLICES = [
  'relays',      // Relay configurations and names
  'settings',    // App settings
  'views',       // View enable/disable
  'alerts',      // Alert rules and thresholds
  'anchor',      // Anchor watch settings
  'network',     // WiFi saved networks and connection settings
  'sensorConfig' // Sensor definitions
];

// Load persisted state from localStorage
export const loadState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return undefined;
  }
};

// Save state to localStorage
export const saveState = (state: RootState) => {
  try {
    // Only persist specified slices
    const stateToPersist: Partial<RootState> = {};
    PERSIST_SLICES.forEach((key) => {
      if (key in state) {
        stateToPersist[key as keyof RootState] = state[key as keyof RootState];
      }
    });

    const serializedState = JSON.stringify(stateToPersist);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
};

// Middleware to save state on every action
export const localStorageMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);

  // Debounce saves to avoid excessive writes
  if (!localStorageMiddleware.saveTimeout) {
    localStorageMiddleware.saveTimeout = setTimeout(() => {
      saveState(store.getState());
      localStorageMiddleware.saveTimeout = null;
    }, 500);
  }

  return result;
};

// Static property to hold timeout
localStorageMiddleware.saveTimeout = null as NodeJS.Timeout | null;
