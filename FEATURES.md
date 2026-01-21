# AmpMatter Features Guide

## Overview

AmpMatter is a marine monitoring and control system designed for Raspberry Pi 4, providing real-time boat data visualization and control through a touch-optimized interface.

## Swipeable View System

The interface consists of 4 main swipeable views that can be navigated by swiping left/right:

### View 1: Navigation
**Layout:** 75% map (top) + 25% info panel (bottom)

**Map Features:**
- OpenStreetMap base layer with OpenSeaMap nautical overlay
- Navigation mode: Boat positioned at 1/3 from bottom (like Google Maps)
- Auto-centering with intelligent manual pan detection
- Manual pan override: 30-second timeout before auto-center resumes
- Offline tile caching for reliability
- Track history visualization (configurable length)
- Smooth transitions with hysteresis (50m threshold)

**Info Panel Widgets:**
1. **SOG** (Speed Over Ground) - knots
2. **COG** (Course Over Ground) - degrees
3. **Battery SOC** - percentage with type-aware color thresholds
4. **Temperature** - degrees Celsius
5. **Barometric Pressure** - hPa with trend indicator
6. **Wind Speed** - knots (apparent wind)
7. **Wind Direction** - degrees (apparent angle)
8. **Depth** - meters below transducer with color warnings
9. **Water Tank** - percentage remaining
10. **Fuel Tank** - percentage remaining

### View 2: Victron Energy
Full-screen display of Victron equipment:
- Battery state (voltage, current, SOC, power, temperature)
- Solar charger (PV voltage, current, power, state)
- Multiplus inverter/charger (AC/DC data, state, mode)
- Mode control: On/Off/Charger Only

### View 3: Sensors
Comprehensive sensor monitoring:
- Tank levels (fresh water, fuel, black water, gray water)
- Temperature sensors (engine, cabin, outdoor, refrigerator)
- Digital inputs (bilge pump, high water alarm, shore power)
- Barometric pressure with trend
- Navigation data (depth, wind)
- Engine data when available (RPM, oil pressure via NMEA)

### View 4: Relays
Grid of 8 configurable relay switches for boat systems:
- Touch-optimized toggle switches (48px minimum touch target)
- Each switch displays: name, ON/OFF state badge, last changed time
- Default names: "Switch 1" through "Switch 8" (user-renameable)
- Tap to toggle on/off
- MQTT-based control for reliability
- Visual feedback and loading states

## Enhanced Header

The header provides essential information at a glance:
- **Status Indicators:** GPS, Victron, Sensors (color-coded dots)
- **GPS Position:** Latitude/Longitude display
- **Sunrise/Sunset Times:** Calculated based on GPS position
  - Format: ↑ 06:42  ↓ 18:15
  - Auto-updates when position changes significantly
  - Recalculates daily at midnight
- **Time/Date:** Current time with weekday and date
- **Theme Toggle:** Switch between day and night modes

## Battery Type Detection

### Auto-Detection
The system automatically detects battery chemistry from Victron equipment:
- Lead-acid
- AGM (Absorbed Glass Mat)
- Gel
- LiFePO4 (Lithium Iron Phosphate)

### Type-Aware SOC Color Thresholds

**AGM / Lead-acid / Gel:**
- 🟢 Green: > 80% (healthy)
- 🟠 Orange: 65-79% (caution)
- 🔴 Red: < 65% (critical)

**LiFePO4:**
- 🟢 Green: > 70% (healthy)
- 🟠 Orange: 30-69% (caution)
- 🔴 Red: < 30% (critical)

Manual override available in settings if auto-detection unavailable.

## Depth Monitoring

Color-coded depth warnings in Navigation View:
- 🔴 Red: < 3 meters (critical)
- 🟠 Orange: 3-5 meters (caution)
- ⚪ White: > 5 meters (safe)

## Barometric Pressure

Displays atmospheric pressure with trend indicators:
- **Trend:** ↑ rising, → steady, ↓ falling
- **Color coding:**
  - 🟢 Green: > 1020 hPa (high pressure)
  - ⚪ Default: 1000-1020 hPa (normal)
  - 🟠 Warning: < 1000 hPa (low pressure)
- 3-hour trend calculation window

## Relay Control System

### MQTT Topics
**Publish (control):** `boat/relays/{id}/set`
- Payload: `"1"` (on) or `"0"` (off)

**Subscribe (state feedback):** `boat/relays/{id}/state`
- Confirmation of relay state changes

### Hardware Integration
Compatible with Raspberry Pi relay HATs via MQTT bridge service:
- GPIO-based relays
- I2C expansion boards
- SPI relay modules

### Configuration
Each relay can be configured with:
- Custom name
- Category (lighting, pumps, heating, navigation, other)
- Icon
- Enable/disable state
- Inverted logic (if needed)

## Theme System

Two optimized color schemes:
- **Day Mode:** High contrast for bright sunlight visibility
- **Night Mode:** Red-shifted palette preserves night vision

Toggle via button in header.

## Map Settings

Configurable options:
- **Auto-center:** Enable/disable automatic map centering
- **Track history:** Show/hide boat track
- **Track length:** Number of position points to display (default: 100)
- **Navigation mode ratio:** Adjust map/info panel split (default: 75/25)

## Data Sources

### SignalK Protocol
Marine instrument data via WebSocket:
- GPS position
- Speed over ground (SOG)
- Course over ground (COG)
- Depth below transducer
- Wind speed and direction
- Navigation data

### MQTT Protocol
Sensor and control data:
- **Victron:** `N/{portal-id}/#` topics
- **Sensors:** `boat/sensors/#` topics
- **Weather:** `boat/weather/#` topics
- **Relays:** `boat/relays/#` topics

## Sun Time Calculation

Automatic sunrise/sunset calculation using GPS position:
- **Update triggers:**
  - Position change > 0.1 degrees
  - Daily at midnight
- **Displayed times:**
  - Sunrise (astronomical dawn)
  - Sunset (astronomical dusk)
  - Solar noon
- **Library:** suncalc (high-accuracy celestial calculations)

## Touch Gestures

- **Swipe left/right:** Navigate between views
- **Tap:** Activate controls (buttons, switches)
- **Long press:** Future feature for advanced options
- **Drag on map:** Manual pan (disables auto-center for 30 seconds)
- **Drag on time display:** Access kiosk settings

## Performance Optimization

- Throttled map updates: Maximum 1 per second
- Hysteresis on position updates: 50m threshold
- React.memo for expensive components
- Lazy loading of view components
- IndexedDB tile caching for offline maps
- Redux state management for efficient re-renders

## Kiosk Mode

Full-screen mode for dedicated marine displays:
- Auto-start on boot
- Hide system UI and cursor
- Password-protected exit
- Touch-optimized interface (48px minimum targets)
- Optimized for 7-10 inch displays

## View Management (Future)

Dynamic view configuration:
- Enable/disable views
- Reorder views via drag-and-drop
- Add custom views with widget layouts
- Widget marketplace
- User-defined dashboard layouts

## Future Enhancements

### Navigation
- Waypoints and route planning
- AIS target display
- Weather overlay (wind, waves, currents)
- Anchor watch with alarm
- MOB (Man Overboard) marker

### Data Visualization
- Historical graphs (battery SOC, tank levels, position)
- Trip logs and statistics
- Fuel consumption tracking
- Battery charge/discharge cycles

### Relay Automation
- Timer-based scheduling
- Automation rules (e.g., bilge pump on high water)
- Power monitoring per relay
- Usage statistics

### Advanced Features
- Multi-boat support
- Remote monitoring via web interface
- Notifications (low battery, high water, etc.)
- Export data (CSV, GPX)
- Cloud backup and sync

## Technical Stack

- **Frontend:** React 19 + TypeScript + Vite
- **State Management:** Redux Toolkit
- **Mapping:** React-Leaflet + Leaflet
- **Protocols:** SignalK WebSocket, MQTT
- **Hardware:** Raspberry Pi 4 (4GB+ recommended)
- **Display:** 7-10 inch touchscreen
- **OS:** Raspberry Pi OS Lite

## Configuration Files

Settings stored in Redux with localStorage persistence:
- View configurations
- Relay configurations
- Battery settings (type, thresholds)
- Map settings (auto-center, track, zoom)
- Theme preference

## Troubleshooting

### Map not auto-centering
- Check "Auto-center" setting in map settings
- Verify GPS position data is being received
- Manual pan disables auto-center for 30 seconds

### Relay not responding
- Verify MQTT broker connection
- Check relay MQTT topics in settings
- Ensure relay HAT service is running
- Test MQTT publish with mosquitto_pub

### Battery colors incorrect
- Verify battery type detection in Victron view
- Check battery settings (auto vs manual)
- Confirm Victron MQTT topic: `N/{id}/battery/Type`

### Sun times not displaying
- Verify GPS position is valid
- Check "Show sun times" setting
- Position must have changed > 0.1 degrees since last calculation

### Sensor data not updating
- Check sensor status indicator in header
- Verify MQTT connection
- Confirm sensor topics match configuration
- Check Automation 2040W firmware is running

## Support

For issues, feature requests, or contributions, visit the project repository or contact the development team.

## License

AmpMatter is licensed under [LICENSE_TYPE]. See LICENSE file for details.
