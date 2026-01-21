# AmpMatter Automation 2040W Configuration
# Edit these values for your setup

# WiFi Configuration
WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

# MQTT Configuration
MQTT_BROKER = "192.168.1.100"  # IP of your Raspberry Pi
MQTT_PORT = 1883
MQTT_CLIENT_ID = "automation2040w"
MQTT_TOPIC_PREFIX = "boat"

# Sensor Configuration
# Tank sensors connected to ADC inputs
TANKS = [
    {
        "id": "fresh_water",
        "name": "Fresh Water",
        "type": "freshWater",
        "adc_channel": 0,
        "capacity": 200,  # Liters
        "min_voltage": 0.5,  # Voltage at empty
        "max_voltage": 3.0,  # Voltage at full
    },
    {
        "id": "fuel",
        "name": "Diesel",
        "type": "fuel",
        "adc_channel": 1,
        "capacity": 150,
        "min_voltage": 0.5,
        "max_voltage": 3.0,
    },
    {
        "id": "waste",
        "name": "Waste Water",
        "type": "wasteWater",
        "adc_channel": 2,
        "capacity": 80,
        "min_voltage": 0.5,
        "max_voltage": 3.0,
    },
]

# Temperature sensors (DS18B20 on 1-Wire bus)
# Pin for 1-Wire bus
ONEWIRE_PIN = 26

TEMPERATURE_SENSORS = [
    {"id": "engine", "name": "Engine", "location": "engine", "max_alarm": 95},
    {"id": "cabin", "name": "Cabin", "location": "cabin"},
    {"id": "fridge", "name": "Fridge", "location": "fridge", "max_alarm": 8},
]

# Digital inputs
DIGITAL_INPUTS = [
    {"id": "bilge_pump", "name": "Bilge Pump", "pin": 0, "inverted": False},
    {"id": "nav_lights", "name": "Nav Lights", "pin": 1, "inverted": False},
    {"id": "anchor_light", "name": "Anchor Light", "pin": 2, "inverted": False},
]

# Update intervals (milliseconds)
TANK_UPDATE_INTERVAL = 5000      # 5 seconds
TEMP_UPDATE_INTERVAL = 10000     # 10 seconds
DIGITAL_UPDATE_INTERVAL = 1000   # 1 second
STATUS_UPDATE_INTERVAL = 30000   # 30 seconds (heartbeat)
