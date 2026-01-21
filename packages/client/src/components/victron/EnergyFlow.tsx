import type { CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';
import type { MultiplusData, MultiplusState } from '@ampmatter/shared';
import { getMultiplusStateName } from '@ampmatter/shared';

interface EnergyFlowProps {
  theme: Theme;
  multiplus: MultiplusData;
  solarPower: number;
  batterySoc: number;
}

export function EnergyFlow({ theme, multiplus, solarPower, batterySoc }: EnergyFlowProps) {
  const formatPower = (watts: number) => {
    const absWatts = Math.abs(watts);
    if (absWatts >= 1000) {
      return `${(absWatts / 1000).toFixed(1)}kW`;
    }
    return `${Math.round(absWatts)}W`;
  };

  const getStateColor = (state: MultiplusState): string => {
    switch (state) {
      case 'inverting':
        return theme.colors.primary;
      case 'bulk':
      case 'absorption':
        return theme.colors.success;
      case 'float':
      case 'storage':
        return theme.colors.success;
      case 'passthru':
        return theme.colors.warning;
      case 'fault':
        return theme.colors.danger;
      case 'off':
      case 'low_power':
        return theme.colors.textMuted;
      default:
        return theme.colors.primary;
    }
  };

  const containerStyle: CSSProperties = {
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  // Status badge style
  const statusStyle: CSSProperties = {
    display: 'inline-block',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    backgroundColor: getStateColor(multiplus.state),
    color: '#FFFFFF',
    textAlign: 'center',
  };

  // Power box style (for Grid, Multiplus, Battery, Loads)
  const boxStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: active ? theme.colors.surface : theme.colors.surfaceHover,
    border: `2px solid ${active ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    minWidth: '80px',
  });

  const boxTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  };

  const boxValueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  };

  const boxSubStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  };

  // Arrow/flow indicator
  const flowStyle = (power: number, vertical: boolean = false): CSSProperties => {
    const isFlowing = Math.abs(power) > 10;

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xs,
      color: isFlowing ? theme.colors.success : theme.colors.textMuted,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      flexDirection: vertical ? 'column' : 'row',
    };
  };

  const arrowRight = '→';
  const arrowDown = '↓';
  const arrowUp = '↑';

  // Row styles
  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };

  const detailRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing.xs} 0`,
    borderBottom: `1px solid ${theme.colors.border}`,
    fontSize: theme.typography.sizes.sm,
  };

  const labelStyle: CSSProperties = {
    color: theme.colors.textSecondary,
  };

  const valueStyle: CSSProperties = {
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  };

  const shoreConnected = multiplus.acInput.connected;
  const isCharging = multiplus.batteryPower > 50;
  const isDischarging = multiplus.batteryPower < -50;

  return (
    <div style={containerStyle}>
      {/* Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.medium }}>
          Multiplus
        </span>
        <span style={statusStyle}>
          {getMultiplusStateName(multiplus.state)}
        </span>
      </div>

      {/* Energy Flow Diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        {/* Top Row: Shore/Grid → Multiplus → Loads */}
        <div style={rowStyle}>
          {/* Shore Power */}
          <div style={boxStyle(shoreConnected)}>
            <div style={boxTitleStyle}>Shore</div>
            <div style={boxValueStyle}>
              {shoreConnected ? formatPower(multiplus.inputPower) : 'Off'}
            </div>
            {shoreConnected && (
              <div style={boxSubStyle}>
                {multiplus.acInput.voltage.toFixed(0)}V {multiplus.acInput.frequency.toFixed(0)}Hz
              </div>
            )}
          </div>

          {/* Flow Arrow: Shore → Multiplus */}
          <div style={flowStyle(multiplus.inputPower)}>
            {multiplus.inputPower > 10 ? arrowRight : '—'}
            <div style={{ fontSize: theme.typography.sizes.xs }}>
              {multiplus.inputPower > 10 && formatPower(multiplus.inputPower)}
            </div>
          </div>

          {/* Multiplus Center */}
          <div style={{
            ...boxStyle(true),
            borderColor: getStateColor(multiplus.state),
            flex: 1.5,
          }}>
            <div style={boxTitleStyle}>Multiplus</div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>IN</div>
                <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold }}>
                  {formatPower(multiplus.inputPower)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>OUT</div>
                <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold }}>
                  {formatPower(multiplus.outputPower)}
                </div>
              </div>
            </div>
          </div>

          {/* Flow Arrow: Multiplus → Loads */}
          <div style={flowStyle(multiplus.outputPower)}>
            {multiplus.outputPower > 10 ? arrowRight : '—'}
            <div style={{ fontSize: theme.typography.sizes.xs }}>
              {multiplus.outputPower > 10 && formatPower(multiplus.outputPower)}
            </div>
          </div>

          {/* Loads */}
          <div style={boxStyle(multiplus.outputPower > 10)}>
            <div style={boxTitleStyle}>Loads</div>
            <div style={boxValueStyle}>
              {formatPower(multiplus.outputPower)}
            </div>
            <div style={boxSubStyle}>
              {multiplus.acOutput.voltage.toFixed(0)}V
            </div>
          </div>
        </div>

        {/* Center connector to battery */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            ...flowStyle(multiplus.batteryPower, true),
            width: '60px',
          }}>
            {isCharging && arrowDown}
            {isDischarging && arrowUp}
            {!isCharging && !isDischarging && '|'}
            <div style={{ fontSize: theme.typography.sizes.xs }}>
              {(isCharging || isDischarging) && formatPower(multiplus.batteryPower)}
            </div>
          </div>
        </div>

        {/* Bottom Row: Battery + Solar */}
        <div style={rowStyle}>
          {/* Solar */}
          <div style={boxStyle(solarPower > 10)}>
            <div style={boxTitleStyle}>Solar</div>
            <div style={{
              ...boxValueStyle,
              color: solarPower > 10 ? theme.colors.success : theme.colors.textMuted,
            }}>
              {formatPower(solarPower)}
            </div>
          </div>

          {/* Flow Arrow: Solar → Battery */}
          <div style={flowStyle(solarPower)}>
            {solarPower > 10 ? arrowRight : '—'}
          </div>

          {/* Battery */}
          <div style={{
            ...boxStyle(true),
            flex: 2,
            borderColor: isCharging ? theme.colors.success :
                        isDischarging ? theme.colors.warning : theme.colors.border,
          }}>
            <div style={boxTitleStyle}>Battery</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div style={{
                  fontSize: theme.typography.sizes.xl,
                  fontWeight: theme.typography.weights.bold,
                  color: batterySoc < 20 ? theme.colors.danger :
                         batterySoc < 50 ? theme.colors.warning : theme.colors.success,
                }}>
                  {batterySoc}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: theme.typography.sizes.base,
                  fontWeight: theme.typography.weights.bold,
                  color: isCharging ? theme.colors.success :
                         isDischarging ? theme.colors.warning : theme.colors.text,
                }}>
                  {isCharging ? '+' : ''}{formatPower(multiplus.batteryPower)}
                </div>
                <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
                  {isCharging ? 'Charging' : isDischarging ? 'Discharging' : 'Idle'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Readings */}
      <div style={{ marginTop: theme.spacing.sm }}>
        <div style={detailRowStyle}>
          <span style={labelStyle}>AC Input</span>
          <span style={valueStyle}>
            {shoreConnected
              ? `${multiplus.acInput.voltage.toFixed(1)}V / ${multiplus.acInput.current.toFixed(1)}A`
              : 'Disconnected'}
          </span>
        </div>
        <div style={detailRowStyle}>
          <span style={labelStyle}>AC Output</span>
          <span style={valueStyle}>
            {multiplus.acOutput.voltage.toFixed(1)}V / {multiplus.acOutput.current.toFixed(1)}A
          </span>
        </div>
        <div style={detailRowStyle}>
          <span style={labelStyle}>DC Bus</span>
          <span style={valueStyle}>
            {multiplus.dcVoltage.toFixed(1)}V / {Math.abs(multiplus.dcCurrent).toFixed(1)}A
          </span>
        </div>
        {multiplus.acInput.currentLimit > 0 && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Input Limit</span>
            <span style={valueStyle}>{multiplus.acInput.currentLimit}A</span>
          </div>
        )}
        {multiplus.temperature && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Temperature</span>
            <span style={{
              ...valueStyle,
              color: multiplus.temperature > 50 ? theme.colors.warning : theme.colors.text,
            }}>
              {multiplus.temperature}°C
            </span>
          </div>
        )}
      </div>

      {/* Alarms */}
      {Object.entries(multiplus.alarms).some(([, active]) => active) && (
        <div style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.danger,
          color: '#FFFFFF',
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.medium,
        }}>
          {multiplus.alarms.lowBattery && 'LOW BATTERY '}
          {multiplus.alarms.overload && 'OVERLOAD '}
          {multiplus.alarms.highTemperature && 'HIGH TEMP '}
          {multiplus.alarms.ripple && 'RIPPLE '}
        </div>
      )}
    </div>
  );
}
