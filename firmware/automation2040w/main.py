# AmpMatter Automation 2040W Main Firmware
# Reads sensors and publishes to MQTT

import time
import network

# Import configuration
from config import (
    WIFI_SSID, WIFI_PASSWORD,
    MQTT_BROKER, MQTT_PORT, MQTT_CLIENT_ID, MQTT_TOPIC_PREFIX,
    TANKS, TEMPERATURE_SENSORS, DIGITAL_INPUTS, ONEWIRE_PIN,
    TANK_UPDATE_INTERVAL, TEMP_UPDATE_INTERVAL,
    DIGITAL_UPDATE_INTERVAL, STATUS_UPDATE_INTERVAL,
)

# Import modules
from sensors import TankSensor, TemperatureSensors, DigitalInputs
from mqtt_client import BoatMQTTClient


def connect_wifi():
    """Connect to WiFi network"""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("Already connected to WiFi")
        return True

    print(f"Connecting to WiFi: {WIFI_SSID}")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    # Wait for connection with timeout
    max_wait = 20
    while max_wait > 0 and not wlan.isconnected():
        print(".", end="")
        time.sleep(1)
        max_wait -= 1

    if wlan.isconnected():
        print(f"\nConnected! IP: {wlan.ifconfig()[0]}")
        return True
    else:
        print("\nWiFi connection failed")
        return False


def main():
    """Main entry point"""
    print("\n=== AmpMatter Sensor Node ===")
    print("Automation 2040W Starting...\n")

    # Connect to WiFi
    if not connect_wifi():
        print("Cannot proceed without WiFi")
        # Retry loop
        while True:
            time.sleep(10)
            if connect_wifi():
                break

    # Initialize sensors
    print("\nInitializing sensors...")

    tank_sensors = []
    for tank_config in TANKS:
        try:
            sensor = TankSensor(tank_config)
            tank_sensors.append(sensor)
            print(f"  Tank sensor: {tank_config['name']}")
        except Exception as e:
            print(f"  Error initializing tank {tank_config['id']}: {e}")

    temp_sensors = TemperatureSensors(ONEWIRE_PIN, TEMPERATURE_SENSORS)

    digital_inputs = DigitalInputs(DIGITAL_INPUTS)

    # Initialize MQTT
    print("\nConnecting to MQTT broker...")
    mqtt = BoatMQTTClient(
        MQTT_BROKER,
        MQTT_PORT,
        MQTT_CLIENT_ID,
        MQTT_TOPIC_PREFIX,
    )

    if not mqtt.connect():
        print("MQTT connection failed, will retry...")

    # Timing variables
    last_tank_update = 0
    last_temp_update = 0
    last_digital_update = 0
    last_status_update = 0

    print("\n=== Starting main loop ===\n")

    while True:
        current_time = time.ticks_ms()

        # Reconnect MQTT if disconnected
        if not mqtt.connected:
            print("Reconnecting to MQTT...")
            mqtt.reconnect()
            time.sleep(5)
            continue

        # Update tank levels
        if time.ticks_diff(current_time, last_tank_update) >= TANK_UPDATE_INTERVAL:
            last_tank_update = current_time
            for sensor in tank_sensors:
                try:
                    data = sensor.get_data()
                    mqtt.publish_tank(sensor.id, data)
                except Exception as e:
                    print(f"Tank read error ({sensor.id}): {e}")

        # Update temperatures
        if time.ticks_diff(current_time, last_temp_update) >= TEMP_UPDATE_INTERVAL:
            last_temp_update = current_time
            try:
                temps = temp_sensors.read_all()
                for sensor_id, data in temps.items():
                    mqtt.publish_temperature(sensor_id, data)
            except Exception as e:
                print(f"Temperature read error: {e}")

        # Update digital inputs
        if time.ticks_diff(current_time, last_digital_update) >= DIGITAL_UPDATE_INTERVAL:
            last_digital_update = current_time
            try:
                digitals = digital_inputs.read_all()
                for input_id, data in digitals.items():
                    mqtt.publish_digital(input_id, data)
            except Exception as e:
                print(f"Digital input read error: {e}")

        # Publish status heartbeat
        if time.ticks_diff(current_time, last_status_update) >= STATUS_UPDATE_INTERVAL:
            last_status_update = current_time
            mqtt.publish_status()

        # Small delay to prevent busy loop
        time.sleep_ms(100)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped by user")
    except Exception as e:
        print(f"\nFatal error: {e}")
        # In production, you might want to reset the device
        # import machine
        # machine.reset()
