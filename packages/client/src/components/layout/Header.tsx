import { type CSSProperties, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { toggleTheme } from '../../store/slices/settingsSlice';
import { updateSunTimes } from '../../store/slices/navigationSlice';
import { useKiosk } from '../../contexts/KioskContext';
import { SunTimesDisplay } from '../common/SunTimesDisplay';
import { ConnectionIndicator } from '../common/ConnectionIndicator';
import { calculateSunTimes, shouldRecalculateSunTimes, shouldRecalculateForNewDay } from '../../utils/sunCalc';
import type { Theme } from '../../styles/theme';

interface HeaderProps {
  theme: Theme;
}

export function Header({ theme }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { handleTitleClick } = useKiosk();

  // Get connection info from Redux
  const signalkConnectionInfo = useAppSelector((state) => state.navigation.connectionInfo);
  const sensorsConnectionInfo = useAppSelector((state) => state.sensors.connectionInfo);
  const victronConnectionInfo = useAppSelector((state) => state.victron.connectionInfo);
  const position = useAppSelector((state) => state.navigation.navigation.position);
  const sunTimes = useAppSelector((state) => state.navigation.sunTimes);
  const showSunTimes = useAppSelector((state) => state.settings.viewSettings.showSunTimes);
  const themeSetting = useAppSelector((state) => state.settings.theme);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastPosition, setLastPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate sun times when position changes or daily
  useEffect(() => {
    if (!position) return;

    const needsRecalculation =
      !lastPosition ||
      !lastCalculated ||
      shouldRecalculateSunTimes(lastPosition.lat, lastPosition.lon, position.latitude, position.longitude) ||
      shouldRecalculateForNewDay(lastCalculated);

    if (needsRecalculation) {
      const newSunTimes = calculateSunTimes(position.latitude, position.longitude);
      dispatch(updateSunTimes(newSunTimes));
      setLastPosition({ lat: position.latitude, lon: position.longitude });
      setLastCalculated(new Date());
    }
  }, [position, lastPosition, lastCalculated, dispatch]);

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    height: 'var(--header-height)',
  };

  const titleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  };

  const statusContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  };

  const statusItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  };

  const buttonStyle: CSSProperties = {
    minWidth: theme.touchTarget.min,
    minHeight: theme.touchTarget.min,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
  };

  const formatPosition = () => {
    if (!position) return 'No GPS';
    const lat = position.latitude.toFixed(5);
    const lon = position.longitude.toFixed(5);
    const latDir = position.latitude >= 0 ? 'N' : 'S';
    const lonDir = position.longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(parseFloat(lat))}°${latDir} ${Math.abs(parseFloat(lon))}°${lonDir}`;
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <header style={headerStyle}>
      <div
        style={{
          ...titleStyle,
          cursor: 'default',
          userSelect: 'none',
        }}
        onClick={handleTitleClick}
      >
        AmpMatter
      </div>

      <div style={statusContainerStyle}>
        <ConnectionIndicator
          label="GPS"
          state={signalkConnectionInfo.state}
          nextRetryIn={signalkConnectionInfo.nextRetryIn}
          theme={theme}
        />
        <ConnectionIndicator
          label="Victron"
          state={victronConnectionInfo.state}
          nextRetryIn={victronConnectionInfo.nextRetryIn}
          theme={theme}
        />
        <ConnectionIndicator
          label="Sensors"
          state={sensorsConnectionInfo.state}
          nextRetryIn={sensorsConnectionInfo.nextRetryIn}
          theme={theme}
        />
      </div>

      <div
        className="hide-mobile-portrait hide-mobile-landscape"
        style={{
          ...statusItemStyle,
          fontSize: theme.typography.sizes.base,
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2px',
        }}
      >
        <div>{formatPosition()}</div>
        {showSunTimes && sunTimes && (
          <SunTimesDisplay sunTimes={sunTimes} theme={theme} compact />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
          }}
        >
          {formatTime()}
        </div>
        <div
          className="hide-mobile-portrait"
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          {formatDate()}
        </div>
      </div>

      <button
        style={{
          ...buttonStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        }}
        onClick={() => dispatch(toggleTheme())}
        aria-label="Toggle theme"
      >
        <span style={{ fontSize: theme.typography.sizes.base }}>
          {themeSetting === 'day' && '☀️ Day'}
          {themeSetting === 'night' && '🌙 Night'}
          {themeSetting === 'auto' && '🔄 Auto'}
        </span>
        {themeSetting === 'auto' && (
          <span
            style={{
              fontSize: theme.typography.sizes.xs,
              opacity: 0.8,
            }}
          >
            ({theme.mode === 'day' ? '☀️' : '🌙'})
          </span>
        )}
      </button>
    </header>
  );
}
