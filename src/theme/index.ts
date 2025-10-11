import {palette} from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  weightRegular: '400' as const,
  weightSemi: '600' as const,
  weightBold: '700' as const,
};

export const theme = {
  palette,
  spacing,
  radii,
  typography,
};

export type Theme = typeof theme;

export default theme;
export {palette};
