export const palette = {
  background: '#0B1D3C',
  backgroundSoft: '#10264D',
  card: '#152E5F',
  surface: '#FFFFFF',
  surfaceSoft: '#F1F4FE',
  primary: '#4C8BF5',
  primaryDark: '#2B63DF',
  primaryLight: '#7AA6F8',
  accent: '#F9AB00',
  success: '#34A853',
  warning: '#F9AB00',
  danger: '#EA4335',
  textPrimary: '#0F172A',
  textSecondary: '#4B5563',
  textOnDark: '#F8FAFC',
  textOnPrimary: '#FFFFFF',
  border: '#D6DAE2',
  shadow: '#0F172A33',
} as const;

export type Palette = typeof palette;
