import { type CSSProperties } from 'react';
import { useBilgeStatus } from '../../hooks/useBilgeMonitor';
import type { Theme } from '../../styles/theme';

interface BilgePanelProps {
  theme: Theme;
  compact?: boolean;
}

export function BilgePanel({ theme, compact = false }: BilgePanelProps) {
  const {
    enabled,
    isRunning,
    totalCycles24h,
    totalRunTime24h,
    cyclesPerHour,
    lastStateChange,
    hasInput,
  } = useBilgeStatus();

  if (!enabled || !hasInput) {
    return null; // Don't show if disabled or no input configured
  }

  const panelStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: compact ? theme.spacing.sm : theme.spacing.md,
    border: `1px solid ${isRunning ? theme.colors.warning : theme.colors.border}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: compact ? theme.spacing.xs : theme.spacing.sm,
  };

  const titleStyle: CSSProperties = {
    fontSize: compact ? theme.typography.sizes.sm : theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  };

  const statusBadgeStyle: CSSProperties = {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    backgroundColor: isRunning ? theme.colors.warning : theme.colors.success,
    color: '#FFFFFF',
  };

  const statsStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: theme.spacing.sm,
  };

  const statItemStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const statLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  };

  const statValueStyle: CSSProperties = {
    fontSize: compact ? theme.typography.sizes.base : theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  };

  const formatRunTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getLastRunText = () => {
    if (!lastStateChange) return 'Never';
    const ago = Date.now() - lastStateChange;
    if (ago < 60000) return 'Just now';
    if (ago < 3600000) return `${Math.round(ago / 60000)}m ago`;
    if (ago < 86400000) return `${Math.round(ago / 3600000)}h ago`;
    return `${Math.round(ago / 86400000)}d ago`;
  };

  const getCyclesColor = () => {
    if (cyclesPerHour > 6) return theme.colors.danger;
    if (cyclesPerHour > 3) return theme.colors.warning;
    return theme.colors.text;
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span>🚰</span>
          <span>Bilge Pump</span>
        </div>
        <span style={statusBadgeStyle}>
          {isRunning ? 'RUNNING' : 'Idle'}
        </span>
      </div>

      <div style={statsStyle}>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Cycles/hr</span>
          <span style={{ ...statValueStyle, color: getCyclesColor() }}>
            {cyclesPerHour}
          </span>
        </div>

        <div style={statItemStyle}>
          <span style={statLabelStyle}>24h Total</span>
          <span style={statValueStyle}>{totalCycles24h}</span>
        </div>

        {!compact && (
          <>
            <div style={statItemStyle}>
              <span style={statLabelStyle}>Run Time</span>
              <span style={statValueStyle}>{formatRunTime(totalRunTime24h)}</span>
            </div>

            <div style={statItemStyle}>
              <span style={statLabelStyle}>Last Run</span>
              <span style={statValueStyle}>{getLastRunText()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
