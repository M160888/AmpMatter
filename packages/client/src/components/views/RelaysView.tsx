import { useMemo, useState } from 'react';
import { useAppSelector } from '../../store';
import { RelaySwitch } from '../common/RelaySwitch';
import type { Theme } from '../../styles/theme';

interface RelaysViewProps {
  theme: Theme;
  onToggle?: (id: string) => void;
}

// Maximum switches per page to ensure they remain clickable
// 8 switches (2 rows x 4 cols or 4 rows x 2 cols) is a good balance
const MAX_SWITCHES_PER_PAGE = 8;

export function RelaysView({ theme, onToggle }: RelaysViewProps) {
  const relays = useAppSelector((state) => state.relays);
  const [currentPage, setCurrentPage] = useState(0);

  const handleToggle = (id: string) => {
    if (onToggle) {
      onToggle(id);
    }
  };

  // Filter to enabled relays only
  const enabledRelays = useMemo(
    () => relays.configs.filter((c) => c.enabled),
    [relays.configs]
  );

  // Paginate if we have more than max
  const totalPages = Math.ceil(enabledRelays.length / MAX_SWITCHES_PER_PAGE);
  const paginatedRelays = useMemo(() => {
    const start = currentPage * MAX_SWITCHES_PER_PAGE;
    return enabledRelays.slice(start, start + MAX_SWITCHES_PER_PAGE);
  }, [enabledRelays, currentPage]);

  // Calculate optimal grid layout based on number of switches
  // On mobile portrait, we use 2 columns with more rows
  const gridLayout = useMemo(() => {
    const count = paginatedRelays.length;
    // Default to 2 columns for mobile-friendly layout
    if (count <= 2) return { cols: 2, rows: 1 };
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 2, rows: 3 };
    if (count <= 8) return { cols: 2, rows: 4 };
    return { cols: 2, rows: 4 }; // Max 8
  }, [paginatedRelays.length]);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs,
      }}
    >
      {/* Switch Grid - fills available space */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          gap: theme.spacing.sm,
          minHeight: 0, // Important for flex child to shrink
        }}
      >
        {paginatedRelays.map((config) => {
          const state = relays.relays[config.id] || {
            id: config.id,
            state: false,
            lastChanged: Date.now(),
          };

          return (
            <RelaySwitch
              key={config.id}
              config={config}
              state={state}
              onToggle={handleToggle}
              theme={theme}
            />
          );
        })}
      </div>

      {/* Pagination Controls - only show if needed */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.spacing.md,
            padding: theme.spacing.sm,
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            style={{
              minWidth: theme.touchTarget.min,
              minHeight: theme.touchTarget.min,
              padding: theme.spacing.sm,
              backgroundColor: currentPage === 0 ? theme.colors.border : theme.colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.sizes.base,
              cursor: currentPage === 0 ? 'default' : 'pointer',
              opacity: currentPage === 0 ? 0.5 : 1,
            }}
          >
            ◀ Prev
          </button>
          <span
            style={{
              fontSize: theme.typography.sizes.base,
              color: theme.colors.text,
            }}
          >
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            style={{
              minWidth: theme.touchTarget.min,
              minHeight: theme.touchTarget.min,
              padding: theme.spacing.sm,
              backgroundColor: currentPage === totalPages - 1 ? theme.colors.border : theme.colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.sizes.base,
              cursor: currentPage === totalPages - 1 ? 'default' : 'pointer',
              opacity: currentPage === totalPages - 1 ? 0.5 : 1,
            }}
          >
            Next ▶
          </button>
        </div>
      )}

      {enabledRelays.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizes.lg,
          }}
        >
          No relays configured
        </div>
      )}
    </div>
  );
}
