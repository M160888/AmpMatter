import { useState, useEffect, type CSSProperties } from 'react';
import { useAppSelector } from '../../store';
import type { Theme } from '../../styles/theme';

interface SensorTesterProps {
  theme: Theme;
}

interface SensorReading {
  sensorId: string;
  rawValue: number;
  scaledValue: number;
  unit: string;
  timestamp: number;
  status: 'ok' | 'warning' | 'error';
}

export function SensorTester({ theme }: SensorTesterProps) {
  const sensors = useAppSelector((state) => state.sensorConfig.sensors);
  const enabledSensors = sensors.filter((s) => s.enabled);
  const [readings, setReadings] = useState<Record<string, SensorReading>>({});
  const [monitoring, setMonitoring] = useState(false);

  // Mock sensor reading simulation
  useEffect(() => {
    if (!monitoring) return;

    const interval = setInterval(() => {
      const newReadings: Record<string, SensorReading> = {};

      enabledSensors.forEach((sensor) => {
        // Generate mock readings based on sensor type
        let rawValue = 0;
        let scaledValue = 0;

        if (sensor.calibration) {
          rawValue = Math.random() * (sensor.calibration.rawMax - sensor.calibration.rawMin) + sensor.calibration.rawMin;
          const range = sensor.calibration.rawMax - sensor.calibration.rawMin;
          const scaledRange = sensor.calibration.scaledMax - sensor.calibration.scaledMin;
          scaledValue = ((rawValue - sensor.calibration.rawMin) / range) * scaledRange + sensor.calibration.scaledMin;
        } else {
          // Generate values based on sensor type
          switch (sensor.type) {
            case 'temperature':
              rawValue = Math.random() * 50 + 15; // 15-65°C
              scaledValue = rawValue;
              break;
            case 'tank':
              rawValue = Math.random() * 100; // 0-100%
              scaledValue = rawValue;
              break;
            case 'voltage':
              rawValue = Math.random() * 5 + 10; // 10-15V
              scaledValue = rawValue;
              break;
            case 'current':
              rawValue = Math.random() * 20; // 0-20A
              scaledValue = rawValue;
              break;
            case 'pressure':
              rawValue = Math.random() * 100; // 0-100 psi
              scaledValue = rawValue;
              break;
            case 'humidity':
              rawValue = Math.random() * 100; // 0-100%
              scaledValue = rawValue;
              break;
            case 'digital_input':
              rawValue = Math.random() > 0.5 ? 1 : 0;
              scaledValue = rawValue;
              break;
            default:
              rawValue = Math.random() * 1023; // Generic ADC value
              scaledValue = rawValue;
          }
        }

        // Determine status based on alarms
        let status: 'ok' | 'warning' | 'error' = 'ok';
        if (sensor.minAlarm !== undefined && scaledValue < sensor.minAlarm) {
          status = 'warning';
        }
        if (sensor.maxAlarm !== undefined && scaledValue > sensor.maxAlarm) {
          status = 'warning';
        }

        newReadings[sensor.id] = {
          sensorId: sensor.id,
          rawValue,
          scaledValue,
          unit: sensor.calibration?.unit || sensor.displayUnit || '',
          timestamp: Date.now(),
          status,
        };
      });

      setReadings(newReadings);
    }, 1000);

    return () => clearInterval(interval);
  }, [monitoring, enabledSensors]);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'secondary'): CSSProperties => ({
    minHeight: theme.touchTarget.min,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor:
      variant === 'primary' ? theme.colors.primary :
      variant === 'danger' ? theme.colors.danger :
      theme.colors.surface,
    color: variant !== 'secondary' ? '#FFFFFF' : theme.colors.text,
    border: variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  });

  const readingCardStyle = (status: 'ok' | 'warning' | 'error'): CSSProperties => ({
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${
      status === 'error' ? theme.colors.danger :
      status === 'warning' ? theme.colors.warning :
      theme.colors.border
    }`,
  });

  const getSensorIcon = (type: string) => {
    const icons: Record<string, string> = {
      tank: '🪣',
      temperature: '🌡️',
      digital_input: '🔘',
      analog_input: '📊',
      pressure: '💨',
      humidity: '💧',
      bilge_pump: '⚓',
      voltage: '⚡',
      current: '🔌',
    };
    return icons[type] || '📡';
  };

  const formatValue = (value: number, decimals?: number) => {
    return value.toFixed(decimals ?? 2);
  };

  return (
    <div style={containerStyle}>
      {/* Control Buttons */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.sm,
      }}>
        <button
          onClick={() => setMonitoring(!monitoring)}
          style={{
            ...buttonStyle(monitoring ? 'danger' : 'primary'),
            flex: 1,
          }}
        >
          {monitoring ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
        </button>
        {monitoring && (
          <button
            onClick={() => setReadings({})}
            style={buttonStyle('secondary')}
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {/* Status Display */}
      {monitoring && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.success + '20',
          borderRadius: theme.borderRadius.md,
          border: `2px solid ${theme.colors.success}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.success,
          }}>
            ● LIVE MONITORING
          </div>
          <div style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text,
            marginTop: theme.spacing.xs,
          }}>
            {enabledSensors.length} sensor{enabledSensors.length !== 1 ? 's' : ''} active
          </div>
        </div>
      )}

      {/* Sensor Readings */}
      {enabledSensors.length === 0 ? (
        <div style={{
          padding: theme.spacing.xl,
          textAlign: 'center',
          color: theme.colors.textSecondary,
          fontSize: theme.typography.sizes.base,
        }}>
          No enabled sensors to monitor. Add and enable sensors in the Sensor Configuration section.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm,
          maxHeight: '500px',
          overflowY: 'auto',
        }}>
          {enabledSensors.map((sensor) => {
            const reading = readings[sensor.id];
            const hasReading = reading && monitoring;

            return (
              <div key={sensor.id} style={readingCardStyle(reading?.status || 'ok')}>
                {/* Sensor Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing.sm,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: theme.typography.sizes.base,
                      fontWeight: theme.typography.weights.medium,
                      color: theme.colors.text,
                    }}>
                      {getSensorIcon(sensor.type)} {sensor.name}
                    </div>
                    <div style={{
                      fontSize: theme.typography.sizes.xs,
                      color: theme.colors.textSecondary,
                      marginTop: theme.spacing.xs,
                    }}>
                      {sensor.interface.toUpperCase()} • {sensor.location || 'No location'}
                    </div>
                  </div>

                  {hasReading && (
                    <div style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      backgroundColor:
                        reading.status === 'error' ? theme.colors.danger + '30' :
                        reading.status === 'warning' ? theme.colors.warning + '30' :
                        theme.colors.success + '30',
                      color:
                        reading.status === 'error' ? theme.colors.danger :
                        reading.status === 'warning' ? theme.colors.warning :
                        theme.colors.success,
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.sizes.xs,
                      fontWeight: theme.typography.weights.bold,
                    }}>
                      {reading.status.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Reading Display */}
                {hasReading ? (
                  <div style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.borderRadius.sm,
                    padding: theme.spacing.md,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: theme.spacing.sm,
                    }}>
                      <div style={{
                        fontSize: theme.typography.sizes.xs,
                        color: theme.colors.textSecondary,
                      }}>
                        Scaled Value
                      </div>
                      <div style={{
                        fontSize: theme.typography.sizes.xxl,
                        fontWeight: theme.typography.weights.bold,
                        color: theme.colors.text,
                        fontFamily: 'monospace',
                      }}>
                        {formatValue(reading.scaledValue, sensor.decimals)}
                        <span style={{
                          fontSize: theme.typography.sizes.base,
                          marginLeft: theme.spacing.xs,
                          color: theme.colors.textSecondary,
                        }}>
                          {reading.unit}
                        </span>
                      </div>
                    </div>

                    {sensor.calibration && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: theme.spacing.sm,
                        borderTop: `1px solid ${theme.colors.border}`,
                      }}>
                        <div style={{
                          fontSize: theme.typography.sizes.xs,
                          color: theme.colors.textSecondary,
                        }}>
                          Raw Value
                        </div>
                        <div style={{
                          fontSize: theme.typography.sizes.sm,
                          fontFamily: 'monospace',
                          color: theme.colors.textSecondary,
                        }}>
                          {formatValue(reading.rawValue, 0)}
                        </div>
                      </div>
                    )}

                    {/* Alarm Indicators */}
                    {(sensor.minAlarm !== undefined || sensor.maxAlarm !== undefined) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: theme.spacing.sm,
                        paddingTop: theme.spacing.sm,
                        borderTop: `1px solid ${theme.colors.border}`,
                        fontSize: theme.typography.sizes.xs,
                        color: theme.colors.textSecondary,
                      }}>
                        {sensor.minAlarm !== undefined && (
                          <div>Min: {sensor.minAlarm} {reading.unit}</div>
                        )}
                        {sensor.maxAlarm !== undefined && (
                          <div>Max: {sensor.maxAlarm} {reading.unit}</div>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div style={{
                      fontSize: theme.typography.sizes.xs,
                      color: theme.colors.textSecondary,
                      textAlign: 'right',
                      marginTop: theme.spacing.xs,
                    }}>
                      Updated: {new Date(reading.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.borderRadius.sm,
                    textAlign: 'center',
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.sizes.sm,
                  }}>
                    {monitoring ? 'Waiting for data...' : 'Start monitoring to see values'}
                  </div>
                )}

                {/* Configuration Summary */}
                <div style={{
                  marginTop: theme.spacing.sm,
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.textSecondary,
                }}>
                  {sensor.interface === 'gpio' && sensor.gpioConfig && (
                    <div>GPIO Pin {sensor.gpioConfig.pin} ({sensor.gpioConfig.mode})</div>
                  )}
                  {sensor.interface === 'i2c' && sensor.i2cConfig && (
                    <div>I2C 0x{sensor.i2cConfig.address.toString(16).toUpperCase()} @ Bus {sensor.i2cConfig.bus}</div>
                  )}
                  {sensor.interface === 'automation2040w' && sensor.automation2040wConfig && (
                    <div>{sensor.automation2040wConfig.deviceId} Ch{sensor.automation2040wConfig.channel}</div>
                  )}
                  {sensor.interface === 'mqtt' && sensor.mqttConfig && (
                    <div>{sensor.mqttConfig.topic}</div>
                  )}
                  {sensor.updateInterval && (
                    <div>Update: {sensor.updateInterval}ms{sensor.smoothing && sensor.smoothing > 1 ? ` • Avg: ${sensor.smoothing}` : ''}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: theme.spacing.sm,
      }}>
        💡 Note: Currently showing simulated sensor data. Real sensor integration requires hardware configuration.
      </div>
    </div>
  );
}
