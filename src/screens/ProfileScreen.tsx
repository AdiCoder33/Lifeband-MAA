import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../components/ScreenBackground';
import AppHeader from '../components/AppHeader';
import {useAuth} from '../context/AuthContext';
import {palette, radii, spacing} from '../theme';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const {name, identifier, email, role, logout} = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const profileData = [
    {
      label: 'Full Name',
      value: name || 'Not provided',
      icon: '👤',
    },
    {
      label: 'Role',
      value: role || 'No role selected',
      icon: role === 'Doctor' ? '🩺' : role === 'ASHA' ? '👩‍⚕️' : role === 'Patient' ? '🤱' : '👤',
    },
    {
      label: 'ID/Staff Number',
      value: identifier || 'Not provided',
      icon: '🆔',
    },
    {
      label: 'Email Address',
      value: email || 'Not provided',
      icon: '📧',
    },
  ];

  const roleSpecificInfo = () => {
    switch (role) {
      case 'Doctor':
        return {
          title: 'Medical Professional',
          description: 'Providing specialized maternal and newborn care',
          features: [
            'Monitor high-risk pregnancies',
            'Review patient health data',
            'Coordinate care with ASHA workers',
            'Make clinical decisions',
          ],
        };
      case 'ASHA':
        return {
          title: 'Community Health Worker',
          description: 'Supporting maternal health in the community',
          features: [
            'Conduct health screenings',
            'Provide prenatal education',
            'Connect mothers to healthcare',
            'Monitor community health',
          ],
        };
      case 'Patient':
        return {
          title: 'Expecting Mother',
          description: 'Tracking your pregnancy journey',
          features: [
            'Monitor baby\'s development',
            'Track health measurements',
            'Receive care reminders',
            'Connect with healthcare team',
          ],
        };
      default:
        return {
          title: 'LifeBand User',
          description: 'Welcome to maternal care monitoring',
          features: [
            'Choose your role to get started',
            'Access personalized features',
            'Connect with care team',
            'Monitor health data',
          ],
        };
    }
  };

  const roleInfo = roleSpecificInfo();

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          title="My Profile"
          subtitle="Your account and role information"
          rightAccessory={
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button">
              <Text style={styles.backButtonText}>Done</Text>
            </TouchableOpacity>
          }
        />

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {(() => {
                  try {
                    if (!name || typeof name !== 'string') return 'LB';
                    return name.split(' ').map(n => n[0] || '').join('').toUpperCase() || 'LB';
                  } catch {
                    return 'LB';
                  }
                })()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name || 'Guest User'}</Text>
              <Text style={styles.profileSubtitle}>{roleInfo.title}</Text>
            </View>
          </View>
          <Text style={styles.profileDescription}>{roleInfo.description}</Text>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {profileData.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailIcon}>{item.icon}</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Role Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Features</Text>
          <View style={styles.featuresCard}>
            {roleInfo.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityRole="button">
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
  },
  backButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
  profileCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileAvatarText: {
    color: palette.textOnPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  profileSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  profileDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textSecondary,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textPrimary,
    marginTop: 2,
  },
  featuresCard: {
    padding: spacing.md,
    backgroundColor: palette.maternal.cream,
    borderRadius: radii.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  featureBullet: {
    fontSize: 16,
    color: palette.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: palette.textPrimary,
  },
  actionsSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  signOutButton: {
    backgroundColor: palette.danger,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutButtonText: {
    color: palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;