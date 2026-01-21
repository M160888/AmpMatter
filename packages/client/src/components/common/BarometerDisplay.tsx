import { Theme } from '../../styles/theme';
import type { BarometricPressure } from '@ampmatter/shared';

interface BarometerDisplayProps {
  pressure: BarometricPressure | null;
  theme: Theme;
  compact?: boolean;
}

export function BarometerDisplay({ pressure, theme, compact = false }: BarometerDisplayProps) {
  if (!pressure) {
    return (
      <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm }}>
        No data
      </div>
    );
  }

  // Determine color based on pressure value
  // High pressure (>1020 hPa) = good weather = green
  // Low pressure (<1000 hPa) = bad weather = warning
  let pressureColor = theme.colors.text;
  if (pressure.value > 1020) {
    pressureColor = theme.colors.success;
  } else if (pressure.value < 1000) {
    pressureColor = theme.colors.warning;
  }

  // Trend indicator
  const trendSymbol = pressure.trend === 'rising' ? '↑' : pressure.trend === 'falling' ? '↓' : '→';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: compact ? 'center' : 'flex-start',
        gap: theme.spacing.xs,
      }}
    >
      <div
        style={{
          fontSize: compact ? theme.typography.sizes.base : theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.bold,
          color: pressureColor,
        }}
      >
        {pressure.value.toFixed(1)} hPa
      </div>
      {pressure.trend && (
        <div
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}
        >
          <span>{trendSymbol}</span>
          <span style={{ textTransform: 'capitalize' }}>{pressure.trend}</span>
        </div>
      )}
    </div>
  );
}
