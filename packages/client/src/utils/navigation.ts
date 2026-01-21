/**
 * Navigation utility functions
 */

/**
 * Convert degrees to 8-point compass direction
 */
export function degreesToCompass(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360; // Normalize to 0-360

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalized / 45) % 8;

  return directions[index];
}

/**
 * Convert speed from knots to other units
 */
export function convertSpeed(knots: number, unit: 'kn' | 'km/h' | 'mph' | 'm/s'): number {
  switch (unit) {
    case 'kn':
      return knots;
    case 'km/h':
      return knots * 1.852;
    case 'mph':
      return knots * 1.15078;
    case 'm/s':
      return knots * 0.514444;
    default:
      return knots;
  }
}

/**
 * Get speed unit label
 */
export function getSpeedUnitLabel(unit: 'kn' | 'km/h' | 'mph' | 'm/s'): string {
  return unit;
}
