import React, {useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {palette, spacing, radii} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type SideDrawerProps = {
  isConnected?: boolean;
  onBandPress?: () => void;
  onClose?: () => void;
  onNavigate?: (screenName: string) => void;
};

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isConnected,
  onBandPress,
  onClose,
  onNavigate,
}) => {
  const navigation = useNavigation();
  const {name, role, logout} = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);

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

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Mother Dashboard',
      icon: '🏠',
      description: 'Your maternal health overview',
      onPress: () => {
        setSelectedMenuItem('dashboard');
        navigation.navigate('PatientHome' as never);
        onNavigate?.('PatientHome');
        onClose?.();
      },
    },
    {
      id: 'care-team',
      title: 'My Care Team',
      icon: '👩‍⚕️',
      description: 'Link doctors & view monthly reports',
      onPress: () => {
        setSelectedMenuItem('care-team');
        navigation.navigate('LinkDoctor' as never);
        onNavigate?.('LinkDoctor');
        onClose?.();
      },
    },
    {
      id: 'appointments',
      title: 'My Appointments',
      icon: '📅',
      description: 'View & schedule medical visits',
      onPress: () => {
        setSelectedMenuItem('appointments');
        navigation.navigate('Appointments' as never);
        onNavigate?.('Appointments');
        onClose?.();
      },
    },
    {
      id: 'analytics',
      title: 'Health Analytics',
      icon: '📊',
      description: 'Detailed health insights & trends',
      onPress: () => {
        setSelectedMenuItem('analytics');
        navigation.navigate('Analytics' as never);
        onNavigate?.('Analytics');
        onClose?.();
      },
    },
    {
      id: 'medicine',
      title: 'Medicine Tracker',
      icon: '💊',
      description: 'Track medications & supplements',
      onPress: () => {
        setSelectedMenuItem('medicine');
        navigation.navigate('MedicineTracker' as never);
        onNavigate?.('MedicineTracker');
        onClose?.();
      },
    },
    {
      id: 'nutrition',
      title: 'Nutrition Guide',
      icon: '🥗',
      description: 'Pregnancy nutrition & meal plans',
      onPress: () => {
        setSelectedMenuItem('nutrition');
        navigation.navigate('NutritionGuide' as never);
        onNavigate?.('NutritionGuide');
        onClose?.();
      },
    },
    {
      id: 'exercise',
      title: 'Prenatal Exercise',
      icon: '🧘',
      description: 'Safe exercises for pregnancy',
      onPress: () => {
        setSelectedMenuItem('exercise');
        navigation.navigate('PrenatalExercise' as never);
        onNavigate?.('PrenatalExercise');
        onClose?.();
      },
    },
    {
      id: 'baby-development',
      title: 'Baby Development',
      icon: '👶',
      description: 'Track your baby\'s growth',
      onPress: () => {
        setSelectedMenuItem('baby-development');
        navigation.navigate('BabyDevelopment' as never);
        onNavigate?.('BabyDevelopment');
        onClose?.();
      },
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: '📞',
      description: 'Quick access to emergency help',
      onPress: () => {
        setSelectedMenuItem('emergency');
        navigation.navigate('EmergencyContacts' as never);
        onNavigate?.('EmergencyContacts');
        onClose?.();
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      description: 'App preferences & account',
      onPress: () => {
        setSelectedMenuItem('settings');
        navigation.navigate('Settings' as never);
        onNavigate?.('Settings');
        onClose?.();
      },
    },
  ];

  const quickActions = [
    {
      id: 'scan',
      title: 'Scan LifeBand',
      icon: '📡',
      color: palette.primary,
      onPress: onBandPress,
    },
    {
      id: 'emergency-call',
      title: 'Emergency Call',
      icon: '🚨',
      color: palette.danger,
      onPress: () => {
        Alert.alert(
          'Emergency Call',
          'This will call your primary emergency contact.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Call Now', style: 'destructive', onPress: () => {}},
          ]
        );
      },
    },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              {typeof isConnected !== 'undefined' && (
                <View
                  style={[
                    styles.connectionIndicator,
                    isConnected
                      ? styles.connectedIndicator
                      : styles.disconnectedIndicator,
                  ]}
                />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{name || 'LifeBand User'}</Text>
              <Text style={styles.userRole}>
                {role === 'ASHA' ? 'ASHA Worker' : 'Patient'}
              </Text>
              {typeof isConnected !== 'undefined' && (
                <View style={styles.connectionStatus}>
                  <View
                    style={[
                      styles.connectionDot,
                      isConnected ? styles.connectedDot : styles.disconnectedDot,
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectionText,
                      isConnected
                        ? styles.connectedText
                        : styles.disconnectedText,
                    ]}>
                    {isConnected ? 'LifeBand Connected' : 'LifeBand Disconnected'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionButton,
                  {backgroundColor: `${action.color}15`},
                ]}
                onPress={action.onPress}>
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text
                  style={[styles.quickActionText, {color: action.color}]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                selectedMenuItem === item.id && styles.selectedMenuItem,
              ]}
              onPress={item.onPress}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <View style={styles.menuItemTexts}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>{''}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.healthSummary}>
            <View style={styles.healthMetric}>
              <Text style={styles.healthMetricIcon}>{'\u2764\uFE0F'}</Text>
              <Text style={styles.healthMetricLabel}>Heart Rate</Text>
              <Text style={styles.healthMetricValue}>72 BPM</Text>
            </View>
            <View style={styles.healthMetric}>
              <Text style={styles.healthMetricIcon}>{'\uD83D\uDC63'}</Text>
              <Text style={styles.healthMetricLabel}>Steps</Text>
              <Text style={styles.healthMetricValue}>8,432</Text>
            </View>
            <View style={styles.healthMetric}>
              <Text style={styles.healthMetricIcon}>{':)'}</Text>
              <Text style={styles.healthMetricLabel}>Stress Level</Text>
              <Text style={styles.healthMetricValue}>Low</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.profileButton} onPress={() => {
          navigation.navigate('Profile' as never);
          onNavigate?.('Profile');
          onClose?.();
        }}>
          <Text style={styles.profileButtonIcon}>👤</Text>
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonIcon}>🚪</Text>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.surface,
    width: SCREEN_WIDTH * 0.85,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: palette.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.primary,
  },
  connectionIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: palette.surface,
  },
  connectedIndicator: {
    backgroundColor: palette.success,
  },
  disconnectedIndicator: {
    backgroundColor: palette.danger,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.surface,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: palette.surface,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: palette.danger,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  connectedText: {
    color: palette.surface,
  },
  disconnectedText: {
    color: palette.surface,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuItem: {
    backgroundColor: palette.background,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  selectedMenuItem: {
    backgroundColor: `${palette.primary}10`,
    borderColor: palette.primary,
    borderWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  menuItemTexts: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: palette.textSecondary,
    marginLeft: spacing.sm,
  },
  healthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthMetric: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  healthMetricIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  healthMetricLabel: {
    fontSize: 10,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  healthMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginRight: spacing.xs,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileButtonIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  signOutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginLeft: spacing.xs,
    backgroundColor: `${palette.danger}15`,
    borderRadius: radii.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutButtonIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.danger,
  },
});
