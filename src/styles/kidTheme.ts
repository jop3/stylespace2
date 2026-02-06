/**
 * Kid-friendly design tokens for StyleSpace
 * Bright, colorful, and playful design system
 */

export const colors = {
  // Primary colors - bright and playful
  primary: {
    pink: '#FF6B9D',
    pinkLight: '#FFB4CC',
    pinkDark: '#E54C7B',
  },
  purple: {
    main: '#7C3AED',
    light: '#A78BFA',
    dark: '#5B21B6',
  },
  green: {
    main: '#10B981',
    light: '#6EE7B7',
    dark: '#047857',
  },
  orange: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
  },
  blue: {
    main: '#3B82F6',
    light: '#93C5FD',
    dark: '#1D4ED8',
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    cream: '#FFF8F0',
    gray100: '#F8F9FA',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#6C757D',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Gradient presets
  gradients: {
    rainbow: 'linear-gradient(135deg, #FF6B9D 0%, #7C3AED 50%, #3B82F6 100%)',
    sunset: 'linear-gradient(135deg, #F59E0B 0%, #FF6B9D 100%)',
    ocean: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
    candy: 'linear-gradient(135deg, #FFB4CC 0%, #A78BFA 100%)',
    magic: 'linear-gradient(135deg, #7C3AED 0%, #FF6B9D 50%, #F59E0B 100%)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const typography = {
  fontFamily: '"Nunito", system-ui, sans-serif',
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
  glow: {
    pink: '0 0 20px rgba(255, 107, 157, 0.5)',
    purple: '0 0 20px rgba(124, 58, 237, 0.5)',
    green: '0 0 20px rgba(16, 185, 129, 0.5)',
    orange: '0 0 20px rgba(245, 158, 11, 0.5)',
  },
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '400ms ease',
  bounce: '400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Button size presets (minimum 48px for touch)
export const buttonSizes = {
  sm: {
    height: '48px',
    padding: '0 16px',
    fontSize: '16px',
    iconSize: '20px',
  },
  md: {
    height: '56px',
    padding: '0 24px',
    fontSize: '18px',
    iconSize: '24px',
  },
  lg: {
    height: '72px',
    padding: '0 32px',
    fontSize: '20px',
    iconSize: '28px',
  },
} as const;

// Icon button sizes
export const iconButtonSizes = {
  sm: '48px',
  md: '56px',
  lg: '72px',
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 100,
  modal: 200,
  toast: 300,
  celebration: 400,
  tooltip: 500,
} as const;

// Screen/View names for navigation
export const screens = {
  CLOSET: 'closet',
  DRESS_UP: 'dress-up',
  PLAY: 'play',
  GALLERY: 'gallery',
} as const;

export type Screen = typeof screens[keyof typeof screens];

// Achievement tiers
export const achievementTiers = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
} as const;

export type AchievementTier = typeof achievementTiers[keyof typeof achievementTiers];

// Theme export for use in components
export const kidTheme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  transitions,
  buttonSizes,
  iconButtonSizes,
  zIndex,
  screens,
  achievementTiers,
} as const;

export default kidTheme;
