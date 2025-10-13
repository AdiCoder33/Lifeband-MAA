import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {palette, spacing, radii} from '../theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  rightAccessory?: React.ReactNode;
  isConnected?: boolean;
  onBandPress?: () => void;
  showDrawerButton?: boolean;
  onDrawerPress?: () => void;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  rightAccessory,
  isConnected,
  onBandPress,
  showDrawerButton = false,
  onDrawerPress,
}) => {
  const navigation = useNavigation();
  const { name, role, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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



  const handleProfilePress = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleViewProfile = () => {
    setShowProfileMenu(false);
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

  const handleDrawerToggle = () => {
    if (onDrawerPress) {
      onDrawerPress();
    }
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.leftSection}>
          {showDrawerButton && (
            <TouchableOpacity 
              style={styles.drawerButton}
              onPress={handleDrawerToggle}
              accessibilityRole="button"
              accessibilityLabel="Open menu">
              <Text style={styles.drawerIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {typeof isConnected !== 'undefined' && (
              <View style={styles.connectionStatus}>
                <View style={[styles.connectionDot, isConnected ? styles.connectedDot : styles.disconnectedDot]} />
                <Text style={[styles.connectionText, isConnected ? styles.connectedText : styles.disconnectedText]}>
                  {isConnected ? 'LifeBand Connected' : 'LifeBand Disconnected'}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          {actionLabel && onActionPress && (
            <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
          {rightAccessory}
          
          {/* Band Connection Button - Scan/Connect Action */}
          {typeof isConnected !== 'undefined' && onBandPress && (
            <TouchableOpacity 
              style={[styles.bandActionButton, !isConnected && styles.bandActionHighlight]}
              onPress={onBandPress}>
              <Text style={styles.bandActionIcon}>{isConnected ? '⚙️' : '📡'}</Text>
            </TouchableOpacity>
          )}
          
          {/* Profile Section */}
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
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{name || 'LifeBand User'}</Text>
                  <Text style={styles.profileRole}>{role || 'User'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleViewProfile}>
                  <Text style={styles.menuIcon}>👤</Text>
                  <Text style={styles.menuItemText}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={handleSignOut}>
                  <Text style={styles.menuIcon}>🚪</Text>
                  <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 65,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1001,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerButton: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  drawerIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textOnPrimary,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    color: palette.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    color: palette.textSecondary,
    fontWeight: '500',
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    shadowColor: palette.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
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
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: palette.textOnPrimary,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  profileMenu: {
    position: 'absolute',
    top: 55,
    right: 0,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    minWidth: 200,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  profileInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.backgroundSoft,
  },
  profileName: {
    fontWeight: '700',
    color: palette.textPrimary,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  profileRole: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: palette.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  signOutText: {
    color: palette.danger,
    fontWeight: '700',
  },
  // Band connection button styles
  bandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  bandConnected: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  bandDisconnected: {
    backgroundColor: palette.warning,
    borderColor: palette.warning,
  },
  bandIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  bandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bandTextConnected: {
    color: palette.textOnPrimary,
  },
  bandTextDisconnected: {
    color: palette.textOnPrimary,
  },
  // Connection status in title area
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: radii.sm,
    marginRight: spacing.xs,
  },
  connectedDot: {
    backgroundColor: palette.success,
  },
  disconnectedDot: {
    backgroundColor: palette.warning,
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  connectedText: {
    color: palette.success,
  },
  disconnectedText: {
    color: palette.warning,
  },
  // Band action button (scan/settings)
  bandActionButton: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bandActionHighlight: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  bandActionIcon: {
    fontSize: 16,
    color: palette.textSecondary,
  },
});

export default AppHeader;
