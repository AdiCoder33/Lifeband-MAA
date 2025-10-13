import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {palette, spacing, radii} from '../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const healthMetrics = [
    {
      title: 'Heart Rate Trends',
      value: '72 BPM',
      trend: '+2% from last week',
      icon: '❤️',
      color: palette.danger,
    },
    {
      title: 'Blood Pressure',
      value: '120/80',
      trend: 'Normal range',
      icon: '🩺',
      color: palette.success,
    },
    {
      title: 'Baby Movement',
      value: '15 kicks/hr',
      trend: 'Active today',
      icon: '👶',
      color: palette.primary,
    },
    {
      title: 'Stress Level',
      value: 'Low',
      trend: 'Improved 10%',
      icon: '😌',
      color: palette.success,
    },
    {
      title: 'Sleep Quality',
      value: '7.5 hrs',
      trend: '+30 min from avg',
      icon: '😴',
      color: palette.primary,
    },
    {
      title: 'Physical Activity',
      value: '8,432 steps',
      trend: 'Goal: 10,000',
      icon: '🏃‍♀️',
      color: palette.warning,
    },
  ];

  const weeklyInsights = [
    'Your heart rate has been consistently in the healthy range',
    'Baby movement patterns show healthy development',
    'Stress levels have decreased by 15% this week',
    'Sleep quality has improved with consistent bedtime routine',
  ];

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Health Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Analytics</Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.metricCard, {borderLeftColor: metric.color}]}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>{metric.icon}</Text>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={[styles.metricTrend, {color: metric.color}]}>
                  {metric.trend}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          <View style={styles.insightsContainer}>
            {weeklyInsights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightIcon}>💡</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Charts Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Charts</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Heart Rate Over Time</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>
                📈 Interactive chart coming soon
              </Text>
            </View>
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Baby Movement Patterns</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>
                📊 Movement tracking chart coming soon
              </Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Share</Text>
          <View style={styles.exportContainer}>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportIcon}>📄</Text>
              <Text style={styles.exportText}>Export PDF Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportIcon}>📊</Text>
              <Text style={styles.exportText}>Share with Doctor</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (SCREEN_WIDTH - spacing.lg * 3) / 2,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  metricTitle: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightsContainer: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: palette.textPrimary,
    lineHeight: 20,
  },
  chartCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: palette.background,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.border,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  exportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  exportIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textOnPrimary,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;