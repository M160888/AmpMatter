import { Theme } from '../../styles/theme';
import { formatSunTime } from '../../utils/sunCalc';
import type { SunTimes } from '@ampmatter/shared';

interface SunTimesDisplayProps {
  sunTimes: SunTimes | null;
  theme: Theme;
  compact?: boolean;
}

export function SunTimesDisplay({ sunTimes, theme, compact = false }: SunTimesDisplayProps) {
  if (!sunTimes) {
    return null;
  }

  const now = new Date();
  const isDaytime = now >= sunTimes.sunrise && now <= sunTimes.sunset;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        fontSize: compact ? theme.typography.sizes.sm : theme.typography.sizes.base,
        color: isDaytime ? theme.colors.text : theme.colors.textSecondary,
      }}
    >
      {/* Sunrise */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
        <span>↑</span>
        <span>{formatSunTime(sunTimes.sunrise)}</span>
      </div>

      {/* Sunset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
        <span>↓</span>
        <span>{formatSunTime(sunTimes.sunset)}</span>
      </div>
    </div>
  );
}
