// Relay control types

export interface RelayConfig {
  id: string;
  name: string;
  enabled: boolean;
  pin?: number; // GPIO pin or relay HAT channel
  inverted?: boolean; // Invert logic (active low)
  icon?: string;
  category?: 'lighting' | 'pumps' | 'heating' | 'navigation' | 'other';
}

export interface RelayState {
  id: string;
  state: boolean; // true = on, false = off
  lastChanged: number; // timestamp
}

export interface RelaySystemState {
  connected: boolean;
  relays: Record<string, RelayState>;
  configs: RelayConfig[];
  lastUpdate: number;
}

// Default relay configurations (8 switches)
export const DEFAULT_RELAYS: RelayConfig[] = [
  {
    id: 'relay_1',
    name: 'Switch 1',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_2',
    name: 'Switch 2',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_3',
    name: 'Switch 3',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_4',
    name: 'Switch 4',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_5',
    name: 'Switch 5',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_6',
    name: 'Switch 6',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_7',
    name: 'Switch 7',
    enabled: true,
    category: 'other',
  },
  {
    id: 'relay_8',
    name: 'Switch 8',
    enabled: true,
    category: 'other',
  },
];
