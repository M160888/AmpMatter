import { type CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

interface ConnectionIndicatorProps {
  label: string;
  state: ConnectionState;
  nextRetryIn?: number; // milliseconds until next retry
  theme: Theme;
}

export function ConnectionIndicator({ label, state, nextRetryIn = 0, theme }: ConnectionIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  };

  const getIndicatorContent = () => {
    switch (state) {
      case 'connected':
        return (
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.success,
            }}
          />
        );

      case 'connecting':
        return (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="5"
              cy="5"
              r="4"
              fill="none"
              stroke={theme.colors.warning}
              strokeWidth="2"
              strokeDasharray="12.5 12.5"
            />
          </svg>
        );

      case 'reconnecting':
        return (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="5"
              cy="5"
              r="4"
              fill="none"
              stroke={theme.colors.warning}
              strokeWidth="2"
              strokeDasharray="12.5 12.5"
            />
          </svg>
        );

      case 'disconnected':
        return (
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.danger,
            }}
          />
        );

      case 'error':
        return (
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}
          >
            !
          </span>
        );

      default:
        return (
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.textSecondary,
              opacity: 0.5,
            }}
          />
        );
    }
  };

  const getStatusText = () => {
    if (state === 'connecting') return 'Connecting...';
    if (state === 'reconnecting' && nextRetryIn > 0) {
      const seconds = Math.ceil(nextRetryIn / 1000);
      return `Retry in ${seconds}s`;
    }
    if (state === 'disconnected' && nextRetryIn > 0) {
      const seconds = Math.ceil(nextRetryIn / 1000);
      return `Retry in ${seconds}s`;
    }
    return label;
  };

  return (
    <div style={containerStyle}>
      {getIndicatorContent()}
      <span>{getStatusText()}</span>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
