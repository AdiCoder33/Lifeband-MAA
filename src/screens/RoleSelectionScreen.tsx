import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenBackground from '../components/ScreenBackground';
import AppHeader from '../components/AppHeader';
import {useAuth, type UserRole} from '../context/AuthContext';
import {useAppStore} from '../store/useAppStore';
import {palette, radii, spacing} from '../theme';

const ROLES: {
  role: UserRole;
  description: string;
  highlights: string[];
  icon: string;
  color: string;
}[] = [
  {
    role: 'ASHA',
    description: 'Support expecting mothers with vital monitoring and care coordination in the community.',
    highlights: ['Maternal health checks', 'Prenatal monitoring', 'Emergency alerts'],
    icon: '👩‍⚕️',
    color: palette.primary,
  },
  {
    role: 'Doctor',
    description: 'Monitor maternal health, review pregnancy risks, and coordinate specialized care.',
    highlights: ['Pregnancy monitoring', 'Risk assessment', 'Care coordination'],
    icon: '🩺',
    color: palette.accent,
  },
  {
    role: 'Patient',
    description: 'Track your pregnancy journey, monitor baby\'s health, and follow care guidance.',
    highlights: ['Baby monitoring', 'Health tracking', 'Care reminders'],
    icon: '🤱',
    color: palette.success,
  },
];

export const RoleSelectionScreen: React.FC = () => {
  const {selectRole, logout, name, identifier, email} = useAuth();
  const setSelectedPatient = useAppStore(state => state.setSelectedPatient);

  const handleSelect = (role: UserRole) => {
    if (role === 'Patient') {
      setSelectedPatient(identifier);
    } else {
      setSelectedPatient(undefined);
    }
    selectRole(role);
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          title={`Welcome${name ? `, ${name}` : ''} 💕`}
          subtitle="Choose your role in our maternal care community."
        />

        <View style={styles.metaCard}>
          <View>
            <Text style={styles.metaTitle}>Your credentials</Text>
            <Text style={styles.metaCopy}>
              Signed in with {email ?? identifier ?? 'your ID'}. Switch between care roles anytime to support maternal health.
            </Text>
          </View>
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>ID</Text>
              <Text style={styles.badgeValue}>{identifier ?? 'N/A'}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Email</Text>
              <Text style={styles.badgeValue}>{email ?? 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rolesGrid}>
          {ROLES.map(item => (
            <TouchableOpacity
              key={item.role}
              style={[styles.roleCard, {borderColor: item.color}]}
              onPress={() => handleSelect(item.role)}
              accessibilityRole="button">
              <View style={styles.roleHeader}>
                <View
                  style={[
                    styles.roleAvatar,
                    {backgroundColor: `${item.color}33`},
                  ]}>
                  <Text style={styles.roleAvatarEmoji}>
                    {item.icon}
                  </Text>
                </View>
                <Text style={styles.roleTitle}>{item.role}</Text>
              </View>
              <Text style={styles.roleDescription}>{item.description}</Text>
              <View style={styles.roleHighlights}>
                {item.highlights.map(highlight => (
                  <View key={highlight} style={styles.highlightPill}>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  metaCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    flexDirection: 'column',
    shadowColor: palette.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  metaCopy: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
    color: palette.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  badge: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  badgeValue: {
    marginTop: 2,
    fontWeight: '700',
    color: palette.textPrimary,
    fontSize: 12,
  },
  rolesGrid: {
    marginTop: spacing.xl,
  },
  roleCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  roleAvatarLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  roleAvatarEmoji: {
    fontSize: 20,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    flex: 1,
  },
  roleDescription: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  roleHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  highlightPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceSoft,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
  },
});

export default RoleSelectionScreen;
