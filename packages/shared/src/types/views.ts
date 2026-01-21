// View system types for dynamic view management

export type ViewType = 'navigation' | 'victron' | 'sensors' | 'relays' | 'settings' | 'custom';

export interface ViewConfig {
  id: string;
  type: ViewType;
  name: string;
  icon?: string;
  enabled: boolean;
  order: number;
  layoutConfig?: ViewLayoutConfig;
  customWidgets?: CustomWidget[];
}

export interface ViewLayoutConfig {
  mapRatio?: number; // For navigation view: 0.75-0.8 (75-80% map)
  splitOrientation?: 'horizontal' | 'vertical';
  widgets?: WidgetPlacement[];
}

export interface WidgetPlacement {
  widgetId: string;
  gridPosition: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface CustomWidget {
  id: string;
  type: 'gauge' | 'text' | 'graph' | 'button';
  dataSource: string; // Path to data in Redux state
  config: Record<string, unknown>;
}

// Default view configurations
export const DEFAULT_VIEWS: ViewConfig[] = [
  {
    id: 'navigation',
    type: 'navigation',
    name: 'Navigation',
    icon: 'map',
    enabled: true,
    order: 0,
    layoutConfig: {
      mapRatio: 0.75,
    },
  },
  {
    id: 'victron',
    type: 'victron',
    name: 'Victron',
    icon: 'battery',
    enabled: true,
    order: 1,
  },
  {
    id: 'sensors',
    type: 'sensors',
    name: 'Sensors',
    icon: 'sensor',
    enabled: true,
    order: 2,
  },
  {
    id: 'relays',
    type: 'relays',
    name: 'Relays',
    icon: 'power',
    enabled: true,
    order: 3,
  },
  {
    id: 'settings',
    type: 'settings',
    name: 'Settings',
    icon: 'settings',
    enabled: true,
    order: 4,
  },
];
