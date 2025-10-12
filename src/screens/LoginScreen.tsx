import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ScreenBackground from '../components/ScreenBackground';
import LoadingScreen from '../components/LoadingScreen';
import {useAuth} from '../context/AuthContext';
import {palette, radii, spacing} from '../theme';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const {login, loginWithGoogle} = useAuth();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const heartAnimation = useRef(new Animated.Value(1)).current;
  const connectionAnimation = useRef(new Animated.Value(0)).current;

  // Start animations on component mount
  useEffect(() => {
    // Heartbeat animation
    const heartbeat = () => {
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(heartbeat, 2000); // Repeat every 2 seconds
      });
    };

    // Connection line pulse animation
    const connectionPulse = () => {
      Animated.sequence([
        Animated.timing(connectionAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(connectionAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setTimeout(connectionPulse, 1000);
      });
    };

    heartbeat();
    connectionPulse();
  }, [heartAnimation, connectionAnimation]);

  const isDisabled = useMemo(
    () => !fullName.trim() || !identifier.trim() || isLoading,
    [fullName, identifier, isLoading],
  );

  const handleSubmit = async () => {
    if (isDisabled) {
      return;
    }
    
    setIsLoading(true);
    
    // Show loading screen for a moment to demonstrate the features
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    login({
      name: fullName.trim(),
      identifier: identifier.trim(),
      email: identifier.includes('@') ? identifier.trim() : undefined,
    });
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    loginWithGoogle();
    setIsLoading(false);
  };

  return (
    <>
      <ScreenBackground>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
          {/* Beautiful Mother & Baby Animation */}
          <View style={styles.animationContainer}>
            <Text style={styles.appTitle}>LifeBand MAA</Text>
            <View style={styles.motherBabyAnimation}>
              <View style={styles.motherContainer}>
                <Text style={styles.motherIcon}>🤰</Text>
                <Text style={styles.motherLabel}>You</Text>
              </View>
              <View style={styles.connectionContainer}>
                <Animated.View style={[styles.connectionLine, {
                  backgroundColor: connectionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#E57373', '#F48FB1']
                  })
                }]} />
                <Animated.Text style={[styles.heartIcon, {
                  transform: [{ scale: heartAnimation }]
                }]}>💓</Animated.Text>
                <Animated.View style={[styles.connectionLine, {
                  backgroundColor: connectionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#E57373', '#F48FB1']
                  })
                }]} />
              </View>
              <View style={styles.babyContainer}>
                <Text style={styles.babyIcon}>👶</Text>
                <Text style={styles.babyLabel}>Baby</Text>
              </View>
            </View>
            <Text style={styles.animationSubtext}>Healthy together</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Sign In</Text>
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              accessibilityRole="button">
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleLabel}>Sign in with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Dr. Priya Sharma"
                placeholderTextColor="#6B7A90"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email or Staff ID</Text>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="e.g. priya@clinic.org or ASHA-034"
                placeholderTextColor="#6B7A90"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              accessibilityRole='button'
              onPress={handleSubmit}
              disabled={isDisabled}
              style={[styles.primaryButton, isDisabled && styles.buttonDisabled]}>
              <Text style={styles.primaryButtonLabel}>
                {isLoading ? 'Preparing your care...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkLabel}>New to LifeBand?</Text>
              <Text style={styles.linkAction}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
    
    <LoadingScreen 
      visible={isLoading} 
      message={isLoading ? "Setting up your maternal care dashboard..." : undefined} 
    />
  </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  // Simple Animation Styles
  animationContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  motherBabyAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  motherContainer: {
    alignItems: 'center',
  },
  motherIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  motherLabel: {
    fontSize: 10,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  connectionLine: {
    width: 20,
    height: 2,
    backgroundColor: palette.primary,
    borderRadius: 1,
  },
  heartIcon: {
    fontSize: 16,
    marginHorizontal: spacing.xs,
  },
  babyContainer: {
    alignItems: 'center',
  },
  babyIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  babyLabel: {
    fontSize: 10,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  animationSubtext: {
    fontSize: 12,
    color: palette.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  cardRow: {
    marginTop: spacing.lg,
  },
  insightCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  insightTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
    flex: 1,
  },
  insightCopy: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  formSubtitle: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
    color: palette.textSecondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
  },
  googleIcon: {
    marginRight: spacing.sm,
    fontSize: 18,
    fontWeight: '700',
    color: '#DB4437',
  },
  googleLabel: {
    fontWeight: '600',
    color: palette.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
  },
  dividerLabel: {
    marginHorizontal: spacing.md,
    fontSize: 12,
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formHeader: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.textPrimary,
    backgroundColor: palette.surfaceSoft,
  },
  primaryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: palette.maternal.blush,
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  linkRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkLabel: {
    color: palette.textSecondary,
    marginRight: spacing.xs,
  },
  linkAction: {
    color: palette.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
