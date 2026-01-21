import { useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '../../store';
import { updateRelayConfig } from '../../store/slices/relaysSlice';
import { Theme } from '../../styles/theme';
import type { RelayConfig, RelayState } from '@ampmatter/shared';

interface RelaySwitchProps {
  config: RelayConfig;
  state: RelayState;
  onToggle: (id: string) => void;
  theme: Theme;
  isLoading?: boolean;
}

// Maximum movement allowed for a gesture to count as a "click" (in pixels)
const CLICK_MOVEMENT_THRESHOLD = 10;

export function RelaySwitch({ config, state, onToggle, theme, isLoading = false }: RelaySwitchProps) {
  const dispatch = useAppDispatch();
  const isOn = state.state;
  const lastChanged = state.lastChanged ? new Date(state.lastChanged) : null;

  // Track pointer position to distinguish clicks from swipes
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(config.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Stop propagation to prevent swipe container from capturing
    e.stopPropagation();
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();

    if (isLoading || !pointerStartRef.current) {
      pointerStartRef.current = null;
      return;
    }

    // Calculate movement distance
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only trigger toggle if movement was minimal (a real click, not a swipe)
    if (distance < CLICK_MOVEMENT_THRESHOLD) {
      onToggle(config.id);
    }

    pointerStartRef.current = null;
  }, [isLoading, onToggle, config.id]);

  const handlePointerCancel = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(config.name);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [config.name]);

  const handleSaveName = useCallback(() => {
    if (editName.trim() && editName !== config.name) {
      dispatch(updateRelayConfig({
        id: config.id,
        config: { name: editName.trim() },
      }));
    }
    setIsEditing(false);
  }, [editName, config.id, config.name, dispatch]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName(config.name);
  }, [config.name]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveName, handleCancelEdit]);

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs,
        minHeight: '90px',
        height: '100%',
        cursor: isLoading ? 'wait' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        touchAction: 'none', // Prevent browser touch actions, we handle it ourselves
        userSelect: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
    >
      {/* Header: Name and Status Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.xs,
        }}
      >
        {isEditing ? (
          // Editing mode
          <div style={{ display: 'flex', gap: theme.spacing.xs, flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveName}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              maxLength={20}
              style={{
                flex: 1,
                padding: theme.spacing.xs,
                fontSize: theme.typography.sizes.sm,
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: theme.borderRadius.sm,
                outline: 'none',
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveName();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                padding: `${theme.spacing.xs}`,
                backgroundColor: theme.colors.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.sizes.xs,
                cursor: 'pointer',
                minWidth: '40px',
              }}
            >
              ✓
            </button>
          </div>
        ) : (
          // Display mode
          <>
            <div
              style={{
                fontSize: theme.typography.sizes.base,
                fontWeight: theme.typography.weights.medium,
                color: theme.colors.text,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
              }}
            >
              <span>{config.name}</span>
              <button
                onClick={handleEditClick}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: theme.typography.sizes.xs,
                  padding: theme.spacing.xs,
                  opacity: 0.6,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              >
                ✏️
              </button>
            </div>
            <div
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: isOn ? theme.colors.success : theme.colors.textSecondary,
                color: '#ffffff',
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.bold,
              }}
            >
              {isOn ? 'ON' : 'OFF'}
            </div>
          </>
        )}
      </div>

      {/* Toggle Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <div
          style={{
            width: '60px',
            height: '32px',
            borderRadius: '16px',
            backgroundColor: isOn ? theme.colors.primary : theme.colors.border,
            position: 'relative',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: isOn ? '30px' : '2px',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {/* Last Changed */}
      {lastChanged && (
        <div
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textSecondary,
            textAlign: 'center',
          }}
        >
          {formatTimeSince(lastChanged)}
        </div>
      )}
    </div>
  );
}

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
