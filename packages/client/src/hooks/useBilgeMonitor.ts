import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  pumpStarted,
  pumpStopped,
  updateStats,
  setLastAlertTime,
  pruneOldCycles,
} from '../store/slices/bilgeSlice';
import { addAlert } from '../store/slices/alertsSlice';

/**
 * Monitors bilge pump activity and triggers alerts on unusual patterns.
 * Should be initialized once at the app level.
 */
export function useBilgeMonitor() {
  const dispatch = useAppDispatch();

  // Bilge state
  const enabled = useAppSelector((state) => state.bilge.enabled);
  const digitalInputId = useAppSelector((state) => state.bilge.digitalInputId);
  const invertState = useAppSelector((state) => state.bilge.invertState);
  const isRunning = useAppSelector((state) => state.bilge.isRunning);
  const lastStateChange = useAppSelector((state) => state.bilge.lastStateChange);
  const cyclesPerHour = useAppSelector((state) => state.bilge.cyclesPerHour);
  const maxCyclesPerHour = useAppSelector((state) => state.bilge.maxCyclesPerHour);
  const maxContinuousRunTime = useAppSelector((state) => state.bilge.maxContinuousRunTime);
  const alertCooldown = useAppSelector((state) => state.bilge.alertCooldown);
  const lastAlertTime = useAppSelector((state) => state.bilge.lastAlertTime);

  // Sensor data - digital inputs
  const digitalInputs = useAppSelector((state) => state.sensors.digitalInputs);

  // Alert rule
  const bilgeAlertRule = useAppSelector((state) =>
    state.alerts.rules.find((r) => r.id === 'bilge_active')
  );

  // Previous state tracking
  const prevRunningRef = useRef<boolean | null>(null);

  // Find the bilge pump input (if not configured, try to auto-detect by name)
  const bilgeInput = digitalInputId
    ? digitalInputs.find((d) => d.id === digitalInputId)
    : digitalInputs.find((d) =>
        d.name.toLowerCase().includes('bilge') ||
        d.name.toLowerCase().includes('pump')
      );

  // Monitor bilge pump state changes
  useEffect(() => {
    if (!enabled || !bilgeInput) return;

    // Determine actual state (accounting for inversion)
    const actualState = invertState ? !bilgeInput.state : bilgeInput.state;

    // Detect state changes
    if (prevRunningRef.current !== null && prevRunningRef.current !== actualState) {
      if (actualState) {
        dispatch(pumpStarted());
      } else {
        dispatch(pumpStopped());
      }
    } else if (prevRunningRef.current === null && actualState !== isRunning) {
      // Initial sync
      if (actualState) {
        dispatch(pumpStarted());
      }
    }

    prevRunningRef.current = actualState;
  }, [bilgeInput, invertState, enabled, isRunning, dispatch]);

  // Update stats periodically
  useEffect(() => {
    dispatch(updateStats());
    const interval = setInterval(() => {
      dispatch(updateStats());
      dispatch(pruneOldCycles());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  // Check for alert conditions
  useEffect(() => {
    if (!enabled || bilgeAlertRule?.enabled === false) return;

    const now = Date.now();
    const canAlert = !lastAlertTime || now - lastAlertTime > alertCooldown;

    if (!canAlert) return;

    // Check for excessive cycling
    if (cyclesPerHour > maxCyclesPerHour) {
      dispatch(setLastAlertTime(now));
      dispatch(
        addAlert({
          type: 'bilge_active',
          severity: 'warning',
          title: 'Bilge Pump High Activity',
          message: `${cyclesPerHour} cycles in the last hour (threshold: ${maxCyclesPerHour})`,
          autoAcknowledge: false,
          soundEnabled: bilgeAlertRule?.soundEnabled ?? true,
        })
      );
      return;
    }

    // Check for continuous running
    if (isRunning && lastStateChange) {
      const runDuration = (now - lastStateChange) / 1000;
      if (runDuration > maxContinuousRunTime) {
        dispatch(setLastAlertTime(now));
        dispatch(
          addAlert({
            type: 'bilge_active',
            severity: 'critical',
            title: 'Bilge Pump Running Continuously',
            message: `Pump has been running for ${Math.floor(runDuration / 60)} minutes`,
            autoAcknowledge: false,
            soundEnabled: bilgeAlertRule?.soundEnabled ?? true,
          })
        );
      }
    }
  }, [
    enabled,
    cyclesPerHour,
    maxCyclesPerHour,
    isRunning,
    lastStateChange,
    maxContinuousRunTime,
    lastAlertTime,
    alertCooldown,
    bilgeAlertRule,
    dispatch,
  ]);
}

/**
 * Hook to get bilge pump status for display
 */
export function useBilgeStatus() {
  const enabled = useAppSelector((state) => state.bilge.enabled);
  const isRunning = useAppSelector((state) => state.bilge.isRunning);
  const totalCycles24h = useAppSelector((state) => state.bilge.totalCycles24h);
  const totalRunTime24h = useAppSelector((state) => state.bilge.totalRunTime24h);
  const cyclesPerHour = useAppSelector((state) => state.bilge.cyclesPerHour);
  const lastStateChange = useAppSelector((state) => state.bilge.lastStateChange);
  const digitalInputId = useAppSelector((state) => state.bilge.digitalInputId);
  const digitalInputs = useAppSelector((state) => state.sensors.digitalInputs);

  // Check if bilge input is configured/detected
  const hasInput = digitalInputId
    ? digitalInputs.some((d) => d.id === digitalInputId)
    : digitalInputs.some((d) =>
        d.name.toLowerCase().includes('bilge') ||
        d.name.toLowerCase().includes('pump')
      );

  return {
    enabled,
    isRunning,
    totalCycles24h,
    totalRunTime24h,
    cyclesPerHour,
    lastStateChange,
    hasInput,
  };
}
