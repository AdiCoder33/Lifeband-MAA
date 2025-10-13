import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type WeeklyMilestone = {
  week: number;
  babySize: string;
  babyWeight: string;
  babyLength: string;
  developmentHighlights: string[];
  maternalChanges: string[];
  tips: string[];
  nextAppointment?: string;
};

type DevelopmentCategory = {
  id: string;
  title: string;
  icon: string;
  description: string;
  milestones: {week: number; description: string}[];
};

const BabyDevelopmentScreen: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(20); // Example: 20 weeks
  const [selectedCategory, setSelectedCategory] = useState<DevelopmentCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const weeklyData: Record<number, WeeklyMilestone> = {
    12: {
      week: 12,
      babySize: 'Size of a plum',
      babyWeight: '14g (0.5 oz)',
      babyLength: '5.4 cm (2.1 inches)',
      developmentHighlights: [
        'Fingernails are forming',
        'Baby can open and close fingers',
        'Reflexes are developing',
        'Kidneys are starting to function',
      ],
      maternalChanges: [
        'Morning sickness may decrease',
        'Energy levels may increase',
        'Breast tenderness continues',
      ],
      tips: [
        'Start prenatal vitamins if not already',
        'Schedule first trimester screening',
        'Consider telling close family and friends',
      ],
    },
    20: {
      week: 20,
      babySize: 'Size of a banana',
      babyWeight: '300g (10.6 oz)',
      babyLength: '16.4 cm (6.5 inches)',
      developmentHighlights: [
        'Baby can hear sounds from outside',
        'Hair is starting to grow',
        'Skin is developing layers',
        'Limbs are in proportion',
        'You might feel first movements',
      ],
      maternalChanges: [
        'Belly is showing more',
        'Energy levels are good',
        'Appetite may increase',
        'Back pain may start',
      ],
      tips: [
        'Schedule anatomy scan ultrasound',
        'Start talking and singing to baby',
        'Consider maternity clothes',
        'Practice good posture',
      ],
      nextAppointment: 'Anatomy scan at 20 weeks',
    },
    28: {
      week: 28,
      babySize: 'Size of an eggplant',
      babyWeight: '1 kg (2.2 lbs)',
      babyLength: '25 cm (9.8 inches)',
      developmentHighlights: [
        'Eyes can blink and see light',
        'Brain is developing rapidly',
        'Baby is developing sleep cycles',
        'Lungs are maturing',
      ],
      maternalChanges: [
        'Braxton Hicks contractions may start',
        'Sleep may become uncomfortable',
        'Heartburn is common',
        'Leg cramps may occur',
      ],
      tips: [
        'Start counting baby movements',
        'Begin childbirth classes',
        'Plan maternity leave',
        'Sleep on your side',
      ],
      nextAppointment: 'Glucose screening test',
    },
    36: {
      week: 36,
      babySize: 'Size of romaine lettuce',
      babyWeight: '2.6 kg (5.8 lbs)',
      babyLength: '32.2 cm (12.7 inches)',
      developmentHighlights: [
        'Baby is considered full-term soon',
        'Bones are hardening',
        'Immune system is developing',
        'Fat is accumulating',
      ],
      maternalChanges: [
        'Frequent urination increases',
        'Shortness of breath',
        'Nesting instinct may kick in',
        'Pelvis may feel pressure',
      ],
      tips: [
        'Pack hospital bag',
        'Finalize birth plan',
        'Install car seat',
        'Practice breathing techniques',
      ],
      nextAppointment: 'Weekly check-ups begin',
    },
  };

  const developmentCategories: DevelopmentCategory[] = [
    {
      id: 'physical',
      title: 'Physical Development',
      icon: '💪',
      description: 'Baby\'s physical growth and motor skill development',
      milestones: [
        {week: 8, description: 'Arms and legs are forming'},
        {week: 12, description: 'Fingernails develop'},
        {week: 16, description: 'Baby can grip and suck thumb'},
        {week: 20, description: 'Hair and eyebrows grow'},
        {week: 24, description: 'Hearing is fully developed'},
        {week: 28, description: 'Eyes can open and close'},
        {week: 32, description: 'Bones are hardening'},
        {week: 36, description: 'Ready for birth'},
      ],
    },
    {
      id: 'brain',
      title: 'Brain Development',
      icon: '🧠',
      description: 'Neurological and cognitive development milestones',
      milestones: [
        {week: 6, description: 'Neural tube forms'},
        {week: 10, description: 'Brain waves detectable'},
        {week: 14, description: 'Reflexes start developing'},
        {week: 18, description: 'Sleep cycles begin'},
        {week: 22, description: 'Rapid brain growth'},
        {week: 26, description: 'Memory formation starts'},
        {week: 30, description: 'Learning begins'},
        {week: 34, description: 'Brain fully connected'},
      ],
    },
    {
      id: 'senses',
      title: 'Sensory Development',
      icon: '👁️',
      description: 'Development of sight, hearing, taste, smell, and touch',
      milestones: [
        {week: 8, description: 'Taste buds form'},
        {week: 12, description: 'Eyes move to front of face'},
        {week: 16, description: 'Can hear your voice'},
        {week: 20, description: 'Can respond to sounds'},
        {week: 24, description: 'Eyes are fully formed'},
        {week: 28, description: 'Can see light through belly'},
        {week: 32, description: 'All senses functioning'},
        {week: 36, description: 'Vision continues developing'},
      ],
    },
    {
      id: 'organs',
      title: 'Organ Development',
      icon: '❤️',
      description: 'Formation and maturation of vital organs',
      milestones: [
        {week: 4, description: 'Heart starts beating'},
        {week: 8, description: 'Major organs form'},
        {week: 12, description: 'Kidneys start working'},
        {week: 16, description: 'Liver produces bile'},
        {week: 20, description: 'Digestive system active'},
        {week: 24, description: 'Lungs produce surfactant'},
        {week: 28, description: 'Breathing movements'},
        {week: 32, description: 'All organs mature'},
      ],
    },
  ];

  const getCurrentMilestone = (): WeeklyMilestone => {
    return weeklyData[currentWeek] || weeklyData[20];
  };

  const getTrimester = (week: number): string => {
    if (week <= 12) return '1st Trimester';
    if (week <= 27) return '2nd Trimester';
    return '3rd Trimester';
  };

  const getWeekProgress = (week: number): number => {
    return Math.min((week / 40) * 100, 100);
  };

  const milestone = getCurrentMilestone();

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Baby Development</Text>
          <Text style={styles.headerSubtitle}>
            Track your baby's amazing growth journey week by week
          </Text>
        </View>

        {/* Current Week Display */}
        <View style={styles.currentWeekCard}>
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.weekNumber}>Week {currentWeek}</Text>
              <Text style={styles.trimester}>{getTrimester(currentWeek)}</Text>
            </View>
            <View style={styles.babySizeContainer}>
              <Text style={styles.babySizeTitle}>Your baby is</Text>
              <Text style={styles.babySize}>{milestone.babySize}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, {width: `${getWeekProgress(currentWeek)}%`}]}
              />
            </View>
            <Text style={styles.progressText}>{currentWeek}/40 weeks</Text>
          </View>
          
          <View style={styles.babyStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{milestone.babyWeight}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Length</Text>
              <Text style={styles.statValue}>{milestone.babyLength}</Text>
            </View>
          </View>
        </View>

        {/* Week Selector */}
        <View style={styles.weekSelector}>
          <Text style={styles.sectionTitle}>Choose Week:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[12, 16, 20, 24, 28, 32, 36, 40].map(week => (
              <TouchableOpacity
                key={week}
                style={[
                  styles.weekButton,
                  currentWeek === week && styles.selectedWeekButton,
                ]}
                onPress={() => setCurrentWeek(week)}>
                <Text
                  style={[
                    styles.weekButtonText,
                    currentWeek === week && styles.selectedWeekButtonText,
                  ]}>
                  Week {week}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Development Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Development Highlights</Text>
          <View style={styles.highlightsContainer}>
            {milestone.developmentHighlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <Text style={styles.highlightText}>✨ {highlight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Maternal Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤱 What You Might Experience</Text>
          <View style={styles.changesContainer}>
            {milestone.maternalChanges.map((change, index) => (
              <View key={index} style={styles.changeItem}>
                <Text style={styles.changeText}>• {change}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Development Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Development Categories</Text>
          <View style={styles.categoriesGrid}>
            {developmentCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoryModal(true);
                }}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips for This Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips for Week {currentWeek}</Text>
          <View style={styles.tipsContainer}>
            {milestone.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipText}>💡 {tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Appointment */}
        {milestone.nextAppointment && (
          <View style={styles.appointmentCard}>
            <Text style={styles.appointmentTitle}>📅 Upcoming</Text>
            <Text style={styles.appointmentText}>{milestone.nextAppointment}</Text>
          </View>
        )}

        {/* Movement Counter */}
        <View style={styles.movementCard}>
          <Text style={styles.movementTitle}>👶 Baby Movement Tracker</Text>
          <Text style={styles.movementSubtitle}>
            Track 10 movements in 2 hours (after 28 weeks)
          </Text>
          <View style={styles.movementCounter}>
            {Array.from({length: 10}).map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.movementDot,
                  index < 3 && styles.movementDotActive, // Example: 3 movements counted
                ]}>
                <Text style={styles.movementDotText}>{index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.resetMovementButton}>
            <Text style={styles.resetMovementText}>Reset Counter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Development Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCategory && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedCategory.icon} {selectedCategory.title}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedCategory.description}
                </Text>
                
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.milestonesTitle}>Key Milestones:</Text>
                  {selectedCategory.milestones.map(milestone => (
                    <View key={milestone.week} style={styles.milestoneItem}>
                      <Text style={styles.milestoneWeek}>Week {milestone.week}</Text>
                      <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCategoryModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  headerSection: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  currentWeekCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  weekNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: palette.primary,
  },
  trimester: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  babySizeContainer: {
    alignItems: 'flex-end',
  },
  babySizeTitle: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  babySize: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: radii.sm,
  },
  progressText: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  babyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  weekSelector: {
    marginBottom: spacing.lg,
  },
  weekButton: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  selectedWeekButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  weekButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  selectedWeekButtonText: {
    color: palette.textOnPrimary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  highlightsContainer: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  highlightItem: {
    marginBottom: spacing.sm,
  },
  highlightText: {
    fontSize: 14,
    color: palette.textPrimary,
    lineHeight: 20,
  },
  changesContainer: {
    backgroundColor: palette.maternal.peach,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  changeItem: {
    marginBottom: spacing.sm,
  },
  changeText: {
    fontSize: 14,
    color: palette.textPrimary,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsContainer: {
    backgroundColor: palette.maternal.cream,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tipItem: {
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: palette.textPrimary,
    lineHeight: 20,
  },
  appointmentCard: {
    backgroundColor: palette.maternal.mint,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  appointmentText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  movementCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  movementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  movementSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  movementCounter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  movementDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: palette.border,
  },
  movementDotActive: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  movementDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  resetMovementButton: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resetMovementText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalScroll: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  milestoneItem: {
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  milestoneWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  milestoneDescription: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BabyDevelopmentScreen;