import { CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';

interface TextGaugeProps {
  value: string;
  label: string;
  color?: string;
  theme: Theme;
}

/**
 * Simple text-based gauge display (no circles)
 * Larger, easier-to-read text for the footer status bar
 */
export function TextGauge({ value, label, color, theme }: TextGaugeProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: '65px',
  };

  const valueStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: color || theme.colors.text,
    lineHeight: '1.2',
  };

  const labelStyle: CSSProperties = {
    fontSize: '10px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: '1.2',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={containerStyle}>
      <div style={valueStyle}>{value}</div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
}
