// SignalK data types
import { SunTimes } from './weather';
import type { ConnectionInfo } from './connection';

export interface Position {
  latitude: number;          // Decimal degrees
  longitude: number;         // Decimal degrees
  altitude?: number;         // Meters
}

export interface NavigationData {
  position: Position | null;
  courseOverGround: number | null;     // Degrees (0-360)
  speedOverGround: number | null;      // Knots
  speedThroughWater?: number | null;   // Knots
  headingMagnetic?: number | null;     // Degrees
  headingTrue?: number | null;         // Degrees
  depth?: {
    belowTransducer: number;           // Meters
    belowKeel?: number;                // Meters
    belowSurface?: number;             // Meters
  };
  wind?: {
    speedApparent: number;             // Knots
    angleApparent: number;             // Degrees (-180 to 180)
    speedTrue?: number;                // Knots
    angleTrue?: number;                // Degrees
  };
}

export interface SignalKDelta {
  context?: string;
  updates: Array<{
    source?: {
      label: string;
      type?: string;
    };
    timestamp: string;
    values: Array<{
      path: string;
      value: unknown;
    }>;
  }>;
}

export interface SignalKHello {
  name: string;
  version: string;
  self: string;
  roles: string[];
  timestamp: string;
}

export type SignalKMessage = SignalKDelta | SignalKHello;

// Connection status
export type SignalKConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SignalKState {
  status: SignalKConnectionStatus; // Deprecated: use connectionInfo.state instead
  connectionInfo: ConnectionInfo;
  selfId: string | null;
  navigation: NavigationData;
  sunTimes: SunTimes | null;
  lastUpdate: number;
  error?: string;
}
