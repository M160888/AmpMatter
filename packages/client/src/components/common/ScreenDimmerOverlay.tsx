import { type CSSProperties } from 'react';
import { useScreenDimmer } from '../../hooks/useScreenDimmer';

/**
 * Overlay that dims the screen based on activity.
 * Should be rendered at the root level of the app.
 */
export function ScreenDimmerOverlay() {
  const { screenState, effectiveBrightness, wake } = useScreenDimmer();

  // Don't render anything if screen is fully active
  if (screenState === 'active' && effectiveBrightness === 100) {
    return null;
  }

  // Calculate opacity from brightness (0% brightness = 100% overlay opacity)
  const overlayOpacity = 1 - effectiveBrightness / 100;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: overlayOpacity,
    pointerEvents: screenState === 'off' ? 'auto' : 'none',
    zIndex: 9999,
    transition: 'opacity 0.5s ease',
  };

  // For screen off state, clicking anywhere wakes the screen
  const handleClick = () => {
    if (screenState === 'off' || screenState === 'dimmed') {
      wake();
    }
  };

  return (
    <div
      style={overlayStyle}
      onClick={handleClick}
      onPointerDown={handleClick}
    />
  );
}

/**
 * Brightness slider component for settings
 */
import type { Theme } from '../../styles/theme';

interface BrightnessSliderProps {
  theme: Theme;
}

export function BrightnessSlider({ theme }: BrightnessSliderProps) {
  const { brightness, setBrightness, autoDimEnabled, dimmedBrightness } = useScreenDimmer();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    display: 'flex',
    justifyContent: 'space-between',
  };

  const sliderContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  };

  const sliderStyle: CSSProperties = {
    flex: 1,
    height: '8px',
    appearance: 'none',
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
  };

  const valueStyle: CSSProperties = {
    minWidth: '48px',
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'right',
  };

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>
        <span>Brightness</span>
        <span style={{ fontSize: theme.typography.sizes.xs }}>
          {autoDimEnabled && `(dims to ${dimmedBrightness}%)`}
        </span>
      </div>
      <div style={sliderContainerStyle}>
        <span style={{ color: theme.colors.textMuted }}>☀️</span>
        <input
          type="range"
          min={10}
          max={100}
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
          style={sliderStyle}
        />
        <span style={valueStyle}>{brightness}%</span>
      </div>
    </div>
  );
}
