import { type CSSProperties } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateGpsSettings } from '../../store/slices/settingsSlice';
import type { Theme } from '../../styles/theme';

interface GPSSettingsProps {
  theme: Theme;
}

export function GPSSettings({ theme }: GPSSettingsProps) {
  const dispatch = useAppDispatch();
  const gpsSettings = useAppSelector((state) => state.settings.gpsSettings);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const sectionStyle: CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.medium,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  };

  const inputStyle: CSSProperties = {
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.base,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    minWidth: '200px',
  };

  const toggleStyle = (enabled: boolean): CSSProperties => ({
    position: 'relative',
    width: '50px',
    height: '26px',
    backgroundColor: enabled ? theme.colors.success : theme.colors.border,
    borderRadius: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const toggleKnobStyle = (enabled: boolean): CSSProperties => ({
    position: 'absolute',
    top: '3px',
    left: enabled ? '26px' : '3px',
    width: '20px',
    height: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    transition: 'left 0.2s',
  });

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: 0, color: theme.colors.text }}>GPS Data Sources</h3>

      <div style={sectionStyle}>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>SignalK GPS</div>
            <div style={descriptionStyle}>
              Receive GPS data from SignalK WebSocket server
            </div>
          </div>
          <div
            style={toggleStyle(gpsSettings.signalkGpsEnabled)}
            onClick={() =>
              dispatch(updateGpsSettings({ signalkGpsEnabled: !gpsSettings.signalkGpsEnabled }))
            }
          >
            <div style={toggleKnobStyle(gpsSettings.signalkGpsEnabled)} />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Network GPS (MQTT)</div>
            <div style={descriptionStyle}>
              Receive GPS data from MQTT broker (mobile apps, network GPS devices)
            </div>
          </div>
          <div
            style={toggleStyle(gpsSettings.networkGpsEnabled)}
            onClick={() =>
              dispatch(updateGpsSettings({ networkGpsEnabled: !gpsSettings.networkGpsEnabled }))
            }
          >
            <div style={toggleKnobStyle(gpsSettings.networkGpsEnabled)} />
          </div>
        </div>

        {gpsSettings.networkGpsEnabled && (
          <div style={{ marginTop: theme.spacing.md }}>
            <label style={labelStyle}>
              MQTT Topic Prefix
              <input
                type="text"
                value={gpsSettings.mqttTopicPrefix}
                onChange={(e) =>
                  dispatch(updateGpsSettings({ mqttTopicPrefix: e.target.value }))
                }
                style={{ ...inputStyle, display: 'block', marginTop: theme.spacing.xs, width: '100%' }}
                placeholder="gps"
              />
            </label>
            <div style={descriptionStyle}>
              GPS data topics: {gpsSettings.mqttTopicPrefix}/position, {gpsSettings.mqttTopicPrefix}/course, etc.
            </div>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>GPS Priority</div>
        <div style={descriptionStyle}>
          When multiple GPS sources are active, which one to use
        </div>
        <div style={{ marginTop: theme.spacing.md, display: 'flex', gap: theme.spacing.sm }}>
          {(['signalk', 'network', 'both'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => dispatch(updateGpsSettings({ gpsPriority: priority }))}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor:
                  gpsSettings.gpsPriority === priority
                    ? theme.colors.primary
                    : theme.colors.surface,
                color:
                  gpsSettings.gpsPriority === priority ? '#FFFFFF' : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.sizes.base,
                textTransform: 'capitalize',
              }}
            >
              {priority}
            </button>
          ))}
        </div>
        <div style={{ ...descriptionStyle, marginTop: theme.spacing.sm }}>
          {gpsSettings.gpsPriority === 'signalk' && 'Use SignalK GPS data only'}
          {gpsSettings.gpsPriority === 'network' && 'Use Network GPS data only'}
          {gpsSettings.gpsPriority === 'both' && 'Merge data from both sources (latest wins)'}
        </div>
      </div>

      <div style={{ ...sectionStyle, backgroundColor: theme.mode === 'day' ? '#f0f8ff' : '#1a2332' }}>
        <div style={labelStyle}>📱 MQTT GPS Data Format</div>
        <div style={{ ...descriptionStyle, marginTop: theme.spacing.sm, fontFamily: 'monospace' }}>
          Publish GPS data to these topics:<br />
          • <strong>{gpsSettings.mqttTopicPrefix}/position</strong> → {`{"latitude": 37.7749, "longitude": -122.4194}`}<br />
          • <strong>{gpsSettings.mqttTopicPrefix}/course</strong> → 234.5 (degrees)<br />
          • <strong>{gpsSettings.mqttTopicPrefix}/speed</strong> → 5.2 (knots)<br />
          • <strong>{gpsSettings.mqttTopicPrefix}/heading</strong> → 230 (degrees)<br />
        </div>
      </div>
    </div>
  );
}
