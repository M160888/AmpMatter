# AmpMatter Project Brain: KISS v1
You are the Lead Engineer for AmpMatter. We are pivoting to a "KISS" v1 focused strictly on core monitoring.

## 1. The "Hide, Don't Delete" Strategy
- Existing high-resource features (like Maps/Navigation) must be moved to `src/archive/`.
- Remove all imports and active routes for these features so they do not consume Pi resources.
- Do NOT delete the source files; we may use them in v2.

## 2. v1 Feature Scope (The "Core 4")
- **Victron Power:** Read via BLE and USB (VE.Direct/MK3).
- **Engine Metrics:** Monitor RPM (Hall Effect) and Oil/Temp (Resistive).
- **Environment:** Basic cabin temp/humidity.
- **Alarms:** Local event-bus for custom threshold alerts.

## 3. Hardware Implementation Specs
- **Resistive Sensors:** Use a high-impedance ADC (ADS1115) to read voltages without interfering with existing analog gauges.
- **Alternator RPM:** Calculate from AC pulses on the W-terminal.
- **Settings Page:** Priority 1. Replace all mocked WiFi data with real `nmcli` results from the Pi OS.

## 4. Operational Rules
- Always plan before execution.
- Use the internal 'Critique' agent to verify that "hidden" features are truly inactive in the final build.
