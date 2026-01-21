import { type CSSProperties, useMemo } from 'react';
import type { Theme } from '../../styles/theme';
import type { DataPoint } from '../../store/slices/historySlice';

interface MiniChartProps {
  theme: Theme;
  data: DataPoint[];
  label: string;
  unit: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  minValue?: number;
  maxValue?: number;
}

/**
 * A lightweight SVG-based line chart for displaying time-series data.
 */
export function MiniChart({
  theme,
  data,
  label,
  unit,
  color,
  height = 80,
  showGrid = true,
  showLabels = true,
  minValue,
  maxValue,
}: MiniChartProps) {
  const chartColor = color || theme.colors.primary;

  // Calculate chart dimensions and data bounds
  const chartData = useMemo(() => {
    if (data.length < 2) {
      return { path: '', points: [], yMin: 0, yMax: 100, currentValue: null };
    }

    const values = data.map((d) => d.value);
    let yMin = minValue ?? Math.min(...values);
    let yMax = maxValue ?? Math.max(...values);

    // Add some padding to the range
    const padding = (yMax - yMin) * 0.1 || 1;
    if (minValue === undefined) yMin -= padding;
    if (maxValue === undefined) yMax += padding;

    // Ensure we have a valid range
    if (yMax === yMin) {
      yMax = yMin + 1;
    }

    const width = 100; // Percentage width
    const chartHeight = height - (showLabels ? 24 : 0);

    // Map data points to SVG coordinates
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = chartHeight - ((point.value - yMin) / (yMax - yMin)) * chartHeight;
      return { x, y, value: point.value, timestamp: point.timestamp };
    });

    // Create SVG path
    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const currentValue = data[data.length - 1]?.value ?? null;

    return { path, points, yMin, yMax, currentValue };
  }, [data, height, showLabels, minValue, maxValue]);

  const containerStyle: CSSProperties = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    border: `1px solid ${theme.colors.border}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '4px',
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  };

  const valueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
  };

  const svgHeight = height - (showLabels ? 24 : 0);

  if (data.length < 2) {
    return (
      <div style={containerStyle}>
        {showLabels && (
          <div style={headerStyle}>
            <span style={labelStyle}>{label}</span>
            <span style={{ ...valueStyle, color: theme.colors.textMuted }}>No data</span>
          </div>
        )}
        <div
          style={{
            height: `${svgHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.textMuted,
            fontSize: theme.typography.sizes.xs,
          }}
        >
          Collecting data...
        </div>
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1000) return val.toFixed(0);
    if (Math.abs(val) >= 100) return val.toFixed(1);
    return val.toFixed(2);
  };

  return (
    <div style={containerStyle}>
      {showLabels && (
        <div style={headerStyle}>
          <span style={labelStyle}>{label}</span>
          <span style={valueStyle}>
            {chartData.currentValue !== null ? formatValue(chartData.currentValue) : '-'}
            <span style={{ fontSize: theme.typography.sizes.xs, fontWeight: 'normal' }}>
              {unit}
            </span>
          </span>
        </div>
      )}
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 100 ${svgHeight}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* Grid lines */}
        {showGrid && (
          <>
            <line
              x1="0"
              y1={svgHeight / 2}
              x2="100"
              y2={svgHeight / 2}
              stroke={theme.colors.border}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1={svgHeight * 0.25}
              x2="100"
              y2={svgHeight * 0.25}
              stroke={theme.colors.border}
              strokeWidth="0.3"
              strokeDasharray="1,2"
            />
            <line
              x1="0"
              y1={svgHeight * 0.75}
              x2="100"
              y2={svgHeight * 0.75}
              stroke={theme.colors.border}
              strokeWidth="0.3"
              strokeDasharray="1,2"
            />
          </>
        )}

        {/* Area fill */}
        <path
          d={`${chartData.path} L 100 ${svgHeight} L 0 ${svgHeight} Z`}
          fill={chartColor}
          fillOpacity="0.1"
        />

        {/* Line */}
        <path
          d={chartData.path}
          fill="none"
          stroke={chartColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Current value dot */}
        {chartData.points.length > 0 && (
          <circle
            cx={chartData.points[chartData.points.length - 1].x}
            cy={chartData.points[chartData.points.length - 1].y}
            r="3"
            fill={chartColor}
          />
        )}
      </svg>
    </div>
  );
}

/**
 * Grid of multiple mini charts
 */
interface ChartGridProps {
  theme: Theme;
  charts: Array<{
    data: DataPoint[];
    label: string;
    unit: string;
    color?: string;
    minValue?: number;
    maxValue?: number;
  }>;
}

export function ChartGrid({ theme, charts }: ChartGridProps) {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: theme.spacing.sm,
  };

  return (
    <div style={gridStyle}>
      {charts.map((chart, index) => (
        <MiniChart
          key={index}
          theme={theme}
          data={chart.data}
          label={chart.label}
          unit={chart.unit}
          color={chart.color}
          minValue={chart.minValue}
          maxValue={chart.maxValue}
        />
      ))}
    </div>
  );
}
