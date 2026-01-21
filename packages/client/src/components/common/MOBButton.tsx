import { type CSSProperties, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { activateMOB, deactivateMOB, calculateBearing } from '../../store/slices/mobSlice';
import { addAlert } from '../../store/slices/alertsSlice';
import { calculateDistance } from '../../store/slices/anchorSlice';
import type { Theme } from '../../styles/theme';

interface MOBButtonProps {
  theme: Theme;
  size?: 'sm' | 'md' | 'lg';
}

// Sound effect for MOB activation
function playMOBAlarm() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Create a loud, attention-getting alarm
    for (let i = 0; i < 5; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 1000 + (i % 2) * 500; // Alternating pitch
      oscillator.type = 'square';

      const startTime = now + i * 0.2;
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.setValueAtTime(0, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    }
  } catch (e) {
    console.warn('Could not play MOB alarm:', e);
  }
}

export function MOBButton({ theme, size = 'md' }: MOBButtonProps) {
  const dispatch = useAppDispatch();
  const position = useAppSelector((state) => state.navigation.navigation.position);
  const mobActive = useAppSelector((state) => state.mob.active);
  const mobPosition = useAppSelector((state) => state.mob.position);
  const lastPressRef = useRef<number>(0);

  const handlePress = useCallback(() => {
    // Debounce rapid presses
    const now = Date.now();
    if (now - lastPressRef.current < 500) return;
    lastPressRef.current = now;

    if (mobActive) {
      // Deactivate MOB
      dispatch(deactivateMOB());
    } else {
      // Activate MOB
      if (position) {
        dispatch(
          activateMOB({
            latitude: position.latitude,
            longitude: position.longitude,
          })
        );

        // Play alarm
        playMOBAlarm();

        // Add alert
        dispatch(
          addAlert({
            type: 'custom',
            severity: 'critical',
            title: 'MAN OVERBOARD',
            message: `Position marked at ${position.latitude.toFixed(5)}°, ${position.longitude.toFixed(5)}°`,
            autoAcknowledge: false,
            soundEnabled: true,
          })
        );
      }
    }
  }, [mobActive, position, dispatch]);

  // Calculate distance and bearing if MOB is active
  let distance = 0;
  let bearing = 0;
  if (mobActive && mobPosition && position) {
    distance = calculateDistance(
      position.latitude,
      position.longitude,
      mobPosition.latitude,
      mobPosition.longitude
    );
    bearing = calculateBearing(
      position.latitude,
      position.longitude,
      mobPosition.latitude,
      mobPosition.longitude
    );
  }

  const sizes = {
    sm: { button: '48px', font: theme.typography.sizes.sm },
    md: { button: '64px', font: theme.typography.sizes.base },
    lg: { button: '80px', font: theme.typography.sizes.lg },
  };

  const buttonStyle: CSSProperties = {
    width: sizes[size].button,
    height: sizes[size].button,
    borderRadius: theme.borderRadius.full,
    border: mobActive ? `3px solid ${theme.colors.danger}` : `2px solid ${theme.colors.border}`,
    backgroundColor: mobActive ? theme.colors.danger : theme.colors.surface,
    color: mobActive ? '#FFFFFF' : theme.colors.text,
    fontSize: sizes[size].font,
    fontWeight: theme.typography.weights.bold,
    cursor: 'pointer',
    touchAction: 'manipulation',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: mobActive ? `0 0 20px ${theme.colors.danger}` : 'none',
    animation: mobActive ? 'mobPulse 1s infinite' : undefined,
    opacity: position ? 1 : 0.5,
  };

  const infoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  };

  return (
    <>
      <style>
        {`
          @keyframes mobPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          style={buttonStyle}
          onClick={handlePress}
          disabled={!position}
          aria-label={mobActive ? 'Cancel MOB' : 'Man Overboard'}
        >
          {mobActive ? '❌' : '🆘'}
          <span style={{ fontSize: theme.typography.sizes.xs }}>MOB</span>
        </button>

        {mobActive && position && (
          <div style={infoStyle}>
            <span>{distance.toFixed(0)}m</span>
            <span>{bearing.toFixed(0)}°</span>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Compact MOB indicator showing distance/bearing when active
 */
interface MOBIndicatorProps {
  theme: Theme;
}

export function MOBIndicator({ theme }: MOBIndicatorProps) {
  const mobActive = useAppSelector((state) => state.mob.active);
  const mobPosition = useAppSelector((state) => state.mob.position);
  const position = useAppSelector((state) => state.navigation.navigation.position);

  if (!mobActive || !mobPosition || !position) return null;

  const distance = calculateDistance(
    position.latitude,
    position.longitude,
    mobPosition.latitude,
    mobPosition.longitude
  );
  const bearing = calculateBearing(
    position.latitude,
    position.longitude,
    mobPosition.latitude,
    mobPosition.longitude
  );

  const indicatorStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: theme.colors.danger,
    color: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    animation: 'mobPulse 1s infinite',
  };

  const formatDistance = (m: number) => {
    if (m < 1000) return `${m.toFixed(0)}m`;
    return `${(m / 1000).toFixed(2)}km`;
  };

  return (
    <div style={indicatorStyle}>
      <span>🆘 MOB</span>
      <span>{formatDistance(distance)}</span>
      <span>{bearing.toFixed(0)}°</span>
    </div>
  );
}
