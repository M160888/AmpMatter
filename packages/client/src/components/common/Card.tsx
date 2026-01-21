import type { ReactNode, CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';

interface CardProps {
  theme: Theme;
  title?: string;
  children: ReactNode;
  padding?: boolean;
}

export function Card({ theme, title, children, padding = true }: CardProps) {
  const cardStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    overflow: 'hidden',
  };

  const headerStyle: CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const contentStyle: CSSProperties = {
    padding: padding ? theme.spacing.md : 0,
  };

  return (
    <div style={cardStyle}>
      {title && <div style={headerStyle}>{title}</div>}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
