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

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const roleHighlights = [
  'Choose your role on the next screen to customise the dashboard.',
  'Patients see guided health summaries and demo charts.',
  'Doctors and ASHA workers get live feeds and analytics to escalate care.',
];

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const {register, loginWithGoogle} = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isDisabled = useMemo(() => {
    if (!fullName.trim() || !email.trim()) {
      return true;
    }
    if (password.trim().length < 4) {
      return true;
    }
    return password.trim() !== confirmPassword.trim();
  }, [confirmPassword, email, fullName, password]);

  const handleRegister = () => {
    if (isDisabled) {
      return;
    }
    register({
      name: fullName.trim(),
      email: email.trim(),
      identifier: staffId.trim() || email.trim(),
    });
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.title}>Let’s create your LifeBand account</Text>
            <Text style={styles.subtitle}>
              A single login unlocks role-based dashboards for patients,
              doctors, and ASHA workers.
            </Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={loginWithGoogle}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleLabel}>Sign up with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or create with email</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldHalf, styles.fieldHalfLeft]}>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Asha Kumari"
                  placeholderTextColor="#6B7A90"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Organisation</Text>
                <TextInput
                  value={organisation}
                  onChangeText={setOrganisation}
                  placeholder="Clinic / PHC (optional)"
                  placeholderTextColor="#6B7A90"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Work email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@lifeband.care"
                placeholderTextColor="#6B7A90"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Staff / Patient ID</Text>
              <TextInput
                value={staffId}
                onChangeText={setStaffId}
                placeholder="Optional but helps your team find you"
                placeholderTextColor="#6B7A90"
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldHalf, styles.fieldHalfLeft]}>
                <Text style={styles.label}>Create passcode</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 4 digits"
                  placeholderTextColor="#6B7A90"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Confirm passcode</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter passcode"
                  placeholderTextColor="#6B7A90"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleRegister}
              disabled={isDisabled}
              style={[
                styles.primaryButton,
                isDisabled && styles.buttonDisabled,
              ]}>
              <Text style={styles.primaryButtonLabel}>Create account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkLabel}>Already have an account?</Text>
              <Text style={styles.linkAction}>Back to sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sidePanel}>
            <Text style={styles.sideTitle}>What happens next?</Text>
            {roleHighlights.map(item => (
              <View key={item} style={styles.highlightRow}>
                <View style={styles.bullet} />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
            <View style={styles.mockCard}>
              <Text style={styles.mockCardTitle}>Preview: Patient overview</Text>
              <Text style={styles.mockCardCopy}>
                Visualise demo charts and KPI cards instantly. Real data will
                replace these placeholders once your LifeBand syncs.
              </Text>
            <View style={styles.mockPills}>
              <View style={[styles.mockPill, {backgroundColor: '#EEF4FF'}]}>
                <Text style={styles.mockPillText}>Vitals summary</Text>
              </View>
              <View style={[styles.mockPill, {backgroundColor: '#E5FBF0'}]}>
                <Text style={styles.mockPillText}>Alerts timeline</Text>
              </View>
              <View style={[styles.mockPill, {backgroundColor: '#FFF2E5'}]}>
                <Text style={styles.mockPillText}>Care plan</Text>
              </View>
            </View>
            </View>
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
  formCard: {
    padding: spacing.xl,
    borderRadius: 28,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
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
  fieldRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldHalfLeft: {
    marginRight: spacing.sm,
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
    backgroundColor: palette.primaryDark,
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
  sidePanel: {
    padding: spacing.xl,
    borderRadius: 28,
    backgroundColor: '#0F2B50',
    borderWidth: 1,
    borderColor: '#1F3F70',
  },
  sideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  highlightText: {
    flex: 1,
    color: '#9CB3DC',
    fontSize: 13,
    lineHeight: 18,
  },
  mockCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: '#112F5B',
    borderWidth: 1,
    borderColor: '#1F3F70',
  },
  mockCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  mockCardCopy: {
    marginTop: spacing.xs,
    color: '#9CB3DC',
    fontSize: 13,
    lineHeight: 18,
  },
  mockPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  mockPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  mockPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textPrimary,
  },
});

export default RegisterScreen;
