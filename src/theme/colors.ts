export const palette = {
  // Modern, clean backgrounds with subtle warmth
  background: '#FAFCFF', // Very light blue-white for cleanliness and trust
  backgroundSoft: '#F5F8FC', // Subtle blue tint
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FAFC', // Clean light gray
  
  // Primary colors - modern teal/emerald for health and growth
  primary: '#10B981', // Modern emerald green - health, growth, vitality
  primaryDark: '#059669', // Deeper emerald
  primaryLight: '#A7F3D0', // Light emerald
  
  // Accent and status colors
  accent: '#F59E0B', // Warm amber for energy and optimism
  success: '#22C55E', // Bright green for positive health outcomes
  info: '#3B82F6', // Modern blue for informational content
  warning: '#F59E0B', // Amber for caution
  danger: '#EF4444', // Clear red for important alerts
  
  // Text colors for modern readability
  textPrimary: '#1F2937', // Modern dark gray - excellent readability
  textSecondary: '#6B7280', // Medium gray for secondary text
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnLight: '#1F2937', // For light backgrounds
  
  // Borders and shadows
  border: '#E5E7EB', // Clean light gray border
  shadow: '#1F293715', // Subtle shadow
  
  // Additional maternal care colors - modern pastels
  maternal: {
    blush: '#FDF2F8', // Very light pink background
    lavender: '#F3F4F6', // Light gray-lavender
    mint: '#ECFDF5', // Very light green
    peach: '#FEF3E2', // Light amber background
    cream: '#FFFBEB', // Very light yellow
    rose: '#FCE7F3', // Light rose
    sky: '#EFF6FF', // Light blue
    indigo: '#EEF2FF', // Light indigo
  },
} as const;

export type Palette = typeof palette;
