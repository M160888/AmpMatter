import { useState, type CSSProperties } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateRelayConfig } from '../../store/slices/relaysSlice';
import { updateDisplaySettings, updateViewSettings } from '../../store/slices/settingsSlice';
import { setGlobalSound, updateRule } from '../../store/slices/alertsSlice';
import { WiFiManager } from '../settings/WiFiManager';
import { SensorConfigManager } from '../settings/SensorConfigManager';
import { ConnectionSettings } from '../settings/ConnectionSettings';
import { GPSSettings } from '../settings/GPSSettings';
import type { Theme } from '../../styles/theme';

interface SettingsViewProps {
  theme: Theme;
}

type SettingsTab = 'network' | 'connections' | 'gps' | 'sensors' | 'relays' | 'display' | 'alerts';

export function SettingsView({ theme }: SettingsViewProps) {
  const dispatch = useAppDispatch();
  const relayConfigs = useAppSelector((state) => state.relays.configs);
  const displaySettings = useAppSelector((state) => state.settings.displaySettings);
  const viewSettings = useAppSelector((state) => state.settings.viewSettings);
  const alertRules = useAppSelector((state) => state.alerts.rules);
  const globalSoundEnabled = useAppSelector((state) => state.alerts.soundEnabled);
  const [activeTab, setActiveTab] = useState<SettingsTab>('display');
  const [editingRelay, setEditingRelay] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const tabButtonStyle = (isActive: boolean): CSSProperties => ({
    flex: 1,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
    color: isActive ? '#FFFFFF' : theme.colors.text,
    border: 'none',
    borderBottom: isActive ? 'none' : `2px solid ${theme.colors.border}`,
    fontSize: theme.typography.sizes.sm,
    fontWeight: isActive ? theme.typography.weights.bold : theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: theme.transitions.fast,
  });

  const tabContentStyle: CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    overflowY: 'auto',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  };

  const relayListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const relayItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const relayLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    minWidth: '60px',
  };

  const relayNameStyle: CSSProperties = {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.sm,
    outline: 'none',
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): CSSProperties => ({
    minWidth: '80px',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: variant === 'primary' ? theme.colors.primary : theme.colors.surface,
    color: variant === 'primary' ? '#FFFFFF' : theme.colors.text,
    border: variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: theme.transitions.fast,
  });

  const sliderContainerStyle: CSSProperties = {
    marginBottom: theme.spacing.md,
  };

  const sliderLabelStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  };

  const sliderStyle: CSSProperties = {
    width: '100%',
    height: '4px',
    borderRadius: theme.borderRadius.full,
    background: theme.colors.border,
    outline: 'none',
    WebkitAppearance: 'none',
  };

  const toggleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.sm,
  };

  const toggleLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  };

  const handleRelayNameUpdate = (id: string) => {
    if (editValue.trim()) {
      dispatch(updateRelayConfig({ id, changes: { name: editValue.trim() } }));
    }
    setEditingRelay(null);
    setEditValue('');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'network':
        return (
          <div>
            <h3 style={sectionTitleStyle}>WiFi Network</h3>
            <WiFiManager theme={theme} />
          </div>
        );

      case 'connections':
        return (
          <div>
            <h3 style={sectionTitleStyle}>Connection Settings</h3>
            <ConnectionSettings theme={theme} />
          </div>
        );

      case 'gps':
        return (
          <div>
            <GPSSettings theme={theme} />
          </div>
        );

      case 'sensors':
        return (
          <div>
            <h3 style={sectionTitleStyle}>Sensor Configuration</h3>
            <SensorConfigManager theme={theme} />
          </div>
        );

      case 'relays':
        return (
          <div>
            <h3 style={sectionTitleStyle}>Relay Names</h3>
            <div style={relayListStyle}>
              {relayConfigs.map((config) => (
                <div key={config.id} style={relayItemStyle}>
                  <span style={relayLabelStyle}>Relay {config.id}</span>
                  {editingRelay === config.id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRelayNameUpdate(config.id);
                          if (e.key === 'Escape') {
                            setEditingRelay(null);
                            setEditValue('');
                          }
                        }}
                        style={inputStyle}
                        autoFocus
                      />
                      <button
                        onClick={() => handleRelayNameUpdate(config.id)}
                        style={{ ...buttonStyle('primary'), marginLeft: theme.spacing.sm }}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={relayNameStyle}>{config.name}</span>
                      <button
                        onClick={() => {
                          setEditingRelay(config.id);
                          setEditValue(config.name);
                        }}
                        style={buttonStyle('secondary')}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'display':
        return (
          <div>
            <h3 style={sectionTitleStyle}>Display Settings</h3>
            <div style={sliderContainerStyle}>
              <div style={sliderLabelStyle}>
                <span>Brightness</span>
                <span>{Math.round(displaySettings.brightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={displaySettings.brightness * 100}
                onChange={(e) =>
                  dispatch(updateDisplaySettings({ brightness: parseInt(e.target.value) / 100 }))
                }
                style={sliderStyle}
              />
            </div>
            <div style={toggleStyle}>
              <span style={toggleLabelStyle}>Auto-dim after inactivity</span>
              <input
                type="checkbox"
                checked={displaySettings.autoDimEnabled}
                onChange={(e) => dispatch(updateDisplaySettings({ autoDimEnabled: e.target.checked }))}
                style={{ width: '20px', height: '20px' }}
              />
            </div>
            <div style={toggleStyle}>
              <span style={toggleLabelStyle}>Turn off screen when dimmed</span>
              <input
                type="checkbox"
                checked={displaySettings.screenOffEnabled}
                onChange={(e) => dispatch(updateDisplaySettings({ screenOffEnabled: e.target.checked }))}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            {/* Speed Unit Selector */}
            <div style={{ marginTop: theme.spacing.md }}>
              <div style={{ ...sectionTitleStyle, fontSize: theme.typography.sizes.base, marginBottom: theme.spacing.sm }}>
                Speed Unit
              </div>
              <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                {(['kn', 'km/h', 'mph', 'm/s'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => dispatch(updateViewSettings({ speedUnit: unit }))}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      backgroundColor:
                        viewSettings.speedUnit === unit
                          ? theme.colors.primary
                          : theme.colors.surface,
                      color:
                        viewSettings.speedUnit === unit ? '#FFFFFF' : theme.colors.text,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.sm,
                      cursor: 'pointer',
                      fontSize: theme.typography.sizes.base,
                      minWidth: '60px',
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
              <div style={{
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.xs,
              }}>
                Unit for speed display (SOG, wind speed, etc.)
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div>
            <h3 style={sectionTitleStyle}>Alert Settings</h3>
            <div style={toggleStyle}>
              <span style={toggleLabelStyle}>Sound Alerts</span>
              <input
                type="checkbox"
                checked={globalSoundEnabled}
                onChange={(e) => dispatch(setGlobalSound(e.target.checked))}
                style={{ width: '20px', height: '20px' }}
              />
            </div>
            <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.sm }}>
              Individual alert rules can be configured here (Low Battery, Shallow Depth, High Temp, etc.)
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background, position: 'relative', height: '100%' }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: `2px solid ${theme.colors.border}` }}>
        <button onClick={() => setActiveTab('display')} style={tabButtonStyle(activeTab === 'display')}>
          Display
        </button>
        <button onClick={() => setActiveTab('relays')} style={tabButtonStyle(activeTab === 'relays')}>
          Relays
        </button>
        <button onClick={() => setActiveTab('alerts')} style={tabButtonStyle(activeTab === 'alerts')}>
          Alerts
        </button>
        <button onClick={() => setActiveTab('network')} style={tabButtonStyle(activeTab === 'network')}>
          WiFi
        </button>
        <button onClick={() => setActiveTab('connections')} style={tabButtonStyle(activeTab === 'connections')}>
          Connect
        </button>
        <button onClick={() => setActiveTab('gps')} style={tabButtonStyle(activeTab === 'gps')}>
          GPS
        </button>
        <button onClick={() => setActiveTab('sensors')} style={tabButtonStyle(activeTab === 'sensors')}>
          Sensors
        </button>
      </div>

      {/* Tab Content */}
      <div style={tabContentStyle}>
        {renderTabContent()}
      </div>
    </div>
  );
}
