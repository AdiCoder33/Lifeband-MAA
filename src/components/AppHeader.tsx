import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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
  const navigation = useNavigation();
  const {name, role, logout} = useAuth();
  const initials = useMemo(() => {
    if (!name || typeof name !== 'string') return 'LB';
    
    try {
      return name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() || '')
        .slice(0, 2)
        .join('') || 'LB';
    } catch (error) {
      return 'LB';
    }
  }, [name]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const handleProfilePress = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleViewProfile = () => {
    setShowProfileMenu(false);
    // Navigate to Profile screen within the current stack
    navigation.navigate('Profile' as never);
  };

  const handleSignOut = () => {
    setShowProfileMenu(false);
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

  return (
    <>
      {showProfileMenu && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        />
      )}
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
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.profile}
            onPress={handleProfilePress}
            accessibilityRole="button"
            accessibilityLabel="View profile menu">
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
          
          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleViewProfile}>
                <Text style={styles.menuItemText}>👤 View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={handleSignOut}>
                <Text style={[styles.menuItemText, styles.signOutText]}>🚪 Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 70,
    zIndex: 1001,
  },
  leftSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: palette.textPrimary,
    flexWrap: 'wrap',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: palette.textSecondary,
    flexWrap: 'wrap',
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
  profileContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  profile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  profileText: {
    justifyContent: 'center',
    maxWidth: 80,
  },
  profileName: {
    fontWeight: '600',
    color: palette.textPrimary,
    fontSize: 12,
  },
  profileRole: {
    fontSize: 10,
    color: palette.textSecondary,
  },
  profileMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 150,
    borderWidth: 1,
    borderColor: palette.border,
  },
  menuItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  signOutText: {
    color: palette.danger,
  },
});

export default AppHeader;
