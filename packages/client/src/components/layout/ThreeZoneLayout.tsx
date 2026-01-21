import type { ReactNode, CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';

interface ThreeZoneLayoutProps {
  theme: Theme;
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
  leftWidth?: number;   // percentage, default 25
  rightWidth?: number;  // percentage, default 25
}

export function ThreeZoneLayout({
  theme,
  leftPanel,
  centerPanel,
  rightPanel,
  leftWidth = 25,
  rightWidth = 25,
}: ThreeZoneLayoutProps) {
  const centerWidth = 100 - leftWidth - rightWidth;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    gap: '2px',
    padding: '2px',
    backgroundColor: theme.colors.border,
  };

  const panelBaseStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const leftStyle: CSSProperties = {
    ...panelBaseStyle,
    width: `${leftWidth}%`,
    minWidth: '200px',
  };

  const centerStyle: CSSProperties = {
    ...panelBaseStyle,
    width: `${centerWidth}%`,
    flex: 1, // Allow center to grow
  };

  const rightStyle: CSSProperties = {
    ...panelBaseStyle,
    width: `${rightWidth}%`,
    minWidth: '200px',
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>{leftPanel}</div>
      <div style={centerStyle}>{centerPanel}</div>
      <div style={rightStyle}>{rightPanel}</div>
    </div>
  );
}
