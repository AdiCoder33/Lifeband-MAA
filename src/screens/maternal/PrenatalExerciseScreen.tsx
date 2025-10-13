import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type Exercise = {
  id: string;
  name: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  trimester: '1st' | '2nd' | '3rd' | 'all' | 'postnatal';
  benefits: string[];
  instructions: string[];
  precautions: string[];
  equipment?: string;
  reps?: string;
};

type WorkoutPlan = {
  id: string;
  name: string;
  trimester: '1st' | '2nd' | '3rd' | 'postnatal';
  duration: string;
  exercises: Exercise[];
  description: string;
};

const PrenatalExerciseScreen: React.FC = () => {
  const [selectedTrimester, setSelectedTrimester] = useState<string>('2nd');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);

  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Prenatal Yoga Stretches',
      duration: '15-30 minutes',
      difficulty: 'beginner',
      trimester: 'all',
      benefits: ['Improves flexibility', 'Reduces stress', 'Better sleep', 'Pain relief'],
      instructions: [
        'Start in a comfortable seated position',
        'Perform gentle neck rolls and shoulder stretches',
        'Move into cat-cow stretches on hands and knees',
        'Hold each pose for 30 seconds',
        'Focus on deep breathing throughout',
      ],
      precautions: ['Avoid deep twists', 'No lying on back after 1st trimester', 'Stay hydrated'],
      equipment: 'Yoga mat',
    },
    {
      id: '2',
      name: 'Pelvic Tilts',
      duration: '5-10 minutes',
      difficulty: 'beginner',
      trimester: 'all',
      reps: '10-15 repetitions',
      benefits: ['Strengthens core', 'Reduces back pain', 'Improves posture'],
      instructions: [
        'Stand with your back against a wall',
        'Tighten your abdominal muscles',
        'Tilt your pelvis forward, flattening your back against the wall',
        'Hold for 5 seconds, then release',
        'Repeat slowly and controlled',
      ],
      precautions: ['Stop if you feel dizzy', 'Don\'t hold your breath'],
    },
    {
      id: '3',
      name: 'Modified Squats',
      duration: '10-15 minutes',
      difficulty: 'beginner',
      trimester: '2nd',
      reps: '10-12 repetitions',
      benefits: ['Strengthens legs', 'Prepares for labor', 'Improves circulation'],
      instructions: [
        'Stand with feet shoulder-width apart',
        'Hold onto a chair for support if needed',
        'Slowly lower into squat position',
        'Keep knees aligned over toes',
        'Rise slowly back to standing',
      ],
      precautions: ['Use support if needed', 'Don\'t go too deep', 'Stop if uncomfortable'],
      equipment: 'Chair for support (optional)',
    },
    {
      id: '4',
      name: 'Swimming/Water Aerobics',
      duration: '20-30 minutes',
      difficulty: 'intermediate',
      trimester: 'all',
      benefits: ['Low impact cardio', 'Joint relief', 'Full body workout', 'Reduces swelling'],
      instructions: [
        'Start with gentle water walking',
        'Perform arm circles and leg lifts in water',
        'Try gentle swimming strokes',
        'Focus on steady breathing',
        'Cool down with gentle stretching',
      ],
      precautions: ['Avoid hot tubs', 'Stay hydrated', 'Listen to your body'],
      equipment: 'Swimming pool',
    },
    {
      id: '5',
      name: 'Kegel Exercises',
      duration: '5-10 minutes',
      difficulty: 'beginner',
      trimester: 'all',
      reps: '3 sets of 10',
      benefits: ['Strengthens pelvic floor', 'Prevents incontinence', 'Aids delivery', 'Faster recovery'],
      instructions: [
        'Identify your pelvic floor muscles (muscles that stop urine flow)',
        'Contract these muscles for 3 seconds',
        'Relax for 3 seconds',
        'Gradually increase hold time to 10 seconds',
        'Can be done anywhere, anytime',
      ],
      precautions: ['Don\'t overdo it', 'Breathe normally', 'Don\'t use other muscles'],
    },
    {
      id: '6',
      name: 'Walking',
      duration: '20-45 minutes',
      difficulty: 'beginner',
      trimester: 'all',
      benefits: ['Cardiovascular health', 'Energy boost', 'Easy to do', 'Mental health'],
      instructions: [
        'Start with 10-15 minutes daily',
        'Gradually increase duration',
        'Maintain conversational pace',
        'Wear supportive shoes',
        'Choose safe, flat routes',
      ],
      precautions: ['Avoid overheating', 'Stay hydrated', 'Listen to your body'],
      equipment: 'Comfortable shoes',
    },
  ];

  const workoutPlans: WorkoutPlan[] = [
    {
      id: '1',
      name: 'First Trimester Gentle Start',
      trimester: '1st',
      duration: '20-25 minutes',
      description: 'Gentle introduction to prenatal fitness focusing on establishing healthy habits',
      exercises: exercises.filter(e => e.trimester === 'all' || e.trimester === '1st').slice(0, 3),
    },
    {
      id: '2',
      name: 'Second Trimester Active Plan',
      trimester: '2nd',
      duration: '30-40 minutes',
      description: 'More active routine for when energy returns and movement feels good',
      exercises: exercises.filter(e => e.trimester === 'all' || e.trimester === '2nd').slice(0, 4),
    },
    {
      id: '3',
      name: 'Third Trimester Preparation',
      trimester: '3rd',
      duration: '25-35 minutes',
      description: 'Focus on labor preparation and maintaining fitness as delivery approaches',
      exercises: exercises.filter(e => e.trimester === 'all' || e.trimester === '3rd').slice(0, 3),
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return palette.success;
      case 'intermediate':
        return palette.accent;
      case 'advanced':
        return palette.danger;
      default:
        return palette.textSecondary;
    }
  };

  const getTrimesterColor = (trimester: string) => {
    switch (trimester) {
      case '1st':
        return palette.maternal.blush;
      case '2nd':
        return palette.maternal.lavender;
      case '3rd':
        return palette.maternal.mint;
      case 'all':
        return palette.primary;
      default:
        return palette.textSecondary;
    }
  };

  const filteredExercises = exercises.filter(exercise => 
    exercise.trimester === selectedTrimester || exercise.trimester === 'all'
  );

  const startExercise = (exercise: Exercise) => {
    Alert.alert(
      'Start Exercise',
      `Ready to start ${exercise.name}?\n\nDuration: ${exercise.duration}${exercise.reps ? `\nReps: ${exercise.reps}` : ''}`,
      [
        {text: 'View Details', onPress: () => {
          setSelectedExercise(exercise);
          setShowExerciseModal(true);
        }},
        {text: 'Start Now', onPress: () => {
          Alert.alert('Exercise Started!', `Timer started for ${exercise.duration}. Remember to listen to your body and stop if you feel uncomfortable.`);
        }},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Prenatal Exercise</Text>
          <Text style={styles.headerSubtitle}>
            Safe and effective exercises for a healthy pregnancy journey
          </Text>
        </View>

        {/* Safety Notice */}
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyTitle}>⚠️ Always Consult Your Doctor</Text>
          <Text style={styles.safetyText}>
            Before starting any exercise routine during pregnancy, please consult with your healthcare provider to ensure it's safe for your specific situation.
          </Text>
        </View>

        {/* Trimester Filter */}
        <View style={styles.trimesterFilter}>
          <Text style={styles.filterTitle}>Choose Your Trimester:</Text>
          <View style={styles.filterButtons}>
            {['1st', '2nd', '3rd', 'postnatal'].map(trimester => (
              <TouchableOpacity
                key={trimester}
                style={[
                  styles.filterButton,
                  selectedTrimester === trimester && styles.selectedFilterButton,
                ]}
                onPress={() => setSelectedTrimester(trimester)}>
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedTrimester === trimester && styles.selectedFilterButtonText,
                  ]}>
                  {trimester === 'postnatal' ? 'Postnatal' : `${trimester} Trimester`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredExercises.length}</Text>
            <Text style={styles.statLabel}>Safe Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>20-45</Text>
            <Text style={styles.statLabel}>Minutes Daily</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3-5</Text>
            <Text style={styles.statLabel}>Days Per Week</Text>
          </View>
        </View>

        {/* Workout Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏃‍♀️ Recommended Workout Plans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workoutPlans.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={styles.workoutPlanCard}
                onPress={() => {
                  setSelectedWorkout(plan);
                  setShowWorkoutPlan(true);
                }}>
                <Text style={styles.workoutPlanTitle}>{plan.name}</Text>
                <Text style={styles.workoutPlanTrimester}>{plan.trimester} Trimester</Text>
                <Text style={styles.workoutPlanDuration}>{plan.duration}</Text>
                <Text style={styles.workoutPlanDescription}>{plan.description}</Text>
                <Text style={styles.workoutPlanExercises}>
                  {plan.exercises.length} exercises
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Available Exercises</Text>
          
          {filteredExercises.map(exercise => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                  {exercise.reps && (
                    <Text style={styles.exerciseReps}>{exercise.reps}</Text>
                  )}
                  {exercise.equipment && (
                    <Text style={styles.exerciseEquipment}>
                      🏋️ Equipment: {exercise.equipment}
                    </Text>
                  )}
                </View>
                
                <View style={styles.exerciseBadges}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {backgroundColor: getDifficultyColor(exercise.difficulty)},
                    ]}>
                    <Text style={styles.badgeText}>
                      {exercise.difficulty.toUpperCase()}
                    </Text>
                  </View>
                  
                  <View
                    style={[
                      styles.trimesterBadge,
                      {backgroundColor: getTrimesterColor(exercise.trimester)},
                    ]}>
                    <Text style={styles.badgeText}>
                      {exercise.trimester === 'all' ? 'ALL' : exercise.trimester.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.benefitsList}>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                {exercise.benefits.slice(0, 3).map(benefit => (
                  <Text key={benefit} style={styles.benefitItem}>
                    ✓ {benefit}
                  </Text>
                ))}
              </View>
              
              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => {
                    setSelectedExercise(exercise);
                    setShowExerciseModal(true);
                  }}>
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => startExercise(exercise)}>
                  <Text style={styles.startButtonText}>Start Exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Exercise Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Exercise Tips</Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tip}>🌡️ Stay cool and hydrated during workouts</Text>
            <Text style={styles.tip}>👂 Listen to your body - stop if you feel uncomfortable</Text>
            <Text style={styles.tip}>🍎 Eat a light snack 30 minutes before exercising</Text>
            <Text style={styles.tip}>👟 Wear supportive, comfortable clothing and shoes</Text>
            <Text style={styles.tip}>📱 Keep your phone nearby in case of emergencies</Text>
          </View>
        </View>
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExerciseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedExercise && (
              <>
                <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedExercise.duration} • {selectedExercise.difficulty}
                </Text>
                
                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📋 Instructions:</Text>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <Text key={index} style={styles.instructionItem}>
                        {index + 1}. {instruction}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>✨ Benefits:</Text>
                    {selectedExercise.benefits.map(benefit => (
                      <Text key={benefit} style={styles.benefitModalItem}>
                        ✓ {benefit}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>⚠️ Precautions:</Text>
                    {selectedExercise.precautions.map(precaution => (
                      <Text key={precaution} style={styles.precautionItem}>
                        • {precaution}
                      </Text>
                    ))}
                  </View>
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowExerciseModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Workout Plan Modal */}
      <Modal
        visible={showWorkoutPlan}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWorkoutPlan(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWorkout && (
              <>
                <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedWorkout.duration} • {selectedWorkout.exercises.length} exercises
                </Text>
                
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.workoutDescription}>{selectedWorkout.description}</Text>
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Exercises in this plan:</Text>
                    {selectedWorkout.exercises.map((exercise, index) => (
                      <View key={exercise.id} style={styles.workoutExerciseItem}>
                        <Text style={styles.workoutExerciseName}>
                          {index + 1}. {exercise.name}
                        </Text>
                        <Text style={styles.workoutExerciseDuration}>{exercise.duration}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.startWorkoutButton}
                    onPress={() => {
                      setShowWorkoutPlan(false);
                      Alert.alert('Workout Started!', `Starting ${selectedWorkout.name}. Remember to listen to your body!`);
                    }}>
                    <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowWorkoutPlan(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
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
  safetyNotice: {
    backgroundColor: palette.maternal.peach,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: palette.danger,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  safetyText: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  trimesterFilter: {
    marginBottom: spacing.lg,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  selectedFilterButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  selectedFilterButtonText: {
    color: palette.textOnPrimary,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
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
  workoutPlanCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 220,
    borderLeftWidth: 4,
    borderLeftColor: palette.accent,
  },
  workoutPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  workoutPlanTrimester: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  workoutPlanDuration: {
    fontSize: 14,
    color: palette.accent,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  workoutPlanDescription: {
    fontSize: 12,
    color: palette.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  workoutPlanExercises: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '500',
  },
  exerciseCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  exerciseDuration: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  exerciseReps: {
    fontSize: 12,
    color: palette.accent,
    marginBottom: spacing.xs,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  exerciseBadges: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  trimesterBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: palette.textOnDark,
  },
  benefitsList: {
    marginBottom: spacing.md,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  benefitItem: {
    fontSize: 12,
    color: palette.success,
    marginBottom: spacing.xs,
  },
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  startButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  startButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: palette.maternal.cream,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tip: {
    fontSize: 14,
    color: palette.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 20,
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalScroll: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  instructionItem: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    lineHeight: 20,
  },
  benefitModalItem: {
    fontSize: 14,
    color: palette.success,
    marginBottom: spacing.xs,
  },
  precautionItem: {
    fontSize: 14,
    color: palette.danger,
    marginBottom: spacing.xs,
  },
  workoutDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  workoutExerciseItem: {
    marginBottom: spacing.md,
  },
  workoutExerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  workoutExerciseDuration: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  modalActions: {
    gap: spacing.sm,
  },
  startWorkoutButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startWorkoutButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PrenatalExerciseScreen;