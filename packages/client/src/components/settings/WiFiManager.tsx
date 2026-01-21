import { useState, useEffect, type CSSProperties } from 'react';
import { useAppSelector } from '../../store';
import { useWiFiManager } from '../../hooks/useWiFiManager';
import type { Theme } from '../../styles/theme';
import type { WiFiNetwork } from '@ampmatter/shared';

interface WiFiManagerProps {
  theme: Theme;
}

export function WiFiManager({ theme }: WiFiManagerProps) {
  const wifiManager = useWiFiManager();
  const { scanning, connecting, availableNetworks, currentNetwork, savedNetworks, error } = useAppSelector(
    (state) => state.network.wifi
  );
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Load current network on mount
  useEffect(() => {
    wifiManager.getCurrentNetwork();
  }, [wifiManager]);

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

  const networkItemStyle = (isConnected: boolean, isSaved: boolean): CSSProperties => ({
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${isConnected ? theme.colors.success : isSaved ? theme.colors.primary : theme.colors.border}`,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  });

  const handleScan = async () => {
    await wifiManager.scanNetworks();
  };

  const handleConnect = async () => {
    if (!selectedNetwork) return;

    await wifiManager.connectToNetwork({
      ssid: selectedNetwork.ssid,
      password: password || '',
      autoConnect: true,
    });

    setSelectedNetwork(null);
    setPassword('');
  };

  const handleForget = async (ssid: string) => {
    await wifiManager.forgetNetwork(ssid);
  };

  const getSignalIcon = (signal: number) => {
    if (signal >= 80) return '▁▃▅▇';
    if (signal >= 60) return '▁▃▅';
    if (signal >= 40) return '▁▃';
    return '▁';
  };

  const getSecurityIcon = (security: string) => {
    return security === 'open' ? '🔓' : '🔒';
  };

  return (
    <div style={containerStyle}>
      {/* Current Network Status */}
      {currentNetwork && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.success + '20',
          borderRadius: theme.borderRadius.md,
          border: `2px solid ${theme.colors.success}`,
        }}>
          <div style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.success,
            fontWeight: theme.typography.weights.bold,
            marginBottom: theme.spacing.xs,
          }}>
            ✓ Connected
          </div>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.text,
          }}>
            {currentNetwork.ssid}
          </div>
          <div style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
          }}>
            Signal: {getSignalIcon(currentNetwork.signal)} {currentNetwork.signal}% • {currentNetwork.frequency} MHz
          </div>
        </div>
      )}

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={scanning || connecting}
        style={{
          ...buttonStyle('primary'),
          opacity: (scanning || connecting) ? 0.6 : 1,
        }}
      >
        {scanning ? '🔍 Scanning...' : '🔍 Scan for Networks'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.danger + '20',
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.danger}`,
          color: theme.colors.danger,
          fontSize: theme.typography.sizes.sm,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Network List */}
      {availableNetworks.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm,
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {availableNetworks.map((network) => {
            const isSaved = savedNetworks.some((n) => n.ssid === network.ssid);
            const isConnected = network.connected;
            const isSelected = selectedNetwork?.ssid === network.ssid;

            return (
              <div key={network.bssid}>
                <div
                  style={networkItemStyle(isConnected, isSaved)}
                  onClick={() => !connecting && setSelectedNetwork(network)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: theme.typography.sizes.base,
                        fontWeight: theme.typography.weights.medium,
                        color: theme.colors.text,
                        marginBottom: theme.spacing.xs,
                      }}>
                        {getSecurityIcon(network.security)} {network.ssid}
                        {isConnected && ' ✓'}
                      </div>
                      <div style={{
                        fontSize: theme.typography.sizes.sm,
                        color: theme.colors.textSecondary,
                      }}>
                        {getSignalIcon(network.signal)} {network.signal}% • {network.security.toUpperCase()}
                      </div>
                    </div>
                    {isSaved && !isConnected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleForget(network.ssid);
                        }}
                        style={{
                          ...buttonStyle('danger'),
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          minHeight: 'auto',
                          fontSize: theme.typography.sizes.sm,
                        }}
                      >
                        Forget
                      </button>
                    )}
                  </div>
                </div>

                {/* Connection Form */}
                {isSelected && network.security !== 'open' && (
                  <div style={{
                    marginTop: theme.spacing.sm,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`,
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: theme.typography.weights.medium,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.xs,
                    }}>
                      Password
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: theme.spacing.sm,
                      marginBottom: theme.spacing.md,
                    }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter network password"
                        style={{
                          flex: 1,
                          padding: theme.spacing.sm,
                          fontSize: theme.typography.sizes.base,
                          backgroundColor: theme.colors.surface,
                          color: theme.colors.text,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius.sm,
                          outline: 'none',
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          ...buttonStyle('secondary'),
                          padding: theme.spacing.sm,
                          minWidth: '50px',
                        }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: theme.spacing.sm,
                    }}>
                      <button
                        onClick={handleConnect}
                        disabled={connecting || !password}
                        style={{
                          ...buttonStyle('primary'),
                          flex: 1,
                          opacity: (connecting || !password) ? 0.6 : 1,
                        }}
                      >
                        {connecting ? 'Connecting...' : 'Connect'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNetwork(null);
                          setPassword('');
                        }}
                        style={{
                          ...buttonStyle('secondary'),
                          flex: 1,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isSelected && network.security === 'open' && (
                  <div style={{
                    marginTop: theme.spacing.sm,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`,
                  }}>
                    <button
                      onClick={handleConnect}
                      disabled={connecting}
                      style={{
                        ...buttonStyle('primary'),
                        width: '100%',
                        opacity: connecting ? 0.6 : 1,
                      }}
                    >
                      {connecting ? 'Connecting...' : 'Connect to Open Network'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Saved Networks */}
      {savedNetworks.length > 0 && (
        <div style={{
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}>
            Saved Networks ({savedNetworks.length})
          </div>
          <div style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
          }}>
            {savedNetworks.map((n) => n.ssid).join(', ')}
          </div>
        </div>
      )}

      <div style={{
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: theme.spacing.sm,
      }}>
        💡 WiFi management uses NetworkManager (nmcli). Requires appropriate system permissions on Raspberry Pi.
        <br />
        Script location: <code style={{ fontFamily: 'monospace' }}>/scripts/wifi-manager.sh</code>
      </div>
    </div>
  );
}
