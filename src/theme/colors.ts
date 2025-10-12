export const palette = {
  // Warm, nurturing background colors inspired by maternal care
  background: '#FFF8F5', // Soft cream/peach background
  backgroundSoft: '#FFF0E8', // Lighter peach
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#FBF7F4', // Very light warm tone
  
  // Primary colors - soft rose/coral for maternal warmth
  primary: '#E57373', // Soft coral/rose - nurturing and warm
  primaryDark: '#D25A5A', // Deeper rose
  primaryLight: '#F8BBD9', // Light pink
  
  // Accent and status colors
  accent: '#FFB74D', // Warm orange - like sunrise/hope
  success: '#81C784', // Soft green for health/growth
  warning: '#FFB74D', // Warm orange
  danger: '#F06292', // Soft pink-red, less harsh than pure red
  
  // Text colors for warm theme
  textPrimary: '#3E2723', // Warm dark brown instead of cold black
  textSecondary: '#6D4C41', // Medium warm brown
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnLight: '#3E2723', // For light backgrounds
  
  // Borders and shadows
  border: '#E8D5D3', // Warm light border
  shadow: '#3E272320', // Warm shadow
  
  // Additional maternal care colors
  maternal: {
    blush: '#F8BBD9', // Soft blush pink
    lavender: '#E1BEE7', // Gentle lavender
    mint: '#B2DFDB', // Soft mint for freshness
    peach: '#FFCCBC', // Warm peach
    cream: '#FFF8E1', // Creamy yellow
  },
} as const;

export type Palette = typeof palette;
