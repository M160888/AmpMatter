import { type CSSProperties, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { acknowledgeAlert, dismissAlert, acknowledgeAll } from '../../store/slices/alertsSlice';
import type { Theme } from '../../styles/theme';
import type { AlertSeverity } from '../../store/slices/alertsSlice';

interface AlertBannerProps {
  theme: Theme;
}

// Simple beep using Web Audio API
function useAlertSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<number>(0);

  const playSound = useCallback((severity: AlertSeverity) => {
    // Debounce: don't play more than once per second
    const now = Date.now();
    if (now - lastPlayedRef.current < 1000) return;
    lastPlayedRef.current = now;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different tones for different severities
      if (severity === 'critical') {
        oscillator.frequency.value = 880; // High A
        oscillator.type = 'square';
        gainNode.gain.value = 0.3;
      } else if (severity === 'warning') {
        oscillator.frequency.value = 660; // E
        oscillator.type = 'triangle';
        gainNode.gain.value = 0.2;
      } else {
        oscillator.frequency.value = 440; // A
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
      }

      oscillator.start();

      // Beep pattern based on severity
      if (severity === 'critical') {
        // Triple beep for critical
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.stop(ctx.currentTime + 0.5);
      } else {
        // Single beep for others
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.warn('Could not play alert sound:', e);
    }
  }, []);

  return { playSound };
}

export function AlertBanner({ theme }: AlertBannerProps) {
  const dispatch = useAppDispatch();
  const activeAlerts = useAppSelector((state) => state.alerts.active);
  const soundEnabled = useAppSelector((state) => state.alerts.soundEnabled);
  const { playSound } = useAlertSound();

  // Get unacknowledged alerts sorted by severity
  const unacknowledgedAlerts = activeAlerts
    .filter((a) => !a.acknowledged)
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  const currentAlert = unacknowledgedAlerts[0];
  const alertCount = unacknowledgedAlerts.length;

  // Play sound for new critical/warning alerts
  useEffect(() => {
    if (currentAlert && soundEnabled && currentAlert.soundEnabled !== false) {
      if (currentAlert.severity === 'critical' || currentAlert.severity === 'warning') {
        playSound(currentAlert.severity);
      }
    }
  }, [currentAlert?.id, soundEnabled, playSound, currentAlert?.severity, currentAlert?.soundEnabled]);

  if (!currentAlert) return null;

  const getSeverityColors = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: theme.mode === 'day' ? '#FEE2E2' : '#450A0A',
          border: theme.colors.danger,
          text: theme.mode === 'day' ? '#991B1B' : '#FCA5A5',
        };
      case 'warning':
        return {
          bg: theme.mode === 'day' ? '#FEF3C7' : '#451A03',
          border: theme.colors.warning,
          text: theme.mode === 'day' ? '#92400E' : '#FCD34D',
        };
      case 'info':
      default:
        return {
          bg: theme.mode === 'day' ? '#DBEAFE' : '#1E3A5F',
          border: theme.colors.primary,
          text: theme.mode === 'day' ? '#1E40AF' : '#93C5FD',
        };
    }
  };

  const colors = getSeverityColors(currentAlert.severity);

  const bannerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: colors.bg,
    borderBottom: `2px solid ${colors.border}`,
    color: colors.text,
    animation: currentAlert.severity === 'critical' ? 'pulse 1s infinite' : undefined,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  };

  const iconStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    flexShrink: 0,
  };

  const textContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const titleStyle: CSSProperties = {
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.base,
  };

  const messageStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    opacity: 0.9,
  };

  const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };

  const buttonStyle: CSSProperties = {
    minWidth: theme.touchTarget.min,
    minHeight: theme.touchTarget.min,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    backgroundColor: 'transparent',
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
  };

  const dismissButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: colors.border,
    color: theme.mode === 'day' ? '#FFFFFF' : colors.text,
  };

  const getIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const handleAcknowledge = () => {
    if (alertCount > 1) {
      dispatch(acknowledgeAll());
    } else {
      dispatch(acknowledgeAlert(currentAlert.id));
    }
  };

  const handleDismiss = () => {
    dispatch(dismissAlert(currentAlert.id));
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}
      </style>
      <div style={bannerStyle}>
        <div style={contentStyle}>
          <span style={iconStyle}>{getIcon(currentAlert.severity)}</span>
          <div style={textContainerStyle}>
            <div style={titleStyle}>
              {currentAlert.title}
              {alertCount > 1 && (
                <span style={{ fontWeight: 'normal', marginLeft: theme.spacing.sm }}>
                  (+{alertCount - 1} more)
                </span>
              )}
            </div>
            <div style={messageStyle}>{currentAlert.message}</div>
          </div>
        </div>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={handleAcknowledge}>
            {alertCount > 1 ? 'Ack All' : 'Acknowledge'}
          </button>
          <button style={dismissButtonStyle} onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </>
  );
}

// Compact alert indicator for header
interface AlertIndicatorProps {
  theme: Theme;
  onClick?: () => void;
}

export function AlertIndicator({ theme, onClick }: AlertIndicatorProps) {
  const activeAlerts = useAppSelector((state) => state.alerts.active);
  const unacknowledged = activeAlerts.filter((a) => !a.acknowledged);

  if (unacknowledged.length === 0) return null;

  const hasCritical = unacknowledged.some((a) => a.severity === 'critical');
  const hasWarning = unacknowledged.some((a) => a.severity === 'warning');

  const indicatorStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    padding: `0 ${theme.spacing.xs}`,
    backgroundColor: hasCritical
      ? theme.colors.danger
      : hasWarning
        ? theme.colors.warning
        : theme.colors.primary,
    color: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    cursor: onClick ? 'pointer' : 'default',
    animation: hasCritical ? 'pulse 1s infinite' : undefined,
  };

  return (
    <div style={indicatorStyle} onClick={onClick}>
      {unacknowledged.length}
    </div>
  );
}
