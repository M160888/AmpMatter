import { useState, type CSSProperties } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateConnectionSettings } from '../../store/slices/networkSlice';
import { validateWebSocketUrl, testSignalKConnection, testMqttConnection } from '../../utils/connectionTest';
import type { Theme } from '../../styles/theme';

interface TestStatus {
  testing: boolean;
  success?: boolean;
  message?: string;
}

interface ConnectionSettingsProps {
  theme: Theme;
}

export function ConnectionSettings({ theme }: ConnectionSettingsProps) {
  const dispatch = useAppDispatch();
  const connectionSettings = useAppSelector((state) => state.network.connection);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [signalkTest, setSignalkTest] = useState<TestStatus>({ testing: false });
  const [mqttTest, setMqttTest] = useState<TestStatus>({ testing: false });

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const settingItemStyle: CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    display: 'block',
  };

  const valueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    wordBreak: 'break-all',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.base,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.sm,
    outline: 'none',
    marginBottom: theme.spacing.sm,
  };

  const buttonStyle = (variant: 'primary' | 'secondary' = 'secondary', small = false): CSSProperties => ({
    minHeight: small ? '32px' : theme.touchTarget.min,
    padding: small ? `${theme.spacing.xs} ${theme.spacing.sm}` : `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: variant === 'primary' ? theme.colors.primary : theme.colors.surface,
    color: variant === 'primary' ? '#FFFFFF' : theme.colors.text,
    border: variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: small ? theme.typography.sizes.sm : theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  });

  const buttonGroupStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  };

  const handleSave = (field: keyof typeof connectionSettings) => {
    if (editValue.trim()) {
      dispatch(updateConnectionSettings({ [field]: editValue.trim() }));
    }
    setEditing(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue('');
  };

  const handleTestSignalK = async () => {
    setSignalkTest({ testing: true });
    const result = await testSignalKConnection(connectionSettings.signalkUrl);
    setSignalkTest({
      testing: false,
      success: result.success,
      message: result.error || result.message,
    });
    // Clear status after 5 seconds
    setTimeout(() => setSignalkTest({ testing: false }), 5000);
  };

  const handleTestMqtt = async () => {
    setMqttTest({ testing: true });
    const result = await testMqttConnection(connectionSettings.mqttUrl);
    setMqttTest({
      testing: false,
      success: result.success,
      message: result.error || result.message,
    });
    // Clear status after 5 seconds
    setTimeout(() => setMqttTest({ testing: false }), 5000);
  };

  const getValidationMessage = (value: string): string | null => {
    const validation = validateWebSocketUrl(value);
    return validation.valid ? null : validation.error || 'Invalid URL';
  };

  return (
    <div style={containerStyle}>
      {/* SignalK URL */}
      <div style={settingItemStyle}>
        <label style={labelStyle}>
          🧭 Signal K Server URL
        </label>
        <div style={{
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        }}>
          WebSocket URL for navigation data (GPS, wind, depth, etc.)
        </div>
        {editing === 'signalkUrl' ? (
          <>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave('signalkUrl');
                if (e.key === 'Escape') handleCancel();
              }}
              style={inputStyle}
              autoFocus
              placeholder="ws://localhost:3000/signalk/v1/stream?subscribe=all"
            />
            {editValue && getValidationMessage(editValue) && (
              <div style={{
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.danger,
                marginBottom: theme.spacing.sm,
              }}>
                ⚠️ {getValidationMessage(editValue)}
              </div>
            )}
            <div style={buttonGroupStyle}>
              <button
                style={buttonStyle('primary', true)}
                onClick={() => handleSave('signalkUrl')}
                disabled={!!getValidationMessage(editValue)}
              >
                Save
              </button>
              <button
                style={buttonStyle('secondary', true)}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={valueStyle}>
              {connectionSettings.signalkUrl}
            </div>
            <div style={buttonGroupStyle}>
              <button
                style={buttonStyle('secondary', true)}
                onClick={() => handleEdit('signalkUrl', connectionSettings.signalkUrl)}
              >
                ✏️ Edit
              </button>
              <button
                style={{
                  ...buttonStyle('primary', true),
                  opacity: signalkTest.testing ? 0.6 : 1,
                }}
                onClick={handleTestSignalK}
                disabled={signalkTest.testing}
              >
                {signalkTest.testing ? '⏳ Testing...' : '🔌 Test Connection'}
              </button>
            </div>
            {signalkTest.message && (
              <div style={{
                marginTop: theme.spacing.sm,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: signalkTest.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: signalkTest.success ? theme.colors.success : theme.colors.danger,
                fontSize: theme.typography.sizes.sm,
                border: `1px solid ${signalkTest.success ? theme.colors.success : theme.colors.danger}`,
              }}>
                {signalkTest.success ? '✅' : '❌'} {signalkTest.message}
              </div>
            )}
          </>
        )}
      </div>

      {/* MQTT URL */}
      <div style={settingItemStyle}>
        <label style={labelStyle}>
          📡 MQTT Broker URL
        </label>
        <div style={{
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        }}>
          WebSocket URL for MQTT (Victron, relays, sensors, Automation 2040W)
        </div>
        {editing === 'mqttUrl' ? (
          <>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave('mqttUrl');
                if (e.key === 'Escape') handleCancel();
              }}
              style={inputStyle}
              autoFocus
              placeholder="ws://localhost:9001"
            />
            {editValue && getValidationMessage(editValue) && (
              <div style={{
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.danger,
                marginBottom: theme.spacing.sm,
              }}>
                ⚠️ {getValidationMessage(editValue)}
              </div>
            )}
            <div style={buttonGroupStyle}>
              <button
                style={buttonStyle('primary', true)}
                onClick={() => handleSave('mqttUrl')}
                disabled={!!getValidationMessage(editValue)}
              >
                Save
              </button>
              <button
                style={buttonStyle('secondary', true)}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={valueStyle}>
              {connectionSettings.mqttUrl}
            </div>
            <div style={buttonGroupStyle}>
              <button
                style={buttonStyle('secondary', true)}
                onClick={() => handleEdit('mqttUrl', connectionSettings.mqttUrl)}
              >
                ✏️ Edit
              </button>
              <button
                style={{
                  ...buttonStyle('primary', true),
                  opacity: mqttTest.testing ? 0.6 : 1,
                }}
                onClick={handleTestMqtt}
                disabled={mqttTest.testing}
              >
                {mqttTest.testing ? '⏳ Testing...' : '🔌 Test Connection'}
              </button>
            </div>
            {mqttTest.message && (
              <div style={{
                marginTop: theme.spacing.sm,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: mqttTest.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: mqttTest.success ? theme.colors.success : theme.colors.danger,
                fontSize: theme.typography.sizes.sm,
                border: `1px solid ${mqttTest.success ? theme.colors.success : theme.colors.danger}`,
              }}>
                {mqttTest.success ? '✅' : '❌'} {mqttTest.message}
              </div>
            )}
          </>
        )}
      </div>

      {/* MQTT Credentials (Optional) */}
      <div style={settingItemStyle}>
        <label style={labelStyle}>
          🔐 MQTT Authentication (Optional)
        </label>
        <div style={{
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        }}>
          Username and password for MQTT broker authentication
        </div>

        {/* Username */}
        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{
            ...labelStyle,
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textSecondary,
          }}>
            Username
          </label>
          {editing === 'mqttUsername' ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave('mqttUsername');
                  if (e.key === 'Escape') handleCancel();
                }}
                style={inputStyle}
                autoFocus
                placeholder="mqtt_user"
              />
              <div style={buttonGroupStyle}>
                <button
                  style={buttonStyle('primary', true)}
                  onClick={() => handleSave('mqttUsername')}
                >
                  Save
                </button>
                <button
                  style={buttonStyle('secondary', true)}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={valueStyle}>
                {connectionSettings.mqttUsername || '(not set)'}
              </div>
              <button
                style={buttonStyle('secondary', true)}
                onClick={() => handleEdit('mqttUsername', connectionSettings.mqttUsername || '')}
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>

        {/* Password */}
        <div>
          <label style={{
            ...labelStyle,
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textSecondary,
          }}>
            Password
          </label>
          {editing === 'mqttPassword' ? (
            <>
              <input
                type="password"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave('mqttPassword');
                  if (e.key === 'Escape') handleCancel();
                }}
                style={inputStyle}
                autoFocus
                placeholder="••••••••"
              />
              <div style={buttonGroupStyle}>
                <button
                  style={buttonStyle('primary', true)}
                  onClick={() => handleSave('mqttPassword')}
                >
                  Save
                </button>
                <button
                  style={buttonStyle('secondary', true)}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={valueStyle}>
                {connectionSettings.mqttPassword ? '••••••••' : '(not set)'}
              </div>
              <button
                style={buttonStyle('secondary', true)}
                onClick={() => handleEdit('mqttPassword', connectionSettings.mqttPassword || '')}
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Automation 2040W Connection */}
      <div style={settingItemStyle}>
        <label style={labelStyle}>
          🤖 Automation 2040W
        </label>
        <div style={{
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        }}>
          Direct connection settings (alternative to MQTT)
        </div>

        {/* IP Address */}
        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{
            ...labelStyle,
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textSecondary,
          }}>
            IP Address
          </label>
          {editing === 'automation2040wIp' ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave('automation2040wIp');
                  if (e.key === 'Escape') handleCancel();
                }}
                style={inputStyle}
                autoFocus
                placeholder="192.168.1.100"
              />
              <div style={buttonGroupStyle}>
                <button
                  style={buttonStyle('primary', true)}
                  onClick={() => handleSave('automation2040wIp')}
                >
                  Save
                </button>
                <button
                  style={buttonStyle('secondary', true)}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={valueStyle}>
                {connectionSettings.automation2040wIp || '(not set)'}
              </div>
              <button
                style={buttonStyle('secondary', true)}
                onClick={() => handleEdit('automation2040wIp', connectionSettings.automation2040wIp || '')}
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>

        {/* Bluetooth Address */}
        <div>
          <label style={{
            ...labelStyle,
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textSecondary,
          }}>
            Bluetooth Address
          </label>
          {editing === 'automation2040wBtAddress' ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave('automation2040wBtAddress');
                  if (e.key === 'Escape') handleCancel();
                }}
                style={inputStyle}
                autoFocus
                placeholder="AA:BB:CC:DD:EE:FF"
              />
              <div style={buttonGroupStyle}>
                <button
                  style={buttonStyle('primary', true)}
                  onClick={() => handleSave('automation2040wBtAddress')}
                >
                  Save
                </button>
                <button
                  style={buttonStyle('secondary', true)}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={valueStyle}>
                {connectionSettings.automation2040wBtAddress || '(not set)'}
              </div>
              <button
                style={buttonStyle('secondary', true)}
                onClick={() => handleEdit('automation2040wBtAddress', connectionSettings.automation2040wBtAddress || '')}
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
      }}>
        💡 Tip: Changes take effect after reconnecting to services or restarting the app.
      </div>
    </div>
  );
}
