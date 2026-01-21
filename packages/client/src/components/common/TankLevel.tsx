import type { CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';
import type { TankType } from '@ampmatter/shared';

interface TankLevelProps {
  theme: Theme;
  name: string;
  type: TankType;
  level: number;      // 0-100
  capacity?: number;  // Liters
}

const tankColors: Record<TankType, string> = {
  freshWater: '#4A90D9',
  fuel: '#D4A84B',
  wasteWater: '#8B8B8B',
  blackWater: '#4A4A4A',
  liveWell: '#5AB88F',
};

const tankIcons: Record<TankType, string> = {
  freshWater: 'Water',
  fuel: 'Fuel',
  wasteWater: 'Grey',
  blackWater: 'Black',
  liveWell: 'Live',
};

export function TankLevel({ theme, name, type, level, capacity }: TankLevelProps) {
  const color = tankColors[type];
  const clampedLevel = Math.max(0, Math.min(100, level));

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const labelRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const nameStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  };

  const valueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  };

  const barContainerStyle: CSSProperties = {
    width: '100%',
    height: '24px',
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  };

  const barFillStyle: CSSProperties = {
    width: `${clampedLevel}%`,
    height: '100%',
    backgroundColor: color,
    transition: theme.transitions.normal,
    borderRadius: theme.borderRadius.sm,
  };

  const typeIndicatorStyle: CSSProperties = {
    position: 'absolute',
    left: theme.spacing.sm,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: clampedLevel > 20 ? '#FFFFFF' : theme.colors.textSecondary,
    textShadow: clampedLevel > 20 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
  };

  const capacityStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  };

  return (
    <div style={containerStyle}>
      <div style={labelRowStyle}>
        <span style={nameStyle}>{name}</span>
        <span style={valueStyle}>{Math.round(clampedLevel)}%</span>
      </div>
      <div style={barContainerStyle}>
        <div style={barFillStyle} />
        <span style={typeIndicatorStyle}>{tankIcons[type]}</span>
      </div>
      {capacity && (
        <div style={capacityStyle}>
          {Math.round((clampedLevel / 100) * capacity)}L / {capacity}L
        </div>
      )}
    </div>
  );
}
