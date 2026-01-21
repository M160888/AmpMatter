import { Theme } from '../../styles/theme';

interface CompactGaugeProps {
  value: number;
  label: string;
  unit?: string;
  size?: 'xs' | 'sm';
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  theme: Theme;
}

export function CompactGauge({
  value,
  label,
  unit = '',
  size = 'sm',
  color,
  warningThreshold,
  dangerThreshold,
  theme,
}: CompactGaugeProps) {
  const sizeMap = { xs: 40, sm: 60 };
  const diameter = sizeMap[size];
  const strokeWidth = 4;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  // Determine color based on thresholds
  let gaugeColor = color || theme.colors.primary;
  if (dangerThreshold !== undefined && value <= dangerThreshold) {
    gaugeColor = theme.colors.danger;
  } else if (warningThreshold !== undefined && value <= warningThreshold) {
    gaugeColor = theme.colors.warning;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size === 'xs' ? '2px' : theme.spacing.xs,
      }}
    >
      <svg width={diameter} height={diameter} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize={size === 'xs' ? '12px' : '14px'}
          fontWeight="bold"
          fill={theme.colors.text}
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
        >
          {Math.round(value)}{unit}
        </text>
      </svg>
      <div
        style={{
          fontSize: size === 'xs' ? '10px' : theme.typography.sizes.xs,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          lineHeight: '1.2',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
}
