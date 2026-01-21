import { useState, type CSSProperties } from 'react';
import { useAppDispatch } from '../../store';
import { addSensor, updateSensor } from '../../store/slices/sensorConfigSlice';
import type { Theme } from '../../styles/theme';
import type {
  SensorDefinition,
  SensorType,
  SensorInterface,
  GPIOConfig,
  I2CConfig,
  Automation2040WConfig,
  MQTTConfig,
  SensorCalibration,
} from '@ampmatter/shared';

interface SensorEditorProps {
  theme: Theme;
  sensor?: SensorDefinition;
  onClose: () => void;
}

const SENSOR_TYPES: { value: SensorType; label: string; icon: string }[] = [
  { value: 'tank', label: 'Tank Level', icon: '🪣' },
  { value: 'temperature', label: 'Temperature', icon: '🌡️' },
  { value: 'digital_input', label: 'Digital Input', icon: '🔘' },
  { value: 'analog_input', label: 'Analog Input', icon: '📊' },
  { value: 'pressure', label: 'Pressure', icon: '💨' },
  { value: 'humidity', label: 'Humidity', icon: '💧' },
  { value: 'bilge_pump', label: 'Bilge Pump', icon: '⚓' },
  { value: 'voltage', label: 'Voltage', icon: '⚡' },
  { value: 'current', label: 'Current', icon: '🔌' },
];

const INTERFACES: { value: SensorInterface; label: string }[] = [
  { value: 'gpio', label: 'GPIO Pin' },
  { value: 'i2c', label: 'I2C Bus' },
  { value: 'automation2040w', label: 'Automation 2040W' },
  { value: 'mqtt', label: 'MQTT Topic' },
  { value: 'signalk', label: 'Signal K' },
];

export function SensorEditor({ theme, sensor, onClose }: SensorEditorProps) {
  const dispatch = useAppDispatch();
  const isEditing = !!sensor;

  // Basic fields
  const [name, setName] = useState(sensor?.name || '');
  const [type, setType] = useState<SensorType>(sensor?.type || 'analog_input');
  const [interface_, setInterface] = useState<SensorInterface>(sensor?.interface || 'gpio');
  const [location, setLocation] = useState(sensor?.location || '');
  const [notes, setNotes] = useState(sensor?.notes || '');
  const [displayUnit, setDisplayUnit] = useState(sensor?.displayUnit || '');
  const [decimals, setDecimals] = useState(sensor?.decimals?.toString() || '2');
  const [updateInterval, setUpdateInterval] = useState(sensor?.updateInterval?.toString() || '1000');
  const [smoothing, setSmoothing] = useState(sensor?.smoothing?.toString() || '1');
  const [minAlarm, setMinAlarm] = useState(sensor?.minAlarm?.toString() || '');
  const [maxAlarm, setMaxAlarm] = useState(sensor?.maxAlarm?.toString() || '');

  // GPIO config
  const [gpioPin, setGpioPin] = useState(sensor?.gpioConfig?.pin.toString() || '');
  const [gpioMode, setGpioMode] = useState<'input' | 'output' | 'pwm'>(sensor?.gpioConfig?.mode || 'input');
  const [gpioPullup, setGpioPullup] = useState(sensor?.gpioConfig?.pullup || false);
  const [gpioPulldown, setGpioPulldown] = useState(sensor?.gpioConfig?.pulldown || false);
  const [gpioInverted, setGpioInverted] = useState(sensor?.gpioConfig?.inverted || false);

  // I2C config
  const [i2cAddress, setI2cAddress] = useState(sensor?.i2cConfig?.address.toString(16) || '');
  const [i2cBus, setI2cBus] = useState(sensor?.i2cConfig?.bus.toString() || '1');
  const [i2cDeviceType, setI2cDeviceType] = useState(sensor?.i2cConfig?.deviceType || '');
  const [i2cRegister, setI2cRegister] = useState(sensor?.i2cConfig?.register?.toString(16) || '');

  // Automation 2040W config
  const [a2040wDeviceId, setA2040wDeviceId] = useState(sensor?.automation2040wConfig?.deviceId || '');
  const [a2040wChannel, setA2040wChannel] = useState(sensor?.automation2040wConfig?.channel.toString() || '0');
  const [a2040wConnectionType, setA2040wConnectionType] = useState<'wifi' | 'bluetooth'>(
    sensor?.automation2040wConfig?.connectionType || 'wifi'
  );

  // MQTT config
  const [mqttTopic, setMqttTopic] = useState(sensor?.mqttConfig?.topic || '');
  const [mqttQos, setMqttQos] = useState<0 | 1 | 2>(sensor?.mqttConfig?.qos || 0);

  // Calibration
  const [enableCalibration, setEnableCalibration] = useState(!!sensor?.calibration);
  const [calRawMin, setCalRawMin] = useState(sensor?.calibration?.rawMin.toString() || '0');
  const [calRawMax, setCalRawMax] = useState(sensor?.calibration?.rawMax.toString() || '1023');
  const [calScaledMin, setCalScaledMin] = useState(sensor?.calibration?.scaledMin.toString() || '0');
  const [calScaledMax, setCalScaledMax] = useState(sensor?.calibration?.scaledMax.toString() || '100');
  const [calUnit, setCalUnit] = useState(sensor?.calibration?.unit || '%');

  const modalStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2000,
    overflowY: 'auto',
    padding: theme.spacing.md,
  };

  const contentStyle: CSSProperties = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    maxWidth: '600px',
    width: '100%',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  };

  const sectionStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border}`,
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.base,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    outline: 'none',
    marginBottom: theme.spacing.md,
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'secondary'): CSSProperties => ({
    minHeight: theme.touchTarget.min,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor:
      variant === 'primary' ? theme.colors.primary :
      variant === 'danger' ? theme.colors.danger :
      theme.colors.surface,
    color: variant !== 'secondary' ? '#FFFFFF' : theme.colors.text,
    border: variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  });

  const checkboxContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  };

  const handleSave = () => {
    const newSensor: SensorDefinition = {
      id: sensor?.id || `sensor_${Date.now()}`,
      name,
      type,
      interface: interface_,
      enabled: sensor?.enabled ?? true,
      location: location || undefined,
      notes: notes || undefined,
      displayUnit: displayUnit || undefined,
      decimals: decimals ? parseInt(decimals, 10) : undefined,
      updateInterval: updateInterval ? parseInt(updateInterval, 10) : undefined,
      smoothing: smoothing ? parseInt(smoothing, 10) : undefined,
      minAlarm: minAlarm ? parseFloat(minAlarm) : undefined,
      maxAlarm: maxAlarm ? parseFloat(maxAlarm) : undefined,
      created: sensor?.created || Date.now(),
      lastModified: Date.now(),
    };

    // Add interface-specific config
    if (interface_ === 'gpio' && gpioPin) {
      const config: GPIOConfig = {
        pin: parseInt(gpioPin, 10),
        mode: gpioMode,
        pullup: gpioPullup,
        pulldown: gpioPulldown,
        inverted: gpioInverted,
      };
      newSensor.gpioConfig = config;
    } else if (interface_ === 'i2c' && i2cAddress) {
      const config: I2CConfig = {
        address: parseInt(i2cAddress, 16),
        bus: parseInt(i2cBus, 10),
        deviceType: i2cDeviceType,
        register: i2cRegister ? parseInt(i2cRegister, 16) : undefined,
      };
      newSensor.i2cConfig = config;
    } else if (interface_ === 'automation2040w' && a2040wDeviceId) {
      const config: Automation2040WConfig = {
        deviceId: a2040wDeviceId,
        channel: parseInt(a2040wChannel, 10),
        connectionType: a2040wConnectionType,
      };
      newSensor.automation2040wConfig = config;
    } else if (interface_ === 'mqtt' && mqttTopic) {
      const config: MQTTConfig = {
        topic: mqttTopic,
        qos: mqttQos,
      };
      newSensor.mqttConfig = config;
    }

    // Add calibration if enabled
    if (enableCalibration && calRawMin && calRawMax && calScaledMin && calScaledMax) {
      const calibration: SensorCalibration = {
        rawMin: parseFloat(calRawMin),
        rawMax: parseFloat(calRawMax),
        scaledMin: parseFloat(calScaledMin),
        scaledMax: parseFloat(calScaledMax),
        unit: calUnit,
      };
      newSensor.calibration = calibration;
    }

    if (isEditing) {
      dispatch(updateSensor({ id: newSensor.id, updates: newSensor }));
    } else {
      dispatch(addSensor(newSensor));
    }

    onClose();
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{
          fontSize: theme.typography.sizes.xl,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text,
          marginBottom: theme.spacing.xl,
        }}>
          {isEditing ? 'Edit Sensor' : 'Add New Sensor'}
        </div>

        {/* Basic Information */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Basic Information</div>

          <label style={labelStyle}>Sensor Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fresh Water Tank"
            style={inputStyle}
          />

          <label style={labelStyle}>Sensor Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SensorType)}
            style={inputStyle}
          >
            {SENSOR_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Interface *</label>
          <select
            value={interface_}
            onChange={(e) => setInterface(e.target.value as SensorInterface)}
            style={inputStyle}
          >
            {INTERFACES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Engine Room, Starboard Side"
            style={inputStyle}
          />

          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional information about this sensor"
            style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }}
          />
        </div>

        {/* Interface Configuration */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Interface Configuration</div>

          {interface_ === 'gpio' && (
            <>
              <label style={labelStyle}>GPIO Pin Number *</label>
              <input
                type="number"
                value={gpioPin}
                onChange={(e) => setGpioPin(e.target.value)}
                placeholder="e.g., 17, 27, 22"
                style={inputStyle}
              />

              <label style={labelStyle}>Mode</label>
              <select
                value={gpioMode}
                onChange={(e) => setGpioMode(e.target.value as 'input' | 'output' | 'pwm')}
                style={inputStyle}
              >
                <option value="input">Input</option>
                <option value="output">Output</option>
                <option value="pwm">PWM</option>
              </select>

              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  checked={gpioPullup}
                  onChange={(e) => setGpioPullup(e.target.checked)}
                  id="pullup"
                />
                <label htmlFor="pullup" style={{ ...labelStyle, marginBottom: 0 }}>
                  Enable Pull-up Resistor
                </label>
              </div>

              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  checked={gpioPulldown}
                  onChange={(e) => setGpioPulldown(e.target.checked)}
                  id="pulldown"
                />
                <label htmlFor="pulldown" style={{ ...labelStyle, marginBottom: 0 }}>
                  Enable Pull-down Resistor
                </label>
              </div>

              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  checked={gpioInverted}
                  onChange={(e) => setGpioInverted(e.target.checked)}
                  id="inverted"
                />
                <label htmlFor="inverted" style={{ ...labelStyle, marginBottom: 0 }}>
                  Invert Logic (Active Low)
                </label>
              </div>
            </>
          )}

          {interface_ === 'i2c' && (
            <>
              <label style={labelStyle}>I2C Address (hex) *</label>
              <input
                type="text"
                value={i2cAddress}
                onChange={(e) => setI2cAddress(e.target.value)}
                placeholder="e.g., 48, 76, 20"
                style={inputStyle}
              />

              <label style={labelStyle}>I2C Bus Number</label>
              <input
                type="number"
                value={i2cBus}
                onChange={(e) => setI2cBus(e.target.value)}
                placeholder="Usually 1"
                style={inputStyle}
              />

              <label style={labelStyle}>Device Type</label>
              <input
                type="text"
                value={i2cDeviceType}
                onChange={(e) => setI2cDeviceType(e.target.value)}
                placeholder="e.g., ADS1115, BME280, MCP23017"
                style={inputStyle}
              />

              <label style={labelStyle}>Register (hex, optional)</label>
              <input
                type="text"
                value={i2cRegister}
                onChange={(e) => setI2cRegister(e.target.value)}
                placeholder="e.g., 00, F7"
                style={inputStyle}
              />
            </>
          )}

          {interface_ === 'automation2040w' && (
            <>
              <label style={labelStyle}>Device ID *</label>
              <input
                type="text"
                value={a2040wDeviceId}
                onChange={(e) => setA2040wDeviceId(e.target.value)}
                placeholder="e.g., a2040w-001"
                style={inputStyle}
              />

              <label style={labelStyle}>Channel Number *</label>
              <input
                type="number"
                value={a2040wChannel}
                onChange={(e) => setA2040wChannel(e.target.value)}
                placeholder="0-3 for analog, 0-3 for digital"
                style={inputStyle}
              />

              <label style={labelStyle}>Connection Type</label>
              <select
                value={a2040wConnectionType}
                onChange={(e) => setA2040wConnectionType(e.target.value as 'wifi' | 'bluetooth')}
                style={inputStyle}
              >
                <option value="wifi">WiFi</option>
                <option value="bluetooth">Bluetooth</option>
              </select>
            </>
          )}

          {interface_ === 'mqtt' && (
            <>
              <label style={labelStyle}>MQTT Topic *</label>
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                placeholder="e.g., boat/sensors/temperature/engine"
                style={inputStyle}
              />

              <label style={labelStyle}>QoS Level</label>
              <select
                value={mqttQos}
                onChange={(e) => setMqttQos(parseInt(e.target.value, 10) as 0 | 1 | 2)}
                style={inputStyle}
              >
                <option value={0}>0 - At most once</option>
                <option value={1}>1 - At least once</option>
                <option value={2}>2 - Exactly once</option>
              </select>
            </>
          )}

          {interface_ === 'signalk' && (
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.textSecondary,
            }}>
              Signal K sensors are automatically discovered from the Signal K server.
              Configure the sensor path in the Signal K server settings.
            </div>
          )}
        </div>

        {/* Data Processing */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Data Processing</div>

          <label style={labelStyle}>Display Unit</label>
          <input
            type="text"
            value={displayUnit}
            onChange={(e) => setDisplayUnit(e.target.value)}
            placeholder="e.g., °C, V, A, L, %"
            style={inputStyle}
          />

          <label style={labelStyle}>Decimal Places</label>
          <input
            type="number"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            placeholder="2"
            style={inputStyle}
          />

          <label style={labelStyle}>Update Interval (ms)</label>
          <input
            type="number"
            value={updateInterval}
            onChange={(e) => setUpdateInterval(e.target.value)}
            placeholder="1000"
            style={inputStyle}
          />

          <label style={labelStyle}>Smoothing (samples to average)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={smoothing}
            onChange={(e) => setSmoothing(e.target.value)}
            placeholder="1"
            style={inputStyle}
          />
        </div>

        {/* Calibration */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Calibration</div>

          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={enableCalibration}
              onChange={(e) => setEnableCalibration(e.target.checked)}
              id="enableCal"
            />
            <label htmlFor="enableCal" style={{ ...labelStyle, marginBottom: 0 }}>
              Enable Calibration
            </label>
          </div>

          {enableCalibration && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing.md,
                marginBottom: theme.spacing.md,
              }}>
                <div>
                  <label style={labelStyle}>Raw Min</label>
                  <input
                    type="number"
                    value={calRawMin}
                    onChange={(e) => setCalRawMin(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Raw Max</label>
                  <input
                    type="number"
                    value={calRawMax}
                    onChange={(e) => setCalRawMax(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing.md,
                marginBottom: theme.spacing.md,
              }}>
                <div>
                  <label style={labelStyle}>Scaled Min</label>
                  <input
                    type="number"
                    value={calScaledMin}
                    onChange={(e) => setCalScaledMin(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Scaled Max</label>
                  <input
                    type="number"
                    value={calScaledMax}
                    onChange={(e) => setCalScaledMax(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <label style={labelStyle}>Calibration Unit</label>
              <input
                type="text"
                value={calUnit}
                onChange={(e) => setCalUnit(e.target.value)}
                placeholder="e.g., L, %, psi"
                style={inputStyle}
              />

              <div style={{
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.textSecondary,
              }}>
                Maps raw sensor values ({calRawMin}–{calRawMax}) to scaled values ({calScaledMin}–{calScaledMax} {calUnit})
              </div>
            </>
          )}
        </div>

        {/* Alarms */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Alarms</div>

          <label style={labelStyle}>Minimum Alarm Threshold</label>
          <input
            type="number"
            value={minAlarm}
            onChange={(e) => setMinAlarm(e.target.value)}
            placeholder="Optional"
            style={inputStyle}
          />

          <label style={labelStyle}>Maximum Alarm Threshold</label>
          <input
            type="number"
            value={maxAlarm}
            onChange={(e) => setMaxAlarm(e.target.value)}
            placeholder="Optional"
            style={inputStyle}
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          marginTop: theme.spacing.xl,
        }}>
          <button
            onClick={handleSave}
            disabled={!name || !type || !interface_}
            style={{
              ...buttonStyle('primary'),
              flex: 1,
              opacity: (!name || !type || !interface_) ? 0.5 : 1,
            }}
          >
            {isEditing ? 'Save Changes' : 'Add Sensor'}
          </button>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle('secondary'),
              flex: 1,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
