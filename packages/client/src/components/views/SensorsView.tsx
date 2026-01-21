import { SensorPanel } from '../sensors/SensorPanel';
import { Card } from '../common/Card';
import { BarometerDisplay } from '../common/BarometerDisplay';
import { BilgePanel } from '../common/BilgePanel';
import { useAppSelector } from '../../store';
import type { Theme } from '../../styles/theme';

interface SensorsViewProps {
  theme: Theme;
}

export function SensorsView({ theme }: SensorsViewProps) {
  const weather = useAppSelector((state) => state.weather);
  const showBarometer = useAppSelector((state) => state.settings.viewSettings.showBarometer);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
      }}
    >
      {/* Barometric Pressure Card */}
      {showBarometer && weather.barometricPressure && (
        <div style={{ marginBottom: theme.spacing.sm }}>
          <Card theme={theme} title="Weather">
            <BarometerDisplay pressure={weather.barometricPressure} theme={theme} />
          </Card>
        </div>
      )}

      {/* Bilge Pump Monitor */}
      <div style={{ marginBottom: theme.spacing.sm }}>
        <BilgePanel theme={theme} />
      </div>

      {/* Sensor Panel */}
      <div>
        <SensorPanel theme={theme} />
      </div>
    </div>
  );
}
