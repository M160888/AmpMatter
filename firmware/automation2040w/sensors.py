# AmpMatter Sensor Reading Module
# For Pimoroni Automation 2040W

import time
from machine import ADC, Pin

try:
    import onewire
    import ds18x20
    ONEWIRE_AVAILABLE = True
except ImportError:
    ONEWIRE_AVAILABLE = False
    print("Warning: onewire/ds18x20 not available")

class TankSensor:
    """Read tank level from ADC"""

    def __init__(self, config):
        self.id = config["id"]
        self.name = config["name"]
        self.tank_type = config["type"]
        self.capacity = config["capacity"]
        self.min_voltage = config["min_voltage"]
        self.max_voltage = config["max_voltage"]

        # Automation 2040W ADC pins: A0=26, A1=27, A2=28
        adc_pins = [26, 27, 28]
        adc_channel = config["adc_channel"]
        if adc_channel < len(adc_pins):
            self.adc = ADC(Pin(adc_pins[adc_channel]))
        else:
            raise ValueError(f"Invalid ADC channel: {adc_channel}")

        # ADC reference voltage and resolution
        self.vref = 3.3
        self.resolution = 65535  # 16-bit ADC

    def read_voltage(self):
        """Read raw voltage from ADC"""
        raw = self.adc.read_u16()
        voltage = (raw / self.resolution) * self.vref
        return voltage, raw

    def read_level(self):
        """Read tank level as percentage (0-100)"""
        voltage, raw = self.read_voltage()

        # Map voltage to percentage
        voltage_range = self.max_voltage - self.min_voltage
        if voltage_range <= 0:
            return 0, raw

        level = ((voltage - self.min_voltage) / voltage_range) * 100
        level = max(0, min(100, level))  # Clamp to 0-100

        return level, raw

    def get_data(self):
        """Get tank data as dictionary for MQTT"""
        level, raw = self.read_level()
        return {
            "name": self.name,
            "type": self.tank_type,
            "capacity": self.capacity,
            "level": round(level, 1),
            "raw": raw,
        }


class TemperatureSensors:
    """Read temperature from DS18B20 sensors on 1-Wire bus"""

    def __init__(self, pin, sensor_configs):
        self.sensors = {}
        self.sensor_configs = {s["id"]: s for s in sensor_configs}

        if not ONEWIRE_AVAILABLE:
            print("Warning: 1-Wire not available, temperature sensing disabled")
            return

        try:
            self.ow = onewire.OneWire(Pin(pin))
            self.ds = ds18x20.DS18X20(self.ow)
            self.scan_sensors()
        except Exception as e:
            print(f"Error initializing 1-Wire: {e}")
            self.ds = None

    def scan_sensors(self):
        """Scan for DS18B20 sensors on the bus"""
        if not self.ds:
            return

        try:
            roms = self.ds.scan()
            print(f"Found {len(roms)} temperature sensors")

            # Map ROMs to sensor IDs
            # In a real setup, you'd store the ROM-to-ID mapping
            # For now, we'll assign them in order
            config_ids = list(self.sensor_configs.keys())
            for i, rom in enumerate(roms):
                if i < len(config_ids):
                    self.sensors[config_ids[i]] = rom
                    print(f"  {config_ids[i]}: {rom.hex()}")
        except Exception as e:
            print(f"Error scanning sensors: {e}")

    def read_all(self):
        """Read all temperature sensors"""
        if not self.ds or not self.sensors:
            return {}

        try:
            # Start conversion
            self.ds.convert_temp()
            time.sleep_ms(750)  # Wait for conversion

            results = {}
            for sensor_id, rom in self.sensors.items():
                try:
                    temp = self.ds.read_temp(rom)
                    config = self.sensor_configs.get(sensor_id, {})
                    results[sensor_id] = {
                        "name": config.get("name", sensor_id),
                        "location": config.get("location", "unknown"),
                        "value": round(temp, 1),
                        "minAlarm": config.get("min_alarm"),
                        "maxAlarm": config.get("max_alarm"),
                    }
                except Exception as e:
                    print(f"Error reading {sensor_id}: {e}")

            return results
        except Exception as e:
            print(f"Error reading temperatures: {e}")
            return {}


class DigitalInputs:
    """Read digital input states"""

    def __init__(self, input_configs):
        self.inputs = {}

        for config in input_configs:
            input_id = config["id"]
            pin_num = config["pin"]

            # Automation 2040W digital inputs
            # Adjust pin mapping based on your board
            try:
                pin = Pin(pin_num, Pin.IN, Pin.PULL_UP)
                self.inputs[input_id] = {
                    "pin": pin,
                    "name": config["name"],
                    "inverted": config.get("inverted", False),
                    "last_state": None,
                }
            except Exception as e:
                print(f"Error setting up digital input {input_id}: {e}")

    def read_all(self):
        """Read all digital inputs"""
        results = {}

        for input_id, input_data in self.inputs.items():
            try:
                raw_state = input_data["pin"].value()
                state = not raw_state if input_data["inverted"] else raw_state

                results[input_id] = {
                    "name": input_data["name"],
                    "state": bool(state),
                    "inverted": input_data["inverted"],
                }

                input_data["last_state"] = state
            except Exception as e:
                print(f"Error reading {input_id}: {e}")

        return results
