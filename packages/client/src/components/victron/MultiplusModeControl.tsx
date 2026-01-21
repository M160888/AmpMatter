import type { CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';
import type { MultiplusMode } from '@ampmatter/shared';

interface MultiplusModeControlProps {
  theme: Theme;
  currentMode: MultiplusMode;
  onModeChange: (mode: MultiplusMode) => void;
}

const modeLabels: Record<MultiplusMode, string> = {
  on: 'On',
  off: 'Off',
  charger_only: 'Charger Only',
  inverter_only: 'Inverter Only',
};

export function MultiplusModeControl({
  theme,
  currentMode,
  onModeChange,
}: MultiplusModeControlProps) {
  // Only show the three main modes (on, off, charger_only)
  const modes: MultiplusMode[] = ['on', 'off', 'charger_only'];

  const containerStyle: CSSProperties = {
    marginTop: theme.spacing.md,
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  };

  const buttonGroupStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
  };

  const buttonStyle = (mode: MultiplusMode): CSSProperties => ({
    flex: 1,
    minHeight: theme.touchTarget.min,
    padding: theme.spacing.sm,
    backgroundColor: currentMode === mode
      ? theme.colors.primary
      : theme.colors.surface,
    color: currentMode === mode ? '#FFFFFF' : theme.colors.text,
    border: `2px solid ${currentMode === mode
      ? theme.colors.primary
      : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: theme.transitions.fast,
  });

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>Mode Control</div>
      <div style={buttonGroupStyle}>
        {modes.map((mode) => (
          <button
            key={mode}
            style={buttonStyle(mode)}
            onClick={() => onModeChange(mode)}
            aria-pressed={currentMode === mode}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}
