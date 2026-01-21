# Sensor Configuration Guide

Complete guide for configuring sensors in AmpMatter for marine monitoring.

## Overview

AmpMatter supports multiple sensor types and interfaces:

**Sensor Types:**
- Tank Level (fuel, water, waste, black water, live well)
- Temperature (engine, cabin, fridge, seawater)
- Digital Input (bilge pump, door sensors, flow switches)
- Analog Input (generic ADC readings)
- Pressure (oil, water, hydraulic)
- Humidity (cabin, storage areas)
- Voltage (battery monitoring)
- Current (power consumption)

**Interfaces:**
- **GPIO** - Direct connection to Raspberry Pi pins
- **I2C** - I2C bus devices (ADCs, sensors, port expanders)
- **Automation 2040W** - Pimoroni WiFi/Bluetooth I/O board
- **MQTT** - Remote sensors publishing to MQTT broker
- **Signal K** - Marine standard network sensors

## Quick Start

### 1. Add a Sensor

1. Go to **Settings View** → **Sensor Configuration**
2. Click **➕ Add Sensor**
3. Fill in basic information:
   - **Name**: Descriptive name (e.g., "Fresh Water Tank")
   - **Type**: Select sensor type from dropdown
   - **Interface**: Choose connection method
   - **Location**: Physical location on boat

### 2. Configure Interface

Depending on your selected interface:

#### GPIO Configuration
```
Pin Number: 17 (GPIO pin number, not physical pin)
Mode: Input (for sensors) / Output (for controls) / PWM
Pull-up: ✓ Enable for switches/buttons
Pull-down: For specific sensor requirements
Inverted: ✓ For active-low sensors
```

#### I2C Configuration
```
Address: 48 (hex, without 0x prefix)
Bus: 1 (usually 1 on Raspberry Pi)
Device Type: ADS1115, BME280, MCP23017, etc.
Register: Optional hex register address
```

#### Automation 2040W Configuration
```
Device ID: a2040w-001 (from discovered devices)
Channel: 0-3 (analog/digital channel number)
Connection: WiFi or Bluetooth
```

#### MQTT Configuration
```
Topic: boat/sensors/temperature/engine
QoS: 0 (at most once), 1 (at least once), or 2 (exactly once)
```

### 3. Set Up Calibration

Calibration maps raw sensor values to meaningful units:

```
Raw Min: 0 (ADC minimum, e.g., 0)
Raw Max: 1023 (ADC maximum for 10-bit)
Scaled Min: 0 (Real-world minimum)
Scaled Max: 100 (Real-world maximum)
Unit: % (display unit)
```

**Example: Tank Level Sensor**
- Raw: 150-850 (ADC range when tank is empty to full)
- Scaled: 0-200 (tank capacity in liters)
- Unit: L

**Example: Temperature Sensor (Thermistor)**
- Use thermistor calculator to get resistance-to-temperature curve
- Or use simple linear approximation for small ranges

### 4. Configure Data Processing

```
Display Unit: °C, L, V, A, % (shown in UI)
Decimal Places: 1 (for precision)
Update Interval: 1000 ms (how often to read)
Smoothing: 5 (average over 5 readings to reduce noise)
```

### 5. Set Alarm Thresholds

```
Min Alarm: 20 (trigger warning below this value)
Max Alarm: 90 (trigger warning above this value)
```

## Interface-Specific Guides

### GPIO Sensors

#### Raspberry Pi GPIO Pin Numbering

**Use BCM (GPIO) numbers, not physical pin numbers!**

```
Physical Pin → GPIO Number
Pin 11       → GPIO 17
Pin 13       → GPIO 27
Pin 15       → GPIO 22
Pin 16       → GPIO 23
Pin 18       → GPIO 24
```

See [pinout.xyz](https://pinout.xyz) for full diagram.

#### Digital Sensors (Switches, Buttons)

```yaml
Type: Digital Input
Interface: GPIO
Pin: 17
Mode: Input
Pull-up: ✓ Enabled
Inverted: ✓ (if active-low)
```

**Wiring:**
- Connect one side to GPIO pin
- Connect other side to GND
- Enable pull-up resistor in config
- Sensor reads LOW when pressed/active

#### Analog Sensors via ADC

Raspberry Pi doesn't have analog inputs. Use an ADC:

**Common ADCs:**
- ADS1115 (16-bit, 4-channel, I2C)
- MCP3008 (10-bit, 8-channel, SPI)
- ADS1015 (12-bit, 4-channel, I2C)

**Example with ADS1115:**

```yaml
Type: Tank Level
Interface: I2C
Address: 48 (0x48)
Bus: 1
Device Type: ADS1115
Calibration:
  Raw Min: 0
  Raw Max: 32767 (16-bit max)
  Scaled Min: 0
  Scaled Max: 200
  Unit: L
```

**Wiring ADS1115:**
```
ADS1115 → Raspberry Pi
VDD     → 3.3V
GND     → GND
SDA     → GPIO 2 (Pin 3)
SCL     → GPIO 3 (Pin 5)
A0      → Sensor signal
```

### I2C Sensors

#### Enable I2C on Raspberry Pi

```bash
# Enable I2C
sudo raspi-config
# Interface Options → I2C → Enable

# Verify I2C is working
sudo apt-get install i2c-tools
i2cdetect -y 1
```

#### Common I2C Sensors

**BME280 (Temperature, Humidity, Pressure)**
```yaml
Type: Temperature
Interface: I2C
Address: 76 or 77 (check with i2cdetect)
Bus: 1
Device Type: BME280
Display Unit: °C
Decimals: 1
```

**ADS1115 (4-channel ADC)**
```yaml
Type: Analog Input
Interface: I2C
Address: 48 (default, configurable to 49-4B)
Bus: 1
Device Type: ADS1115
# Each channel configured as separate sensor
```

**MCP23017 (16-bit I/O Expander)**
```yaml
Type: Digital Input
Interface: I2C
Address: 20 (default, configurable)
Bus: 1
Device Type: MCP23017
# Configure individual pins as sensors
```

#### Finding I2C Address

```bash
# Scan I2C bus
i2cdetect -y 1

# Output shows hex addresses:
#      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
# 00:          -- -- -- -- -- -- -- -- -- -- -- -- --
# 10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
# 20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
# 30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
# 40: -- -- -- -- -- -- -- -- 48 -- -- -- -- -- -- --
# 50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
# 60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
# 70: -- -- -- -- -- -- 76 --

# Address 48 = 0x48 (ADS1115)
# Address 76 = 0x76 (BME280)
```

### Automation 2040W

[Pimoroni Automation 2040W](https://shop.pimoroni.com/products/automation-2040-w) is a WiFi-enabled I/O board perfect for distributed sensors.

**Features:**
- 3× Analog inputs (0-40V)
- 4× Digital inputs (up to 40V)
- 3× Relay outputs (220V AC / 2A)
- WiFi + Bluetooth connectivity
- MicroPython firmware

#### Discovery

1. Go to **Sensor Configuration** → **🔍 Discover A2040W Devices**
2. Click **Scan for Devices**
3. Devices on network appear automatically
4. Click **Add to Configuration** on discovered devices

#### Manual Configuration

If discovery doesn't work:

1. Find device IP: Check router or use `nmap 192.168.1.0/24`
2. In **Connection Settings** → **Automation 2040W**, set IP address
3. Add sensor with Automation 2040W interface

#### Sensor Configuration

```yaml
Type: Tank Level
Interface: Automation 2040W
Device ID: a2040w-001
Channel: 0 (analog input 0-2)
Connection: WiFi
Calibration:
  Raw Min: 0
  Raw Max: 40 (voltage range)
  Scaled Min: 0
  Scaled Max: 200
  Unit: L
```

**Channel Assignment:**
- Channels 0-2: Analog inputs
- Channels 0-3: Digital inputs (separate namespace)

### MQTT Sensors

Perfect for remote sensors or integrating third-party devices.

#### MQTT Topic Structure

Recommended naming:
```
boat/sensors/{type}/{location}
boat/sensors/temperature/engine
boat/sensors/tank/freshwater
boat/sensors/digital/bilgepump
```

#### Sensor Configuration

```yaml
Type: Temperature
Interface: MQTT
Topic: boat/sensors/temperature/engine
QoS: 1
Display Unit: °C
Decimals: 1
```

#### Publishing Sensor Data

From external device (ESP32, Arduino, etc.):

```python
import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect("mqtt.boat.local", 1883)

# Publish temperature reading
client.publish("boat/sensors/temperature/engine", "85.5")
```

**JSON Format (Recommended):**
```json
{
  "value": 85.5,
  "unit": "°C",
  "timestamp": 1640000000000
}
```

### Signal K Integration

Signal K is a marine data standard. AmpMatter can consume Signal K data streams.

**Configuration:**
```yaml
Type: Temperature
Interface: Signal K
# Sensor automatically discovered from Signal K server
# Configure mapping in Signal K server settings
```

Signal K path examples:
```
environment.outside.temperature
navigation.position.latitude
navigation.position.longitude
electrical.batteries.0.voltage
```

## Sensor Testing

### Live Monitoring

1. Go to **Sensor Configuration** → **🧪 Test**
2. Click **▶️ Start Monitoring**
3. View real-time sensor readings
4. Check status indicators (OK/Warning/Error)
5. Verify calibration is correct

### Status Indicators

- **🟢 OK**: Reading within normal range
- **🟡 Warning**: Approaching alarm threshold
- **🔴 Error**: Outside alarm range or sensor fault

### Troubleshooting Sensors

**No readings / Always 0:**
- Check wiring connections
- Verify interface configuration (GPIO pin, I2C address)
- Test interface: `gpio readall` or `i2cdetect -y 1`
- Check sensor power supply

**Noisy/jumping values:**
- Increase smoothing (average more samples)
- Add hardware filtering (capacitor)
- Check for loose connections
- Shield signal wires from interference

**Wrong values:**
- Re-check calibration min/max
- Verify sensor type matches reading
- Test sensor independently (multimeter)

**I2C sensor not detected:**
```bash
# Check I2C is enabled
ls /dev/i2c-*

# Scan bus
i2cdetect -y 1

# Check connections (SDA/SCL)
# Try lower I2C speed in /boot/config.txt:
dtparam=i2c_arm_baudrate=50000
```

## Example Configurations

### Fresh Water Tank

```yaml
Name: Fresh Water Tank
Type: Tank
Interface: Automation 2040W
Device ID: a2040w-001
Channel: 0
Connection: WiFi
Location: Starboard Side
Calibration:
  Raw Min: 0.5      # Sensor output at empty (volts)
  Raw Max: 4.5      # Sensor output at full (volts)
  Scaled Min: 0
  Scaled Max: 200   # Tank capacity
  Unit: L
Display Unit: L
Decimals: 0
Update Interval: 5000
Smoothing: 5
Min Alarm: 20       # Low level warning
Max Alarm: 195      # Tank full warning
```

### Engine Temperature

```yaml
Name: Engine Temperature
Type: Temperature
Interface: I2C
Address: 48         # ADS1115
Bus: 1
Device Type: ADS1115
Location: Engine Room
Calibration:
  Raw Min: 0
  Raw Max: 32767
  Scaled Min: 0
  Scaled Max: 150
  Unit: °C
Display Unit: °C
Decimals: 1
Update Interval: 1000
Smoothing: 3
Max Alarm: 95       # High temp warning
```

### Bilge Pump

```yaml
Name: Bilge Pump
Type: Digital Input
Interface: GPIO
Pin: 17
Mode: Input
Pull-up: true
Inverted: true      # Active low
Location: Bilge
Display Unit: (none)
Update Interval: 500
# No calibration needed for digital
```

### Battery Voltage

```yaml
Name: House Battery
Type: Voltage
Interface: Automation 2040W
Device ID: a2040w-001
Channel: 1
Location: Battery Bank
Calibration:
  Raw Min: 0
  Raw Max: 40
  Scaled Min: 0
  Scaled Max: 40
  Unit: V
Display Unit: V
Decimals: 2
Update Interval: 2000
Smoothing: 5
Min Alarm: 11.8     # Low voltage
Max Alarm: 14.8     # High voltage (charging)
```

## Advanced Topics

### Multi-Point Calibration

For non-linear sensors (thermistors, some tank sensors), simple min/max calibration may not be accurate across the full range.

**Future feature:** Multi-point calibration with interpolation

For now, choose calibration points in your typical operating range.

### Sensor Averaging & Filtering

```yaml
Smoothing: 5        # Average last 5 readings
Update Interval: 1000  # Read every 1 second

# Effective update: 5 seconds for stable reading
# Good for: Slowly changing values (tank levels, temperature)

Smoothing: 1        # No averaging
Update Interval: 100   # Read every 100ms

# Immediate response
# Good for: Fast-changing values (voltage, current spikes)
```

### Daisy-Chaining I2C Devices

You can connect multiple I2C devices on the same bus if they have different addresses:

```
Raspberry Pi
    ├── SDA/SCL ──┬── ADS1115 (0x48)
                  ├── BME280  (0x76)
                  ├── MCP23017 (0x20)
                  └── ADS1115 (0x49) [address jumper]
```

**Address configuration:**
- Some chips have solderable address jumpers
- ADS1115: A0/A1 pins set address (0x48-0x4B)
- MCP23017: A0/A1/A2 pins set address (0x20-0x27)

### Remote Monitoring with MQTT

Set up sensors on separate ESP32/Arduino boards:

**ESP32 sketch:**
```cpp
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void setup() {
  WiFi.begin("BoatWiFi", "password");
  mqtt.setServer("192.168.1.100", 1883);
}

void loop() {
  float temp = readTemperature(); // Your sensor code
  String topic = "boat/sensors/temperature/cabin";
  mqtt.publish(topic.c_str(), String(temp).c_str());
  delay(5000);
}
```

## Security & Safety

### Electrical Safety

⚠️ **IMPORTANT** for 12V/24V marine systems:

- Use proper marine-grade wire and connectors
- Fuse all power connections
- Keep low-voltage sensors away from high-current circuits
- Use opto-isolators for high-voltage monitoring
- Follow ABYC standards for marine electrical

### Software Security

- Sensor data can affect safety (bilge, temperature alarms)
- Validate all readings before use
- Implement watchdog for sensor failures
- Log all alarm events
- Test alarm conditions regularly

### Fail-Safe Defaults

Configure alarms to fail safe:
- Loss of sensor = trigger alarm (don't assume OK)
- Invalid readings = trigger warning
- Communication timeout = alert user

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Sensor not appearing | Check interface enabled, wiring correct |
| Always reads 0 | Verify power, check address/pin config |
| Erratic values | Increase smoothing, check connections |
| I2C not working | Enable in raspi-config, check SDA/SCL |
| GPIO permission denied | Add user to gpio group |
| Automation 2040W offline | Check WiFi, verify IP address |
| MQTT no data | Verify broker running, check topic |

## Support & Resources

- **Hardware Pinout**: [pinout.xyz](https://pinout.xyz)
- **I2C Tools**: `sudo apt-get install i2c-tools`
- **GPIO Tools**: `sudo apt-get install wiringpi`
- **MQTT Broker**: Mosquitto (`sudo apt-get install mosquitto`)
- **Automation 2040W Docs**: [Pimoroni](https://shop.pimoroni.com/products/automation-2040-w)

---

**Next Steps:**
1. Add your first sensor
2. Test with live monitoring
3. Verify calibration is accurate
4. Set appropriate alarm thresholds
5. Label physical sensors to match configuration
