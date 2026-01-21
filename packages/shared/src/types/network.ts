// Network and WiFi configuration types

export interface WiFiNetwork {
  ssid: string;
  bssid: string;
  signal: number;         // Signal strength (0-100)
  frequency: number;      // MHz
  security: 'open' | 'wep' | 'wpa' | 'wpa2' | 'wpa3';
  connected: boolean;
}

export interface WiFiCredentials {
  ssid: string;
  password: string;
  autoConnect?: boolean;
}

export interface SavedNetwork {
  ssid: string;
  autoConnect: boolean;
  priority: number;
  lastConnected?: number;
}

export interface NetworkState {
  scanning: boolean;
  connecting: boolean;
  availableNetworks: WiFiNetwork[];
  currentNetwork: WiFiNetwork | null;
  savedNetworks: SavedNetwork[];
  lastScan: number;
  error: string | null;
}

export interface ConnectionSettings {
  signalkUrl: string;
  mqttUrl: string;
  mqttUsername?: string;
  mqttPassword?: string;
  automation2040wIp?: string;      // IP address for direct connection
  automation2040wBtAddress?: string; // Bluetooth address
}
