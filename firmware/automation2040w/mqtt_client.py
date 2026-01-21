# AmpMatter MQTT Client Module
# For Pimoroni Automation 2040W

import json
import time

try:
    from umqtt.simple import MQTTClient
    MQTT_AVAILABLE = True
except ImportError:
    try:
        from umqtt.robust import MQTTClient
        MQTT_AVAILABLE = True
    except ImportError:
        MQTT_AVAILABLE = False
        print("Warning: umqtt not available")


class BoatMQTTClient:
    """MQTT client for publishing sensor data"""

    def __init__(self, broker, port, client_id, topic_prefix):
        self.broker = broker
        self.port = port
        self.client_id = client_id
        self.topic_prefix = topic_prefix
        self.client = None
        self.connected = False

    def connect(self):
        """Connect to MQTT broker"""
        if not MQTT_AVAILABLE:
            print("MQTT not available")
            return False

        try:
            self.client = MQTTClient(
                self.client_id,
                self.broker,
                port=self.port,
                keepalive=60,
            )
            self.client.connect()
            self.connected = True
            print(f"Connected to MQTT broker at {self.broker}:{self.port}")
            return True
        except Exception as e:
            print(f"MQTT connection failed: {e}")
            self.connected = False
            return False

    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            try:
                self.client.disconnect()
            except:
                pass
            self.connected = False

    def reconnect(self):
        """Reconnect to MQTT broker"""
        self.disconnect()
        time.sleep(1)
        return self.connect()

    def _publish(self, topic, payload):
        """Internal publish with error handling"""
        if not self.connected:
            return False

        try:
            full_topic = f"{self.topic_prefix}/{topic}"
            message = json.dumps(payload) if isinstance(payload, dict) else str(payload)
            self.client.publish(full_topic, message)
            return True
        except Exception as e:
            print(f"Publish failed: {e}")
            self.connected = False
            return False

    def publish_tank(self, tank_id, data):
        """Publish tank level data"""
        return self._publish(f"tanks/{tank_id}", data)

    def publish_temperature(self, sensor_id, data):
        """Publish temperature data"""
        return self._publish(f"temp/{sensor_id}", data)

    def publish_digital(self, input_id, data):
        """Publish digital input state"""
        return self._publish(f"digital/{input_id}", data)

    def publish_status(self):
        """Publish heartbeat/status message"""
        status = {
            "connected": True,
            "uptime": time.ticks_ms() // 1000,
            "timestamp": time.time(),
        }
        return self._publish("status", status)
