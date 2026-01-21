# AmpMatter Development Session Notes

**Last Updated**: 2026-01-20 (Session 11 - RESIZABLE PANEL & AUTO THEME)
**Project**: Marine Monitoring GUI for Raspberry Pi 4

---

## Quick Resume Instructions

When starting a new Claude session, paste this:

```
Continue working on AmpMatter project at /home/mario/AmpMatter
Read SESSION_NOTES.md first to see current state and pending tasks.
```

---

## Project Overview

- **Tech Stack**: React 19 + TypeScript + Redux Toolkit + Vite
- **Target**: Raspberry Pi 4 with 7-10" touchscreen
- **Purpose**: Marine boat monitoring (GPS, Victron energy, sensors, relay control)

### Key Directories
- `/packages/client/src/` - React frontend
- `/packages/shared/` - Shared types and constants
- `/config/` - Configuration files

---

## Current State (2026-01-15 Updated)

### What Works
- Build compiles successfully
- 5 arrow-navigable views: Navigation, Victron, Sensors, Relays, Settings
- **Day/Night/Auto theme switching**: Automatic theme based on sunrise/sunset times
- Map with OpenStreetMap + OpenSeaMap overlay (fully functional panning/zooming)
- Tile caching for offline use
- MQTT integration with exponential backoff reconnection
- SignalK integration for navigation data
- Code splitting: Initial bundle reduced from 814KB to 215KB (73.6% reduction)
- Settings UI for configuring relay names, display, and alerts
- **View Navigation**: Fixed-position arrows and dot indicators (swipe gestures disabled)
- **LocalStorage Persistence**: Relay names, WiFi networks, settings persist across reloads
- **Alert System**: Monitors battery, depth, tanks, temperature, connections with configurable thresholds
- **Anchor Watch**: Drop/raise anchor with watch radius, drift monitoring, map visualization
- **MOB (Man Overboard)**: One-touch button with position marking, alarm, bearing/distance display
- **Bilge Pump Monitoring**: Tracks pump cycles, run time, alerts on excessive activity
- **Screen Dimmer**: Auto-dims and turns off screen after inactivity
- **Data History Charts**: Displays battery SOC, voltage, solar power over time in VictronView
- **Vertical Scrolling**: Touch scrolling works on all views (VictronView, SensorsView, SettingsView)
- **Resizable Info Panel**: Drag-to-resize navigation info panel (NavigationView)
- **Text-Only Gauges**: SOG with unit conversion, COG with compass direction, battery with charging indicator

### Recently Fixed
1. **Map panning vs swipe conflicts** - Completely resolved
   - Disabled swipe gestures entirely
   - Added fixed navigation arrows (always at 50vh)
   - Map now works perfectly without triggering view changes
   - Files: `SwipeableViewContainer.tsx`, `NauticalMap.tsx`, `ViewNavigationContext.tsx`

2. **Relay name persistence** - Fixed with localStorage
   - Created localStorageMiddleware for selective state persistence
   - Relay names, settings, WiFi networks persist across reloads
   - Files: `localStorageMiddleware.ts`, `store/index.ts`

3. **Relay inline editing** - Edit names directly on switches
   - Click ✏️ icon to edit, Enter to save, Escape to cancel
   - Changes persist immediately via localStorage
   - Files: `RelaySwitch.tsx`

4. **Relay switches now click-only** - Won't trigger when swiping between views
   - Uses pointer events with movement threshold (10px)
   - Stops event propagation to prevent swipe container interference
   - Files: `RelaySwitch.tsx`

5. **Auto-sizing relay grid** - Fills available space with pagination
   - Max 8 switches per page
   - Adaptive grid layout (2x1, 2x2, 3x2, 4x2 depending on count)
   - Pagination controls when > 8 relays
   - Files: `RelaysView.tsx`

6. **Battery threshold bug** - Now uses configured settings instead of hardcoded values
   - Files: `NavigationView.tsx`

---

## Pending Tasks / Known Issues

### High Priority
- [ ] Test relay switches on actual touchscreen to confirm fix
- [x] ~~Test map panning~~ - Fixed: Swipe gestures disabled, navigation arrows added
- [x] ~~Map panning conflict with view swipes~~ - Fixed: Complete swipe gesture removal
- [x] ~~Relay names don't persist~~ - Fixed: localStorage middleware added
- [ ] Mobile responsiveness (portrait has unused space, landscape cuts off content)
- [ ] Verify MQTT connection to actual broker

### Medium Priority
- [x] ~~Multiplus mode control non-functional~~ - Fixed: now sends MQTT commands to Venus OS
- [x] ~~Add error boundaries to prevent full app crash~~ - Added ErrorBoundary components
- [x] ~~Remove orphan backup file: `Header.tsx.backup`~~ - Already cleaned up
- [x] ~~Alert system~~ - Completed: AlertBanner, useAlertMonitor, configurable rules
- [x] ~~Anchor watch~~ - Completed: AnchorWatchPanel with map visualization
- [x] ~~MOB button~~ - Completed: MOBButton with alarm and position tracking
- [x] ~~Bilge monitoring~~ - Completed: BilgePanel with cycle tracking
- [x] ~~Screen dimmer~~ - Completed: Auto-dim with configurable settings

### Low Priority / Future
- [x] ~~Code splitting to reduce bundle size~~ - Completed: Initial bundle reduced to 215KB
- [x] ~~Add settings UI for relay names~~ - Completed: Settings view added with relay name editor
- [x] ~~Add settings UI for Victron MQTT topic prefix~~ - Completed: Shows current config (editing in future update)
- [x] ~~Improve MQTT reconnection handling~~ - Completed: Exponential backoff and state tracking
- [x] ~~Data history charts~~ - Completed: MiniChart component with battery/solar history
- [x] ~~WiFi network management~~ - Completed: WiFi scanner/connector with saved networks
- [x] ~~Sensor configuration UI~~ - Completed: Add/configure GPIO/I2C/Automation 2040W sensors
- [x] ~~Connection settings (SignalK, MQTT)~~ - Completed: Editable URLs and credentials
- [ ] Customizable dashboard view (dashboardSlice ready, view not yet implemented)
- [x] ~~Real WiFi integration~~ - Completed: useWiFiManager hook + wifi-manager.sh script
- [x] ~~Advanced sensor editing~~ - Completed: Full GPIO/I2C/A2040W/MQTT/calibration editor
- [x] ~~Real-time sensor value testing~~ - Completed: Live monitoring with status indicators
- [x] ~~Automation 2040W device discovery~~ - Completed: mDNS scanning and auto-configuration
- [ ] Backend API server for WiFi script execution (currently falls back to mock)
- [ ] Electron wrapper for native system access
- [ ] Real GPIO/I2C sensor reading implementation
- [ ] Advanced calibration curves (non-linear, multi-point)

---

## Architecture Notes

### View System
Views are registered in `ViewRegistry.tsx` and rendered by `SwipeableViewContainer.tsx`.
Each view receives `theme` and `onToggle` props.
Navigation via fixed-position arrows (always at 50vh) and clickable dot indicators.
Swipe gestures are disabled to prevent conflicts with map panning.
ViewNavigationContext provides programmatic navigation to all views.

### State Management
Redux slices in `/store/slices/`:
- `navigationSlice` - GPS, wind, depth, sun times
- `victronSlice` - Battery, solar, inverter data
- `sensorsSlice` - Tanks, temperatures
- `relaysSlice` - Relay configs and states
- `settingsSlice` - App settings, thresholds
- `viewsSlice` - View enable/order config
- `networkSlice` - WiFi networks, connections, Automation 2040W devices
- `sensorConfigSlice` - Sensor definitions and configurations

Middleware:
- `localStorageMiddleware` - Persists selected slices (relays, settings, network, etc.) to localStorage with 500ms debouncing

### Data Flow
1. SignalK WebSocket -> navigationSlice (GPS data)
2. MQTT -> victronSlice, sensorsSlice, relaysSlice
3. Components select from Redux store

### Key Components
- `NauticalMap.tsx` - Leaflet map with boat tracking (fully functional panning)
- `RelaySwitch.tsx` - Touch-friendly toggle switch with inline name editing
- `SwipeableViewContainer.tsx` - View container with arrow navigation (swipe disabled)
- `ViewNavigationContext.tsx` - Context provider for programmatic view navigation
- `Header.tsx` - Status bar with GPS, time, theme toggle

---

## Configuration

### Default MQTT Topics
- Relay state: `boat/relays/{id}/state`
- Relay control: `boat/relays/{id}/set` (payload: "1" or "0")
- Prefix configurable in settings

### Default URLs
- SignalK: `ws://localhost:3000/signalk/v1/stream?subscribe=all`
- MQTT: `ws://localhost:9001`

---

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Session History

### 2026-01-20 - Session 11 (RESIZABLE PANEL & AUTO THEME)

**UX Improvements Completed:**

1. **Resizable Info Panel (#6)**
   - Created `ResizablePanel.tsx` component with drag handle
   - Drag handle at top of panel with visual grip indicator
   - Border and grip turn primary color while dragging
   - Panel height range: 100-400px
   - Height persists to Redux `viewSettings.infoPanelHeight`
   - Integrated into `NavigationView.tsx`
   - Map height dynamically adjusts: `calc(100vh - header - view-indicator - panelHeight)`
   - Uses pointer events for smooth drag interaction with capture
   - Files: `ResizablePanel.tsx` (new), `NavigationView.tsx` (modified)

2. **Theme Toggle with Auto Mode (#7)**
   - Added `ThemeSetting` type: `'day' | 'night' | 'auto'`
   - Updated `settingsSlice.ts` to use ThemeSetting instead of ThemeMode
   - Modified `toggleTheme` action to cycle: day → night → auto → day
   - Implemented auto mode logic in `App.tsx`:
     - Uses sun times (sunrise/sunset) to automatically switch themes
     - Checks if current time is between sunrise and sunset
     - Falls back to day theme if sun times unavailable
   - Updated Header.tsx theme button to 3-state switch:
     - Shows "☀️ Day", "🌙 Night", or "🔄 Auto"
     - When in auto mode, displays current active theme below (☀️ or 🌙)
     - Vertical button layout with larger touch target
   - Files: `theme.ts` (type added), `settingsSlice.ts` (modified), `App.tsx` (modified), `Header.tsx` (modified)

**Technical Details:**
- ResizablePanel uses pointer capture for reliable drag tracking
- Pointer events work better than touch/mouse for cross-device compatibility
- Auto theme mode recalculates when sun times or theme setting changes
- Theme toggle button shows both setting and current active theme
- All changes persist via localStorage middleware

**Status:**
- ✅ #6 Resizable Info Panel - Complete
- ✅ #7 Theme Toggle with Auto Mode - Complete
- ⏸️ #8 Relay Feedback - Already complete (confirmed earlier)

**Next Steps:**
- Continue with remaining UX issues from the prioritized list
- Test resizable panel and auto theme on actual touchscreen device

---

### 2026-01-20 - Session 10 (SCROLLING FIXED!)

**THE FIX**: Vertical scrolling now works on touchscreen!

**Root Cause Identified:**
1. `transform: translateX()` on the track div creates a stacking context that clips scroll behavior
2. Multiple nested `overflow: hidden` containers were clipping scrollable areas
3. `height: '100%'` on VictronPanel and SensorPanel created conflicting nested scroll containers

**The Solution:**
The scroll container must use explicit `height: 100%` (not flex-based sizing) and each view wrapper needs its own independent scroll context.

**Key Files Changed:**

1. **SwipeableViewContainer.tsx** - Complete restructure:
   ```javascript
   // Outer wrapper - explicit height, clips horizontally
   <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>

   // Container - explicit height, clips content
   containerStyle = { height: '100%', overflow: 'hidden', position: 'relative' }

   // Track - explicit height for horizontal layout
   trackStyle = { display: 'flex', height: '100%', transform: translateX(...) }

   // View wrapper - THIS IS THE SCROLL CONTAINER
   viewStyle = { minWidth: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }
   ```

2. **VictronPanel.tsx** - Removed height/overflow constraints:
   - Removed: `height: '100%'`, `overflowY: 'auto'`
   - Panel now sizes naturally to content

3. **SensorPanel.tsx** - Same fix:
   - Removed: `height: '100%'`, `overflowY: 'auto'`

4. **VictronView.tsx** - Simplified layout:
   - Removed flex constraints (`flex: '0 1 auto'`, `flex: '1 1 auto'`)
   - Content now stacks naturally without height constraints

5. **SensorsView.tsx** - Same simplification:
   - Removed flex constraints
   - Natural content flow

6. **SettingsView.tsx** - Removed height constraints:
   - Removed `height: '100%'` from root div
   - Removed `height: 'calc(100% - 40px)'` from tab content

**Why It Works Now:**
- Each view wrapper (viewStyle) is an independent scroll container with `height: 100%` and `overflowY: auto`
- The `height: 100%` chain is explicit all the way down (not flex-based)
- Content inside views has NO height constraints - it sizes naturally
- When content exceeds viewport height, the view wrapper scrolls independently
- Switching views doesn't affect other views' scroll positions

**Testing Confirmed:**
- VictronView: Scrolls to show history charts at bottom ✅
- SensorsView: Scrolls to show all sensors ✅
- RelaysView: Fits in viewport, no scroll needed (uses pagination) ✅
- SettingsView: Scrolls through tabs ✅
- NavigationView: Map fills viewport, no scroll needed ✅

**Backup Created:**
- `AmpMatter-backup-2026-01-20-0210-scrolling-fixed.tar.gz` (20MB)

---

### 2026-01-19/20 - Session 9 (SCROLLING STILL BROKEN - ALL ATTEMPTS FAILED)

**CRITICAL ISSUE**: Vertical scrolling does NOT work on touchscreen despite multiple attempts to fix.

**What the user reported:**
- VictronView: Content cut off, can't see history charts
- SensorsView: Content cut off, can't scroll
- RelaysView: Switches oversized/incomplete view
- Settings: Works fine (has tabbed interface, no scrolling needed)

**What I tried (ALL FAILED):**

1. **Changed view container heights** - FAILED
   - Changed `height: '100%'` to `minHeight: '100%'` + `maxHeight: '100%'`
   - Result: Made relay switches HUGE, broke layout completely
   - User feedback: "switches are oversized now, can only see a bit of switch 1 and 2"

2. **Removed touch event handlers** - FAILED
   - Removed all `onTouchStart/Move/End` from SwipeableViewContainer
   - Theory: Touch handlers blocking native scroll
   - Result: NO CHANGE, still no scrolling
   - Navigation now only works via arrows/dots (no swipes)

3. **Cleared browser cache multiple times** - FAILED
   - Killed Chromium, cleared `/home/mario/.cache/chromium/*`
   - Cleared `/home/mario/.config/chromium/Default/Cache/*`
   - Cleared `/home/mario/.config/chromium-hdmi2/Default/Cache/*`
   - Result: NO CHANGE, user still saw old version or no scrolling

4. **Added `minHeight: 0` to flex containers** - FAILED
   - Theory: Flexbox `min-height: auto` preventing scroll
   - Added to SwipeableViewContainer outer wrapper and containerStyle
   - Result: NO CHANGE reported by user

5. **Changed `overflow` and `touchAction` CSS** - FAILED
   - Changed `touchAction: 'pan-y'` to `'manipulation'`
   - Removed `preventDefault()` from touch handlers
   - Result: NO CHANGE

6. **Removed `overflow: hidden` from views** - FAILED
   - VictronView, SensorsView, NavigationView
   - Theory: Views constraining themselves
   - Result: NO CHANGE

7. **Auto-sizing with flexbox** - NOT TESTED
   - Added `flex: 0 1 auto` / `flex: 1 1 auto` to VictronView/SensorsView
   - User never saw changes (caching issues or wrong approach)

**Settings View (THE ONLY THING THAT WORKED):**
- Created tabbed interface: Display | Relays | Alerts | WiFi | Connect | Sensors
- Each tab fits in viewport, no scrolling needed
- User confirmed: "settings are showing right"

**WHY MY APPROACH WAS WRONG:**

I kept assuming it was a CSS layout issue (height, overflow, flexbox). But:
1. **Never verified scrolling actually works** - Just assumed `overflowY: 'auto'` would work
2. **Never tested on touchscreen** - All changes were blind
3. **May be touchscreen-specific** - Could be touch event capturing, browser behavior, or hardware issue
4. **Caching nightmares** - User kept seeing old version despite rebuilds
5. **Direction was wrong** - Kept adding CSS fixes without understanding root cause

**WHAT NEEDS TO HAPPEN NEXT SESSION:**

1. **VERIFY BASIC SCROLLING FIRST**
   - Create a simple test page with known-working scroll
   - Deploy to touchscreen
   - Confirm touch scrolling actually works in Chromium kiosk mode
   - If basic scroll doesn't work → it's a browser/system config issue, not CSS

2. **IF BASIC SCROLL WORKS:**
   - Use browser DevTools remotely (chrome://inspect)
   - Inspect actual rendered DOM and computed styles
   - Check if content actually overflows container
   - Verify touch events aren't being blocked

3. **IF BASIC SCROLL FAILS:**
   - Check Chromium flags (may need `--touch-events=enabled`)
   - Check X11 touch input configuration
   - May need to enable touch events in kernel/systemd

4. **ALTERNATIVE APPROACH (if scrolling can't be fixed):**
   - Use tabbed interface like Settings for ALL views
   - Or use pagination (multiple screens per view)
   - Or redesign to fit everything in viewport

**Files Modified This Session:**
- `SwipeableViewContainer.tsx` - Removed touch handlers, added minHeight: 0
- `SettingsView.tsx` - Complete rewrite with tabs (THIS WORKED)
- `VictronView.tsx` - Added flexbox auto-sizing (NOT VERIFIED)
- `SensorsView.tsx` - Added flexbox auto-sizing (NOT VERIFIED)
- `NavigationView.tsx` - Removed height: 100% (NOT VERIFIED)
- `RelaysView.tsx` - Removed overflow: hidden (NOT VERIFIED)

**Current Build:**
- Bundle: `index-DGCTDDc2.js` (built 2026-01-20 00:11)
- Settings view has tabs and works ✅
- Other views: scrolling still broken ❌
- Navigation: Arrows and dots work (no swipes) ✅
- RelaysView: May have layout issues (oversized switches reported)
- Kiosk script: `start-kiosk.sh` with `--password-store=basic` ✅

**What's Definitely Working:**
- Settings tabs (Display, Relays, Alerts, WiFi, Connect, Sensors)
- Navigation arrows (left/right at screen center)
- Dot indicators (jump to any view)
- Map panning/zooming (marked as swipe-disabled)
- Build process (Vite + TypeScript)
- HTTP server serving files correctly

**What's Broken:**
- ❌ Vertical scrolling on VictronView
- ❌ Vertical scrolling on SensorsView
- ❌ RelaysView layout (possibly from height changes)
- ❌ User can't see full content on multiple views

### 2026-01-19 - Session 9 (ORIGINAL NOTES - IGNORE, SEE ABOVE)
- **Restored Session 7 Backup** (mobile-responsive)
  - Restored from `AmpMatter-backup-2026-01-15-2250-mobile-responsive.tar.gz`
  - Created backup of Session 8 work before restore
  - Ported updated `start-kiosk.sh` from Session 8

- **Fixed Map/Scroll Conflict with Context-Aware Swipe Detection**
  - Implemented intelligent swipe gesture system that:
    - Detects when touch starts on swipe-disabled zones (map)
    - Differentiates between vertical scrolling and horizontal swiping
    - Only triggers view changes for clear horizontal swipes
  - Added `data-swipe-disabled="true"` attribute to NauticalMap container
  - Swipe detection checks vertical vs horizontal movement (10px threshold)
  - If vertical movement exceeds horizontal, treats as scroll not swipe
  - Map now works perfectly with pan/zoom while swipes work everywhere else

- **Fixed Vertical Scrolling on Touch Devices**
  - Changed view containers from `overflow: 'hidden'` to `overflow-y: 'auto'`
  - Added `-webkit-overflow-scrolling: 'touch'` for smooth iOS scrolling
  - Updated RelaysView to use `minHeight: '100%'` instead of `height: '100%'`
  - Removed `overflow: 'hidden'` constraint from view containers
  - Views now scroll properly on touchscreens (Settings, Relays, etc.)

- **Touch Event Handling Improvements**
  - Track both X and Y touch positions for better gesture detection
  - Maintain `touchAction: 'pan-y'` on container for vertical panning
  - Added `isVerticalScroll` state to prevent accidental view changes during scrolling
  - Reset vertical scroll flag on touch end

- **Build System**
  - Restored project dependencies with `npm install`
  - Built shared package with `npx tsc --build --force`
  - Successful Vite build: 240KB main bundle + lazy-loaded chunks
  - Bundle remains well-optimized with code splitting

- **Files Modified**:
  - `packages/client/src/components/layout/SwipeableViewContainer.tsx` - context-aware swipe detection
  - `packages/client/src/components/map/NauticalMap.tsx` - added data-swipe-disabled attribute
  - `packages/client/src/components/views/RelaysView.tsx` - removed overflow constraints
  - `start-kiosk.sh` - updated version from Session 8
  - `SESSION_NOTES.md` - this update

- **Testing Status**:
  - ✅ Build successful (verified)
  - ⏳ Touchscreen testing pending (needs physical device)
  - ⏳ Map pan/zoom interaction pending
  - ⏳ View swipe gestures pending
  - ⏳ Vertical scrolling in views pending

### 2026-01-15 - Session 6
- **Advanced Sensor Configuration & Testing + Real WiFi Integration**
  - **Advanced Sensor Editor** (`SensorEditor.tsx`)
    - Comprehensive modal form for full sensor configuration
    - Basic info: name, type (9 types), interface (5 interfaces), location, notes
    - GPIO configuration: pin number, mode (input/output/PWM), pull resistors, inverted logic
    - I2C configuration: hex address, bus number, device type, register
    - Automation 2040W: device ID, channel number, connection type (WiFi/BT)
    - MQTT configuration: topic, QoS level (0/1/2)
    - Data processing: display unit, decimal places, update interval, smoothing (averaging)
    - Calibration system: raw min/max to scaled min/max with units (e.g., ADC 0-1023 → 0-100%)
    - Alarm thresholds: min/max values for alerts
    - Real-time validation and error checking
  - **Sensor Testing & Monitoring Interface** (`SensorTester.tsx`)
    - Live monitoring of all enabled sensors with 1-second updates
    - Real-time value display with large, readable numbers
    - Shows both scaled values (with units) and raw ADC values
    - Status indicators: OK (green), Warning (yellow), Error (red)
    - Alarm threshold visualization (shows min/max limits)
    - Configuration summary for each sensor (GPIO pins, I2C addresses, etc.)
    - Start/stop monitoring controls
    - Simulated sensor data generation (ready for real sensor integration)
    - Responsive card layout with color-coded borders
  - **Automation 2040W Device Discovery** (`Automation2040WDiscovery.tsx`)
    - mDNS/Bonjour network scanning for devices
    - Discovers device name, IP address, Bluetooth address, firmware version
    - Shows device capabilities (analog inputs, digital inputs, relay outputs)
    - Online/offline status with last-seen timestamp
    - One-click add to configuration
    - Connection testing for configured devices
    - Remove devices from configuration
    - Help text with discovery tips
  - **Real WiFi Integration** (`useWiFiManager.ts` + `wifi-manager.sh`)
    - Shell script wrapper for nmcli (NetworkManager CLI)
    - Commands: scan, connect, disconnect, current, saved, forget, status
    - JSON output for easy parsing
    - React hook with fallback to mock data if script unavailable
    - Automatic graceful degradation (mock WiFi if system unavailable)
    - Ready for Electron IPC or backend API integration
    - Executes real system WiFi commands on Raspberry Pi
  - **Updated SensorConfigManager**
    - 3-button grid layout: Add Sensor, Test, Discover A2040W Devices
    - Toggle between configuration, testing, and discovery modes
    - Integrated all new components seamlessly
  - **Bundle Size Impact**
    - SettingsView chunk: 33.28KB → 61.58KB (85% increase due to advanced features)
    - Total app remains well-optimized with code splitting
  - Files created/modified:
    - `packages/client/src/components/settings/SensorEditor.tsx` (new, 600+ lines)
    - `packages/client/src/components/settings/SensorTester.tsx` (new, 400+ lines)
    - `packages/client/src/components/settings/Automation2040WDiscovery.tsx` (new, 300+ lines)
    - `packages/client/src/hooks/useWiFiManager.ts` (new)
    - `scripts/wifi-manager.sh` (new, executable shell script)
    - `packages/client/src/components/settings/WiFiManager.tsx` (updated to use real WiFi)
    - `packages/client/src/components/settings/SensorConfigManager.tsx` (updated with all features)

### 2026-01-15 - Session 5
- **Enhanced Settings View with Network & Sensor Configuration**
  - Created `networkSlice` for WiFi network management
    - WiFi scanning, connection, and saved networks
    - Connection state tracking (scanning, connecting, connected)
    - Support for password-protected and open networks
  - Created `sensorConfigSlice` for sensor definitions
    - Support for multiple sensor types (tanks, temperature, digital/analog inputs, bilge pump, voltage, current)
    - Multiple interfaces: GPIO, I2C, Automation 2040W, Signal K, MQTT
    - Sensor calibration and configuration storage
    - Automation 2040W device management with connection tracking
  - **WiFi Manager Component** (`WiFiManager.tsx`)
    - Network scanning with signal strength display
    - Visual indicators for security (🔒 locked, 🔓 open)
    - Password input for secured networks
    - Saved network management (forget networks)
    - Current connection status display
  - **Sensor Configuration Manager** (`SensorConfigManager.tsx`)
    - Add/edit/remove sensor definitions
    - Quick-add templates for common sensors
    - Enable/disable individual sensors
    - Display sensor details (GPIO pins, I2C addresses, MQTT topics)
    - Automation 2040W device list with online/offline status
  - **Connection Settings** (`ConnectionSettings.tsx`)
    - Editable Signal K WebSocket URL
    - Editable MQTT broker URL
    - Optional MQTT authentication (username/password)
    - Automation 2040W direct connection settings (IP/Bluetooth)
  - **Updated SettingsView layout**
    - New sections: WiFi Network, Connection Settings, Sensor Configuration
    - Existing sections: Relay Names, MQTT Configuration, Display Settings, Alert Settings
    - Settings view chunk increased to 33.28KB (includes all new components)
  - **Type Definitions**
    - Added `network.ts` types (WiFi networks, credentials, connection settings)
    - Added `sensorConfig.ts` types (sensor definitions, GPIO/I2C/A2040W configs, calibration)
  - Files created/modified:
    - `packages/shared/src/types/network.ts` (new)
    - `packages/shared/src/types/sensorConfig.ts` (new)
    - `packages/client/src/store/slices/networkSlice.ts` (new)
    - `packages/client/src/store/slices/sensorConfigSlice.ts` (new)
    - `packages/client/src/components/settings/WiFiManager.tsx` (new)
    - `packages/client/src/components/settings/SensorConfigManager.tsx` (new)
    - `packages/client/src/components/settings/ConnectionSettings.tsx` (new)
    - `packages/client/src/components/views/SettingsView.tsx` (updated)
    - `packages/client/src/store/index.ts` (updated)

### 2026-01-15 - Session 7
- **Fixed map interaction conflicts** (complete)
  - Completely disabled swipe gestures to prevent conflicts with map panning
  - Map now fully functional with pan, zoom, and all Leaflet controls
- **Navigation arrow system** (complete)
  - Added fixed-position navigation arrows on all views
  - Arrows positioned at `50vh` (viewport center) regardless of zoom level
  - Semi-transparent with hover effects
  - Only visible when prev/next views are available
- **ViewNavigationContext** (new)
  - Created React context for programmatic view navigation
  - Provides goToView, goToNextView, goToPrevView functions
  - Available to all views via useViewNavigation hook
- **LocalStorage persistence** (complete)
  - Created localStorageMiddleware for Redux state persistence
  - Relay names, settings, WiFi networks now persist across page reloads
  - Selective persistence (config data only, not real-time sensor data)
  - Debounced saves (500ms) to avoid excessive writes
- **Relay inline editing** (complete)
  - Added edit button (✏️) to relay switches
  - Inline name editing with keyboard shortcuts (Enter/Escape)
  - Changes persist via localStorage
- **Navigation methods**:
  - Arrow buttons (left/right, fixed at screen center)
  - Dot indicators (bottom bar, click to jump to any view)
  - Swipe gestures removed
- **Known issues**:
  - Mobile responsiveness needs improvement (portrait has unused space, landscape cuts off content)
- **Backup**: `AmpMatter-backup-2026-01-15-2222-navigation-arrows-complete.tar.gz` (19MB)
- **Commit**: `3eec079` - Fix map interaction and add navigation arrows

### 2026-01-15 - Session 4
- **Recovered work from SSH crash** - All in-progress features were preserved
- **Alert System** (complete)
  - AlertBanner component with severity-based styling and sounds
  - useAlertMonitor hook for monitoring battery, depth, tanks, temperature, and connections
  - alertsSlice with configurable rules and thresholds
  - Sound alerts with different tones for critical/warning/info
- **Anchor Watch** (complete)
  - AnchorWatchPanel for setting/monitoring anchor position
  - Displays current drift, max drift, configurable watch radius
  - Visual anchor zone on map with Circle and Marker
  - anchorSlice with Haversine distance calculation
- **Man Overboard (MOB)** (complete)
  - MOBButton component with alarm sound and visual feedback
  - MOBIndicator for header display
  - Marks position and calculates bearing/distance
  - mobSlice with bearing calculation utility
- **Bilge Pump Monitoring** (complete)
  - BilgePanel showing pump status, cycles/hour, 24h statistics
  - useBilgeMonitor hook for tracking pump activity
  - Alerts on excessive cycling or continuous running
  - bilgeSlice with cycle tracking
- **Screen Dimmer** (complete)
  - ScreenDimmerOverlay with activity-based dimming
  - useScreenDimmer hook tracks activity and manages brightness
  - Configurable dim timeout, brightness levels, screen off
- **Data History & Charts** (complete)
  - MiniChart component (SVG-based line charts)
  - ChartGrid for displaying multiple metrics
  - useDataHistory hook for recording/accessing historical data
  - historySlice storing battery SOC, voltage, current, solar power, depth
- **Settings View Enhanced**
  - Added Display Settings section (brightness slider, auto-dim toggle, screen off)
  - Added Alert Settings section (global sound toggle, individual alert rules)
- **Dashboard Slice** (prepared for future)
  - Widget system with configurable layout
  - Widget types: battery, solar, depth, speed, wind, tanks, etc.

### 2026-01-15 - Session 3
- **Improved MQTT reconnection handling**
  - Created `useMqttConnection` hook with exponential backoff (1s to 30s max)
  - Detailed connection state tracking (idle, connecting, connected, reconnecting, disconnected, error)
  - Retry count tracking and error tracking
  - Manual reconnect capability
  - Updated all MQTT hooks: `useSensorData`, `useRelayControl`, `useVictronControl`, `useWeatherData`
  - Files: `useMqttConnection.ts`, all MQTT hooks
- **Implemented code splitting**
  - Initial bundle reduced from 814KB to 215KB (73.6% reduction)
  - Lazy-loaded view components with React.lazy() and Suspense
  - Manual chunking of large dependencies (Leaflet: 154KB, MQTT: 372KB, Redux: 26KB)
  - Individual view chunks: 4-10KB each, loaded on demand
  - Added loading fallback for lazy-loaded views
  - Files: `vite.config.ts`, `ViewRegistry.tsx`, `App.tsx`
- **Added Settings view**
  - New swipeable view for app configuration
  - Relay name editor with inline editing
  - MQTT configuration display (relay and Victron topic prefixes)
  - Touch-friendly interface with proper button sizing
  - Lazy-loaded as separate chunk (4.62KB)
  - Files: `SettingsView.tsx`, `ViewRegistry.tsx`, `views.ts`
- **Fixed TypeScript errors**
  - Removed unused `CachedTileLayer` component from `NauticalMap.tsx`
  - Removed unused imports and variables
  - All builds now pass TypeScript checks

### 2026-01-15 - Session 2
- Implemented Multiplus mode MQTT control
  - Created `useVictronControl` hook for Venus OS MQTT commands
  - Added `victronSettings` to settings slice (topic prefix, vebus instance)
  - VictronPanel now sends MQTT commands when mode buttons are pressed
  - Files: `useVictronControl.ts`, `settingsSlice.ts`, `VictronPanel.tsx`
- Added error boundaries to prevent full app crashes
  - Created `ErrorBoundary` and `ViewErrorBoundary` components
  - Each view is now wrapped in its own error boundary
  - App-level error boundary as final fallback
  - Files: `ErrorBoundary.tsx`, `App.tsx`
- Fixed map panning conflict with swipe container
  - Created `MapTouchWrapper` component to stop touch event propagation
  - Map now handles all touch gestures independently from swipe container
  - Added `LayersControl` for toggling map layers (OpenStreetMap, Sea Marks, Harbours)
  - Map accepts `children` prop for adding custom overlay layers
  - Files: `NauticalMap.tsx`

### 2026-01-15 - Session 1
- Assessed project state after previous issues
- Fixed relay switch accidental triggering during swipe
- Added auto-sizing grid with pagination for relays
- Fixed battery threshold bug
- Created this SESSION_NOTES.md file

---

## Notes for Next Session

### New Features Summary
- **Navigation View** now has MOB button (top-right) and Anchor Watch panel
- **Victron View** shows historical charts for battery SOC, voltage, solar power
- **Sensors View** includes bilge pump monitoring panel
- **Settings View** has display settings (brightness, auto-dim) and alert configuration

### Alert System
Alerts trigger automatically when thresholds are crossed:
- Low battery (warning at 20%, critical at 10%)
- Shallow depth (warning at 3m, critical at 1.5m)
- High temperature (50°C)
- Low fresh water (15%)
- High waste water (85%)
- Anchor drag (when drift exceeds radius)
- Bilge pump high activity (>6 cycles/hour or continuous running)
Configure in Settings > Alert Settings

### Anchor Watch
On Navigation view, tap the anchor panel (top-right):
1. "Drop Anchor" marks current position
2. Set watch radius (default 30m)
3. Visual circle shows watch zone on map
4. Alert sounds if boat drifts outside radius

### MOB (Man Overboard)
Red MOB button on Navigation view:
- Tap to mark position and trigger alarm
- Shows distance and bearing to MOB position
- Red marker appears on map
- Tap again to cancel

### Screen Dimmer
Configured in Settings > Display Settings:
- Auto-dims after 60s inactivity (configurable)
- Dims to 30% brightness (configurable)
- Optional: turn off screen completely after dimming
- Any touch wakes the screen

### MQTT Reconnection
The `useMqttConnection` hook provides robust reconnection handling:
- Exponential backoff: starts at 1s, maxes at 30s
- Connection states: idle, connecting, connected, reconnecting, disconnected, error
- All MQTT hooks now use this centralized connection manager
- Check console logs for connection status and retry attempts

### Code Splitting
Initial bundle reduced by 73.6%:
- Main bundle: 215KB (was 814KB)
- Leaflet chunk: 154KB (loaded when Navigation view accessed)
- MQTT chunk: 372KB (loaded on MQTT initialization)
- View chunks: 4-10KB each (lazy-loaded on swipe)

### Settings View
Swipe right from Relays to access Settings:
- **WiFi Network**: Scan for networks, connect, manage saved networks
- **Connection Settings**: Configure Signal K URL, MQTT URL/auth, Automation 2040W connections
- **Sensor Configuration**: Add/configure sensors (GPIO, I2C, Automation 2040W)
- **Relay Names**: Edit relay names inline
- **MQTT Configuration**: View topic prefixes
- **Display Settings**: Brightness, auto-dim, screen off
- **Alert Settings**: Enable/disable alerts, global sound toggle

### Map Usage
To add custom layers to the map:
```tsx
<NauticalMap theme={theme}>
  <Marker position={[lat, lng]} />
  <Circle center={[lat, lng]} radius={100} />
</NauticalMap>
```

Available base layers: OpenStreetMap
Available overlays: Sea Marks (checked by default), Harbours

---

## Notes for Next Session

### ✅ SCROLLING IS FIXED (Session 10)

Vertical touch scrolling now works on all views. See Session 10 notes above for the full technical solution.

**Key lesson learned:** When using CSS transforms (like `translateX` for horizontal swipe), scroll containers need explicit `height: 100%` chains, not flex-based sizing. Each view wrapper must be its own independent scroll container.

### Remaining Tasks

1. **Backend API server** - WiFi script execution currently falls back to mock
2. **Electron wrapper** - For native system access
3. **Real GPIO/I2C sensor reading** - Currently simulated
4. **Customizable dashboard** - dashboardSlice ready, view not implemented
5. **Mobile responsiveness** - Portrait has unused space, landscape may cut off

### Working Features (Don't Break These)
   - Verify navigation arrows work correctly
   - Verify dot indicators work for jumping between views

2. **Verify Context-Aware Swipe Detection**
   - Swipes should be disabled when touching the map
   - Swipes should work on all other UI elements
   - Vertical scrolling should not trigger horizontal view changes
   - Horizontal swipes should smoothly change views with visual feedback

3. **Test Vertical Scrolling**
   - All views with long content should scroll vertically
   - Settings view should scroll through all sections
   - Relays view should handle pagination (if >8 switches) or scroll
   - Scrolling should be smooth on touchscreen

4. **Known Issues to Address (if found during testing)**
   - Report any conflicts between swipe and scroll
   - Check if map interactions feel natural
   - Verify no accidental view changes during normal use

### Build Commands

```bash
# Development
npm run dev

# Build (use vite directly)
cd /home/mario/AmpMatter/packages/client && npx vite build

# Build shared package first if needed
cd /home/mario/AmpMatter/packages/shared && npm run build

# Kiosk mode
/home/mario/AmpMatter/start-kiosk.sh
# To stop: pkill chromium && pkill -f "http.server"
```

### Current Implementation Details

**Context-Aware Swipe System:**
- Elements with `data-swipe-disabled="true"` ignore swipe gestures
- NauticalMap container has this attribute set
- Touch handlers check if target or parent has swipe-disabled
- Vertical movement >10px is treated as scroll, not swipe
- `isVerticalScroll` flag prevents view change on scroll gestures

**Vertical Scrolling:**
- View containers use `overflowY: 'auto'` and `overflowX: 'hidden'`
- `-webkit-overflow-scrolling: 'touch'` for smooth iOS scrolling
- Views use `minHeight: '100%'` instead of fixed `height: '100%'`
- Container maintains `touchAction: 'pan-y'` for vertical panning

**Navigation Methods:**
- Swipe left/right (horizontal gestures only)
- Arrow buttons (fixed at screen center)
- Dot indicators (tap to jump to any view)
