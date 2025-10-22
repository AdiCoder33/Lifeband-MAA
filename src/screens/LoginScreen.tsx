import React, {useMemo, useState, useEffect} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  const {login, loginWithGoogle, signInWithFirebase, signUpWithFirebase, logout, isAuthenticated, isLoading: authLoading} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // Force logout any existing session when component mounts (for fresh login)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('LoginScreen: Clearing previous authentication to allow fresh login');
      logout();
    }
  }, []);

  const isDisabled = useMemo(
    () => !email.trim() || !password.trim() || isLoadingLocal || authLoading,
    [email, password, isLoadingLocal, authLoading],
  );

  const handleSubmit = async () => {
    if (isDisabled) {
      return;
    }
    
  setIsLoadingLocal(true);
    
    try {
      // Use Firebase authentication
      await signInWithFirebase(email.trim(), password.trim());
      // signInWithFirebase handles navigation and role setting
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      
      if (error.message) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email address. Please sign up first.';
        } else if (error.message.includes('wrong-password')) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Login Failed', errorMessage, [{text: 'OK'}]);
    }
    
  setIsLoadingLocal(false);
  };

  const handleGoogleLogin = async () => {
  setIsLoadingLocal(true);
    
    try {
      await loginWithGoogle();
      // The auth context will handle the authentication flow
      // If user needs registration, they'll be redirected automatically
    } catch (error: any) {
      console.error('Google Login Error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.message?.includes('cancelled')) {
        errorMessage = 'Google sign-in was cancelled';
      } else if (error.message?.includes('Play Services')) {
        errorMessage = 'Google Play Services not available';
      } else if (error.message?.includes('progress')) {
        errorMessage = 'Sign-in already in progress';
      }
      
      Alert.alert('Sign-In Error', errorMessage, [{text: 'OK'}]);
    } finally {
      setIsLoadingLocal(false);
    }
  };  return (
    <>
      <ScreenBackground>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
          {/* Simple Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>LifeBand MAA</Text>
            <Text style={styles.appSubtitle}>Maternal & Antenatal Care</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#6B7A90"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#6B7A90"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              accessibilityRole='button'
              onPress={handleSubmit}
              disabled={isDisabled}
              style={[styles.primaryButton, isDisabled && styles.buttonDisabled]}>
              <Text style={styles.primaryButtonLabel}>
                {(isLoadingLocal || authLoading) ? 'Preparing your care...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoadingLocal || authLoading}
              accessibilityRole="button">
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleLabel}>Sign in with Google</Text>
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
        visible={isLoadingLocal || authLoading}
        message={(isLoadingLocal || authLoading) ? "Setting up your maternal care dashboard..." : undefined}
      />
  </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  // Simple Header Styles
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  formCard: {
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  formSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  formHeader: {
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: palette.textPrimary,
    backgroundColor: palette.surfaceSoft,
  },
  primaryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    shadowColor: palette.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: palette.primaryLight,
    opacity: 0.6,
  },
  primaryButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerLabel: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  googleIcon: {
    marginRight: spacing.sm,
    fontSize: 20,
    fontWeight: '700',
    color: '#DB4437',
  },
  googleLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: palette.textPrimary,
  },
  linkRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    marginRight: spacing.xs,
  },
  linkAction: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default LoginScreen;
