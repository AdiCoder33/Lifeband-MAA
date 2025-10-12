import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View, Dimensions} from 'react-native';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import ScreenBackground from '../components/ScreenBackground';
import AppHeader from '../components/AppHeader';
import ReadingTile from '../components/ReadingTile';
import {useAuth} from '../context/AuthContext';
import {useAppStore} from '../store/useAppStore';
import {usePatientReadings} from '../hooks/usePatientReadings';
import {palette, radii, spacing} from '../theme';

const now = Date.now();
const hour = 60 * 60 * 1000;
const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80; // Account for padding and margins

const demoHeartTrend = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  y: 72 + index * 3 - (index % 2 === 0 ? 2 : 0),
}));

const demoSpO2Trend = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  y: 96 + (index % 3 === 0 ? 1 : 0),
}));

const demoBloodPressure = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  systolic: 120 + (index % 2 === 0 ? 2 : -2),
  diastolic: 78 + (index % 2 === 0 ? -1 : 1),
}));

export const PatientHomeScreen: React.FC = () => {
  const {name, identifier} = useAuth();
  const selectedPatient = useAppStore(state => state.selectedPatientId);
  const readings = usePatientReadings(selectedPatient ?? identifier, {
    days: 7,
  });
  const latest = readings[0];

  const summary = useMemo(
    () => ({
      heartRate: latest?.heartRate ?? null,
      spo2: latest?.spo2 ?? null,
      systolic: latest?.systolic ?? null,
      diastolic: latest?.diastolic ?? null,
      temperature: latest?.temperature ?? null,
      timestamp: latest?.timestamp,
    }),
    [latest],
  );

  const hasLiveData = readings.length > 0;

  const heartSeries = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({x: new Date(item.timestamp), y: item.heartRate}))
        .reverse()
    : demoHeartTrend;

  const spo2Series = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({x: new Date(item.timestamp), y: item.spo2}))
        .reverse()
    : demoSpO2Trend;

  const bloodPressureSeries = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({
          x: new Date(item.timestamp),
          systolic: item.systolic,
          diastolic: item.diastolic,
        }))
        .reverse()
    : demoBloodPressure;

  const lastUpdated = summary.timestamp
    ? new Date(summary.timestamp).toLocaleString()
    : 'No readings yet';

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          title={name ? `${name}'s wellbeing` : 'Patient dashboard'}
          subtitle="Visualise your vitals, understand demo trends, and stay ahead with guided care tips."
        />

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Last sync</Text>
            <Text style={styles.heroValue}>{lastUpdated}</Text>
          </View>
          <View style={styles.heroInsights}>
            <Text style={styles.heroBadge}>
              {hasLiveData ? 'Live data' : 'Demo data preview'}
            </Text>
            <Text style={styles.heroCopy}>
              {hasLiveData
                ? 'These metrics reflect your latest LifeBand sync.'
                : 'Connect your LifeBand to replace demo visuals with actual readings.'}
            </Text>
          </View>
        </View>

        <View style={styles.tilesRow}>
          <ReadingTile
            label="Heart Rate"
            value={summary.heartRate}
            unit="bpm"
            trend={hasLiveData ? 'steady' : 'up'}
          />
          <ReadingTile
            label="SpO2"
            value={summary.spo2}
            unit="%"
            trend={hasLiveData ? 'steady' : 'down'}
          />
        </View>
        <View style={styles.tilesRow}>
          <ReadingTile
            label="Blood Pressure"
            value={
              summary.systolic && summary.diastolic
                ? `${summary.systolic}/${summary.diastolic}`
                : null
            }
            unit="mmHg"
            trend={hasLiveData ? 'steady' : 'up'}
            variant="secondary"
          />
          <ReadingTile
            label="Temperature"
            value={summary.temperature}
            unit="°C"
            trend={hasLiveData ? 'steady' : 'up'}
            variant="secondary"
          />
        </View>

        <View style={styles.chartRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>💓 Heart Rate Trend</Text>
            <Text style={styles.chartSubtitle}>Your baby's heartbeat rhythm</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              height={180}
              width={chartWidth}
              padding={{top: 16, left: 50, right: 20, bottom: 45}}
              scale={{x: 'time'}}>
              <VictoryAxis
                tickFormat={(value: Date | string | number) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(value: number) => `${value}`}
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryArea
                interpolation="monotoneX"
                style={{
                  data: {fill: palette.maternal.blush + '40', stroke: palette.primary, strokeWidth: 2},
                }}
                data={heartSeries}
              />
            </VictoryChart>
            {!hasLiveData ? (
              <Text style={styles.chartHint}>
                🔄 Demo preview - Connect LifeBand for real-time monitoring
              </Text>
            ) : null}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>🫁 Oxygen & Blood Pressure</Text>
            <Text style={styles.chartSubtitle}>Your health vitals overview</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.maternal.mint}]} />
                <Text style={styles.legendText}>SpO2</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.maternal.peach}]} />
                <Text style={styles.legendText}>Systolic</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.primary}]} />
                <Text style={styles.legendText}>Diastolic</Text>
              </View>
            </View>
            <VictoryChart
              theme={VictoryTheme.material}
              height={180}
              width={chartWidth}
              padding={{top: 16, left: 50, right: 20, bottom: 45}}
              scale={{x: 'time'}}>
              <VictoryAxis
                tickFormat={(value: Date | string | number) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(value: number) => `${value}`}
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryGroup>
                <VictoryLine
                  data={spo2Series}
                  style={{data: {stroke: palette.maternal.mint, strokeWidth: 2}}}
                  interpolation="monotoneX"
                />
                <VictoryLine
                  data={bloodPressureSeries.map(item => ({
                    x: item.x,
                    y: item.systolic,
                  }))}
                  style={{data: {stroke: palette.maternal.peach, strokeWidth: 2}}}
                />
                <VictoryLine
                  data={bloodPressureSeries.map(item => ({
                    x: item.x,
                    y: item.diastolic,
                  }))}
                  style={{data: {stroke: palette.primary, strokeWidth: 2}}}
                />
              </VictoryGroup>
            </VictoryChart>
            {!hasLiveData ? (
              <Text style={styles.chartHint}>
                Demo lines: SpO2 (green) and blood pressure (gold/red) preview.
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.carePlanCard}>
          <Text style={styles.careTitle}>🤱 Your Pregnancy Care Plan</Text>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>💓</Text>
            <Text style={styles.careText}>
              Keep your LifeBand positioned comfortably for continuous baby monitoring.
            </Text>
          </View>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>📊</Text>
            <Text style={styles.careText}>
              Review your health trends daily to stay informed about your wellness journey.
            </Text>
          </View>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>👩‍⚕️</Text>
            <Text style={styles.careText}>
              Share this dashboard with your doctor and ASHA worker for comprehensive care.
            </Text>
          </View>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>🚨</Text>
            <Text style={styles.careText}>
              Contact your healthcare provider immediately if you notice any concerning changes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  heroCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  heroValue: {
    marginTop: 4,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  heroInsights: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: palette.maternal.mint,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  heroCopy: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 13,
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chartRow: {
    flexDirection: 'column',
    marginTop: spacing.xl,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.md,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 11,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  chartHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: palette.textSecondary,
  },
  carePlanCard: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.maternal.cream,
    borderWidth: 1,
    borderColor: palette.border,
  },
  careTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  careIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  careText: {
    flex: 1,
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default PatientHomeScreen;
