import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  dropAnchor,
  raiseAnchor,
  setWatchRadius,
  setWatchEnabled,
  updateDrift,
  setLastAlertTime,
  calculateDistance,
} from '../store/slices/anchorSlice';
import { addAlert, clearAlertByType } from '../store/slices/alertsSlice';

export function useAnchorWatch() {
  const dispatch = useAppDispatch();

  // Anchor state
  const isAnchored = useAppSelector((state) => state.anchor.isAnchored);
  const anchorPosition = useAppSelector((state) => state.anchor.anchorPosition);
  const watchRadius = useAppSelector((state) => state.anchor.watchRadius);
  const watchEnabled = useAppSelector((state) => state.anchor.watchEnabled);
  const currentDrift = useAppSelector((state) => state.anchor.currentDrift);
  const maxDrift = useAppSelector((state) => state.anchor.maxDrift);
  const lastAlertTime = useAppSelector((state) => state.anchor.lastAlertTime);
  const alertCooldown = useAppSelector((state) => state.anchor.alertCooldown);

  // Current position
  const position = useAppSelector((state) => state.navigation.navigation.position);

  // Alert rules
  const anchorDragRule = useAppSelector((state) =>
    state.alerts.rules.find((r) => r.id === 'anchor_drag')
  );

  // Monitor position and check for anchor drag
  useEffect(() => {
    if (!isAnchored || !watchEnabled || !anchorPosition || !position) {
      return;
    }

    const distance = calculateDistance(
      anchorPosition.latitude,
      anchorPosition.longitude,
      position.latitude,
      position.longitude
    );

    dispatch(updateDrift(distance));

    // Check if we've drifted outside the watch radius
    if (distance > watchRadius) {
      const now = Date.now();
      const canAlert = !lastAlertTime || now - lastAlertTime > alertCooldown;

      if (canAlert && anchorDragRule?.enabled !== false) {
        dispatch(setLastAlertTime(now));
        dispatch(
          addAlert({
            type: 'anchor_drag',
            severity: 'critical',
            title: 'Anchor Drag Detected!',
            message: `Drifted ${distance.toFixed(0)}m from anchor (limit: ${watchRadius}m)`,
            autoAcknowledge: false,
            soundEnabled: anchorDragRule?.soundEnabled ?? true,
          })
        );
      }
    } else {
      // Within radius, clear any auto-acknowledge alerts
      dispatch(clearAlertByType('anchor_drag'));
    }
  }, [
    isAnchored,
    watchEnabled,
    anchorPosition,
    position,
    watchRadius,
    lastAlertTime,
    alertCooldown,
    anchorDragRule,
    dispatch,
  ]);

  // Actions
  const handleDropAnchor = useCallback(() => {
    if (position) {
      dispatch(
        dropAnchor({
          latitude: position.latitude,
          longitude: position.longitude,
        })
      );
    }
  }, [position, dispatch]);

  const handleRaiseAnchor = useCallback(() => {
    dispatch(raiseAnchor());
    dispatch(clearAlertByType('anchor_drag'));
  }, [dispatch]);

  const handleSetRadius = useCallback(
    (radius: number) => {
      dispatch(setWatchRadius(radius));
    },
    [dispatch]
  );

  const handleToggleWatch = useCallback(
    (enabled: boolean) => {
      dispatch(setWatchEnabled(enabled));
      if (!enabled) {
        dispatch(clearAlertByType('anchor_drag'));
      }
    },
    [dispatch]
  );

  return {
    // State
    isAnchored,
    anchorPosition,
    watchRadius,
    watchEnabled,
    currentDrift,
    maxDrift,
    hasPosition: !!position,

    // Actions
    dropAnchor: handleDropAnchor,
    raiseAnchor: handleRaiseAnchor,
    setWatchRadius: handleSetRadius,
    setWatchEnabled: handleToggleWatch,
  };
}
