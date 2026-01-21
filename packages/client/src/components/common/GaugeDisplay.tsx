import type { CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';

interface GaugeDisplayProps {
  theme: Theme;
  value: number;       // 0-100
  label: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  color?: string;
  warningThreshold?: number;  // Below this shows warning color
  dangerThreshold?: number;   // Below this shows danger color
  arcDegrees?: 270 | 360;     // Arc span: 270 for 3/4 dial, 360 for full circle
}

export function GaugeDisplay({
  theme,
  value,
  label,
  unit = '%',
  size = 'md',
  showValue = true,
  color,
  warningThreshold = 30,
  dangerThreshold = 15,
  arcDegrees = 360,
}: GaugeDisplayProps) {
  const sizes = {
    sm: { diameter: 80, stroke: 6, fontSize: theme.typography.sizes.lg },
    md: { diameter: 100, stroke: 8, fontSize: theme.typography.sizes.xl },
    lg: { diameter: 130, stroke: 10, fontSize: theme.typography.sizes.xxl },
  };

  const { diameter, stroke, fontSize } = sizes[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));

  // For 270-degree arc, we only use 75% of the circumference
  const is270 = arcDegrees === 270;
  const arcLength = is270 ? circumference * 0.75 : circumference;
  const offset = arcLength - (progress / 100) * arcLength;

  // Rotation: 270-degree arc starts at bottom-left (135deg from top)
  // 360-degree arc starts at top (-90deg)
  const rotationDeg = is270 ? 135 : -90;

  // Determine color based on value and thresholds
  const getColor = () => {
    if (color) return color;
    if (value <= dangerThreshold) return theme.colors.danger;
    if (value <= warningThreshold) return theme.colors.warning;
    return theme.colors.success;
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
    position: 'relative',
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  };

  if (is270) {
    // 270-degree arc with value in bottom gap
    return (
      <div style={containerStyle}>
        <svg width={diameter} height={diameter}>
          <g transform={`rotate(${rotationDeg} ${diameter / 2} ${diameter / 2})`}>
            {/* Background arc */}
            <circle
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              stroke={theme.colors.border}
              strokeWidth={stroke}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth={stroke}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: theme.transitions.normal }}
            />
          </g>
        </svg>
        {/* Value displayed in the bottom gap */}
        {showValue && (
          <div
            style={{
              position: 'absolute',
              bottom: theme.spacing.xs,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <span style={{
              fontSize,
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.text,
            }}>
              {Math.round(value)}
            </span>
            <span style={{
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.textSecondary,
            }}>
              {unit}
            </span>
          </div>
        )}
        <div style={{ ...labelStyle, marginTop: theme.spacing.sm }}>{label}</div>
      </div>
    );
  }

  // Full 360-degree circle (original behavior)
  return (
    <div style={containerStyle}>
      <svg width={diameter} height={diameter} style={{ transform: `rotate(${rotationDeg}deg)` }}>
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: theme.transitions.normal }}
        />
      </svg>
      {showValue && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
          }}
        >
          {Math.round(value)}
          <span style={{ fontSize: theme.typography.sizes.sm }}>{unit}</span>
        </div>
      )}
      <div style={labelStyle}>{label}</div>
    </div>
  );
}
