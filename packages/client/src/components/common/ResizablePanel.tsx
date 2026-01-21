import { useRef, useState, useCallback, useEffect, CSSProperties, ReactNode } from 'react';
import type { Theme } from '../../styles/theme';

interface ResizablePanelProps {
  children: ReactNode;
  initialHeight: number;
  minHeight?: number;
  maxHeight?: number;
  onHeightChange?: (height: number) => void;
  theme: Theme;
}

/**
 * Resizable panel with drag handle
 * User can drag the top border to resize the panel height
 */
export function ResizablePanel({
  children,
  initialHeight,
  minHeight = 100,
  maxHeight = 400,
  onHeightChange,
  theme,
}: ResizablePanelProps) {
  const [height, setHeight] = useState(initialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(0);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = height;

    // Capture pointer to continue receiving events even if cursor leaves element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [height]);

  const handleDragMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;

    // Calculate new height (dragging up decreases Y, which should increase height)
    const deltaY = dragStartYRef.current - e.clientY;
    const newHeight = Math.max(
      minHeight,
      Math.min(maxHeight, dragStartHeightRef.current + deltaY)
    );

    setHeight(newHeight);
  }, [isDragging, minHeight, maxHeight]);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      // Notify parent of final height
      if (onHeightChange) {
        onHeightChange(height);
      }
    }
  }, [isDragging, height, onHeightChange]);

  // Handle pointer move at document level while dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handleDragMove);
      return () => document.removeEventListener('pointermove', handleDragMove);
    }
  }, [isDragging, handleDragMove]);

  const handleStyle: CSSProperties = {
    height: '20px',
    backgroundColor: theme.colors.surface,
    borderTop: `2px solid ${isDragging ? theme.colors.primary : theme.colors.border}`,
    cursor: 'ns-resize',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none',
    transition: isDragging ? 'none' : 'border-color 0.2s',
  };

  const gripStyle: CSSProperties = {
    width: '40px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: isDragging ? theme.colors.primary : theme.colors.border,
    transition: isDragging ? 'none' : 'background-color 0.2s',
  };

  const panelStyle: CSSProperties = {
    height: `${height}px`,
    backgroundColor: theme.colors.surface,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing.xs,
  };

  return (
    <div ref={panelRef} style={panelStyle}>
      {/* Drag Handle */}
      <div
        style={handleStyle}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div style={gripStyle} />
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}
