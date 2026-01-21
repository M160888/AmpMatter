/// <reference types="vite/client" />

// Leaflet marker rotation extension
declare module 'leaflet' {
  interface MarkerOptions {
    rotationAngle?: number;
    rotationOrigin?: string;
  }
}
