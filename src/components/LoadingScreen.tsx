import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import {palette, spacing} from '../theme';

const {width, height} = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  visible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Caring for you and your baby...',
  visible,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      // Heartbeat animation
      const heartbeat = Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]);

      const heartbeatLoop = Animated.loop(heartbeat);
      heartbeatLoop.start();

      // Pulse animation for the glow effect
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]);

      const pulseLoop = Animated.loop(pulse);
      pulseLoop.start();

      return () => {
        heartbeatLoop.stop();
        pulseLoop.stop();
      };
    }
  }, [visible, fadeAnim, pulseAnim, heartAnim, progressAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* Logo area with heartbeat animation */}
        <Animated.View style={[styles.logoContainer, {transform: [{scale: heartAnim}]}]}>
          <View style={styles.heartIcon}>
            <Text style={styles.heartEmoji}>💗</Text>
          </View>
          <Animated.View 
            style={[
              styles.pulseCircle, 
              {transform: [{scale: pulseAnim}]}
            ]} 
          />
        </Animated.View>

        {/* App name */}
        <Text style={styles.appName}>LifeBand MAA</Text>
        <Text style={styles.tagline}>Maternal & Newborn Care</Text>

        {/* Loading message */}
        <Text style={styles.loadingMessage}>{message}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </View>

        {/* Features preview */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👶</Text>
            <Text style={styles.featureText}>Baby Health Monitoring</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤱</Text>
            <Text style={styles.featureText}>Maternal Care Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👩‍⚕️</Text>
            <Text style={styles.featureText}>Expert Care Team</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.backgroundSoft,
    opacity: 0.3,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  heartIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: palette.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 2,
  },
  heartEmoji: {
    fontSize: 40,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.primary,
    opacity: 0.2,
    top: -20,
    left: -20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  loadingMessage: {
    fontSize: 18,
    color: palette.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  progressContainer: {
    width: width * 0.7,
    height: 4,
    backgroundColor: palette.border,
    borderRadius: 2,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 2,
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: palette.textSecondary,
    fontWeight: '500',
  },
});

export default LoadingScreen;