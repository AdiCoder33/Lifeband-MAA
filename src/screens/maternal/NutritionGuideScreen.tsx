import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type NutritionTip = {
  id: string;
  title: string;
  description: string;
  category: 'prenatal' | 'postnatal' | 'breastfeeding' | 'general';
  importance: 'high' | 'medium' | 'low';
  foods: string[];
  benefits: string[];
};

type MealPlan = {
  id: string;
  name: string;
  trimester: '1st' | '2nd' | '3rd' | 'postnatal';
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  calories: number;
  nutrients: string[];
};

const NutritionGuideScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('prenatal');
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);

  const nutritionTips: NutritionTip[] = [
    {
      id: '1',
      title: 'Folic Acid Essentials',
      description: 'Critical for preventing birth defects and supporting baby development',
      category: 'prenatal',
      importance: 'high',
      foods: ['Leafy greens', 'Citrus fruits', 'Fortified cereals', 'Beans', 'Avocado'],
      benefits: ['Prevents neural tube defects', 'Supports DNA formation', 'Reduces miscarriage risk'],
    },
    {
      id: '2',
      title: 'Iron for Energy',
      description: 'Prevents anemia and supports increased blood volume during pregnancy',
      category: 'prenatal',
      importance: 'high',
      foods: ['Red meat', 'Spinach', 'Lentils', 'Tofu', 'Fortified cereals'],
      benefits: ['Prevents anemia', 'Supports oxygen transport', 'Boosts energy levels'],
    },
    {
      id: '3',
      title: 'Calcium for Strong Bones',
      description: 'Essential for baby\'s bone development and maintaining maternal bone health',
      category: 'prenatal',
      importance: 'high',
      foods: ['Dairy products', 'Sardines', 'Kale', 'Almonds', 'Fortified plant milk'],
      benefits: ['Baby\'s bone development', 'Prevents maternal bone loss', 'Supports muscle function'],
    },
    {
      id: '4',
      title: 'Omega-3 for Brain Development',
      description: 'Crucial for baby\'s brain and eye development',
      category: 'prenatal',
      importance: 'high',
      foods: ['Salmon', 'Walnuts', 'Chia seeds', 'Sardines', 'Flaxseeds'],
      benefits: ['Brain development', 'Eye development', 'Reduces inflammation'],
    },
    {
      id: '5',
      title: 'Hydration During Breastfeeding',
      description: 'Adequate fluid intake is crucial for milk production',
      category: 'breastfeeding',
      importance: 'high',
      foods: ['Water', 'Herbal teas', 'Coconut water', 'Fresh juices', 'Soups'],
      benefits: ['Maintains milk supply', 'Prevents dehydration', 'Supports recovery'],
    },
  ];

  const mealPlans: MealPlan[] = [
    {
      id: '1',
      name: 'First Trimester Nausea-Friendly',
      trimester: '1st',
      calories: 1800,
      nutrients: ['Folic Acid', 'B Vitamins', 'Ginger'],
      meals: {
        breakfast: ['Ginger tea with toast', 'Banana with almond butter', 'Fortified cereal'],
        lunch: ['Chicken broth with crackers', 'Mild vegetable soup', 'Plain rice'],
        dinner: ['Grilled chicken breast', 'Steamed vegetables', 'Sweet potato'],
        snacks: ['Crackers', 'Ginger snaps', 'Prenatal smoothie'],
      },
    },
    {
      id: '2',
      name: 'Second Trimester Balanced Growth',
      trimester: '2nd',
      calories: 2200,
      nutrients: ['Iron', 'Calcium', 'Protein', 'Omega-3'],
      meals: {
        breakfast: ['Greek yogurt with berries', 'Whole grain toast', 'Orange juice'],
        lunch: ['Salmon salad', 'Quinoa', 'Mixed greens', 'Avocado'],
        dinner: ['Lean beef', 'Broccoli', 'Brown rice', 'Side salad'],
        snacks: ['Nuts and dried fruit', 'Cheese and crackers', 'Smoothie'],
      },
    },
    {
      id: '3',
      name: 'Third Trimester Energy Boost',
      trimester: '3rd',
      calories: 2400,
      nutrients: ['Iron', 'Calcium', 'Fiber', 'Healthy fats'],
      meals: {
        breakfast: ['Oatmeal with nuts', 'Fresh fruit', 'Milk'],
        lunch: ['Lentil soup', 'Whole grain bread', 'Leafy green salad'],
        dinner: ['Grilled fish', 'Roasted vegetables', 'Quinoa'],
        snacks: ['Trail mix', 'Yogurt', 'Whole grain crackers'],
      },
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prenatal':
        return palette.primary;
      case 'postnatal':
        return palette.success;
      case 'breastfeeding':
        return palette.accent;
      default:
        return palette.textSecondary;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return palette.danger;
      case 'medium':
        return palette.accent;
      default:
        return palette.success;
    }
  };

  const filteredTips = nutritionTips.filter(tip => 
    selectedCategory === 'all' || tip.category === selectedCategory
  );

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Nutrition Guide</Text>
          <Text style={styles.headerSubtitle}>
            Nourish yourself and your baby with expert nutrition guidance
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['prenatal', 'breastfeeding', 'postnatal', 'general'].map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.selectedCategoryButtonText,
                  ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Essential Nutrients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2200+</Text>
            <Text style={styles.statLabel}>Daily Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8-10</Text>
            <Text style={styles.statLabel}>Glasses Water</Text>
          </View>
        </View>

        {/* Meal Plans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Recommended Meal Plans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mealPlans.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={styles.mealPlanCard}
                onPress={() => {
                  setSelectedMealPlan(plan);
                  setShowMealPlan(true);
                }}>
                <Text style={styles.mealPlanTitle}>{plan.name}</Text>
                <Text style={styles.mealPlanTrimester}>{plan.trimester} Trimester</Text>
                <Text style={styles.mealPlanCalories}>{plan.calories} calories/day</Text>
                <View style={styles.nutrientsList}>
                  {plan.nutrients.slice(0, 3).map(nutrient => (
                    <Text key={nutrient} style={styles.nutrientTag}>
                      {nutrient}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nutrition Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Nutrition Tips</Text>
          
          {filteredTips.map(tip => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <View
                  style={[
                    styles.importanceBadge,
                    {backgroundColor: getImportanceColor(tip.importance)},
                  ]}>
                  <Text style={styles.importanceText}>
                    {tip.importance.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.tipDescription}>{tip.description}</Text>
              
              <View style={styles.tipSection}>
                <Text style={styles.tipSectionTitle}>🥗 Best Food Sources:</Text>
                <View style={styles.foodsList}>
                  {tip.foods.map(food => (
                    <Text key={food} style={styles.foodItem}>
                      • {food}
                    </Text>
                  ))}
                </View>
              </View>
              
              <View style={styles.tipSection}>
                <Text style={styles.tipSectionTitle}>✨ Benefits:</Text>
                <View style={styles.benefitsList}>
                  {tip.benefits.map(benefit => (
                    <Text key={benefit} style={styles.benefitItem}>
                      ✓ {benefit}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Hydration Reminder */}
        <View style={styles.hydrationCard}>
          <Text style={styles.hydrationTitle}>💧 Hydration Reminder</Text>
          <Text style={styles.hydrationText}>
            Drink 8-10 glasses of water daily for optimal health and milk production
          </Text>
          <View style={styles.waterGlasses}>
            {Array.from({length: 8}).map((_, index) => (
              <Text key={index} style={styles.waterGlass}>
                💧
              </Text>
            ))}
          </View>
        </View>

        {/* Nutritional Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Daily Guidelines</Text>
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelineItem}>🥛 3-4 servings of dairy or calcium-rich foods</Text>
            <Text style={styles.guidelineItem}>🥩 2-3 servings of protein (meat, fish, beans)</Text>
            <Text style={styles.guidelineItem}>🥬 5+ servings of fruits and vegetables</Text>
            <Text style={styles.guidelineItem}>🌾 6-8 servings of whole grains</Text>
            <Text style={styles.guidelineItem}>🥑 Healthy fats in moderation</Text>
          </View>
        </View>
      </ScrollView>

      {/* Meal Plan Modal */}
      <Modal
        visible={showMealPlan}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMealPlan(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMealPlan && (
              <>
                <Text style={styles.modalTitle}>{selectedMealPlan.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedMealPlan.trimester} Trimester • {selectedMealPlan.calories} calories
                </Text>
                
                <ScrollView style={styles.mealPlanContent}>
                  <View style={styles.mealSection}>
                    <Text style={styles.mealSectionTitle}>🌅 Breakfast</Text>
                    {selectedMealPlan.meals.breakfast.map(item => (
                      <Text key={item} style={styles.mealItem}>• {item}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.mealSection}>
                    <Text style={styles.mealSectionTitle}>🌞 Lunch</Text>
                    {selectedMealPlan.meals.lunch.map(item => (
                      <Text key={item} style={styles.mealItem}>• {item}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.mealSection}>
                    <Text style={styles.mealSectionTitle}>🌙 Dinner</Text>
                    {selectedMealPlan.meals.dinner.map(item => (
                      <Text key={item} style={styles.mealItem}>• {item}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.mealSection}>
                    <Text style={styles.mealSectionTitle}>🍎 Snacks</Text>
                    {selectedMealPlan.meals.snacks.map(item => (
                      <Text key={item} style={styles.mealItem}>• {item}</Text>
                    ))}
                  </View>
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowMealPlan(false)}>
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
    marginBottom: spacing.lg,
  },
  categoryFilter: {
    marginBottom: spacing.lg,
  },
  categoryButton: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  selectedCategoryButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  categoryButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  selectedCategoryButtonText: {
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
  mealPlanCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 200,
    borderLeftWidth: 4,
    borderLeftColor: palette.accent,
  },
  mealPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  mealPlanTrimester: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  mealPlanCalories: {
    fontSize: 14,
    color: palette.accent,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  nutrientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutrientTag: {
    backgroundColor: palette.maternal.cream,
    color: palette.textPrimary,
    fontSize: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tipCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1,
  },
  importanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  importanceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: palette.textOnDark,
  },
  tipDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  tipSection: {
    marginBottom: spacing.md,
  },
  tipSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  foodsList: {
    paddingLeft: spacing.sm,
  },
  foodItem: {
    fontSize: 13,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  benefitsList: {
    paddingLeft: spacing.sm,
  },
  benefitItem: {
    fontSize: 13,
    color: palette.success,
    marginBottom: spacing.xs,
  },
  hydrationCard: {
    backgroundColor: palette.maternal.mint,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  hydrationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  hydrationText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  waterGlasses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  waterGlass: {
    fontSize: 20,
    margin: spacing.xs,
  },
  guidelinesCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  guidelineItem: {
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
  mealPlanContent: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  mealSection: {
    marginBottom: spacing.lg,
  },
  mealSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  mealItem: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
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

export default NutritionGuideScreen;