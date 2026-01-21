import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { recordSample } from '../store/slices/historySlice';

/**
 * Hook that periodically records system metrics to history.
 * Should be initialized once at the app level.
 */
export function useDataHistoryRecorder() {
  const dispatch = useAppDispatch();

  // Data sources
  const battery = useAppSelector((state) => state.victron.battery);
  const solar = useAppSelector((state) => state.victron.solar);
  const depth = useAppSelector((state) => state.navigation.navigation.depth);
  const victronConnected = useAppSelector((state) => state.victron.connected);
  const signalkConnected = useAppSelector((state) => state.navigation.status === 'connected');

  // Record samples periodically
  useEffect(() => {
    const recordData = () => {
      const sample: Parameters<typeof recordSample>[0] = {};

      if (victronConnected) {
        sample.batterySOC = battery.soc;
        sample.batteryVoltage = battery.voltage;
        sample.batteryCurrent = battery.current;
        sample.solarPower = solar.totalPower;
      }

      if (signalkConnected && depth?.belowTransducer !== undefined) {
        sample.depth = depth.belowTransducer;
      }

      // Only record if we have data
      if (Object.keys(sample).length > 0) {
        dispatch(recordSample(sample));
      }
    };

    // Record immediately and then every minute
    recordData();
    const interval = setInterval(recordData, 60000);

    return () => clearInterval(interval);
  }, [dispatch, battery, solar, depth, victronConnected, signalkConnected]);
}

/**
 * Hook to access history data for display
 */
export function useDataHistory() {
  const batterySOC = useAppSelector((state) => state.history.batterySOC);
  const batteryVoltage = useAppSelector((state) => state.history.batteryVoltage);
  const batteryCurrent = useAppSelector((state) => state.history.batteryCurrent);
  const solarPower = useAppSelector((state) => state.history.solarPower);
  const depth = useAppSelector((state) => state.history.depth);

  return {
    batterySOC,
    batteryVoltage,
    batteryCurrent,
    solarPower,
    depth,
  };
}
