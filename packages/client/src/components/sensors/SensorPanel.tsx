import type { CSSProperties } from 'react';
import { useAppSelector } from '../../store';
import type { Theme } from '../../styles/theme';
import { Card } from '../common/Card';
import { TankLevel } from '../common/TankLevel';

interface SensorPanelProps {
  theme: Theme;
}

export function SensorPanel({ theme }: SensorPanelProps) {
  const sensors = useAppSelector((state) => state.sensors);
  const navigation = useAppSelector((state) => state.navigation.navigation);

  const panelStyle: CSSProperties = {
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.xs} 0`,
    borderBottom: `1px solid ${theme.colors.border}`,
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  };

  const valueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  };

  const bigValueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
  };

  const unitStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  };

  const formatSpeed = (knots: number | null | undefined) => {
    if (knots == null) return '--';
    return knots.toFixed(1);
  };

  const formatCourse = (degrees: number | null | undefined) => {
    if (degrees == null) return '--';
    return `${Math.round(degrees)}°`;
  };

  const formatDepth = (meters: number | undefined) => {
    if (meters === undefined) return '--';
    return meters.toFixed(1);
  };

  const getTemperatureColor = (temp: number, min?: number, max?: number) => {
    if (max && temp >= max) return theme.colors.danger;
    if (min && temp <= min) return theme.colors.warning;
    return theme.colors.text;
  };

  return (
    <div style={panelStyle}>
      {/* Navigation Data */}
      <Card theme={theme} title="Navigation">
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: theme.spacing.md }}>
          <div style={{ textAlign: 'center' }}>
            <div style={bigValueStyle}>
              {formatSpeed(navigation.speedOverGround)}
              <span style={unitStyle}>kts</span>
            </div>
            <div style={labelStyle}>SOG</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={bigValueStyle}>
              {formatCourse(navigation.courseOverGround)}
            </div>
            <div style={labelStyle}>COG</div>
          </div>
        </div>

        {navigation.depth && (
          <div style={rowStyle}>
            <span style={labelStyle}>Depth</span>
            <span style={{
              ...valueStyle,
              color: navigation.depth.belowTransducer < 3 ? theme.colors.danger :
                     navigation.depth.belowTransducer < 5 ? theme.colors.warning : theme.colors.text,
            }}>
              {formatDepth(navigation.depth.belowTransducer)} m
            </span>
          </div>
        )}

        {navigation.headingMagnetic !== null && (
          <div style={rowStyle}>
            <span style={labelStyle}>Heading</span>
            <span style={valueStyle}>{formatCourse(navigation.headingMagnetic)}</span>
          </div>
        )}
      </Card>

      {/* Tank Levels */}
      {sensors.tanks.length > 0 && (
        <Card theme={theme} title="Tanks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            {sensors.tanks.map((tank) => (
              <TankLevel
                key={tank.id}
                theme={theme}
                name={tank.name}
                type={tank.type}
                level={tank.currentLevel}
                capacity={tank.capacity}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Temperature Sensors */}
      {sensors.temperatures.length > 0 && (
        <Card theme={theme} title="Temperatures">
          {sensors.temperatures.map((sensor) => (
            <div key={sensor.id} style={rowStyle}>
              <span style={labelStyle}>{sensor.name}</span>
              <span style={{
                ...valueStyle,
                color: getTemperatureColor(sensor.value, sensor.minAlarm, sensor.maxAlarm),
              }}>
                {sensor.value.toFixed(1)}°C
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* Digital Inputs */}
      {sensors.digitalInputs.length > 0 && (
        <Card theme={theme} title="Status">
          {sensors.digitalInputs.map((input) => (
            <div key={input.id} style={rowStyle}>
              <span style={labelStyle}>{input.name}</span>
              <span style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.sizes.xs,
                fontWeight: theme.typography.weights.medium,
                backgroundColor: input.state ? theme.colors.success : theme.colors.border,
                color: input.state ? '#FFFFFF' : theme.colors.textMuted,
              }}>
                {input.state ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* Wind Data (if available) */}
      {navigation.wind && (
        <Card theme={theme} title="Wind">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={bigValueStyle}>
                {navigation.wind.speedApparent.toFixed(1)}
                <span style={unitStyle}>kts</span>
              </div>
              <div style={labelStyle}>AWS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={bigValueStyle}>
                {Math.round(navigation.wind.angleApparent)}°
              </div>
              <div style={labelStyle}>AWA</div>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Status */}
      {!sensors.connected && sensors.tanks.length === 0 && (
        <div style={{
          padding: theme.spacing.md,
          textAlign: 'center',
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.sm,
        }}>
          Waiting for sensor data...
        </div>
      )}
    </div>
  );
}
