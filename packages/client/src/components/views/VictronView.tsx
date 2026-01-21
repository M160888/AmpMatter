import { VictronPanel } from '../victron/VictronPanel';
import { ChartGrid } from '../common/MiniChart';
import { useDataHistory } from '../../hooks/useDataHistory';
import type { Theme } from '../../styles/theme';

interface VictronViewProps {
  theme: Theme;
}

export function VictronView({ theme }: VictronViewProps) {
  const { batterySOC, batteryVoltage, solarPower } = useDataHistory();

  const charts = [
    {
      data: batterySOC.data,
      label: 'Battery SOC',
      unit: '%',
      color: theme.colors.success,
      minValue: 0,
      maxValue: 100,
    },
    {
      data: batteryVoltage.data,
      label: 'Voltage',
      unit: 'V',
      color: theme.colors.primary,
    },
    {
      data: solarPower.data,
      label: 'Solar',
      unit: 'W',
      color: theme.colors.warning,
      minValue: 0,
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
      }}
    >
      {/* VictronPanel */}
      <div style={{ marginBottom: theme.spacing.sm }}>
        <VictronPanel theme={theme} />
      </div>

      {/* History Charts */}
      <div>
        <div
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
            fontWeight: theme.typography.weights.medium,
          }}
        >
          History (6h)
        </div>
        <ChartGrid theme={theme} charts={charts} />
      </div>
    </div>
  );
}
