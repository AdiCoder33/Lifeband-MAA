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
            <Text style={styles.title}>
              {isGoogleSignUp || needsRegistration 
                ? 'Complete Your Registration' 
                : 'Create Your Account'}
            </Text>
            {(isGoogleSignUp || needsRegistration) && (
              <Text style={styles.subtitle}>
                Please provide additional details to complete your Google account setup.
              </Text>
            )}

            {/* Role Selection - Always at the top */}
            <View style={styles.field}>
              <Text style={styles.label}>Your Role *</Text>
              <Text style={styles.roleSubtext}>Select your role to customize your dashboard</Text>
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
                  <Text style={styles.roleDescription}>Expecting mother</Text>
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
                  <Text style={styles.roleDescription}>Healthcare provider</Text>
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
                  ]}>ASHA Worker</Text>
                  <Text style={styles.roleDescription}>Community health worker</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Show Google info if it's Google sign up */}
            {isGoogleSignUp && googleUserInfo && (
              <View style={styles.googleInfo}>
                <Text style={styles.googleInfoText}>
                  {route.params?.existingUserData ? 'Complete Your Profile' : 'Google Sign-Up'}
                </Text>
                <Text style={styles.googleInfoSubtext}>
                  {route.params?.existingUserData 
                    ? `Account: ${googleUserInfo.email} - Please complete missing details`
                    : `Account: ${googleUserInfo.email} - Complete registration below`
                  }
                </Text>
              </View>
            )}



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

            <View style={styles.field}>
              <Text style={styles.label}>Your Role *</Text>
              <Text style={styles.roleSubtext}>Select your role to customize your dashboard</Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'patient' && styles.roleButtonSelected
                  ]}
                  onPress={() => setSelectedRole('patient')}
                >
                  <Text style={styles.roleIcon}>🤱</Text>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === 'patient' && styles.roleLabelSelected
                  ]}>Patient</Text>
                  <Text style={styles.roleDescription}>Expecting mother</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'doctor' && styles.roleButtonSelected
                  ]}
                  onPress={() => setSelectedRole('doctor')}
                >
                  <Text style={styles.roleIcon}>🩺</Text>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === 'doctor' && styles.roleLabelSelected
                  ]}>Doctor</Text>
                  <Text style={styles.roleDescription}>Healthcare provider</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'asha' && styles.roleButtonSelected
                  ]}
                  onPress={() => setSelectedRole('asha')}
                >
                  <Text style={styles.roleIcon}>👩‍⚕️</Text>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === 'asha' && styles.roleLabelSelected
                  ]}>ASHA Worker</Text>
                  <Text style={styles.roleDescription}>Community health worker</Text>
                </TouchableOpacity>
              </View>
            </View>

            {renderRoleSpecificFields()}

            {isGoogleSignUp && (
              <View style={styles.googleInfo}>
                <Text style={styles.googleInfoText}>
                  ✅ Signed in with Google as {googleUserInfo?.name}
                </Text>
                <Text style={styles.googleInfoSubtext}>
                  Complete your profile details below
                </Text>
              </View>
            )}

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
  roleSubtext: {
    fontSize: 13,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
  },
  roleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    minHeight: 100,
    justifyContent: 'center',
  },
  roleButtonSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.primaryLight + '20',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  roleLabelSelected: {
    color: palette.primary,
  },
  roleDescription: {
    fontSize: 11,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  googleInfo: {
    backgroundColor: '#E8F5E8',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  googleInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D2E',
    textAlign: 'center',
  },
  googleInfoSubtext: {
    fontSize: 12,
    color: '#2E7D2E',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default RegisterScreen;
