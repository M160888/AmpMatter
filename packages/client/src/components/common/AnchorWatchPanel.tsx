import { type CSSProperties, useState } from 'react';
import { useAnchorWatch } from '../../hooks/useAnchorWatch';
import type { Theme } from '../../styles/theme';

interface AnchorWatchPanelProps {
  theme: Theme;
  compact?: boolean;
}

export function AnchorWatchPanel({ theme, compact = false }: AnchorWatchPanelProps) {
  const {
    isAnchored,
    watchRadius,
    watchEnabled,
    currentDrift,
    maxDrift,
    hasPosition,
    dropAnchor,
    raiseAnchor,
    setWatchRadius,
    setWatchEnabled,
  } = useAnchorWatch();

  const [showRadiusInput, setShowRadiusInput] = useState(false);
  const [radiusValue, setRadiusValue] = useState(watchRadius.toString());

  const panelStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: compact ? theme.spacing.sm : theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
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

  const buttonStyle: CSSProperties = {
    minWidth: theme.touchTarget.min,
    minHeight: theme.touchTarget.min,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
  };

  const primaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
  };

  const dangerButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.colors.danger,
    color: '#FFFFFF',
  };

  const secondaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.colors.surfaceHover,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  };

  const statsStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
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

  const getDriftColor = () => {
    if (!isAnchored) return theme.colors.text;
    const ratio = currentDrift / watchRadius;
    if (ratio > 1) return theme.colors.danger;
    if (ratio > 0.8) return theme.colors.warning;
    return theme.colors.success;
  };

  const inputStyle: CSSProperties = {
    width: '80px',
    padding: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  };

  const controlsStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const handleRadiusSubmit = () => {
    const value = parseInt(radiusValue, 10);
    if (!isNaN(value) && value >= 10 && value <= 500) {
      setWatchRadius(value);
    }
    setShowRadiusInput(false);
  };

  if (!isAnchored) {
    // Not anchored - show drop anchor button
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={titleStyle}>
            <span>⚓</span>
            <span>Anchor Watch</span>
          </div>
        </div>
        <button
          style={{
            ...primaryButtonStyle,
            width: '100%',
            opacity: hasPosition ? 1 : 0.5,
          }}
          onClick={dropAnchor}
          disabled={!hasPosition}
        >
          {hasPosition ? 'Drop Anchor' : 'Waiting for GPS...'}
        </button>
      </div>
    );
  }

  // Anchored - show watch status
  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span>⚓</span>
          <span>Anchor Watch</span>
          {watchEnabled && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: theme.colors.success,
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </div>
        <button
          style={dangerButtonStyle}
          onClick={raiseAnchor}
        >
          Raise
        </button>
      </div>

      <div style={statsStyle}>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Drift</span>
          <span style={{ ...statValueStyle, color: getDriftColor() }}>
            {currentDrift.toFixed(0)}m
          </span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Max</span>
          <span style={statValueStyle}>{maxDrift.toFixed(0)}m</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Radius</span>
          {showRadiusInput ? (
            <div style={{ display: 'flex', gap: theme.spacing.xs }}>
              <input
                type="number"
                style={inputStyle}
                value={radiusValue}
                onChange={(e) => setRadiusValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRadiusSubmit()}
                min={10}
                max={500}
                autoFocus
              />
              <button
                style={{ ...secondaryButtonStyle, minWidth: 'auto', padding: theme.spacing.xs }}
                onClick={handleRadiusSubmit}
              >
                Set
              </button>
            </div>
          ) : (
            <span
              style={{ ...statValueStyle, cursor: 'pointer' }}
              onClick={() => {
                setRadiusValue(watchRadius.toString());
                setShowRadiusInput(true);
              }}
            >
              {watchRadius}m
            </span>
          )}
        </div>
      </div>

      <div style={controlsStyle}>
        <button
          style={watchEnabled ? secondaryButtonStyle : primaryButtonStyle}
          onClick={() => setWatchEnabled(!watchEnabled)}
        >
          {watchEnabled ? 'Pause Watch' : 'Resume Watch'}
        </button>
        {!compact && (
          <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary }}>
            Alert when drift exceeds radius
          </span>
        )}
      </div>
    </div>
  );
}
