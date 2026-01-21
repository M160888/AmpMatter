import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { addAlert, clearAlertByType, type AlertType } from '../store/slices/alertsSlice';

/**
 * Monitors system state and triggers alerts when thresholds are crossed.
 * This hook should be initialized once at the app level.
 */
export function useAlertMonitor() {
  const dispatch = useAppDispatch();

  // Data sources
  const battery = useAppSelector((state) => state.victron.battery);
  const victronConnected = useAppSelector((state) => state.victron.connected);
  const depth = useAppSelector((state) => state.navigation.navigation.depth);
  const signalkStatus = useAppSelector((state) => state.navigation.status);
  const tanks = useAppSelector((state) => state.sensors.tanks);
  const temperatures = useAppSelector((state) => state.sensors.temperatures);
  const sensorConnected = useAppSelector((state) => state.sensors.connected);

  // Alert rules
  const rules = useAppSelector((state) => state.alerts.rules);
  const activeAlerts = useAppSelector((state) => state.alerts.active);

  // Track previous values to detect transitions
  const prevValuesRef = useRef<{
    batterySOC: number | null;
    depth: number | null;
    victronConnected: boolean;
    signalkConnected: boolean;
    sensorConnected: boolean;
  }>({
    batterySOC: null,
    depth: null,
    victronConnected: false,
    signalkConnected: false,
    sensorConnected: false,
  });

  // Helper to check if an alert of a type is already active
  const isAlertActive = (type: AlertType) => {
    return activeAlerts.some((a) => a.type === type && !a.acknowledged);
  };

  // Helper to get rule by id
  const getRule = (id: string) => rules.find((r) => r.id === id);

  // Monitor battery SOC
  useEffect(() => {
    if (!victronConnected || battery.soc === 0) return;

    const criticalRule = getRule('low_battery_critical');
    const warningRule = getRule('low_battery');

    // Check critical first
    if (criticalRule?.enabled && battery.soc <= (criticalRule.threshold ?? 10)) {
      if (!isAlertActive('low_battery')) {
        dispatch(
          addAlert({
            type: 'low_battery',
            severity: 'critical',
            title: 'Critical Battery Level',
            message: `Battery at ${battery.soc.toFixed(0)}% - immediate charging required`,
            autoAcknowledge: true,
            soundEnabled: criticalRule.soundEnabled,
          })
        );
      }
    } else if (warningRule?.enabled && battery.soc <= (warningRule.threshold ?? 20)) {
      if (!isAlertActive('low_battery')) {
        dispatch(
          addAlert({
            type: 'low_battery',
            severity: 'warning',
            title: 'Low Battery',
            message: `Battery at ${battery.soc.toFixed(0)}% - consider charging soon`,
            autoAcknowledge: true,
            soundEnabled: warningRule.soundEnabled,
          })
        );
      }
    } else {
      // Battery is OK, clear any auto-acknowledge alerts
      dispatch(clearAlertByType('low_battery'));
    }

    prevValuesRef.current.batterySOC = battery.soc;
  }, [battery.soc, victronConnected, dispatch, rules, activeAlerts]);

  // Monitor depth
  useEffect(() => {
    if (signalkStatus !== 'connected' || !depth?.belowTransducer) return;

    const depthValue = depth.belowTransducer;
    const criticalRule = getRule('shallow_depth_critical');
    const warningRule = getRule('shallow_depth');

    // Check critical first
    if (criticalRule?.enabled && depthValue <= (criticalRule.threshold ?? 1.5)) {
      if (!isAlertActive('shallow_depth')) {
        dispatch(
          addAlert({
            type: 'shallow_depth',
            severity: 'critical',
            title: 'Dangerously Shallow!',
            message: `Depth: ${depthValue.toFixed(1)}m - risk of grounding`,
            autoAcknowledge: true,
            soundEnabled: criticalRule.soundEnabled,
          })
        );
      }
    } else if (warningRule?.enabled && depthValue <= (warningRule.threshold ?? 3)) {
      if (!isAlertActive('shallow_depth')) {
        dispatch(
          addAlert({
            type: 'shallow_depth',
            severity: 'warning',
            title: 'Shallow Water',
            message: `Depth: ${depthValue.toFixed(1)}m - proceed with caution`,
            autoAcknowledge: true,
            soundEnabled: warningRule.soundEnabled,
          })
        );
      }
    } else {
      dispatch(clearAlertByType('shallow_depth'));
    }

    prevValuesRef.current.depth = depthValue;
  }, [depth?.belowTransducer, signalkStatus, dispatch, rules, activeAlerts]);

  // Monitor tanks
  useEffect(() => {
    if (!sensorConnected || tanks.length === 0) return;

    const freshWaterRule = getRule('low_fresh_water');
    const blackWaterRule = getRule('high_black_water');

    // Check fresh water tanks
    const freshWaterTanks = tanks.filter((t) => t.type === 'freshWater');
    for (const tank of freshWaterTanks) {
      const level = (tank.currentLevel / tank.capacity) * 100;
      if (freshWaterRule?.enabled && level <= (freshWaterRule.threshold ?? 15)) {
        if (!isAlertActive('low_fresh_water')) {
          dispatch(
            addAlert({
              type: 'low_fresh_water',
              severity: 'warning',
              title: 'Low Fresh Water',
              message: `${tank.name}: ${level.toFixed(0)}% remaining`,
              autoAcknowledge: true,
              soundEnabled: freshWaterRule.soundEnabled,
            })
          );
        }
      }
    }

    // Check if fresh water is OK now
    const allFreshWaterOk = freshWaterTanks.every((t) => {
      const level = (t.currentLevel / t.capacity) * 100;
      return level > (freshWaterRule?.threshold ?? 15);
    });
    if (allFreshWaterOk) {
      dispatch(clearAlertByType('low_fresh_water'));
    }

    // Check black/waste water tanks
    const blackWaterTanks = tanks.filter((t) => t.type === 'blackWater' || t.type === 'wasteWater');
    for (const tank of blackWaterTanks) {
      const level = (tank.currentLevel / tank.capacity) * 100;
      if (blackWaterRule?.enabled && level >= (blackWaterRule.threshold ?? 85)) {
        if (!isAlertActive('high_black_water')) {
          dispatch(
            addAlert({
              type: 'high_black_water',
              severity: 'warning',
              title: 'Waste Tank Nearly Full',
              message: `${tank.name}: ${level.toFixed(0)}% full - pump out soon`,
              autoAcknowledge: true,
              soundEnabled: blackWaterRule.soundEnabled,
            })
          );
        }
      }
    }

    // Check if black water is OK now
    const allBlackWaterOk = blackWaterTanks.every((t) => {
      const level = (t.currentLevel / t.capacity) * 100;
      return level < (blackWaterRule?.threshold ?? 85);
    });
    if (allBlackWaterOk) {
      dispatch(clearAlertByType('high_black_water'));
    }
  }, [tanks, sensorConnected, dispatch, rules, activeAlerts]);

  // Monitor temperatures
  useEffect(() => {
    if (!sensorConnected || temperatures.length === 0) return;

    const highTempRule = getRule('high_temp');
    if (!highTempRule?.enabled) return;

    const threshold = highTempRule.threshold ?? 50;
    let hasHighTemp = false;

    for (const temp of temperatures) {
      if (temp.value >= threshold) {
        hasHighTemp = true;
        if (!isAlertActive('high_temp')) {
          dispatch(
            addAlert({
              type: 'high_temp',
              severity: 'warning',
              title: 'High Temperature',
              message: `${temp.name}: ${temp.value.toFixed(1)}°C`,
              autoAcknowledge: true,
              soundEnabled: highTempRule.soundEnabled,
            })
          );
        }
        break;
      }
    }

    if (!hasHighTemp) {
      dispatch(clearAlertByType('high_temp'));
    }
  }, [temperatures, sensorConnected, dispatch, rules, activeAlerts]);

  // Monitor connection states
  useEffect(() => {
    const prev = prevValuesRef.current;
    const connectionRule = getRule('connection_lost');

    if (!connectionRule?.enabled) return;

    // Check Victron connection
    if (prev.victronConnected && !victronConnected) {
      dispatch(
        addAlert({
          type: 'connection_lost',
          severity: 'info',
          title: 'Connection Lost',
          message: 'Victron system disconnected',
          autoAcknowledge: false,
          soundEnabled: connectionRule.soundEnabled,
        })
      );
    }

    // Check SignalK connection
    if (prev.signalkConnected && signalkStatus !== 'connected') {
      dispatch(
        addAlert({
          type: 'connection_lost',
          severity: 'info',
          title: 'Connection Lost',
          message: 'GPS/SignalK disconnected',
          autoAcknowledge: false,
          soundEnabled: connectionRule.soundEnabled,
        })
      );
    }

    // Check Sensor connection
    if (prev.sensorConnected && !sensorConnected) {
      dispatch(
        addAlert({
          type: 'connection_lost',
          severity: 'info',
          title: 'Connection Lost',
          message: 'Sensor system disconnected',
          autoAcknowledge: false,
          soundEnabled: connectionRule.soundEnabled,
        })
      );
    }

    prev.victronConnected = victronConnected;
    prev.signalkConnected = signalkStatus === 'connected';
    prev.sensorConnected = sensorConnected;
  }, [victronConnected, signalkStatus, sensorConnected, dispatch, rules]);
}
