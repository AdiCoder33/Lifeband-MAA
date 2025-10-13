import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {palette, spacing, radii} from '../../theme';
import {useAuth} from '../../context/AuthContext';

const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {name, logout} = useAuth();
  
  const [notifications, setNotifications] = useState({
    medicineReminders: true,
    appointmentAlerts: true,
    healthTips: true,
    emergencyAlerts: true,
    bandDisconnect: true,
  });
  
  const [privacy, setPrivacy] = useState({
    shareHealthData: false,
    allowLocationAccess: true,
    biometricLogin: false,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({...prev, [key]: value}));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({...prev, [key]: value}));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          icon: '👤',
          onPress: () => Alert.alert('Profile', 'Navigate to profile editing'),
        },
        {
          id: 'password',
          title: 'Change Password',
          icon: '🔒',
          onPress: () => Alert.alert('Password', 'Navigate to password change'),
        },
        {
          id: 'emergency-contacts',
          title: 'Emergency Contacts',
          icon: '🚨',
          onPress: () => Alert.alert('Emergency Contacts', 'Navigate to emergency contacts'),
        },
      ],
    },
    {
      title: 'LifeBand Settings',
      items: [
        {
          id: 'pair-device',
          title: 'Pair New Device',
          icon: '📱',
          onPress: () => Alert.alert('Pair Device', 'Navigate to device pairing'),
        },
        {
          id: 'calibrate',
          title: 'Calibrate Sensors',
          icon: '⚙️',
          onPress: () => Alert.alert('Calibrate', 'Navigate to sensor calibration'),
        },
        {
          id: 'sync-frequency',
          title: 'Data Sync Frequency',
          icon: '🔄',
          subtitle: 'Every 5 minutes',
          onPress: () => Alert.alert('Sync Frequency', 'Configure sync frequency'),
        },
      ],
    },
    {
      title: 'Health & Pregnancy',
      items: [
        {
          id: 'pregnancy-profile',
          title: 'Pregnancy Profile',
          icon: '🤱',
          onPress: () => Alert.alert('Pregnancy Profile', 'Configure pregnancy details'),
        },
        {
          id: 'health-goals',
          title: 'Health Goals',
          icon: '🎯',
          onPress: () => Alert.alert('Health Goals', 'Set health and fitness goals'),
        },
        {
          id: 'medication-list',
          title: 'Current Medications',
          icon: '💊',
          onPress: () => Alert.alert('Medications', 'Manage medication list'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & FAQ',
          icon: '❓',
          onPress: () => Alert.alert('Help', 'Open help documentation'),
        },
        {
          id: 'contact',
          title: 'Contact Support',
          icon: '📞',
          onPress: () => Alert.alert('Support', 'Contact customer support'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          icon: '💬',
          onPress: () => Alert.alert('Feedback', 'Send app feedback'),
        },
      ],
    },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Sign Out', style: 'destructive', onPress: logout},
      ]
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'LB'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name || 'LifeBand User'}</Text>
            <Text style={styles.userEmail}>Connected to LifeBand</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>💊</Text>
                <Text style={styles.toggleTitle}>Medicine Reminders</Text>
              </View>
              <Switch
                value={notifications.medicineReminders}
                onValueChange={(value) => handleNotificationChange('medicineReminders', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
            
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>📅</Text>
                <Text style={styles.toggleTitle}>Appointment Alerts</Text>
              </View>
              <Switch
                value={notifications.appointmentAlerts}
                onValueChange={(value) => handleNotificationChange('appointmentAlerts', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
            
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>💡</Text>
                <Text style={styles.toggleTitle}>Health Tips</Text>
              </View>
              <Switch
                value={notifications.healthTips}
                onValueChange={(value) => handleNotificationChange('healthTips', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
            
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>🚨</Text>
                <Text style={styles.toggleTitle}>Emergency Alerts</Text>
              </View>
              <Switch
                value={notifications.emergencyAlerts}
                onValueChange={(value) => handleNotificationChange('emergencyAlerts', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
            
            <View style={[styles.toggleItem, styles.lastToggleItem]}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>📡</Text>
                <Text style={styles.toggleTitle}>Band Disconnect Alerts</Text>
              </View>
              <Switch
                value={notifications.bandDisconnect}
                onValueChange={(value) => handleNotificationChange('bandDisconnect', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.sectionContent}>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>📊</Text>
                <View>
                  <Text style={styles.toggleTitle}>Share Health Data</Text>
                  <Text style={styles.toggleSubtitle}>For medical research</Text>
                </View>
              </View>
              <Switch
                value={privacy.shareHealthData}
                onValueChange={(value) => handlePrivacyChange('shareHealthData', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
            
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>📍</Text>
                <Text style={styles.toggleTitle}>Location Access</Text>
              </View>
              <Switch
                value={privacy.allowLocationAccess}
                onValueChange={(value) => handlePrivacyChange('allowLocationAccess', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
            
            <View style={[styles.toggleItem, styles.lastToggleItem]}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>👆</Text>
                <Text style={styles.toggleTitle}>Biometric Login</Text>
              </View>
              <Switch
                value={privacy.biometricLogin}
                onValueChange={(value) => handlePrivacyChange('biometricLogin', value)}
                trackColor={{false: palette.border, true: palette.primary}}
              />
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastSettingItem
                  ]}
                  onPress={item.onPress}>
                  <View style={styles.settingLeft}>
                    <Text style={styles.settingIcon}>{item.icon}</Text>
                    <View style={styles.settingTexts}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutIcon}>🚪</Text>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>LifeBand Maternal Care v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollView: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: palette.surface,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textOnPrimary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: palette.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  lastToggleItem: {
    borderBottomWidth: 0,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  toggleTitle: {
    fontSize: 16,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 18,
    color: palette.textSecondary,
    marginLeft: spacing.sm,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.danger}15`,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.danger,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  versionText: {
    fontSize: 12,
    color: palette.textSecondary,
  },
});

export default SettingsScreen;