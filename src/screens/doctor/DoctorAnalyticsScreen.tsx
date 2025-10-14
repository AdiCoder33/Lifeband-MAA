import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type AnalyticsData = {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  appointmentsToday: number;
  completedAppointments: number;
  cancelledAppointments: number;
  patientSatisfaction: number;
  averageWaitTime: number;
};

type TrendData = {
  period: string;
  patients: number;
  appointments: number;
  satisfaction: number;
};

const DoctorAnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const analyticsData: AnalyticsData = {
    totalPatients: 847,
    activePatients: 234,
    newPatientsThisMonth: 28,
    appointmentsToday: 12,
    completedAppointments: 156,
    cancelledAppointments: 8,
    patientSatisfaction: 4.8,
    averageWaitTime: 15,
  };

  const trendData: TrendData[] = [
    {period: 'Jan', patients: 45, appointments: 180, satisfaction: 4.6},
    {period: 'Feb', patients: 52, appointments: 195, satisfaction: 4.7},
    {period: 'Mar', patients: 38, appointments: 165, satisfaction: 4.5},
    {period: 'Apr', patients: 41, appointments: 172, satisfaction: 4.8},
    {period: 'May', patients: 48, appointments: 188, satisfaction: 4.9},
    {period: 'Jun', patients: 35, appointments: 158, satisfaction: 4.7},
  ];

  const insights = [
    {
      id: '1',
      title: 'Patient Volume Trending Up',
      description: 'New patient registrations increased 15% this month',
      type: 'positive',
      icon: '📈',
    },
    {
      id: '2',
      title: 'Appointment Efficiency',
      description: 'Average wait time reduced by 3 minutes',
      type: 'positive',
      icon: '⏱️',
    },
    {
      id: '3',
      title: 'High Satisfaction Rating',
      description: 'Patient satisfaction remains consistently high at 4.8/5',
      type: 'positive',
      icon: '⭐',
    },
    {
      id: '4',
      title: 'Follow-up Reminder',
      description: '12 patients need follow-up scheduling',
      type: 'warning',
      icon: '🔔',
    },
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return palette.success;
      case 'warning':
        return palette.warning;
      case 'negative':
        return palette.danger;
      default:
        return palette.textSecondary;
    }
  };

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText,
                ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{analyticsData.totalPatients}</Text>
              <Text style={styles.metricLabel}>Total Patients</Text>
              <Text style={styles.metricChange}>+{analyticsData.newPatientsThisMonth} this month</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{analyticsData.activePatients}</Text>
              <Text style={styles.metricLabel}>Active Patients</Text>
              <Text style={styles.metricChange}>Currently under care</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{analyticsData.appointmentsToday}</Text>
              <Text style={styles.metricLabel}>Today's Appointments</Text>
              <Text style={styles.metricChange}>
                {analyticsData.completedAppointments} completed
              </Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{analyticsData.patientSatisfaction}</Text>
              <Text style={styles.metricLabel}>Satisfaction Rating</Text>
              <Text style={styles.metricChange}>Out of 5.0 stars</Text>
            </View>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Performance Overview</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Completed Appointments</Text>
              <Text style={styles.performanceNumber}>{analyticsData.completedAppointments}</Text>
              <View style={styles.performanceBar}>
                <View
                  style={[
                    styles.performanceFill,
                    {
                      width: `${(analyticsData.completedAppointments / (analyticsData.completedAppointments + analyticsData.cancelledAppointments)) * 100}%`,
                      backgroundColor: palette.success,
                    },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Cancelled Appointments</Text>
              <Text style={styles.performanceNumber}>{analyticsData.cancelledAppointments}</Text>
              <View style={styles.performanceBar}>
                <View
                  style={[
                    styles.performanceFill,
                    {
                      width: `${(analyticsData.cancelledAppointments / (analyticsData.completedAppointments + analyticsData.cancelledAppointments)) * 100}%`,
                      backgroundColor: palette.danger,
                    },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Average Wait Time</Text>
              <Text style={styles.performanceNumber}>{analyticsData.averageWaitTime} min</Text>
              <View style={styles.performanceBar}>
                <View
                  style={[
                    styles.performanceFill,
                    {
                      width: `${(30 - analyticsData.averageWaitTime) / 30 * 100}%`,
                      backgroundColor: palette.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Trends Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📉 Monthly Trends</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Patient & Appointment Trends</Text>
              <Text style={styles.chartSubtitle}>Last 6 months</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <View style={styles.chartData}>
                {trendData.map((data, index) => (
                  <View key={data.period} style={styles.chartBar}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${(data.patients / 60) * 100}%`,
                          backgroundColor: palette.primary,
                        },
                      ]}
                    />
                    <Text style={styles.chartLabel}>{data.period}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.primary}]} />
                <Text style={styles.legendText}>New Patients</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.accent}]} />
                <Text style={styles.legendText}>Appointments</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights & Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights & Recommendations</Text>
          {insights.map(insight => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
                <View
                  style={[
                    styles.insightIndicator,
                    {backgroundColor: getInsightColor(insight.type)},
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Export Report', 'Generate detailed analytics report')}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionTitle}>Export Report</Text>
              <Text style={styles.actionDescription}>Download detailed analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Patient Survey', 'Send patient satisfaction survey')}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>Patient Survey</Text>
              <Text style={styles.actionDescription}>Collect feedback</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Custom Report', 'Create custom analytics report')}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionTitle}>Custom Report</Text>
              <Text style={styles.actionDescription}>Build custom analysis</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Benchmarks', 'Compare with industry benchmarks')}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Benchmarks</Text>
              <Text style={styles.actionDescription}>Industry comparison</Text>
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
  periodSelector: {
    flexDirection: 'row',
    marginVertical: spacing.lg,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  selectedPeriodButton: {
    backgroundColor: palette.primary,
  },
  periodButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  selectedPeriodButtonText: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  metricChange: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  performanceCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  performanceItem: {
    marginBottom: spacing.lg,
  },
  performanceLabel: {
    fontSize: 14,
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  performanceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  performanceBar: {
    height: 8,
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
  },
  performanceFill: {
    height: '100%',
    borderRadius: radii.sm,
  },
  chartCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  chartHeader: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  chartContainer: {
    height: 120,
    marginBottom: spacing.lg,
  },
  chartData: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  chartBar: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 20,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  chartLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  insightCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  insightIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});

export default DoctorAnalyticsScreen;