// Sensor data types for Automation 2040W

import type { ConnectionInfo } from './connection';

export type TankType = 'freshWater' | 'fuel' | 'wasteWater' | 'blackWater' | 'liveWell';

export interface TankData {
  id: string;
  name: string;
  type: TankType;
  capacity: number;          // Liters
  currentLevel: number;      // 0-100 (percentage)
  rawValue?: number;         // Raw ADC value for debugging
  lastUpdate: number;        // Timestamp
}

export interface TemperatureSensor {
  id: string;
  name: string;
  location: string;          // e.g., 'engine', 'cabin', 'fridge', 'seawater'
  value: number;             // Celsius
  minAlarm?: number;         // Low temperature alarm threshold
  maxAlarm?: number;         // High temperature alarm threshold
  lastUpdate: number;
}

export interface DigitalInput {
  id: string;
  name: string;
  state: boolean;            // true = active/on
  inverted?: boolean;        // If true, logic is inverted
  lastChange: number;        // Timestamp of last state change
}

export interface SensorState {
  connected: boolean; // Deprecated: use connectionInfo.state === 'connected' instead
  connectionInfo: ConnectionInfo;
  tanks: TankData[];
  temperatures: TemperatureSensor[];
  digitalInputs: DigitalInput[];
  lastUpdate: number;
}

// MQTT topic structure for Automation 2040W
// boat/tanks/{tankId}         - Tank level (0-100)
// boat/temp/{sensorId}        - Temperature (Celsius)
// boat/digital/{inputId}      - Digital input (0 or 1)
// boat/status                 - Heartbeat/connection status
