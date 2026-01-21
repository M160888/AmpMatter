import type { CSSProperties } from 'react';
import { useAppSelector } from '../../store';
import { useVictronControl } from '../../hooks/useVictronControl';
import type { Theme } from '../../styles/theme';
import type { MultiplusMode } from '@ampmatter/shared';
import { Card } from '../common/Card';
import { GaugeDisplay } from '../common/GaugeDisplay';
import { MultiplusModeControl } from './MultiplusModeControl';

interface VictronPanelProps {
  theme: Theme;
}

export function VictronPanel({ theme }: VictronPanelProps) {
  const victron = useAppSelector((state) => state.victron);
  const { setMode } = useVictronControl();

  const handleModeChange = (mode: MultiplusMode) => {
    setMode(mode);
  };

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

  const formatPower = (watts: number) => {
    if (Math.abs(watts) >= 1000) {
      return `${(watts / 1000).toFixed(1)} kW`;
    }
    return `${Math.round(watts)} W`;
  };

  const formatVoltage = (volts: number) => `${volts.toFixed(1)} V`;
  const formatCurrent = (amps: number) => `${amps.toFixed(1)} A`;

  return (
    <div style={panelStyle}>
      {/* Battery Section */}
      <Card theme={theme} title="Battery">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: theme.spacing.md }}>
          <GaugeDisplay
            theme={theme}
            value={victron.battery.soc}
            label="State of Charge"
            size="md"
            arcDegrees={270}
          />
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Voltage</span>
          <span style={valueStyle}>{formatVoltage(victron.battery.voltage)}</span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Current</span>
          <span style={{
            ...valueStyle,
            color: victron.battery.current > 0 ? theme.colors.success : theme.colors.text,
          }}>
            {victron.battery.current > 0 ? '+' : ''}{formatCurrent(victron.battery.current)}
          </span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Power</span>
          <span style={{
            ...valueStyle,
            color: victron.battery.power > 0 ? theme.colors.success :
                   victron.battery.power < 0 ? theme.colors.warning : theme.colors.text,
          }}>
            {victron.battery.power > 0 ? '+' : ''}{formatPower(victron.battery.power)}
          </span>
        </div>

        {victron.battery.timeToGo && victron.battery.timeToGo > 0 && (
          <div style={rowStyle}>
            <span style={labelStyle}>Time to Go</span>
            <span style={valueStyle}>
              {Math.floor(victron.battery.timeToGo / 60)}h {victron.battery.timeToGo % 60}m
            </span>
          </div>
        )}
      </Card>

      {/* Solar Section */}
      <Card theme={theme} title="Solar">
        <div style={rowStyle}>
          <span style={labelStyle}>Power</span>
          <span style={{
            ...valueStyle,
            color: victron.solar.totalPower > 0 ? theme.colors.success : theme.colors.text,
          }}>
            {formatPower(victron.solar.totalPower)}
          </span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Today</span>
          <span style={valueStyle}>{victron.solar.totalDailyYield.toFixed(2)} kWh</span>
        </div>

        {victron.solar.controllers.map((controller) => (
          <div key={controller.id} style={{ marginTop: theme.spacing.sm }}>
            <div style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.textMuted,
              marginBottom: theme.spacing.xs,
            }}>
              {controller.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: theme.spacing.md }}>
              <span style={labelStyle}>{formatPower(controller.pvPower)}</span>
              <span style={labelStyle}>{formatVoltage(controller.pvVoltage)}</span>
              <span style={{
                fontSize: theme.typography.sizes.xs,
                color: controller.state === 'bulk' || controller.state === 'absorption'
                  ? theme.colors.success
                  : theme.colors.textMuted,
                textTransform: 'capitalize',
              }}>
                {controller.state}
              </span>
            </div>
          </div>
        ))}
      </Card>

      {/* Inverter Section (if available) */}
      {victron.inverter && (
        <Card theme={theme} title="Inverter">
          <div style={rowStyle}>
            <span style={labelStyle}>State</span>
            <span style={{
              ...valueStyle,
              color: victron.inverter.state === 'inverting' ? theme.colors.success :
                     victron.inverter.state === 'fault' ? theme.colors.danger : theme.colors.text,
              textTransform: 'capitalize',
            }}>
              {victron.inverter.state.replace('_', ' ')}
            </span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>AC Output</span>
            <span style={valueStyle}>{formatPower(victron.inverter.acOut.power)}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Voltage</span>
            <span style={valueStyle}>{formatVoltage(victron.inverter.acOut.voltage)}</span>
          </div>

          {victron.inverter.acIn?.connected && (
            <div style={rowStyle}>
              <span style={labelStyle}>Shore Power</span>
              <span style={{ ...valueStyle, color: theme.colors.success }}>Connected</span>
            </div>
          )}

          {(victron.inverter.lowBatteryAlarm || victron.inverter.overloadAlarm) && (
            <div style={{
              marginTop: theme.spacing.sm,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.danger,
              color: '#FFFFFF',
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.medium,
            }}>
              {victron.inverter.lowBatteryAlarm && 'LOW BATTERY '}
              {victron.inverter.overloadAlarm && 'OVERLOAD'}
            </div>
          )}
        </Card>
      )}

      {/* Multiplus II Section */}
      {victron.multiplus && (
        <Card theme={theme} title="Multiplus II">
          {/* AC Input Section */}
          <div style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textMuted,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
          }}>
            AC Input (Shore)
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Power</span>
            <span style={{
              ...valueStyle,
              color: victron.multiplus.acInput.connected
                ? theme.colors.success
                : theme.colors.textMuted,
            }}>
              {victron.multiplus.acInput.connected
                ? formatPower(victron.multiplus.acInput.power)
                : 'Disconnected'}
            </span>
          </div>
          {victron.multiplus.acInput.connected && (
            <div style={rowStyle}>
              <span style={labelStyle}>Frequency</span>
              <span style={valueStyle}>
                {victron.multiplus.acInput.frequency.toFixed(1)} Hz
              </span>
            </div>
          )}

          {/* AC Output Section */}
          <div style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textMuted,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
          }}>
            AC Output (Loads)
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Power</span>
            <span style={valueStyle}>
              {formatPower(victron.multiplus.acOutput.power)}
            </span>
          </div>

          {/* DC Loads Section */}
          <div style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textMuted,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
          }}>
            DC Loads
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Discharge Rate</span>
            <span style={{
              ...valueStyle,
              color: victron.battery.power < 0 ? theme.colors.warning : theme.colors.text,
            }}>
              {victron.battery.power < 0
                ? formatPower(Math.abs(victron.battery.power))
                : '0 W'}
            </span>
          </div>

          {/* Mode Control */}
          <MultiplusModeControl
            theme={theme}
            currentMode={victron.multiplus.mode}
            onModeChange={handleModeChange}
          />
        </Card>
      )}

      {/* Connection Status */}
      {!victron.connected && (
        <div style={{
          padding: theme.spacing.md,
          textAlign: 'center',
          color: theme.colors.textMuted,
          fontSize: theme.typography.sizes.sm,
        }}>
          Waiting for Victron data...
        </div>
      )}
    </div>
  );
}
