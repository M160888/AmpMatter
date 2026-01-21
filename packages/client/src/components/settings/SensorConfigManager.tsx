import { useState, type CSSProperties } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeSensor, toggleSensor } from '../../store/slices/sensorConfigSlice';
import { SensorEditor } from './SensorEditor';
import { SensorTester } from './SensorTester';
import { Automation2040WDiscovery } from './Automation2040WDiscovery';
import type { Theme } from '../../styles/theme';
import type { SensorDefinition, SensorType, SensorInterface } from '@ampmatter/shared';

interface SensorConfigManagerProps {
  theme: Theme;
}

export function SensorConfigManager({ theme }: SensorConfigManagerProps) {
  const dispatch = useAppDispatch();
  const { sensors, automation2040wDevices } = useAppSelector((state) => state.sensorConfig);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorDefinition | null>(null);
  const [showTester, setShowTester] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'secondary', small = false): CSSProperties => ({
    minHeight: small ? '32px' : theme.touchTarget.min,
    padding: small ? `${theme.spacing.xs} ${theme.spacing.sm}` : `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor:
      variant === 'primary' ? theme.colors.primary :
      variant === 'danger' ? theme.colors.danger :
      theme.colors.surface,
    color: variant !== 'secondary' ? '#FFFFFF' : theme.colors.text,
    border: variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: small ? theme.typography.sizes.sm : theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  });

  const sensorItemStyle = (enabled: boolean): CSSProperties => ({
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${enabled ? theme.colors.primary : theme.colors.border}`,
    opacity: enabled ? 1 : 0.6,
  });


  const getSensorTypeLabel = (type: SensorType): string => {
    const labels: Record<SensorType, string> = {
      tank: '🪣 Tank Level',
      temperature: '🌡️ Temperature',
      digital_input: '🔘 Digital Input',
      analog_input: '📊 Analog Input',
      pressure: '💨 Pressure',
      humidity: '💧 Humidity',
      bilge_pump: '⚓ Bilge Pump',
      voltage: '⚡ Voltage',
      current: '🔌 Current',
    };
    return labels[type] || type;
  };

  const getInterfaceLabel = (iface: SensorInterface): string => {
    const labels: Record<SensorInterface, string> = {
      gpio: 'GPIO Pin',
      i2c: 'I2C Bus',
      automation2040w: 'Automation 2040W',
      signalk: 'Signal K',
      mqtt: 'MQTT Topic',
    };
    return labels[iface] || iface;
  };

  return (
    <div style={containerStyle}>
      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.sm,
      }}>
        <button
          onClick={() => {
            setShowAddModal(true);
            setShowTester(false);
            setShowDiscovery(false);
          }}
          style={buttonStyle('primary')}
        >
          ➕ Add Sensor
        </button>
        <button
          onClick={() => {
            setShowTester(!showTester);
            setShowDiscovery(false);
          }}
          style={buttonStyle(showTester ? 'primary' : 'secondary')}
        >
          {showTester ? '⚙️ Configure' : '🧪 Test'}
        </button>
        <button
          onClick={() => {
            setShowDiscovery(!showDiscovery);
            setShowTester(false);
          }}
          style={{
            ...buttonStyle(showDiscovery ? 'primary' : 'secondary'),
            gridColumn: '1 / -1',
          }}
        >
          {showDiscovery ? '⚙️ Back to Sensors' : '🔍 Discover A2040W Devices'}
        </button>
      </div>

      {/* Sensor Tester */}
      {showTester && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `2px solid ${theme.colors.primary}`,
        }}>
          <div style={{
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
          }}>
            Sensor Testing & Monitoring
          </div>
          <SensorTester theme={theme} />
        </div>
      )}

      {/* Automation 2040W Discovery */}
      {showDiscovery && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `2px solid ${theme.colors.primary}`,
        }}>
          <div style={{
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
          }}>
            Automation 2040W Device Discovery
          </div>
          <Automation2040WDiscovery theme={theme} />
        </div>
      )}

      {/* Automation 2040W Devices */}
      {!showTester && !showDiscovery && automation2040wDevices.length > 0 && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}>
            Automation 2040W Devices
          </div>
          {automation2040wDevices.map((device) => (
            <div key={device.id} style={{
              padding: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.sm,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontSize: theme.typography.sizes.base,
                  color: theme.colors.text,
                  fontWeight: theme.typography.weights.medium,
                }}>
                  {device.name}
                </div>
                <div style={{
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.textSecondary,
                }}>
                  {device.ipAddress} • {device.connected ? '✓ Connected' : '✗ Disconnected'}
                </div>
              </div>
              <div style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                backgroundColor: device.connected ? theme.colors.success + '30' : theme.colors.danger + '30',
                color: device.connected ? theme.colors.success : theme.colors.danger,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.sizes.xs,
                fontWeight: theme.typography.weights.bold,
              }}>
                {device.connected ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sensor List */}
      {!showTester && !showDiscovery && sensors.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm,
        }}>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
          }}>
            Configured Sensors ({sensors.length})
          </div>
          {sensors.map((sensor) => (
            <div key={sensor.id} style={sensorItemStyle(sensor.enabled)}>
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
                    marginBottom: theme.spacing.xs,
                  }}>
                    {sensor.name}
                  </div>
                  <div style={{
                    fontSize: theme.typography.sizes.sm,
                    color: theme.colors.textSecondary,
                  }}>
                    {getSensorTypeLabel(sensor.type)} • {getInterfaceLabel(sensor.interface)}
                  </div>
                  {sensor.location && (
                    <div style={{
                      fontSize: theme.typography.sizes.xs,
                      color: theme.colors.textSecondary,
                      marginTop: theme.spacing.xs,
                    }}>
                      📍 {sensor.location}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dispatch(toggleSensor(sensor.id))}
                  style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: theme.borderRadius.full,
                    border: 'none',
                    backgroundColor: sensor.enabled ? theme.colors.success : theme.colors.surfaceHover,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: theme.transitions.fast,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: sensor.enabled ? '25px' : '3px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transition: theme.transitions.fast,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {/* Sensor Details */}
              <div style={{
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
              }}>
                {sensor.interface === 'gpio' && sensor.gpioConfig && (
                  <div>GPIO Pin {sensor.gpioConfig.pin} ({sensor.gpioConfig.mode})</div>
                )}
                {sensor.interface === 'i2c' && sensor.i2cConfig && (
                  <div>I2C Address: 0x{sensor.i2cConfig.address.toString(16).toUpperCase()} on Bus {sensor.i2cConfig.bus}</div>
                )}
                {sensor.interface === 'automation2040w' && sensor.automation2040wConfig && (
                  <div>Device: {sensor.automation2040wConfig.deviceId}, Channel: {sensor.automation2040wConfig.channel}</div>
                )}
                {sensor.interface === 'mqtt' && sensor.mqttConfig && (
                  <div>MQTT Topic: {sensor.mqttConfig.topic}</div>
                )}
                {sensor.calibration && (
                  <div style={{ marginTop: theme.spacing.xs }}>
                    Calibration: {sensor.calibration.rawMin}-{sensor.calibration.rawMax} → {sensor.calibration.scaledMin}-{sensor.calibration.scaledMax} {sensor.calibration.unit}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: theme.spacing.sm,
              }}>
                <button
                  onClick={() => setEditingSensor(sensor)}
                  style={buttonStyle('secondary', true)}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete sensor "${sensor.name}"?`)) {
                      dispatch(removeSensor(sensor.id));
                    }
                  }}
                  style={buttonStyle('danger', true)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !showTester && !showDiscovery ? (
        <div style={{
          padding: theme.spacing.xl,
          textAlign: 'center',
          color: theme.colors.textSecondary,
          fontSize: theme.typography.sizes.base,
        }}>
          No sensors configured. Add your first sensor to get started.
        </div>
      ) : null}

      {/* Sensor Editor */}
      {(showAddModal || editingSensor) && (
        <SensorEditor
          theme={theme}
          sensor={editingSensor || undefined}
          onClose={() => {
            setShowAddModal(false);
            setEditingSensor(null);
          }}
        />
      )}

    </div>
  );
}
