// Victron equipment data types

import type { ConnectionInfo } from './connection';

export type BatteryState = 'idle' | 'charging' | 'discharging';
export type BatteryType = 'lead-acid' | 'agm' | 'gel' | 'lifepo4' | 'unknown';
export type SolarState = 'off' | 'fault' | 'bulk' | 'absorption' | 'float' | 'equalization';

// Multiplus/Quattro states (from Venus OS)
export type MultiplusState =
  | 'off'
  | 'low_power'
  | 'fault'
  | 'bulk'
  | 'absorption'
  | 'float'
  | 'storage'
  | 'equalize'
  | 'passthru'
  | 'inverting'
  | 'power_assist'
  | 'power_supply'
  | 'scheduled_charge'
  | 'external_control';

export type MultiplusMode = 'charger_only' | 'inverter_only' | 'on' | 'off';

export interface BatteryData {
  voltage: number;           // Volts
  current: number;           // Amps (positive = charging, negative = discharging)
  power: number;             // Watts
  soc: number;               // State of charge (0-100)
  temperature?: number;      // Celsius
  timeToGo?: number;         // Minutes remaining at current consumption
  state: BatteryState;
  batteryType?: BatteryType; // Battery chemistry type
}

export interface SolarController {
  id: string;
  name: string;
  pvVoltage: number;         // PV array voltage
  pvCurrent: number;         // PV array current
  pvPower: number;           // PV power (W)
  batteryVoltage: number;    // Battery voltage
  chargeCurrent: number;     // Charge current (A)
  state: SolarState;
  dailyYield: number;        // kWh today
  maxPowerToday: number;     // Max power today (W)
}

export interface SolarData {
  totalPower: number;        // Total PV power (W)
  totalDailyYield: number;   // Total kWh today
  controllers: SolarController[];
}

export interface ACData {
  voltage: number;           // Volts
  current: number;           // Amps
  power: number;             // Watts (positive = consuming, negative = feeding back)
  frequency: number;         // Hz
}

// Shore power / AC input data
export interface ACInputData extends ACData {
  connected: boolean;        // Is shore power connected?
  currentLimit: number;      // Input current limit (A)
  source: 'shore' | 'generator' | 'grid' | 'unknown';
}

// Multiplus/Quattro inverter-charger data
export interface MultiplusData {
  // Device info
  productId?: number;
  productName?: string;
  firmwareVersion?: string;

  // Operating state
  state: MultiplusState;
  mode: MultiplusMode;

  // AC Input (Shore Power / Generator)
  acInput: ACInputData;

  // AC Output (Loads)
  acOutput: ACData;

  // DC Side (Battery connection)
  dcVoltage: number;         // DC bus voltage
  dcCurrent: number;         // DC current (positive = charging battery)
  dcPower: number;           // DC power to/from battery

  // Power flow summary
  inputPower: number;        // Power coming from shore/generator
  outputPower: number;       // Power going to loads
  batteryPower: number;      // Power to battery (positive = charging)

  // Temperature and alarms
  temperature?: number;      // Internal temperature (°C)
  alarms: {
    lowBattery: boolean;
    overload: boolean;
    highTemperature: boolean;
    ripple: boolean;
    lowAcOut: boolean;
    highAcOut: boolean;
  };

  // Relay state (for Multiplus with relay)
  relayState?: boolean;
}

// Legacy inverter type for backwards compatibility
export interface InverterData {
  state: MultiplusState;
  mode: MultiplusMode;
  acOut: ACData;
  acIn?: ACInputData;
  temperature?: number;
  lowBatteryAlarm: boolean;
  overloadAlarm: boolean;
}

// System-level data from Venus OS
export interface VEBusSystemData {
  // Overall system state
  state: MultiplusState;

  // Grid/Shore connection
  gridConnected: boolean;
  gridPower: number;         // Positive = consuming, negative = feeding back

  // Load power
  consumptionPower: number;  // Total AC loads

  // Battery power from system perspective
  batteryPower: number;      // System battery power (includes solar DC)
}

export interface VictronSystemState {
  connected: boolean; // Deprecated: use connectionInfo.state === 'connected' instead
  connectionInfo: ConnectionInfo;
  battery: BatteryData;
  solar: SolarData;
  multiplus?: MultiplusData;
  inverter?: InverterData;   // Legacy support
  system?: VEBusSystemData;
  lastUpdate: number;
}

// Helper to get human-readable state name
export function getMultiplusStateName(state: MultiplusState): string {
  const stateNames: Record<MultiplusState, string> = {
    off: 'Off',
    low_power: 'Low Power',
    fault: 'Fault',
    bulk: 'Bulk Charging',
    absorption: 'Absorption',
    float: 'Float',
    storage: 'Storage',
    equalize: 'Equalize',
    passthru: 'Pass-through',
    inverting: 'Inverting',
    power_assist: 'Power Assist',
    power_supply: 'Power Supply',
    scheduled_charge: 'Scheduled Charge',
    external_control: 'External Control',
  };
  return stateNames[state] || state;
}
