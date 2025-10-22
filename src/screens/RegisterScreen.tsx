import React, {useMemo, useState, useEffect} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GoogleAuthService from '../services/firebase/googleAuth';
import UserProfileService from '../services/firebase/UserProfileService';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
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
  const route = useRoute<RouteProp<RootStackParamList, 'Register'>>();
  const {
    register, 
    loginWithGoogle, 
    signUpWithFirebase, 
    completeGoogleRegistration, 
    needsRegistration, 
    googleUser, 
    googleUserInfo
  } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'asha' | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [workArea, setWorkArea] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [localGoogleUserInfo, setLocalGoogleUserInfo] = useState<any>(null);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);

  // Handle navigation params for Google sign-up or needsRegistration from auth context
  useEffect(() => {
    if (needsRegistration && googleUserInfo) {
      // User came from Google Sign-In and needs to complete registration
      setIsGoogleSignUp(true);
      setLocalGoogleUserInfo(googleUserInfo);
      setEmail(googleUserInfo.email || '');
      setFullName(googleUserInfo.name || '');
    } else if (route.params?.isGoogleSignUp && route.params?.googleUserInfo) {
      setIsGoogleSignUp(true);
      setLocalGoogleUserInfo(route.params.googleUserInfo);
      setEmail(route.params.googleUserInfo.email);
      setFullName(route.params.googleUserInfo.name || '');

      // If existing user data is provided, populate the form
      if (route.params.existingUserData) {
        const userData = route.params.existingUserData;
        setSelectedRole(userData.role || null);
        setPhoneNumber(userData.phoneNumber || '');
        setOrganisation(userData.organisation || '');
        setStaffId(userData.staffId || '');
        
        // Role-specific fields
        if (userData.role === 'patient') {
          setDateOfBirth(userData.dateOfBirth || '');
          setBloodGroup(userData.bloodGroup || '');
          setEmergencyContact(userData.emergencyContact || '');
        } else if (userData.role === 'doctor') {
          setLicenseNumber(userData.licenseNumber || '');
          setSpecialization(userData.specialization || '');
        } else if (userData.role === 'asha') {
          setWorkArea(userData.workArea || '');
        }
      }
    }
  }, [route.params, needsRegistration, googleUserInfo]);

  const isDisabled = useMemo(() => {
    if (!fullName.trim() || !email.trim() || !selectedRole || !phoneNumber.trim()) {
      return true;
    }
    
    // Skip password validation for Google signup
    if (!isGoogleSignUp) {
      if (password.trim().length < 6) {
        return true;
      }
      if (password.trim() !== confirmPassword.trim()) {
        return true;
      }
    }
    
    // Role-specific validation
    if (selectedRole === 'patient') {
      if (!dateOfBirth.trim() || !emergencyContact.trim()) {
        return true;
      }
    } else if (selectedRole === 'doctor') {
      if (!licenseNumber.trim() || !specialization.trim()) {
        return true;
      }
    } else if (selectedRole === 'asha') {
      if (!workArea.trim()) {
        return true;
      }
    }
    
    return false;
  }, [confirmPassword, email, fullName, password, selectedRole, phoneNumber, dateOfBirth, emergencyContact, licenseNumber, specialization, workArea]);

  const handleRegister = async () => {
    if (isDisabled || !selectedRole) {
      return;
    }
    
    try {
      // Base user info
      const userInfo: any = {
        name: fullName.trim(),
        role: selectedRole,
        phone: phoneNumber.trim(),
        organisation: organisation.trim(),
        staffId: staffId.trim(),
      };

      // Add role-specific data
      if (selectedRole === 'patient') {
        userInfo.dateOfBirth = dateOfBirth;
        userInfo.bloodGroup = bloodGroup;
        userInfo.emergencyContact = emergencyContact;
      } else if (selectedRole === 'doctor') {
        userInfo.licenseNumber = licenseNumber;
        userInfo.specialization = specialization;
      } else if (selectedRole === 'asha') {
        userInfo.workArea = workArea;
      }

      if (isGoogleSignUp || needsRegistration) {
        // For Google signup, complete the registration with user profile
        const profileData: any = {
          name: fullName.trim(),
          role: selectedRole,
          phoneNumber: phoneNumber.trim(),
          organisation: organisation.trim(),
          staffId: staffId.trim(),
        };

        // Add role-specific fields
        if (selectedRole === 'patient') {
          profileData.dateOfBirth = dateOfBirth;
          profileData.bloodGroup = bloodGroup;
          profileData.emergencyContact = emergencyContact;
        } else if (selectedRole === 'doctor') {
          profileData.licenseNumber = licenseNumber;
          profileData.specialization = specialization;
        } else if (selectedRole === 'asha') {
          profileData.workArea = workArea;
        }

        await completeGoogleRegistration(profileData);
      } else {
        // Regular email/password signup
        await signUpWithFirebase(email.trim(), password.trim(), userInfo);
      }
      
      if (isGoogleSignUp || needsRegistration) {
        // Google registration completed - user is automatically logged in
        Alert.alert(
          'Registration Complete!',
          'Your Google account has been set up successfully. You are now logged in.',
          [{ text: 'OK' }]
        );
      } else {
        // Regular registration - redirect to login
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully. You can now sign in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Failed to create account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await GoogleAuthService.signIn();
      
      // Store Google user info and show role selection
      setLocalGoogleUserInfo(result.googleUserInfo);
      setIsGoogleSignUp(true);
      
      // Pre-fill form with Google data
      setFullName(result.googleUserInfo?.name || '');
      setEmail(result.googleUserInfo?.email || '');
      
      Alert.alert(
        'Google Sign-In Successful',
        'Please select your role and complete additional details to finish registration.',
        [{text: 'OK'}]
      );
    } catch (error: any) {
      Alert.alert(
        'Google Sign-In Failed',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{text: 'OK'}]
      );
    }
  };

  const renderRoleSpecificFields = () => {
    if (!selectedRole) return null;

    switch (selectedRole) {
      case 'patient':
        return (
          <>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldHalf, styles.fieldHalfLeft]}>
                <Text style={styles.label}>Date of Birth *</Text>
                <TextInput
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#6B7A90"
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Blood Group</Text>
                <TextInput
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  placeholder="A+, B-, O+, etc."
                  placeholderTextColor="#6B7A90"
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Emergency Contact *</Text>
              <TextInput
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Emergency contact phone number"
                placeholderTextColor="#6B7A90"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </>
        );

      case 'doctor':
        return (
          <>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldHalf, styles.fieldHalfLeft]}>
                <Text style={styles.label}>License Number *</Text>
                <TextInput
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  placeholder="Medical license number"
                  placeholderTextColor="#6B7A90"
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Specialization *</Text>
                <TextInput
                  value={specialization}
                  onChangeText={setSpecialization}
                  placeholder="e.g., Gynecology"
                  placeholderTextColor="#6B7A90"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>
          </>
        );

      case 'asha':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Work Area *</Text>
              <TextInput
                value={workArea}
                onChangeText={setWorkArea}
                placeholder="Village/area you serve"
                placeholderTextColor="#6B7A90"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isGoogleSignUp || needsRegistration 
                  ? 'Complete Your Profile' 
                  : 'Create Account'}
              </Text>
              {(isGoogleSignUp || needsRegistration) && (
                <View style={styles.googleBadge}>
                  <Text style={styles.googleBadgeText}>✓ Google Account</Text>
                </View>
              )}
            </View>

            {/* Role Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>Your Role *</Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'patient' && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole('patient')}
                >
                  <Text style={styles.roleIcon}>🤱</Text>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === 'patient' && styles.roleLabelSelected
                  ]}>Patient</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'doctor' && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole('doctor')}
                >
                  <Text style={styles.roleIcon}>🩺</Text>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === 'doctor' && styles.roleLabelSelected
                  ]}>Doctor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'asha' && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole('asha')}
                >
                  <Text style={styles.roleIcon}>👩‍⚕️</Text>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === 'asha' && styles.roleLabelSelected
                  ]}>ASHA</Text>
                </TouchableOpacity>
              </View>
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

            <View style={styles.fieldRow}>
              <View style={[styles.fieldHalf, styles.fieldHalfLeft]}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Your phone number"
                  placeholderTextColor="#6B7A90"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Staff / Patient ID</Text>
                <TextInput
                  value={staffId}
                  onChangeText={setStaffId}
                  placeholder="Optional ID"
                  placeholderTextColor="#6B7A90"
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>
            </View>

            {renderRoleSpecificFields()}

            {!isGoogleSignUp && !needsRegistration && (
              <View style={styles.fieldRow}>
                <View style={[styles.fieldHalf, styles.fieldHalfLeft]}>
                  <Text style={styles.label}>Create password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#6B7A90"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Confirm password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor="#6B7A90"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
              </View>
            )}

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

            {/* Show Google Sign-Up button only for regular registration */}
            {!isGoogleSignUp && !needsRegistration && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignUp}>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleLabel}>Sign up with Google</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkLabel}>Already have an account?</Text>
              <Text style={styles.linkAction}>Back to sign in</Text>
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
  formCard: {
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  googleBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: palette.success + '15',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.success,
  },
  googleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.success,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
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
  field: {
    marginBottom: spacing.lg,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldHalfLeft: {
    marginRight: spacing.sm,
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
  roleGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  roleButtonSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.primary + '10',
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  roleLabelSelected: {
    color: palette.primary,
  },
});

export default RegisterScreen;
