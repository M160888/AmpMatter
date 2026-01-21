import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { setBrightness } from '../store/slices/settingsSlice';

export type ScreenState = 'active' | 'dimmed' | 'off';

/**
 * Hook to manage screen dimming based on user activity.
 * Returns current screen state and wake function.
 */
export function useScreenDimmer() {
  const dispatch = useAppDispatch();

  // Settings
  const displaySettings = useAppSelector((state) => state.settings.displaySettings);
  const {
    brightness,
    autoDimEnabled,
    autoDimTimeout,
    dimmedBrightness,
    screenOffEnabled,
    screenOffTimeout,
  } = displaySettings;

  // Internal state
  const [screenState, setScreenState] = useState<ScreenState>('active');
  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Wake the screen (reset to active)
  const wake = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (screenState !== 'active') {
      setScreenState('active');
    }
  }, [screenState]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (screenState !== 'active') {
        setScreenState('active');
      }
    };

    // Listen for various user interactions
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('pointermove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('wheel', handleActivity);

    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('wheel', handleActivity);
    };
  }, [screenState]);

  // Check for dimming/screen off
  useEffect(() => {
    if (!autoDimEnabled) {
      setScreenState('active');
      return;
    }

    const checkTimeout = () => {
      const now = Date.now();
      const idleTime = (now - lastActivityRef.current) / 1000; // seconds

      if (screenOffEnabled && idleTime > autoDimTimeout + screenOffTimeout) {
        setScreenState('off');
      } else if (idleTime > autoDimTimeout) {
        setScreenState('dimmed');
      } else {
        setScreenState('active');
      }
    };

    // Check every second
    checkIntervalRef.current = setInterval(checkTimeout, 1000);
    checkTimeout(); // Initial check

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [autoDimEnabled, autoDimTimeout, screenOffEnabled, screenOffTimeout]);

  // Calculate effective brightness based on screen state
  const effectiveBrightness = screenState === 'active'
    ? brightness
    : screenState === 'dimmed'
      ? dimmedBrightness
      : 0;

  // Set brightness action
  const handleSetBrightness = useCallback(
    (value: number) => {
      dispatch(setBrightness(value));
      wake(); // Wake screen when adjusting brightness
    },
    [dispatch, wake]
  );

  return {
    screenState,
    brightness,
    effectiveBrightness,
    dimmedBrightness,
    autoDimEnabled,
    autoDimTimeout,
    wake,
    setBrightness: handleSetBrightness,
  };
}
