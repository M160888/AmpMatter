import { Component, type ReactNode, type ErrorInfo, type CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  theme?: Theme;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  viewName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { theme, viewName } = this.props;

      const containerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme?.spacing.lg || '24px',
        textAlign: 'center',
        backgroundColor: theme?.colors.surface || '#1a1a2e',
        color: theme?.colors.text || '#ffffff',
      };

      const titleStyle: CSSProperties = {
        fontSize: theme?.typography.sizes.lg || '18px',
        fontWeight: theme?.typography.weights.bold || 700,
        marginBottom: theme?.spacing.md || '16px',
        color: theme?.colors.warning || '#f0a500',
      };

      const messageStyle: CSSProperties = {
        fontSize: theme?.typography.sizes.sm || '14px',
        color: theme?.colors.textSecondary || '#a0a0a0',
        marginBottom: theme?.spacing.lg || '24px',
        maxWidth: '300px',
      };

      const buttonStyle: CSSProperties = {
        padding: `${theme?.spacing.sm || '8px'} ${theme?.spacing.lg || '24px'}`,
        fontSize: theme?.typography.sizes.base || '16px',
        fontWeight: theme?.typography.weights.medium || 500,
        backgroundColor: theme?.colors.primary || '#4a90d9',
        color: '#ffffff',
        border: 'none',
        borderRadius: theme?.borderRadius.md || '8px',
        cursor: 'pointer',
      };

      return (
        <div style={containerStyle}>
          <div style={titleStyle}>
            {viewName ? `${viewName} Error` : 'Something went wrong'}
          </div>
          <div style={messageStyle}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button style={buttonStyle} onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping views
interface ViewErrorBoundaryProps {
  children: ReactNode;
  theme: Theme;
  viewName: string;
}

export function ViewErrorBoundary({ children, theme, viewName }: ViewErrorBoundaryProps) {
  return (
    <ErrorBoundary
      theme={theme}
      viewName={viewName}
      onError={(error) => {
        console.error(`Error in ${viewName}:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
