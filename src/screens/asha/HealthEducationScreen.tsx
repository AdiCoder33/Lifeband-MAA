import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type EducationProgram = {
  id: string;
  title: string;
  description: string;
  category: 'maternal' | 'child' | 'general' | 'emergency';
  duration: string;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  date: string;
  materials: string[];
  targetAudience: string;
};

const HealthEducationScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const programs: EducationProgram[] = [
    {
      id: '1',
      title: 'Antenatal Care Awareness',
      description: 'Importance of regular checkups during pregnancy',
      category: 'maternal',
      duration: '2 hours',
      participants: 25,
      status: 'upcoming',
      date: '2024-01-18',
      materials: ['Pregnancy care handbook', 'Nutrition charts', 'Exercise videos'],
      targetAudience: 'Pregnant women and families',
    },
    {
      id: '2',
      title: 'Child Immunization Drive',
      description: 'Complete vaccination schedule for children',
      category: 'child',
      duration: '3 hours',
      participants: 40,
      status: 'ongoing',
      date: '2024-01-15',
      materials: ['Vaccination cards', 'Information brochures', 'Schedule charts'],
      targetAudience: 'Mothers with children under 2 years',
    },
    {
      id: '3',
      title: 'Nutrition for Mother & Child',
      description: 'Balanced diet during pregnancy and breastfeeding',
      category: 'maternal',
      duration: '1.5 hours',
      participants: 30,
      status: 'completed',
      date: '2024-01-10',
      materials: ['Nutrition guide', 'Recipe cards', 'Food charts'],
      targetAudience: 'Pregnant and lactating mothers',
    },
    {
      id: '4',
      title: 'Emergency Preparedness',
      description: 'What to do during medical emergencies',
      category: 'emergency',
      duration: '1 hour',
      participants: 50,
      status: 'upcoming',
      date: '2024-01-20',
      materials: ['Emergency contact list', 'First aid guide', 'Action cards'],
      targetAudience: 'All community members',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maternal':
        return palette.primary;
      case 'child':
        return palette.success;
      case 'general':
        return palette.info;
      case 'emergency':
        return palette.danger;
      default:
        return palette.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return palette.info;
      case 'ongoing':
        return palette.warning;
      case 'completed':
        return palette.success;
      default:
        return palette.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maternal':
        return '🤱';
      case 'child':
        return '👶';
      case 'general':
        return '🏥';
      case 'emergency':
        return '🚨';
      default:
        return '📚';
    }
  };

  const filteredPrograms = programs.filter(program => 
    selectedCategory === 'all' || program.category === selectedCategory
  );

  const stats = {
    upcoming: programs.filter(p => p.status === 'upcoming').length,
    ongoing: programs.filter(p => p.status === 'ongoing').length,
    completed: programs.filter(p => p.status === 'completed').length,
    totalParticipants: programs.reduce((sum, p) => sum + p.participants, 0),
  };

  const handleProgramAction = (program: EducationProgram, action: string) => {
    switch (action) {
      case 'start':
        Alert.alert('Start Program', `Start "${program.title}" session?`);
        break;
      case 'complete':
        Alert.alert('Complete Program', `Mark "${program.title}" as completed?`);
        break;
      case 'materials':
        Alert.alert('Materials', `Download materials for "${program.title}"`);
        break;
      case 'attendance':
        Alert.alert('Attendance', `Mark attendance for "${program.title}"`);
        break;
      case 'feedback':
        Alert.alert('Feedback', `Collect feedback for "${program.title}"`);
        break;
    }
  };

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.info}]}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.warning}]}>{stats.ongoing}</Text>
            <Text style={styles.statLabel}>Ongoing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.success}]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.primary}]}>{stats.totalParticipants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>📚 Education Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
            {(['all', 'maternal', 'child', 'general', 'emergency'] as const).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text style={styles.categoryIcon}>
                  {category === 'all' ? '📚' : getCategoryIcon(category)}
                </Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.activeCategoryButtonText,
                  ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('New Program', 'Create a new health education program')}>
            <Text style={styles.actionButtonText}>➕ New Program</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Resources', 'Download education materials')}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>📄 Resources</Text>
          </TouchableOpacity>
        </View>

        {/* Programs List */}
        <View style={styles.programsSection}>
          <Text style={styles.sectionTitle}>📚 Health Education Programs</Text>
          
          {filteredPrograms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📚</Text>
              <Text style={styles.emptyStateTitle}>No Programs Found</Text>
              <Text style={styles.emptyStateDescription}>
                {selectedCategory === 'all' 
                  ? 'No education programs available'
                  : `No ${selectedCategory} programs found`}
              </Text>
            </View>
          ) : (
            filteredPrograms.map(program => (
              <View key={program.id} style={styles.programCard}>
                <View style={styles.programHeader}>
                  <View style={styles.programInfo}>
                    <View style={styles.programTitleRow}>
                      <Text style={styles.programIcon}>{getCategoryIcon(program.category)}</Text>
                      <Text style={styles.programTitle}>{program.title}</Text>
                    </View>
                    <Text style={styles.programDescription}>{program.description}</Text>
                    <Text style={styles.programTarget}>👥 {program.targetAudience}</Text>
                  </View>
                  
                  <View style={styles.programMeta}>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusColor(program.status)},
                      ]}>
                      <Text style={styles.badgeText}>{program.status}</Text>
                    </View>
                    
                    <View
                      style={[
                        styles.categoryBadge,
                        {backgroundColor: getCategoryColor(program.category)},
                      ]}>
                      <Text style={styles.badgeText}>{program.category}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.programDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>Date: {program.date}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={styles.detailText}>Duration: {program.duration}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>👥</Text>
                    <Text style={styles.detailText}>Participants: {program.participants}</Text>
                  </View>
                </View>
                
                <View style={styles.materialsContainer}>
                  <Text style={styles.materialsLabel}>📋 Materials:</Text>
                  <View style={styles.materialsGrid}>
                    {program.materials.map((material, index) => (
                      <View key={index} style={styles.materialTag}>
                        <Text style={styles.materialText}>{material}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.programActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.materialsBtn]}
                    onPress={() => handleProgramAction(program, 'materials')}>
                    <Text style={styles.actionBtnText}>📄 Materials</Text>
                  </TouchableOpacity>
                  
                  {program.status === 'upcoming' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.startBtn]}
                      onPress={() => handleProgramAction(program, 'start')}>
                      <Text style={styles.actionBtnText}>▶️ Start</Text>
                    </TouchableOpacity>
                  )}
                  
                  {program.status === 'ongoing' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.attendanceBtn]}
                        onPress={() => handleProgramAction(program, 'attendance')}>
                        <Text style={styles.actionBtnText}>✅ Attendance</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.completeBtn]}
                        onPress={() => handleProgramAction(program, 'complete')}>
                        <Text style={styles.actionBtnText}>🏁 Complete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {program.status === 'completed' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.feedbackBtn]}
                      onPress={() => handleProgramAction(program, 'feedback')}>
                      <Text style={styles.actionBtnText}>💬 Feedback</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Educational Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>📖 Educational Resources</Text>
          
          <View style={styles.resourcesGrid}>
            <TouchableOpacity style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>🤱</Text>
              <Text style={styles.resourceTitle}>Maternal Health Guide</Text>
              <Text style={styles.resourceDescription}>Comprehensive pregnancy care</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>👶</Text>
              <Text style={styles.resourceTitle}>Child Care Manual</Text>
              <Text style={styles.resourceDescription}>Newborn to 5 years care</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>🥗</Text>
              <Text style={styles.resourceTitle}>Nutrition Charts</Text>
              <Text style={styles.resourceDescription}>Balanced diet guidelines</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>🚨</Text>
              <Text style={styles.resourceTitle}>Emergency Protocols</Text>
              <Text style={styles.resourceDescription}>Crisis management steps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  statCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  filtersSection: {
    marginBottom: spacing.lg,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  categoryFilters: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  activeCategoryButton: {
    backgroundColor: palette.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  categoryButtonText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: palette.textOnPrimary,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: palette.card,
  },
  actionButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: palette.textPrimary,
  },
  programsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  programCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  programInfo: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  programIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1,
  },
  programDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
  },
  programTarget: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '500',
  },
  programMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: palette.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  programDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: palette.textPrimary,
  },
  materialsContainer: {
    marginBottom: spacing.md,
  },
  materialsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialTag: {
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  materialText: {
    fontSize: 12,
    color: palette.textPrimary,
  },
  programActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  actionBtn: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  materialsBtn: {
    backgroundColor: palette.info,
  },
  startBtn: {
    backgroundColor: palette.primary,
  },
  attendanceBtn: {
    backgroundColor: palette.success,
  },
  completeBtn: {
    backgroundColor: palette.warning,
  },
  feedbackBtn: {
    backgroundColor: palette.textSecondary,
  },
  actionBtnText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  resourcesSection: {
    marginBottom: spacing.xl,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  resourceIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  resourceDescription: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});

export default HealthEducationScreen;