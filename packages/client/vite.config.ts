import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true, // Allow external connections (for Pi access)
    hmr: {
      clientPort: 443, // Use HTTPS port for HMR through tunnel
    },
    allowedHosts: [
      '.trycloudflare.com', // Allow Cloudflare tunnel domains
      'localhost',
      '192.168.0.19',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600, // Set reasonable limit for marine app
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // Redux state management
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],

          // Leaflet mapping library (one of the largest dependencies)
          'leaflet-vendor': ['leaflet', 'react-leaflet'],

          // MQTT communication
          'mqtt-vendor': ['mqtt'],

          // Date/time utilities
          'date-vendor': ['suncalc'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
