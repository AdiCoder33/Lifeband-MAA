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

  const trimesterData = [
    {
      trimester: 'First Trimester',
      weeks: 'Weeks 1-12',
      icon: '🌱',
      color: palette.maternal.mint,
      readings: [
        { label: 'Avg Heart Rate', value: '68 BPM', status: 'Normal' },
        { label: 'Avg Blood Pressure', value: '118/76', status: 'Normal' },
        { label: 'Weight Gain', value: '2.5 kg', status: 'On Track' },
        { label: 'Visits Completed', value: '3 of 3', status: 'Complete' },
      ],
      notes: 'Early pregnancy development phase. Morning sickness managed well.',
    },
    {
      trimester: 'Second Trimester',
      weeks: 'Weeks 13-27',
      icon: '🌿',
      color: palette.maternal.peach,
      readings: [
        { label: 'Avg Heart Rate', value: '72 BPM', status: 'Normal' },
        { label: 'Avg Blood Pressure', value: '120/78', status: 'Normal' },
        { label: 'Weight Gain', value: '6.8 kg', status: 'Healthy' },
        { label: 'Baby Movement', value: '12-15 kicks/hr', status: 'Active' },
      ],
      notes: 'Baby movement detected. Energy levels improved significantly.',
      current: true,
    },
    {
      trimester: 'Third Trimester',
      weeks: 'Weeks 28-40',
      icon: '🌸',
      color: palette.maternal.blush,
      readings: [
        { label: 'Avg Heart Rate', value: '-- BPM', status: 'Upcoming' },
        { label: 'Avg Blood Pressure', value: '--/--', status: 'Upcoming' },
        { label: 'Expected Weight', value: '10-12 kg', status: 'Target' },
        { label: 'Baby Position', value: 'TBD', status: 'Upcoming' },
      ],
      notes: 'Final stage preparation. Regular monitoring scheduled.',
    },
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

        {/* Trimester-wise Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Trimester-wise Analysis</Text>
          <Text style={styles.sectionSubtitle}>
            Track your pregnancy journey across all three trimesters
          </Text>
          <View style={styles.trimesterContainer}>
            {trimesterData.map((trimester, index) => (
              <View 
                key={index} 
                style={[
                  styles.trimesterCard,
                  trimester.current && styles.trimesterCardCurrent,
                  {borderTopColor: trimester.color}
                ]}>
                <View style={styles.trimesterHeader}>
                  <Text style={styles.trimesterIcon}>{trimester.icon}</Text>
                  <View style={styles.trimesterTitleContainer}>
                    <View style={styles.trimesterTitleRow}>
                      <Text style={styles.trimesterTitle}>{trimester.trimester}</Text>
                      {trimester.current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.trimesterWeeks}>{trimester.weeks}</Text>
                  </View>
                </View>

                <View style={styles.readingsContainer}>
                  {trimester.readings.map((reading, idx) => (
                    <View key={idx} style={styles.readingRow}>
                      <Text style={styles.readingLabel}>{reading.label}</Text>
                      <View style={styles.readingValueContainer}>
                        <Text style={styles.readingValue}>{reading.value}</Text>
                        <Text 
                          style={[
                            styles.readingStatus,
                            reading.status === 'Normal' || reading.status === 'Healthy' || reading.status === 'Active' || reading.status === 'Complete' || reading.status === 'On Track'
                              ? styles.statusGood
                              : styles.statusNeutral
                          ]}>
                          {reading.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.notesContainer}>
                  <Text style={styles.notesIcon}>📝</Text>
                  <Text style={styles.notesText}>{trimester.notes}</Text>
                </View>
              </View>
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
  // Trimester section styles
  sectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  trimesterContainer: {
    gap: spacing.lg,
  },
  trimesterCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderTopWidth: 4,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trimesterCardCurrent: {
    borderWidth: 2,
    borderColor: palette.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  trimesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  trimesterIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  trimesterTitleContainer: {
    flex: 1,
  },
  trimesterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  trimesterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginRight: spacing.sm,
  },
  currentBadge: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textOnPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trimesterWeeks: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  readingsContainer: {
    backgroundColor: palette.backgroundSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  readingLabel: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  readingValueContainer: {
    alignItems: 'flex-end',
  },
  readingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  readingStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusGood: {
    color: palette.success,
  },
  statusNeutral: {
    color: palette.textSecondary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.maternal.cream,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  notesIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
    marginTop: 2,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default AnalyticsScreen;