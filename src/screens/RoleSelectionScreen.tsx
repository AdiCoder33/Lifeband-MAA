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
  color: string;
}[] = [
  {
    role: 'ASHA',
    description: 'Capture vitals, sync devices, and triage escalations in the field.',
    highlights: ['Quick scan & connect', 'Offline capture', 'Sync to doctors'],
    color: '#7AA6F8',
  },
  {
    role: 'Doctor',
    description:
      'Review dashboards, monitor risk alerts, and coordinate clinical interventions.',
    highlights: ['Live risk feed', 'Patient drill-downs', 'Care summaries'],
    color: '#F9AB00',
  },
  {
    role: 'Patient',
    description:
      'Track shared vitals, understand demo charts, and follow guided care plans.',
    highlights: ['Vitals overview', 'Demo charts', 'Care tips'],
    color: '#7CE3B1',
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
          title={`Welcome${name ? `, ${name}` : ''}`}
          subtitle="Choose how you want to explore LifeBand today."
          rightAccessory={
            <TouchableOpacity
              onPress={logout}
              style={styles.logoutButton}
              accessibilityRole="button">
              <Text style={styles.logoutLabel}>Sign out</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.metaCard}>
          <View>
            <Text style={styles.metaTitle}>Your credentials</Text>
            <Text style={styles.metaCopy}>
              Signed in with {email ?? identifier ?? 'your ID'}. Switch roles any time without logging out.
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
                  <Text style={[styles.roleAvatarLabel, {color: item.color}]}>
                    {item.role.charAt(0)}
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
    padding: spacing.lg,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.surface,
  },
  logoutLabel: {
    color: palette.textOnDark,
    fontWeight: '600',
  },
  metaCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  metaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  metaCopy: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: palette.textSecondary,
    maxWidth: 260,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badge: {
    marginLeft: spacing.md,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  badgeValue: {
    marginTop: 2,
    fontWeight: '700',
    color: palette.textPrimary,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  roleAvatarLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  roleDescription: {
    color: palette.textSecondary,
    fontSize: 14,
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
