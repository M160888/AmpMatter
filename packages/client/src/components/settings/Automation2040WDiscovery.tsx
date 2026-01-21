import { useState, type CSSProperties } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addAutomation2040WDevice, updateAutomation2040WDevice, removeAutomation2040WDevice } from '../../store/slices/sensorConfigSlice';
import type { Theme } from '../../styles/theme';
import type { Automation2040WDevice } from '@ampmatter/shared';

interface Automation2040WDiscoveryProps {
  theme: Theme;
}

export function Automation2040WDiscovery({ theme }: Automation2040WDiscoveryProps) {
  const dispatch = useAppDispatch();
  const devices = useAppSelector((state) => state.sensorConfig.automation2040wDevices);
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Automation2040WDevice[]>([]);

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

  const deviceCardStyle = (connected: boolean): CSSProperties => ({
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${connected ? theme.colors.success : theme.colors.border}`,
  });

  const handleScan = async () => {
    setScanning(true);
    setDiscoveredDevices([]);

    // Mock mDNS discovery - in production, this would use actual mDNS/Bonjour
    setTimeout(() => {
      const mockDiscovered: Automation2040WDevice[] = [
        {
          id: 'a2040w-001',
          name: 'Automation 2040W #1',
          ipAddress: '192.168.1.150',
          btAddress: 'DC:A6:32:12:34:56',
          connected: true,
          lastSeen: Date.now(),
          firmwareVersion: '1.2.3',
          analogInputs: [0, 1, 2, 3],
          digitalInputs: [0, 1, 2, 3],
          relayOutputs: [0, 1, 2],
        },
        {
          id: 'a2040w-002',
          name: 'Automation 2040W #2',
          ipAddress: '192.168.1.151',
          connected: false,
          lastSeen: Date.now() - 60000,
          firmwareVersion: '1.2.2',
          analogInputs: [0, 1, 2, 3],
          digitalInputs: [0, 1, 2, 3],
          relayOutputs: [0, 1, 2],
        },
      ];

      setDiscoveredDevices(mockDiscovered);
      setScanning(false);
    }, 2500);
  };

  const handleAddDevice = (device: Automation2040WDevice) => {
    dispatch(addAutomation2040WDevice(device));
    setDiscoveredDevices(discoveredDevices.filter((d) => d.id !== device.id));
  };

  const handleTestConnection = async (deviceId: string) => {
    // Mock connection test
    setTimeout(() => {
      dispatch(updateAutomation2040WDevice({
        id: deviceId,
        updates: { connected: true, lastSeen: Date.now() },
      }));
    }, 1000);
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (confirm('Remove this device from the configuration?')) {
      dispatch(removeAutomation2040WDevice(deviceId));
    }
  };

  return (
    <div style={containerStyle}>
      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={scanning}
        style={{
          ...buttonStyle('primary'),
          opacity: scanning ? 0.6 : 1,
        }}
      >
        {scanning ? '🔍 Scanning Network...' : '🔍 Scan for Devices'}
      </button>

      {/* Scanning Status */}
      {scanning && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.primary + '20',
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.primary}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
          }}>
            Scanning local network for Automation 2040W devices...
          </div>
          <div style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
          }}>
            Using mDNS/Bonjour service discovery
          </div>
        </div>
      )}

      {/* Discovered Devices */}
      {discoveredDevices.length > 0 && (
        <div>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}>
            Discovered Devices ({discoveredDevices.length})
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
          }}>
            {discoveredDevices.map((device) => (
              <div key={device.id} style={deviceCardStyle(device.connected)}>
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
                      🤖 {device.name}
                    </div>
                    <div style={{
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.textSecondary,
                    }}>
                      IP: {device.ipAddress}
                      {device.btAddress && ` • BT: ${device.btAddress}`}
                    </div>
                    <div style={{
                      fontSize: theme.typography.sizes.xs,
                      color: theme.colors.textSecondary,
                      marginTop: theme.spacing.xs,
                    }}>
                      Firmware: v{device.firmwareVersion}
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

                {/* Capabilities */}
                <div style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.sm,
                  marginBottom: theme.spacing.sm,
                }}>
                  <div style={{
                    fontSize: theme.typography.sizes.xs,
                    color: theme.colors.text,
                    marginBottom: theme.spacing.xs,
                  }}>
                    Capabilities:
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: theme.spacing.md,
                    fontSize: theme.typography.sizes.xs,
                    color: theme.colors.textSecondary,
                  }}>
                    <div>📊 {device.analogInputs.length} Analog</div>
                    <div>🔘 {device.digitalInputs.length} Digital</div>
                    <div>🔌 {device.relayOutputs.length} Relays</div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddDevice(device)}
                  style={buttonStyle('primary', true)}
                >
                  ➕ Add to Configuration
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configured Devices */}
      {devices.length > 0 && (
        <div>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}>
            Configured Devices ({devices.length})
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
          }}>
            {devices.map((device) => (
              <div key={device.id} style={deviceCardStyle(device.connected)}>
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
                      🤖 {device.name}
                    </div>
                    <div style={{
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.textSecondary,
                    }}>
                      {device.ipAddress || 'No IP address'}
                      {device.btAddress && ` • BT: ${device.btAddress}`}
                    </div>
                    {device.firmwareVersion && (
                      <div style={{
                        fontSize: theme.typography.sizes.xs,
                        color: theme.colors.textSecondary,
                        marginTop: theme.spacing.xs,
                      }}>
                        Firmware: v{device.firmwareVersion}
                      </div>
                    )}
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

                {/* Last Seen */}
                <div style={{
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.sm,
                }}>
                  Last seen: {new Date(device.lastSeen).toLocaleString()}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: theme.spacing.sm,
                }}>
                  <button
                    onClick={() => handleTestConnection(device.id)}
                    style={buttonStyle('secondary', true)}
                  >
                    🔌 Test Connection
                  </button>
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    style={buttonStyle('danger', true)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div style={{
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text,
          marginBottom: theme.spacing.xs,
        }}>
          💡 Device Discovery Tips
        </div>
        <ul style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.textSecondary,
          margin: 0,
          paddingLeft: theme.spacing.lg,
        }}>
          <li>Ensure Automation 2040W devices are powered on and connected to the same network</li>
          <li>Devices should be running firmware with mDNS support enabled</li>
          <li>Check that mDNS/Bonjour service is running on this Raspberry Pi</li>
          <li>You can also manually add devices by IP address in Connection Settings</li>
        </ul>
      </div>

      <div style={{
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
      }}>
        Note: Device discovery uses mDNS (multicast DNS). Some network configurations may block mDNS traffic.
      </div>
    </div>
  );
}
