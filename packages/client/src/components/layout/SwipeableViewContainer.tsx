import { useState, useRef, useCallback, useMemo, type ReactNode, type CSSProperties } from 'react';
import type { Theme } from '../../styles/theme';
import { ViewNavigationContext } from '../../contexts/ViewNavigationContext';

export interface ViewConfig {
  id: string;
  name: string;
  component: ReactNode;
}

interface SwipeableViewContainerProps {
  theme: Theme;
  views: ViewConfig[];
  initialView?: number;
  onViewChange?: (index: number, viewId: string) => void;
}

export function SwipeableViewContainer({
  theme,
  views,
  initialView = 0,
  onViewChange,
}: SwipeableViewContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialView);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVerticalScroll, setIsVerticalScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger view change
  const VERTICAL_SCROLL_THRESHOLD = 10; // If vertical movement exceeds this, it's a scroll not a swipe
  // const SWIPE_VELOCITY_THRESHOLD = 0.3; // For future: minimum velocity for quick swipes

  const goToView = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(views.length - 1, index));
    if (clampedIndex !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(clampedIndex);
      onViewChange?.(clampedIndex, views[clampedIndex].id);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, views, onViewChange]);

  const goToNextView = useCallback(() => {
    if (currentIndex < views.length - 1) {
      goToView(currentIndex + 1);
    }
  }, [currentIndex, views.length, goToView]);

  const goToPrevView = useCallback(() => {
    if (currentIndex > 0) {
      goToView(currentIndex - 1);
    }
  }, [currentIndex, goToView]);

  const navigationValue = useMemo(() => ({
    goToView,
    goToNextView,
    goToPrevView,
    currentIndex,
    totalViews: views.length,
    canGoNext: currentIndex < views.length - 1,
    canGoPrev: currentIndex > 0,
  }), [goToView, goToNextView, goToPrevView, currentIndex, views.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isTransitioning) return;

    // Check if touch started on a swipe-disabled element (e.g., map)
    const target = e.target as HTMLElement;
    const isSwipeDisabled = target.closest('[data-swipe-disabled="true"]');

    if (isSwipeDisabled) {
      setTouchStart(null);
      setTouchStartY(null);
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setTouchStart(clientX);
    setTouchStartY(clientY);
    setTouchDelta(0);
    setIsVerticalScroll(false);
  }, [isTransitioning]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null || touchStartY === null || isTransitioning) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - touchStart;
    const deltaY = clientY - touchStartY;

    // Detect if this is a vertical scroll gesture
    if (!isVerticalScroll && Math.abs(deltaY) > VERTICAL_SCROLL_THRESHOLD) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // More vertical than horizontal - treat as scroll, don't interfere
        setIsVerticalScroll(true);
        setTouchStart(null); // Clear touch tracking to stop handling
        setTouchStartY(null);
        return;
      }
    }

    // If already determined to be vertical scroll, don't interfere
    if (isVerticalScroll) return;

    // Only track horizontal movement, don't prevent default to allow scrolling
    // Limit drag at edges (no wrap-around)
    if ((currentIndex === 0 && deltaX > 0) ||
        (currentIndex === views.length - 1 && deltaX < 0)) {
      setTouchDelta(deltaX * 0.3); // Resistance at edges
    } else {
      setTouchDelta(deltaX);
    }
  }, [touchStart, touchStartY, currentIndex, views.length, isTransitioning, isVerticalScroll, VERTICAL_SCROLL_THRESHOLD]);

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null) return;

    // Don't trigger view change if this was a vertical scroll
    if (!isVerticalScroll) {
      const absD = Math.abs(touchDelta);

      if (absD > SWIPE_THRESHOLD) {
        if (touchDelta > 0 && currentIndex > 0) {
          goToView(currentIndex - 1);
        } else if (touchDelta < 0 && currentIndex < views.length - 1) {
          goToView(currentIndex + 1);
        }
      }
    }

    setTouchStart(null);
    setTouchStartY(null);
    setTouchDelta(0);
    setIsVerticalScroll(false);
  }, [touchStart, touchDelta, currentIndex, views.length, goToView, isVerticalScroll]);

  const containerStyle: CSSProperties = {
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const trackStyle: CSSProperties = {
    display: 'flex',
    height: '100%',
    transform: `translateX(calc(-${currentIndex * 100}% + ${touchDelta}px))`,
    transition: touchStart === null ? 'transform 300ms ease-out' : 'none',
  };

  const viewStyle: CSSProperties = {
    minWidth: '100%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <ViewNavigationContext.Provider value={navigationValue}>
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
        <div
          ref={containerRef}
          style={containerStyle}
        >
          <div style={trackStyle}>
            {views.map((view) => (
              <div key={view.id} style={viewStyle}>
                {view.component}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <NavigationArrow
            direction="left"
            onClick={() => goToView(currentIndex - 1)}
            theme={theme}
          />
        )}
        {currentIndex < views.length - 1 && (
          <NavigationArrow
            direction="right"
            onClick={() => goToView(currentIndex + 1)}
            theme={theme}
          />
        )}

        {/* View Indicator Dots */}
        <ViewIndicator
          theme={theme}
          total={views.length}
          current={currentIndex}
          viewNames={views.map(v => v.name)}
          onDotClick={goToView}
        />
      </div>
    </ViewNavigationContext.Provider>
  );
}

interface ViewIndicatorProps {
  theme: Theme;
  total: number;
  current: number;
  viewNames: string[];
  onDotClick: (index: number) => void;
}

function ViewIndicator({ theme, total, current, viewNames, onDotClick }: ViewIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTop: `1px solid ${theme.colors.border}`,
    height: 'var(--view-indicator-height)',
    minHeight: 'var(--view-indicator-height)',
  };

  const dotStyle = (index: number): CSSProperties => ({
    width: index === current ? '24px' : '10px',
    height: '10px',
    borderRadius: index === current ? '5px' : theme.borderRadius.full,
    backgroundColor: index === current ? theme.colors.primary : theme.colors.border,
    cursor: 'pointer',
    transition: theme.transitions.fast,
    touchAction: 'manipulation',
  });

  const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={dotStyle(i)}
            onClick={() => onDotClick(i)}
            title={viewNames[i]}
          />
        ))}
      </div>
      <span style={labelStyle}>{viewNames[current]}</span>
    </div>
  );
}

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  theme: Theme;
}

function NavigationArrow({ direction, onClick, theme }: NavigationArrowProps) {
  const arrowStyle: CSSProperties = {
    position: 'fixed',
    top: '50vh',
    [direction]: '4px',
    transform: 'translateY(-50%)',
    zIndex: 1000,
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: `2px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
  };

  const arrowIconStyle: CSSProperties = {
    color: '#ffffff',
    fontSize: '26px',
    lineHeight: '1',
    userSelect: 'none',
  };

  return (
    <div
      style={arrowStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      }}
    >
      <span style={arrowIconStyle}>
        {direction === 'left' ? '‹' : '›'}
      </span>
    </div>
  );
}
