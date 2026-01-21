import { useState, type CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';
import { verifyAuthKey } from '../../contexts/KioskContext';

interface KioskAuthDialogProps {
  theme: Theme;
  onClose: () => void;
  onSuccess: () => void;
}

export function KioskAuthDialog({ theme, onClose, onSuccess }: KioskAuthDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (verifyAuthKey(password)) {
      // Store in sessionStorage so it persists until browser closes
      sessionStorage.setItem('ampmatter_debug_mode', 'true');
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const dialogStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    minWidth: '300px',
    maxWidth: '90vw',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };

  const titleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    border: `2px solid ${error ? theme.colors.danger : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    boxSizing: 'border-box',
    outline: 'none',
  };

  const errorStyle: CSSProperties = {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.sm,
    minHeight: '20px',
  };

  const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  };

  const buttonStyle = (primary: boolean): CSSProperties => ({
    flex: 1,
    minHeight: theme.touchTarget.min,
    padding: theme.spacing.md,
    backgroundColor: primary ? theme.colors.primary : theme.colors.surface,
    color: primary ? '#FFFFFF' : theme.colors.text,
    border: `2px solid ${primary ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: theme.transitions.fast,
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>Debug Mode</div>
        <div style={subtitleStyle}>Enter password to exit kiosk mode</div>
        <input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Password"
          autoFocus
        />
        <div style={errorStyle}>
          {error && 'Incorrect password'}
        </div>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle(false)} onClick={onClose}>
            Cancel
          </button>
          <button style={buttonStyle(true)} onClick={handleSubmit}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
