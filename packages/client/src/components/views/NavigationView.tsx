import { useMemo, useCallback } from 'react';
import { Circle, Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateViewSettings } from '../../store/slices/settingsSlice';
import { NauticalMap } from '../map/NauticalMap';
import { CompactGauge } from '../common/CompactGauge';
import { TextGauge } from '../common/TextGauge';
import { ResizablePanel } from '../common/ResizablePanel';
import { BarometerDisplay } from '../common/BarometerDisplay';
import { AnchorWatchPanel } from '../common/AnchorWatchPanel';
import { MOBButton } from '../common/MOBButton';
import { degreesToCompass, convertSpeed, getSpeedUnitLabel } from '../../utils/navigation';
import type { Theme } from '../../styles/theme';
import type { BatteryType } from '@ampmatter/shared';

// MOB icon for map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mobIcon = (L as any).divIcon({
  className: 'mob-marker',
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#CC0000" stroke="#FFFFFF" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Anchor icon for map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anchorIcon = (L as any).divIcon({
  className: 'anchor-marker',
  html: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0066CC" stroke="#FFFFFF" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="12">⚓</text>
    </svg>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface NavigationViewProps {
  theme: Theme;
}

export function NavigationView({ theme }: NavigationViewProps) {
  const dispatch = useAppDispatch();
  const navigation = useAppSelector((state) => state.navigation.navigation);
  const battery = useAppSelector((state) => state.victron.battery);
  const sensors = useAppSelector((state) => state.sensors);
  const weather = useAppSelector((state) => state.weather);
  const batterySettings = useAppSelector((state) => state.settings.batterySettings);
  const speedUnit = useAppSelector((state) => state.settings.viewSettings.speedUnit);
  const infoPanelHeight = useAppSelector((state) => state.settings.viewSettings.infoPanelHeight);

  // Anchor state
  const anchorPosition = useAppSelector((state) => state.anchor.anchorPosition);
  const watchRadius = useAppSelector((state) => state.anchor.watchRadius);
  const isAnchored = useAppSelector((state) => state.anchor.isAnchored);
  const watchEnabled = useAppSelector((state) => state.anchor.watchEnabled);
  const currentDrift = useAppSelector((state) => state.anchor.currentDrift);

  // MOB state
  const mobActive = useAppSelector((state) => state.mob.active);
  const mobPosition = useAppSelector((state) => state.mob.position);

  // Get battery type (auto-detect or manual override)
  const batteryType: BatteryType = useMemo(() => {
    if (batterySettings.batteryType === 'auto') {
      return battery.batteryType || 'agm';
    }
    return batterySettings.batteryType;
  }, [batterySettings.batteryType, battery.batteryType]);

  // Get battery SOC thresholds based on battery type
  const { warningThreshold, dangerThreshold, socColor } = useMemo(() => {
    const isLiFePO4 = batteryType === 'lifepo4';
    const thresholds = isLiFePO4
      ? batterySettings.socThresholds.lifepo4
      : batterySettings.socThresholds.leadAcid;

    let color = theme.colors.success;
    if (battery.soc < thresholds.orange) {
      color = theme.colors.warning;
    }
    // Use the configured threshold (thresholds.orange is warning, danger is 10% below that)
    const dangerLevel = isLiFePO4 ? thresholds.orange - 10 : thresholds.orange - 15;
    if (battery.soc < dangerLevel) {
      color = theme.colors.danger;
    }

    return {
      warningThreshold: thresholds.orange,
      dangerThreshold: dangerLevel,
      socColor: color,
    };
  }, [batteryType, battery.soc, batterySettings.socThresholds, theme]);

  // Get depth color based on thresholds
  const depthColor = useMemo(() => {
    const depth = navigation.depth?.belowTransducer || 0;
    if (depth < 3) return theme.colors.danger;
    if (depth < 5) return theme.colors.warning;
    return theme.colors.text;
  }, [navigation.depth, theme]);

  // Get water and fuel tank levels
  const waterTank = sensors.tanks.find((t) => t.type === 'freshWater');
  const fuelTank = sensors.tanks.find((t) => t.type === 'fuel');

  // Get temperature (first available)
  const temperature = sensors.temperatures[0]?.value || null;

  // Handle info panel height changes
  const handlePanelHeightChange = useCallback((height: number) => {
    dispatch(updateViewSettings({ infoPanelHeight: height }));
  }, [dispatch]);

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map Section */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <NauticalMap theme={theme} navigationMode={true} zoomLevel={15}>
          {/* Anchor watch zone visualization */}
          {isAnchored && anchorPosition && (
            <>
              {/* Watch radius circle */}
              <Circle
                {...{
                  center: [anchorPosition.latitude, anchorPosition.longitude] as [number, number],
                  radius: watchRadius,
                  pathOptions: {
                    color: watchEnabled
                      ? currentDrift > watchRadius
                        ? theme.colors.danger
                        : theme.colors.success
                      : theme.colors.textMuted,
                    weight: 2,
                    fillOpacity: 0.1,
                    dashArray: watchEnabled ? undefined : '5, 5',
                  },
                }}
              />
              {/* Anchor position marker */}
              <Marker
                {...{
                  position: [anchorPosition.latitude, anchorPosition.longitude] as [number, number],
                  icon: anchorIcon,
                }}
              />
            </>
          )}

          {/* MOB marker */}
          {mobActive && mobPosition && (
            <Marker
              {...{
                position: [mobPosition.latitude, mobPosition.longitude] as [number, number],
                icon: mobIcon,
              }}
            />
          )}
        </NauticalMap>

        {/* Control Panels Overlay */}
        <div
          style={{
            position: 'absolute',
            top: theme.spacing.sm,
            right: theme.spacing.sm,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            alignItems: 'flex-end',
          }}
        >
          {/* MOB Button - always visible */}
          <MOBButton theme={theme} size="md" />

          {/* Anchor Watch Panel */}
          <div style={{ maxWidth: '200px' }}>
            <AnchorWatchPanel theme={theme} compact />
          </div>
        </div>
      </div>

      {/* Resizable Info Panel Section */}
      <ResizablePanel
        initialHeight={infoPanelHeight}
        minHeight={100}
        maxHeight={400}
        onHeightChange={handlePanelHeightChange}
        theme={theme}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
            gap: '4px',
            justifyItems: 'center',
            alignItems: 'start',
          }}
        >
          {/* SOG - Speed Over Ground */}
          <TextGauge
            value={`${convertSpeed(navigation.speedOverGround || 0, speedUnit).toFixed(1)} ${getSpeedUnitLabel(speedUnit)}`}
            label="SOG"
            theme={theme}
          />

          {/* COG - Course Over Ground */}
          <TextGauge
            value={navigation.courseOverGround !== null
              ? `${Math.round(navigation.courseOverGround)}° ${degreesToCompass(navigation.courseOverGround)}`
              : '---'
            }
            label="COG"
            theme={theme}
          />

          {/* Battery SOC */}
          <TextGauge
            value={`${battery.state === 'charging' ? '⚡ ' : ''}${Math.round(battery.soc)}%`}
            label="Battery"
            color={battery.soc < 40 ? theme.colors.danger : theme.colors.text}
            theme={theme}
          />

          {/* Temperature */}
          {temperature !== null && (
            <CompactGauge
              value={temperature}
              label="Temp"
              unit="°C"
              size="xs"
              theme={theme}
            />
          )}

          {/* Barometric Pressure */}
          {weather.barometricPressure && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <BarometerDisplay pressure={weather.barometricPressure} theme={theme} compact />
            </div>
          )}

          {/* Wind Speed */}
          {navigation.wind && (
            <CompactGauge
              value={navigation.wind.speedApparent}
              label="Wind"
              unit=" kts"
              size="xs"
              theme={theme}
            />
          )}

          {/* Wind Direction */}
          {navigation.wind && (
            <CompactGauge
              value={Math.abs(navigation.wind.angleApparent)}
              label="Wind Dir"
              unit="°"
              size="xs"
              theme={theme}
            />
          )}

          {/* Depth */}
          {navigation.depth && (
            <CompactGauge
              value={navigation.depth.belowTransducer}
              label="Depth"
              unit=" m"
              size="xs"
              color={depthColor}
              warningThreshold={5}
              dangerThreshold={3}
              theme={theme}
            />
          )}

          {/* Water Tank */}
          {waterTank && (
            <CompactGauge
              value={waterTank.currentLevel}
              label="Water"
              unit="%"
              size="xs"
              theme={theme}
            />
          )}

          {/* Fuel Tank */}
          {fuelTank && (
            <CompactGauge
              value={fuelTank.currentLevel}
              label="Fuel"
              unit="%"
              size="xs"
              theme={theme}
            />
          )}
        </div>
      </ResizablePanel>
    </div>
  );
}
