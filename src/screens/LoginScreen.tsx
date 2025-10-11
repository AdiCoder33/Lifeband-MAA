import React, {useMemo, useState} from 'react';
import {
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
import {useAuth} from '../context/AuthContext';
import {palette, radii, spacing} from '../theme';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const insightCards = [
  {
    title: 'Real-time vitals',
    copy: 'Stream heart rate, SpO2, blood pressure, and temperature in seconds.',
  },
  {
    title: 'Smart escalations',
    copy: 'AI-assisted risk triage helps doctors prioritise care decisions.',
  },
  {
    title: 'Offline resilience',
    copy: 'ASHA workers can capture vitals anywhere and sync once back online.',
  },
];

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const {login, loginWithGoogle} = useAuth();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');

  const isDisabled = useMemo(
    () => !fullName.trim() || !identifier.trim(),
    [fullName, identifier],
  );

  const handleSubmit = () => {
    if (isDisabled) {
      return;
    }
    login({
      name: fullName.trim(),
      identifier: identifier.trim(),
      email: identifier.includes('@') ? identifier.trim() : undefined,
    });
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.brandBadge}>LifeBand MAA</Text>
            <Text style={styles.heroTitle}>
              Connected care for every community
            </Text>
            <Text style={styles.heroCopy}>
              Monitor vitals, coordinate care teams, and keep patients informed
              with a single secure platform.
            </Text>
            <View style={styles.cardRow}>
              {insightCards.map(item => (
                <View key={item.title} style={styles.insightCard}>
                  <Text style={styles.insightTitle}>{item.title}</Text>
                  <Text style={styles.insightCopy}>{item.copy}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in to continue</Text>
            <Text style={styles.formSubtitle}>
              Use your LifeBand credentials or sign in with Google.
            </Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={loginWithGoogle}
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
              <Text style={styles.primaryButtonLabel}>Continue</Text>
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
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  hero: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: '#102F5F',
    color: palette.primaryLight,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: spacing.md,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  heroCopy: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 22,
    color: '#9CB3DC',
  },
  cardRow: {
    marginTop: spacing.lg,
  },
  insightCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: '#102C56',
    borderWidth: 1,
    borderColor: '#1D3F70',
  },
  insightTitle: {
    fontWeight: '700',
    color: palette.textOnDark,
    marginBottom: spacing.xs,
  },
  insightCopy: {
    color: '#9CB3DC',
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    padding: spacing.xl,
    borderRadius: 28,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  formSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
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
    backgroundColor: '#A7C4FB',
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
