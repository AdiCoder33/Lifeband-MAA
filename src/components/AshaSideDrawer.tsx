import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {palette, spacing, radii} from '../theme';

interface AshaSideDrawerProps {
  onClose: () => void;
}

const AshaSideDrawer: React.FC<AshaSideDrawerProps> = ({onClose}) => {
  const handleNavigation = (screen: string) => {
    onClose();
    // Navigation will be implemented when we integrate with navigation
    Alert.alert('Navigation', `Navigating to ${screen}`);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'emergency_contact':
        Alert.alert('Emergency Contact', 'Contacting emergency services...');
        break;
      case 'report_issue':
        Alert.alert('Report Issue', 'Opening issue reporting form...');
        break;
      case 'sync_data':
        Alert.alert('Sync Data', 'Syncing community health data...');
        break;
      case 'offline_mode':
        Alert.alert('Offline Mode', 'Switching to offline mode...');
        break;
    }
  };

  const communityFeatures = [
    {
      id: 'maternal_visits',
      title: '🤱 Maternal Visits',
      description: 'Schedule and track home visits',
      screen: 'MaternalVisits',
      badge: '12 pending',
    },
    {
      id: 'health_education',
      title: '📚 Health Education',
      description: 'Community health programs',
      screen: 'HealthEducation',
      badge: 'New content',
    },
    {
      id: 'vaccination_drive',
      title: '💉 Vaccination Drive',
      description: 'Immunization campaigns',
      screen: 'VaccinationDrive',
      badge: '3 upcoming',
    },
    {
      id: 'nutrition_program',
      title: '🥗 Nutrition Program',
      description: 'Maternal & child nutrition',
      screen: 'NutritionProgram',
    },
    {
      id: 'birth_registration',
      title: '👶 Birth Registration',
      description: 'Register newborn births',
      screen: 'BirthRegistration',
      badge: '5 pending',
    },
    {
      id: 'family_planning',
      title: '👨‍👩‍👧‍👦 Family Planning',
      description: 'Family planning counseling',
      screen: 'FamilyPlanning',
    },
  ];

  const dataManagement = [
    {
      id: 'patient_records',
      title: '📋 Patient Records',
      description: 'Community health records',
      screen: 'PatientRecords',
    },
    {
      id: 'health_surveys',
      title: '📊 Health Surveys',
      description: 'Community health assessments',
      screen: 'HealthSurveys',
    },
    {
      id: 'referral_tracking',
      title: '🏥 Referral Tracking',
      description: 'Track medical referrals',
      screen: 'ReferralTracking',
      badge: '8 active',
    },
    {
      id: 'medicine_distribution',
      title: '💊 Medicine Distribution',
      description: 'Track medicine supplies',
      screen: 'MedicineDistribution',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{uri: 'https://via.placeholder.com/60x60/10B981/FFFFFF?text=AS'}}
              style={styles.avatar}
            />
            <View style={styles.statusIndicator} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>ASHA Devi</Text>
            <Text style={styles.userRole}>Community Health Worker</Text>
            <Text style={styles.userLocation}>📍 Block: Whitefield, Area: 12</Text>
            <Text style={styles.certificationInfo}>🏆 Certified ASHA • ID: ASH001</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('emergency_contact')}>
              <Text style={styles.quickActionIcon}>🚨</Text>
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('report_issue')}>
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>Report Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('sync_data')}>
              <Text style={styles.quickActionIcon}>🔄</Text>
              <Text style={styles.quickActionText}>Sync Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('offline_mode')}>
              <Text style={styles.quickActionIcon}>📱</Text>
              <Text style={styles.quickActionText}>Offline Mode</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Health Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏘️ Community Health</Text>
          {communityFeatures.map(feature => (
            <TouchableOpacity
              key={feature.id}
              style={styles.menuItem}
              onPress={() => handleNavigation(feature.screen)}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{feature.title}</Text>
                <Text style={styles.menuItemDescription}>{feature.description}</Text>
              </View>
              {feature.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{feature.badge}</Text>
                </View>
              )}
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Data Management</Text>
          {dataManagement.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              {item.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance & Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Performance</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('AshaPerformance')}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>📊 My Performance</Text>
              <Text style={styles.menuItemDescription}>View performance metrics</Text>
            </View>
            <View style={styles.performanceScore}>
              <Text style={styles.scoreText}>95%</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('CommunityStats')}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>🏘️ Community Stats</Text>
              <Text style={styles.menuItemDescription}>Community health overview</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Settings & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings & Support</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('AshaSettings')}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>⚙️ Settings</Text>
              <Text style={styles.menuItemDescription}>App preferences & config</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('Training')}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>🎓 Training & Resources</Text>
              <Text style={styles.menuItemDescription}>ASHA training materials</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>New</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('Support')}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>💬 Help & Support</Text>
              <Text style={styles.menuItemDescription}>Get help and support</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ASHA Program Information */}
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>🏥 ASHA Program</Text>
          <Text style={styles.programDescription}>
            Accredited Social Health Activist supporting community health and maternal care in rural areas.
          </Text>
          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>247</Text>
              <Text style={styles.statLabel}>Families Served</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>89</Text>
              <Text style={styles.statLabel}>Home Visits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Referrals Made</Text>
            </View>
          </View>
        </View>
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.surface,
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
    backgroundColor: palette.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.success,
    borderWidth: 2,
    borderColor: palette.card,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  userRole: {
    fontSize: 14,
    color: palette.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userLocation: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  certificationInfo: {
    fontSize: 11,
    color: palette.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 30,
    height: 30,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 16,
    color: palette.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: palette.background,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    color: palette.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  menuItemDescription: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: palette.textSecondary,
    marginLeft: spacing.sm,
  },
  badgeContainer: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontSize: 10,
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  performanceScore: {
    backgroundColor: palette.success,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  scoreText: {
    fontSize: 12,
    color: palette.textOnPrimary,
    fontWeight: 'bold',
  },
  programInfo: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  programDescription: {
    fontSize: 13,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});

export default AshaSideDrawer;