import React, {useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {palette, spacing, radii} from '../theme';

type DoctorSideDrawerProps = {
  onClose?: () => void;
  onNavigate?: (screen: string) => void;
};

export const DoctorSideDrawer: React.FC<DoctorSideDrawerProps> = ({
  onClose,
  onNavigate,
}) => {
  const navigation = useNavigation();
  const {name, role, logout} = useAuth();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('dashboard');

  const initials = useMemo(() => {
    if (!name || typeof name !== 'string') return 'DR';
    
    try {
      return name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() || '')
        .slice(0, 2)
        .join('') || 'DR';
    } catch (error) {
      return 'DR';
    }
  }, [name]);

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Doctor Dashboard',
      icon: 'DB',
      description: 'Your medical practice overview',
      onPress: () => {
        setSelectedMenuItem('dashboard');
        navigation.navigate('DoctorOverview' as never);
        onNavigate?.('DoctorOverview');
        onClose?.();
      },
    },
    {
      id: 'patients',
      title: 'Patient Management',
      icon: 'PT',
      description: 'Manage your patient roster',
      onPress: () => {
        setSelectedMenuItem('patients');
        navigation.navigate('PatientManagement' as never);
        onNavigate?.('PatientManagement');
        onClose?.();
      },
    },
    {
      id: 'doctor-invites',
      title: 'Doctor QR Invites',
      icon: 'QR',
      description: 'Generate patient QR codes',
      onPress: () => {
        setSelectedMenuItem('doctor-invites');
        navigation.navigate('DoctorInvites' as never);
        onNavigate?.('DoctorInvites');
        onClose?.();
      },
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: 'AP',
      description: 'View & manage appointments',
      onPress: () => {
        setSelectedMenuItem('appointments');
        navigation.navigate('DoctorAppointments' as never);
        onNavigate?.('DoctorAppointments');
        onClose?.();
      },
    },
    {
      id: 'schedule',
      title: 'My Schedule',
      icon: 'SC',
      description: 'Your daily schedule & availability',
      onPress: () => {
        setSelectedMenuItem('schedule');
        navigation.navigate('DoctorSchedule' as never);
        onNavigate?.('DoctorSchedule');
        onClose?.();
      },
    },
    {
      id: 'analytics',
      title: 'Medical Analytics',
      icon: 'AN',
      description: 'Patient data & health trends',
      onPress: () => {
        setSelectedMenuItem('analytics');
        navigation.navigate('DoctorAnalytics' as never);
        onNavigate?.('DoctorAnalytics');
        onClose?.();
      },
    },
    {
      id: 'research',
      title: 'Research & Studies',
      icon: 'RS',
      description: 'Clinical research data',
      onPress: () => {
        setSelectedMenuItem('research');
        Alert.alert('Research & Studies', 'Clinical research portal - coming soon');
        onClose?.();
      },
    },
    {
      id: 'guidelines',
      title: 'Medical Guidelines',
      icon: 'GL',
      description: 'Treatment protocols & guidelines',
      onPress: () => {
        setSelectedMenuItem('guidelines');
        Alert.alert('Medical Guidelines', 'Treatment guidelines database - coming soon');
        onClose?.();
      },
    },
    {
      id: 'education',
      title: 'Medical Education',
      icon: 'ED',
      description: 'CME courses & medical updates',
      onPress: () => {
        setSelectedMenuItem('education');
        Alert.alert('Medical Education', 'Continuing education portal - coming soon');
        onClose?.();
      },
    },
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: 'PF',
      description: 'Account settings & preferences',
      onPress: () => {
        setSelectedMenuItem('profile');
        navigation.navigate('Profile' as never);
        onNavigate?.('Profile');
        onClose?.();
      },
    },
  ];

  const quickActions = [
    {
      id: 'emergency',
      title: 'Emergency Alert',
      icon: 'ðŸš¨',
      color: palette.danger,
      onPress: () => {
        Alert.alert('Emergency Protocol', 'Emergency response system activated');
        onClose?.();
      },
    },
    {
      id: 'new-patient',
      title: 'Add Patient',
      icon: 'ðŸ‘¤',
      color: palette.primary,
      onPress: () => {
        Alert.alert('Add Patient', 'New patient registration form');
        onClose?.();
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Dr. {name?.split(' ')[0] || 'Doctor'}
            </Text>
            <Text style={styles.profileRole}>{role || 'Medical Professional'}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Ã—</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, {borderColor: action.color}]}
                onPress={action.onPress}>
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={[styles.quickActionText, {color: action.color}]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medical Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>12</Text>
              <Text style={styles.summaryLabel}>Patients Today</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>Pending Reports</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>7</Text>
              <Text style={styles.summaryLabel}>Follow-ups</Text>
            </View>
          </View>
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Practice</Text>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                selectedMenuItem === item.id && styles.selectedMenuItem,
              ]}
              onPress={item.onPress}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <View style={styles.menuItemTextContainer}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      selectedMenuItem === item.id && styles.selectedMenuItemText,
                    ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuItemDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Text style={styles.menuItemArrow}>â€º</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional</Text>
          <View style={styles.professionalCard}>
            <Text style={styles.professionalTitle}>License Information</Text>
            <Text style={styles.professionalInfo}>License #: MD-2024-8901</Text>
            <Text style={styles.professionalInfo}>Specialization: OB/GYN</Text>
            <Text style={styles.professionalInfo}>Hospital: Memorial Medical Center</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: palette.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    backgroundColor: palette.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textOnPrimary,
    marginBottom: spacing.xs,
  },
  profileRole: {
    fontSize: 14,
    color: palette.textOnPrimary,
    opacity: 0.9,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: palette.textOnPrimary,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
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
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: palette.maternal.sky,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  selectedMenuItem: {
    backgroundColor: palette.maternal.mint,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  selectedMenuItemText: {
    color: palette.primary,
    fontWeight: '600',
  },
  menuItemDescription: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  menuItemArrow: {
    fontSize: 18,
    color: palette.textSecondary,
    marginLeft: spacing.sm,
  },
  professionalCard: {
    backgroundColor: palette.maternal.indigo,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  professionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  professionalInfo: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  logoutButton: {
    backgroundColor: palette.danger,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textOnDark,
  },
});

export default DoctorSideDrawer;
