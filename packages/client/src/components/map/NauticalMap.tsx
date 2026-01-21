import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { CSSProperties } from 'react';
import { useAppSelector } from '../../store';
import type { Theme } from '../../styles/theme';
import { tileCache } from '../../services/TileCache';

interface NauticalMapProps {
  theme: Theme;
  navigationMode?: boolean;
  zoomLevel?: number;
  children?: ReactNode;
}

// Component to handle map position updates
function MapController({ navigationMode = false }: { navigationMode?: boolean }) {
  const map = useMap();
  const position = useAppSelector((state) => state.navigation.navigation.position);
  const autoCenter = useAppSelector((state) => state.settings.mapSettings.autoCenter);
  const prevPositionRef = useRef(position);
  const lastMoveTimeRef = useRef<number>(0);
  const manualPanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isManualPan, setIsManualPan] = useState(false);

  useEffect(() => {
    const handleMoveStart = () => {
      setIsManualPan(true);
      if (manualPanTimeoutRef.current) {
        clearTimeout(manualPanTimeoutRef.current);
      }
      manualPanTimeoutRef.current = setTimeout(() => {
        setIsManualPan(false);
      }, 30000);
    };

    map.on('dragstart', handleMoveStart);

    return () => {
      map.off('dragstart', handleMoveStart);
      if (manualPanTimeoutRef.current) {
        clearTimeout(manualPanTimeoutRef.current);
      }
    };
  }, [map]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (position && autoCenter && !isManualPan) {
      const prev = prevPositionRef.current;
      const now = Date.now();

      if (!prev || getDistance(prev.latitude, prev.longitude, position.latitude, position.longitude) > 50) {
        if (now - lastMoveTimeRef.current > 1000) {
          lastMoveTimeRef.current = now;

          if (navigationMode) {
            const mapSize = map.getSize();
            const targetPoint = map.project([position.latitude, position.longitude], map.getZoom());
            const offsetY = mapSize.y * (2 / 3 - 0.5);
            const newTargetPoint = { x: targetPoint.x, y: targetPoint.y - offsetY };
            const newCenter = map.unproject([newTargetPoint.x, newTargetPoint.y], map.getZoom());

            map.flyTo([newCenter.lat, newCenter.lng], map.getZoom(), {
              animate: true,
              duration: 0.5,
            });
          } else {
            map.flyTo([position.latitude, position.longitude], map.getZoom(), {
              animate: true,
              duration: 0.5,
            });
          }
        }
      }
    }
    prevPositionRef.current = position;
  }, [position, autoCenter, map, navigationMode, isManualPan]);

  return null;
}


// Create boat icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const boatIcon = (L as any).divIcon({
  className: 'boat-marker',
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L8 28H24L16 4Z" fill="#0066CC" stroke="#FFFFFF" stroke-width="2"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export function NauticalMap({ theme, navigationMode = false, zoomLevel = 14, children }: NauticalMapProps) {
  const position = useAppSelector((state) => state.navigation.navigation.position);
  const showTrack = useAppSelector((state) => state.settings.mapSettings.showTrack);
  const trackLength = useAppSelector((state) => state.settings.mapSettings.trackLength);

  const [trackHistory, setTrackHistory] = useState<[number, number][]>([]);
  const [cacheStats, setCacheStats] = useState<{ count: number; sizeMB: number }>({ count: 0, sizeMB: 0 });

  useEffect(() => {
    if (position) {
      setTrackHistory((prev) => {
        const newTrack = [...prev, [position.latitude, position.longitude] as [number, number]];
        if (newTrack.length > trackLength) {
          return newTrack.slice(-trackLength);
        }
        return newTrack;
      });
    }
  }, [position, trackLength]);

  useEffect(() => {
    const updateStats = async () => {
      const stats = await tileCache.getCacheStats();
      setCacheStats({
        count: stats.count,
        sizeMB: stats.sizeBytes / (1024 * 1024),
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Container ref for map wrapper
  const containerRef = useRef<HTMLDivElement>(null);

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  const statsStyle: CSSProperties = {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1000,
    pointerEvents: 'none',
  };

  const defaultCenter: [number, number] = position
    ? [position.latitude, position.longitude]
    : [51.5074, -0.1278];

  const mapContainerProps = {
    center: defaultCenter,
    zoom: navigationMode ? Math.max(zoomLevel, 15) : zoomLevel,
    style: { width: '100%', height: '100%' },
    zoomControl: true,
    attributionControl: false,
  };

  const seaMapProps = {
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    opacity: 0.8,
  };

  const polylineProps = {
    positions: trackHistory,
    pathOptions: {
      color: theme.colors.primary,
      weight: 3,
      opacity: 0.7,
    },
  };

  const markerProps = {
    position: [position?.latitude ?? 0, position?.longitude ?? 0] as [number, number],
    icon: boatIcon,
  };

  // Use regular TileLayer for now (debugging)
  const osmProps = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  return (
    <div ref={containerRef} style={containerStyle} data-swipe-disabled="true">
      <MapContainer {...mapContainerProps}>
        {/* Base map layer */}
        <TileLayer {...osmProps} />

        {/* OpenSeaMap overlay for nautical features */}
        <TileLayer {...seaMapProps} />

        {/* Map controller for auto-centering */}
        <MapController navigationMode={navigationMode} />

        {/* Track history */}
        {showTrack && trackHistory.length > 1 && (
          <Polyline {...polylineProps} />
        )}

        {/* Boat position marker */}
        {position && <Marker {...markerProps} />}

        {/* Additional custom layers */}
        {children}
      </MapContainer>

      {/* Cache stats overlay */}
      <div style={statsStyle}>
        Cached: {cacheStats.count} tiles ({cacheStats.sizeMB.toFixed(1)} MB)
      </div>
    </div>
  );
}
