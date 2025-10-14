import {Dimensions} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Responsive font sizes based on screen width
export const responsiveFontSize = (size: number): number => {
  const baseWidth = 375; // iPhone X width as base
  const scale = screenWidth / baseWidth;
  const newSize = size * scale;
  
  // Limit the scaling to prevent too large or too small fonts
  return Math.max(12, Math.min(newSize, size * 1.3));
};

// Responsive spacing based on screen width
export const responsiveSpacing = (spacing: number): number => {
  const baseWidth = 375;
  const scale = screenWidth / baseWidth;
  return spacing * Math.min(scale, 1.2);
};

// Check if screen is small (width < 375)
export const isSmallScreen = (): boolean => screenWidth < 375;

// Check if screen is large (width > 414)
export const isLargeScreen = (): boolean => screenWidth > 414;

// Get screen dimensions
export const getScreenDimensions = () => ({
  width: screenWidth,
  height: screenHeight,
});

export default {
  responsiveFontSize,
  responsiveSpacing,
  isSmallScreen,
  isLargeScreen,
  getScreenDimensions,
};