import * as SunCalc from 'suncalc';
import type { SunTimes } from '@ampmatter/shared';

/**
 * Calculate sunrise, sunset, and nautical twilight times for a given position and date
 * @param latitude - Latitude in decimal degrees
 * @param longitude - Longitude in decimal degrees
 * @param date - Date for which to calculate (defaults to today)
 * @returns SunTimes object with all sun-related times
 */
export function calculateSunTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): SunTimes {
  // Get times from suncalc library
  const times = SunCalc.getTimes(date, latitude, longitude);

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    dawn: times.nauticalDawn,
    dusk: times.nauticalDusk,
    solarNoon: times.solarNoon,
  };
}

/**
 * Check if sun times should be recalculated based on position change
 * @param oldLat - Previous latitude
 * @param oldLon - Previous longitude
 * @param newLat - New latitude
 * @param newLon - New longitude
 * @returns true if position changed significantly (>0.1 degrees ~11km)
 */
export function shouldRecalculateSunTimes(
  oldLat: number,
  oldLon: number,
  newLat: number,
  newLon: number
): boolean {
  const latDiff = Math.abs(newLat - oldLat);
  const lonDiff = Math.abs(newLon - oldLon);
  return latDiff > 0.1 || lonDiff > 0.1;
}

/**
 * Check if it's time to recalculate sun times based on date change
 * @param lastCalculated - Date when sun times were last calculated
 * @returns true if date has changed (past midnight)
 */
export function shouldRecalculateForNewDay(lastCalculated: Date): boolean {
  const now = new Date();
  return (
    now.getDate() !== lastCalculated.getDate() ||
    now.getMonth() !== lastCalculated.getMonth() ||
    now.getFullYear() !== lastCalculated.getFullYear()
  );
}

/**
 * Format sun time for display (HH:MM format)
 * @param date - Date object to format
 * @returns Formatted time string
 */
export function formatSunTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
