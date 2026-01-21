import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ViewConfig, ViewType } from '@ampmatter/shared';
import type { Theme } from '../styles/theme';

export interface ViewProps {
  theme: Theme;
  onToggle?: (id: string) => void;
}

export interface ViewDefinition {
  id: string;
  type: ViewType;
  name: string;
  icon: string;
  component: LazyExoticComponent<ComponentType<ViewProps>> | ComponentType<ViewProps>;
  defaultEnabled: boolean;
  order: number;
}

// Lazy load view components for code splitting
const NavigationView = lazy(() => import('../components/views/NavigationView').then(m => ({ default: m.NavigationView })));
const VictronView = lazy(() => import('../components/views/VictronView').then(m => ({ default: m.VictronView })));
const SensorsView = lazy(() => import('../components/views/SensorsView').then(m => ({ default: m.SensorsView })));
const RelaysView = lazy(() => import('../components/views/RelaysView').then(m => ({ default: m.RelaysView })));
const SettingsView = lazy(() => import('../components/views/SettingsView').then(m => ({ default: m.SettingsView })));

export const viewRegistry: ViewDefinition[] = [
  {
    id: 'navigation',
    type: 'navigation',
    name: 'Navigation',
    icon: 'map',
    component: NavigationView,
    defaultEnabled: true,
    order: 0,
  },
  {
    id: 'victron',
    type: 'victron',
    name: 'Victron',
    icon: 'battery',
    component: VictronView,
    defaultEnabled: true,
    order: 1,
  },
  {
    id: 'sensors',
    type: 'sensors',
    name: 'Sensors',
    icon: 'sensor',
    component: SensorsView,
    defaultEnabled: true,
    order: 2,
  },
  {
    id: 'relays',
    type: 'relays',
    name: 'Relays',
    icon: 'power',
    component: RelaysView,
    defaultEnabled: true,
    order: 3,
  },
  {
    id: 'settings',
    type: 'settings',
    name: 'Settings',
    icon: 'settings',
    component: SettingsView,
    defaultEnabled: true,
    order: 4,
  },
];

/**
 * Get enabled views based on user configuration
 */
export function getEnabledViews(viewConfigs: ViewConfig[]): ViewDefinition[] {
  // Create a map of view configs for easy lookup
  const configMap = new Map(viewConfigs.map((c) => [c.id, c]));

  return viewRegistry
    .filter((view) => {
      const config = configMap.get(view.id);
      return config ? config.enabled : view.defaultEnabled;
    })
    .sort((a, b) => {
      const orderA = configMap.get(a.id)?.order ?? a.order;
      const orderB = configMap.get(b.id)?.order ?? b.order;
      return orderA - orderB;
    });
}

/**
 * Get a view definition by ID
 */
export function getViewById(id: string): ViewDefinition | undefined {
  return viewRegistry.find((v) => v.id === id);
}
