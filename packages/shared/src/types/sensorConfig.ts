// Sensor configuration types for GPIO/I2C/Automation 2040W

export type SensorInterface = 'gpio' | 'i2c' | 'automation2040w' | 'signalk' | 'mqtt';

export type SensorType =
  | 'tank'
  | 'temperature'
  | 'digital_input'
  | 'analog_input'
  | 'pressure'
  | 'humidity'
  | 'bilge_pump'
  | 'voltage'
  | 'current';

export interface GPIOConfig {
  pin: number;
  mode: 'input' | 'output' | 'pwm';
  pullup?: boolean;
  pulldown?: boolean;
  inverted?: boolean;
}

export interface I2CConfig {
  address: number;        // Hex address (e.g., 0x48)
  bus: number;            // I2C bus number (usually 1)
  deviceType: string;     // e.g., 'ADS1115', 'BME280', 'MCP23017'
  register?: number;      // Register to read from
}

export interface Automation2040WConfig {
  deviceId: string;       // Unique ID of the Automation 2040W
  channel: number;        // Input/output channel on the device
  connectionType: 'wifi' | 'bluetooth';
}

export interface MQTTConfig {
  topic: string;
  qos?: 0 | 1 | 2;
}

export interface SensorCalibration {
  rawMin: number;
  rawMax: number;
  scaledMin: number;
  scaledMax: number;
  unit: string;
}

export interface SensorDefinition {
  id: string;
  name: string;
  type: SensorType;
  interface: SensorInterface;
  enabled: boolean;

  // Interface-specific configuration
  gpioConfig?: GPIOConfig;
  i2cConfig?: I2CConfig;
  automation2040wConfig?: Automation2040WConfig;
  mqttConfig?: MQTTConfig;

  // Data processing
  calibration?: SensorCalibration;
  smoothing?: number;     // Number of samples to average (1-10)
  updateInterval?: number; // Milliseconds (default 1000)

  // Alarms
  minAlarm?: number;
  maxAlarm?: number;

  // Display
  displayUnit?: string;
  decimals?: number;

  // Metadata
  location?: string;
  notes?: string;
  created: number;
  lastModified: number;
}

export interface SensorConfigState {
  sensors: SensorDefinition[];
  automation2040wDevices: Automation2040WDevice[];
}

export interface Automation2040WDevice {
  id: string;
  name: string;
  ipAddress?: string;
  btAddress?: string;
  connected: boolean;
  lastSeen: number;
  firmwareVersion?: string;

  // Available channels
  analogInputs: number[];   // e.g., [0, 1, 2, 3]
  digitalInputs: number[];
  relayOutputs: number[];
}
