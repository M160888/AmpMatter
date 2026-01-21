// Weather and atmospheric data types

export interface BarometricPressure {
  value: number; // hPa (hectopascals) or mbar
  trend?: 'rising' | 'steady' | 'falling';
  lastUpdate: number;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  dawn: Date; // Nautical twilight start
  dusk: Date; // Nautical twilight end
  solarNoon: Date;
}
