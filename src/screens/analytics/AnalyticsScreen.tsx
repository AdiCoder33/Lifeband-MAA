import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {palette, radii, spacing} from '../../theme';
import {useFirebaseHealth} from '../../services/hooks/useFirebaseHealth';
import type {HealthReading} from '../../services/firebase/health';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type MetricCard = {
  title: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
};

type TrimesterCard = {
  trimester: string;
  weeks: string;
  icon: string;
  color: string;
  readings: Array<{
    label: string;
    value: string;
    status: 'Normal' | 'Watch' | 'Upcoming';
  }>;
  notes: string;
  current?: boolean;
};

type AnalyticsSummary = {
  metrics: MetricCard[];
  insights: string[];
  trimester: TrimesterCard[];
};

const ICONS = {
  heart: '??',
  bp: '??',
  spo2: '??',
  temp: '???',
  stress: '???????',
  movement: '????',
};

const DEFAULT_SUMMARY: AnalyticsSummary = {
  metrics: [
    {
      title: 'Heart Rate',
      value: '-- bpm',
      trend: 'Awaiting readings',
      icon: ICONS.heart,
      color: palette.primary,
    },
    {
      title: 'Blood Oxygen',
      value: '-- %',
      trend: 'Awaiting readings',
      icon: ICONS.spo2,
      color: palette.info,
    },
    {
      title: 'Blood Pressure',
      value: '--/--',
      trend: 'Awaiting readings',
      icon: ICONS.bp,
      color: palette.success,
    },
    {
      title: 'Temperature',
      value: '-- °C',
      trend: 'Awaiting readings',
      icon: ICONS.temp,
      color: palette.warning,
    },
    {
      title: "Mother's Stress",
      value: '-- %',
      trend: 'Awaiting readings',
      icon: ICONS.stress,
      color: palette.maternal.lavender,
    },
    {
      title: "Baby's Movement",
      value: '-- kicks/hr',
      trend: 'Awaiting readings',
      icon: ICONS.movement,
      color: palette.maternal.peach,
    },
  ],
  insights: [
    'Sync your LifeBand to unlock personalised analytics.',
    'Weekly health insights will appear here after your first readings.',
  ],
  trimester: [
    {
      trimester: 'First Trimester',
      weeks: 'Weeks 1-12',
      icon: ICONS.heart,
      color: palette.maternal.mint,
      readings: [
        {label: 'Avg Heart Rate', value: '-- bpm', status: 'Upcoming'},
        {label: 'Avg Blood Pressure', value: '--/--', status: 'Upcoming'},
        {label: 'Baby Movement', value: '--', status: 'Upcoming'},
        {label: 'Stress Level', value: '--', status: 'Upcoming'},
      ],
      notes: 'Add readings to compare each trimester.',
    },
    {
      trimester: 'Second Trimester',
      weeks: 'Weeks 13-27',
      icon: ICONS.bp,
      color: palette.maternal.peach,
      readings: [
        {label: 'Avg Heart Rate', value: '-- bpm', status: 'Upcoming'},
        {label: 'Avg Blood Pressure', value: '--/--', status: 'Upcoming'},
        {label: 'Baby Movement', value: '--', status: 'Upcoming'},
        {label: 'Stress Level', value: '--', status: 'Upcoming'},
      ],
      notes: 'Insights will update automatically after data sync.',
    },
    {
      trimester: 'Third Trimester',
      weeks: 'Weeks 28-40',
      icon: ICONS.movement,
      color: palette.maternal.blush,
      readings: [
        {label: 'Avg Heart Rate', value: '-- bpm', status: 'Upcoming'},
        {label: 'Avg Blood Pressure', value: '--/--', status: 'Upcoming'},
        {label: 'Baby Movement', value: '--', status: 'Upcoming'},
        {label: 'Stress Level', value: '--', status: 'Upcoming'},
      ],
      notes: 'Stay connected to keep this view up to date.',
      current: true,
    },
  ],
};

const average = (values: Array<number | null | undefined>) => {
  const valid = values.filter(
    value => typeof value === 'number' && !Number.isNaN(value),
  ) as number[];
  if (!valid.length) {
    return null;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const percentDelta = (current: number | null, previous: number | null) => {
  if (
    current == null ||
    previous == null ||
    Number.isNaN(current) ||
    Number.isNaN(previous) ||
    previous === 0
  ) {
    return null;
  }
  return ((current - previous) / previous) * 100;
};

const formatTrend = (delta: number | null, unit: string) => {
  if (delta == null || Number.isNaN(delta) || !Number.isFinite(delta)) {
    return 'No recent change';
  }
  const direction = delta > 0 ? '+' : '';
  return `${direction}${delta.toFixed(1)}${unit} vs last week`;
};

const formatValue = (
  value: number | null,
  options: {unit?: string; precision?: number; fallback?: string} = {},
) => {
  if (value == null || Number.isNaN(value)) {
    return options.fallback ?? '--';
  }
  const precision = options.precision ?? 0;
  const formatted = value.toFixed(precision);
  return options.unit ? `${formatted} ${options.unit}` : formatted;
};

const buildAnalyticsSummary = (readings: HealthReading[]): AnalyticsSummary => {
  if (!readings.length) {
    return DEFAULT_SUMMARY;
  }

  const sorted = [...readings].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const latestWeek = sorted.slice(0, 7);
  const previousWeek = sorted.slice(7, 14);

  const hrAvg = average(latestWeek.map(reading => reading.heartRate));
  const hrPrevAvg = average(previousWeek.map(reading => reading.heartRate));
  const spoAvg = average(latestWeek.map(reading => reading.spo2));
  const spoPrevAvg = average(previousWeek.map(reading => reading.spo2));
  const tempAvg = average(latestWeek.map(reading => reading.temperature));
  const tempPrevAvg = average(previousWeek.map(reading => reading.temperature));
  const systolicAvg = average(latestWeek.map(reading => reading.systolic));
  const diastolicAvg = average(latestWeek.map(reading => reading.diastolic));
  const systolicPrev = average(previousWeek.map(reading => reading.systolic));
  const diastolicPrev = average(previousWeek.map(reading => reading.diastolic));
  const stressAvg = average(latestWeek.map(reading => reading.stressLevel));
  const stressPrev = average(previousWeek.map(reading => reading.stressLevel));
  const movementAvg = average(latestWeek.map(reading => reading.babyMovement));
  const movementPrev = average(
    previousWeek.map(reading => reading.babyMovement),
  );

  const metrics: MetricCard[] = [
    {
      title: 'Heart Rate',
      value: formatValue(hrAvg, {unit: 'bpm'}),
      trend: formatTrend(percentDelta(hrAvg, hrPrevAvg), '%'),
      icon: ICONS.heart,
      color: palette.primary,
    },
    {
      title: 'Blood Oxygen',
      value: formatValue(spoAvg, {unit: '%', precision: 1}),
      trend: formatTrend(percentDelta(spoAvg, spoPrevAvg), '%'),
      icon: ICONS.spo2,
      color: palette.info,
    },
    {
      title: 'Blood Pressure',
      value:
        systolicAvg && diastolicAvg
          ? `${Math.round(systolicAvg)}/${Math.round(diastolicAvg)}`
          : '--/--',
      trend:
        systolicAvg && diastolicAvg && systolicPrev && diastolicPrev
          ? `? ${Math.round(systolicAvg - systolicPrev)}/${Math.round(
              diastolicAvg - diastolicPrev,
            )} vs last week`
          : 'No recent change',
      icon: ICONS.bp,
      color: palette.success,
    },
    {
      title: 'Temperature',
      value: formatValue(tempAvg, {unit: '°C', precision: 1}),
      trend: formatTrend(percentDelta(tempAvg, tempPrevAvg), '%'),
      icon: ICONS.temp,
      color: palette.warning,
    },
    {
      title: "Mother's Stress",
      value: formatValue(stressAvg, {unit: '%', precision: 0}),
      trend: formatTrend(percentDelta(stressAvg, stressPrev), '%'),
      icon: ICONS.stress,
      color: palette.maternal.lavender,
    },
    {
      title: "Baby's Movement",
      value: formatValue(movementAvg, {unit: 'kicks/hr', precision: 0}),
      trend: formatTrend(percentDelta(movementAvg, movementPrev), '%'),
      icon: ICONS.movement,
      color: palette.maternal.peach,
    },
  ];

  const insights: string[] = [];
  if (hrAvg) {
    insights.push(
      hrAvg >= 60 && hrAvg <= 100
        ? `Heart rate is steady at ${Math.round(hrAvg)} bpm.`
        : `Heart rate averaged ${Math.round(
            hrAvg,
          )} bpm. Share this with your doctor.`,
    );
  }
  if (spoAvg) {
    insights.push(
      spoAvg >= 95
        ? 'Oxygen saturation stayed in the optimal range.'
        : 'Oxygen saturation dipped below 95%. Stay hydrated and follow up if it persists.',
    );
  }
  if (movementAvg) {
    insights.push(
      `Baby movement averaged ${Math.round(
        movementAvg,
      )} kicks/hr this week. Track any noticeable changes.`,
    );
  }
  if (latestWeek.length >= 5) {
    insights.push(
      `Great consistency! You recorded ${latestWeek.length} readings in the last few days.`,
    );
  }
  if (!insights.length) {
    insights.push(
      'Add new readings to unlock personalised pregnancy insights.',
    );
  }

  const ascending = [...readings].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const bucketSize = Math.max(1, Math.ceil(ascending.length / 3));
  const trimesterLabels: Array<{
    trimester: string;
    weeks: string;
    icon: string;
    color: string;
  }> = [
    {
      trimester: 'First Trimester',
      weeks: 'Weeks 1-12',
      icon: ICONS.heart,
      color: palette.maternal.mint,
    },
    {
      trimester: 'Second Trimester',
      weeks: 'Weeks 13-27',
      icon: ICONS.bp,
      color: palette.maternal.peach,
    },
    {
      trimester: 'Third Trimester',
      weeks: 'Weeks 28-40',
      icon: ICONS.movement,
      color: palette.maternal.blush,
    },
  ];

  const trimester = trimesterLabels.map((meta, index, arr) => {
    const slice = ascending.slice(index * bucketSize, (index + 1) * bucketSize);
    const hr = average(slice.map(item => item.heartRate));
    const sys = average(slice.map(item => item.systolic));
    const dia = average(slice.map(item => item.diastolic));
    const movement = average(slice.map(item => item.babyMovement));
    const stress = average(slice.map(item => item.stressLevel));

    const readingStatus = (
      value: number | null,
      healthyRange: [number, number],
    ) => {
      if (value == null) {
        return 'Upcoming';
      }
      return value >= healthyRange[0] && value <= healthyRange[1]
        ? 'Normal'
        : 'Watch';
    };

    return {
      ...meta,
      readings: [
        {
          label: 'Avg Heart Rate',
          value: formatValue(hr, {unit: 'bpm'}),
          status: readingStatus(hr, [60, 100]),
        },
        {
          label: 'Avg Blood Pressure',
          value:
            sys && dia
              ? `${Math.round(sys)}/${Math.round(dia)}`
              : '--/--',
          status:
            sys && dia && sys < 130 && dia < 80
              ? 'Normal'
              : sys && dia
              ? 'Watch'
              : 'Upcoming',
        },
        {
          label: 'Baby Movement',
          value: formatValue(movement, {unit: 'kicks/hr'}),
          status: movement ? 'Normal' : 'Upcoming',
        },
        {
          label: 'Stress Level',
          value: formatValue(stress, {unit: '%'}),
          status: stress ? 'Normal' : 'Upcoming',
        },
      ],
      notes: slice.length
        ? `Based on ${slice.length} readings captured during this stage.`
        : 'Awaiting readings for this stage.',
      current: index === arr.length - 1,
    };
  });

  return {
    metrics,
    insights,
    trimester,
  };
};

const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const firebaseHealth = useFirebaseHealth();
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchReadings = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await firebaseHealth.getHealthReadings(120);
        if (mounted) {
          setReadings(result ?? []);
        }
      } catch (err) {
        console.warn('[Analytics] Failed to load readings', err);
        if (mounted) {
          setError('Unable to load latest readings. Try syncing again shortly.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchReadings();
    const unsubscribe =
      firebaseHealth.onHealthReadingsChange?.((latest: HealthReading[]) => {
        setReadings(latest ?? []);
      }) ?? (() => {});

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [firebaseHealth]);

  const {metrics, insights, trimester} = useMemo(
    () => buildAnalyticsSummary(readings),
    [readings],
  );
  const hasData = readings.length > 0;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Analytics</Text>
          <Text style={styles.sectionSubtitle}>
            {hasData
              ? 'Summarised from your latest LifeBand sync.'
              : 'Connect your LifeBand to populate these cards.'}
          </Text>
          {loading ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color={palette.primary} size="small" />
              <Text style={styles.loaderRowText}>Updating metrics…</Text>
            </View>
          ) : null}
          {error ? (
            <View style={styles.statusBanner}>
              <Text style={styles.statusText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.metricsGrid}>
            {metrics.map(metric => (
              <TouchableOpacity
                key={metric.title}
                style={[styles.metricCard, {borderLeftColor: metric.color}]}
                activeOpacity={0.9}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>{metric.icon}</Text>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricTrend}>{metric.trend}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          <View style={styles.insightsContainer}>
            {insights.map((insight, index) => (
              <View key={`${insight}-${index}`} style={styles.insightCard}>
                <Text style={styles.insightIcon}>?</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trimester Overview</Text>
          <Text style={styles.sectionSubtitle}>
            {hasData
              ? 'Comparing averages across your recorded readings.'
              : 'We will populate this view once readings are available.'}
          </Text>
          <View style={styles.trimesterContainer}>
            {trimester.map(card => (
              <View
                key={card.trimester}
                style={[
                  styles.trimesterCard,
                  card.current && styles.trimesterCardCurrent,
                  {borderTopColor: card.color},
                ]}>
                <View style={styles.trimesterHeader}>
                  <Text style={styles.trimesterIcon}>{card.icon}</Text>
                  <View style={styles.trimesterTitleContainer}>
                    <View style={styles.trimesterTitleRow}>
                      <Text style={styles.trimesterTitle}>{card.trimester}</Text>
                      {card.current ? (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.trimesterWeeks}>{card.weeks}</Text>
                  </View>
                </View>

                <View style={styles.readingsContainer}>
                  {card.readings.map(reading => {
                    const statusStyle =
                      reading.status === 'Normal'
                        ? styles.statusGood
                        : reading.status === 'Watch'
                        ? styles.statusWarning
                        : styles.statusNeutral;
                    return (
                      <View key={reading.label} style={styles.readingRow}>
                        <Text style={styles.readingLabel}>{reading.label}</Text>
                        <View style={styles.readingValueContainer}>
                          <Text style={styles.readingValue}>{reading.value}</Text>
                          <Text style={[styles.readingStatus, statusStyle]}>
                            {reading.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.notesContainer}>
                  <Text style={styles.notesIcon}>??</Text>
                  <Text style={styles.notesText}>{card.notes}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.exportContainer]}>
          <TouchableOpacity style={styles.exportButton} activeOpacity={0.85}>
            <Text style={styles.exportIcon}>??</Text>
            <Text style={styles.exportText}>Export weekly report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} activeOpacity={0.85}>
            <Text style={styles.exportIcon}>??</Text>
            <Text style={styles.exportText}>Share with doctor</Text>
          </TouchableOpacity>
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
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loaderRowText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: palette.textSecondary,
  },
  statusBanner: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.warning,
    backgroundColor: 'rgba(249, 171, 0, 0.12)',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: 12,
    color: palette.warning,
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
  statusWarning: {
    color: palette.warning,
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
