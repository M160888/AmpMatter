// Marine-friendly theme with day/night modes

export type ThemeMode = 'day' | 'night';
export type ThemeSetting = 'day' | 'night' | 'auto';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  primary: string;
  primaryHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  shadow: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    touch: string;
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      xxl: string;
      display: string;
    };
    weights: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  touchTarget: {
    min: string;
    preferred: string;
  };
  transitions: {
    fast: string;
    normal: string;
  };
}

const dayColors: ThemeColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceHover: '#F0F2F5',
  primary: '#0066CC',
  primaryHover: '#0052A3',
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#8A8A8A',
  success: '#00AA44',
  warning: '#FF9900',
  danger: '#CC0000',
  border: '#D0D5DD',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Night mode uses red-shifted colors to preserve night vision
const nightColors: ThemeColors = {
  background: '#0D0000',
  surface: '#1A0505',
  surfaceHover: '#2A0A0A',
  primary: '#AA3333',
  primaryHover: '#CC4444',
  text: '#FF8888',
  textSecondary: '#CC6666',
  textMuted: '#884444',
  success: '#448844',
  warning: '#AA6600',
  danger: '#FF4444',
  border: '#442222',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const baseTheme = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    touch: '12px',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '18px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
      display: '64px',
    },
    weights: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  touchTarget: {
    min: '48px',
    preferred: '64px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
  },
};

export const dayTheme: Theme = {
  mode: 'day',
  colors: dayColors,
  ...baseTheme,
};

export const nightTheme: Theme = {
  mode: 'night',
  colors: nightColors,
  ...baseTheme,
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'day' ? dayTheme : nightTheme;
};
