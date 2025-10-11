import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {palette, spacing, radii} from '../theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  rightAccessory?: React.ReactNode;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  rightAccessory,
}) => {
  const {name, role} = useAuth();
  const initials =
    name
      ?.split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('') ?? 'LB';

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {actionLabel && onActionPress ? (
          <TouchableOpacity
            onPress={onActionPress}
            accessibilityRole="button"
            style={styles.cta}>
            <Text style={styles.ctaLabel}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.rightSection}>
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{name ?? 'Guest User'}</Text>
            {role ? (
              <Text style={styles.profileRole}>{role}</Text>
            ) : (
              <Text style={styles.profileRole}>Choose a role</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  leftSection: {
    flexShrink: 1,
    paddingRight: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: palette.textOnDark,
    opacity: 0.8,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
  },
  ctaLabel: {
    color: palette.primary,
    fontWeight: '700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessory: {
    marginRight: spacing.sm,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#112A54',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#1F3D6F',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  profileText: {
    justifyContent: 'center',
  },
  profileName: {
    fontWeight: '700',
    color: palette.textOnDark,
  },
  profileRole: {
    fontSize: 12,
    color: palette.textOnDark,
    opacity: 0.7,
  },
});

export default AppHeader;
