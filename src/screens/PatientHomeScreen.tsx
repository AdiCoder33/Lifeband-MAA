import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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
import DoctorPatientLinkService from '../services/firebase/DoctorPatientLinkService';
import {LinkedDoctor, MonthlyReportSummary} from '../types/models';
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

const demoBabyMovement = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  y: 30 + index * 2,
}));

export const PatientHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {name, identifier, user} = useAuth();
  const patientUid = user?.uid ?? (typeof identifier === 'string' ? identifier : undefined);
  const selectedPatient = useAppStore(state => state.selectedPatientId);
  const readings = usePatientReadings(selectedPatient ?? patientUid ?? identifier, {
    days: 7,
  });
  const latest = readings[0];
  const [isConnected, setIsConnected] = useState(true);
  const [medicineReminders, setMedicineReminders] = useState([
    {
      id: '1',
      name: 'Folic Acid',
      time: '9:00 AM daily',
      doctor: 'Dr. Sarah',
      taken: false,
    },
    {
      id: '2',
      name: 'Iron Supplements',
      time: '7:00 PM daily',
      doctor: 'ASHA Worker Maya',
      taken: false,
    },
  ]);
  const [careTeamLoading, setCareTeamLoading] = useState(false);
  const [linkedDoctors, setLinkedDoctors] = useState<LinkedDoctor[]>([]);
  const [recentReports, setRecentReports] = useState<MonthlyReportSummary[]>([]);

  const loadCareTeam = useCallback(async () => {
    if (!patientUid) {
      return;
    }
    try {
      setCareTeamLoading(true);
      const [doctors, reports] = await Promise.all([
        DoctorPatientLinkService.getLinkedDoctors(patientUid),
        DoctorPatientLinkService.getMonthlyReportsForPatient(patientUid),
      ]);
      setLinkedDoctors(doctors);
      setRecentReports(reports.slice(0, 3));
    } catch (error) {
      console.log('Failed to load care team data', error);
    } finally {
      setCareTeamLoading(false);
    }
  }, [patientUid]);

  useEffect(() => {
    loadCareTeam();
  }, [loadCareTeam]);

  const handleScanForBands = () => {
    Alert.alert(
      'Scanning for LifeBands...',
      'Looking for nearby LifeBand devices',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect to LifeBand-001',
          onPress: () => {
            setTimeout(() => {
              Alert.alert('🎉 Success!', 'Successfully connected to LifeBand-001!\n\nYour health monitoring is now active.');
              setIsConnected(true);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect LifeBand',
      'Are you sure you want to disconnect your LifeBand?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setIsConnected(false);
            Alert.alert('⚠️ Disconnected', 'LifeBand has been disconnected.\n\nHealth monitoring is now paused.');
          },
        },
      ]
    );
  };

  const handleMedicineTaken = (medicineId: string) => {
    setMedicineReminders(prev =>
      prev.map(med =>
        med.id === medicineId ? {...med, taken: !med.taken} : med
      )
    );
    Alert.alert('Medicine Reminder', 'Marked as taken! Great job staying healthy! 💊');
  };

  const summary = useMemo(
    () => ({
      heartRate: latest?.heartRate ?? null,
      spo2: latest?.spo2 ?? null,
      systolic: latest?.systolic ?? null,
      diastolic: latest?.diastolic ?? null,
      temperature: latest?.temperature ?? null,
      timestamp: latest?.timestamp,
      babyMovement: latest?.babyMovement ?? null,
      stressLevel: latest?.stressLevel ?? null,
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

  const babyMovementSeries = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({x: new Date(item.timestamp), y: item.babyMovement}))
        .reverse()
    : demoBabyMovement;

  const handleManageCareTeam = useCallback(() => {
    (navigation as any).navigate('LinkDoctor');
  }, [navigation]);

  const lastUpdated = summary.timestamp
    ? new Date(summary.timestamp).toLocaleString()
    : 'No readings yet';

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Pregnancy Tracking Section */}
        <View style={styles.pregnancySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤰 Pregnancy Journey</Text>
            <Text style={styles.sectionSubtitle}>Track your beautiful journey</Text>
          </View>
          <View style={styles.pregnancyStats}>
            <View style={styles.pregnancyStatCard}>
              <Text style={styles.pregnancyStatNumber}>28</Text>
              <Text style={styles.pregnancyStatLabel}>Weeks</Text>
              <Text style={styles.pregnancyStatSub}>2nd Trimester</Text>
            </View>
            <View style={styles.pregnancyStatCard}>
              <Text style={styles.pregnancyStatNumber}>84</Text>
              <Text style={styles.pregnancyStatLabel}>Days Left</Text>
              <Text style={styles.pregnancyStatSub}>Almost there!</Text>
            </View>
            <View style={styles.pregnancyStatCard}>
              <Text style={styles.pregnancyStatNumber}>12.5</Text>
              <Text style={styles.pregnancyStatLabel}>kg Gained</Text>
              <Text style={styles.pregnancyStatSub}>Healthy range</Text>
            </View>
          </View>
        </View>

        {/* Care Team Section */}
        <View style={styles.careTeamSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Care Team</Text>
            <TouchableOpacity onPress={handleManageCareTeam}>
              <Text style={styles.sectionAction}>Manage</Text>
            </TouchableOpacity>
          </View>
          {careTeamLoading ? (
            <View style={styles.careTeamLoading}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.careTeamLoadingText}>Updating your care team…</Text>
            </View>
          ) : linkedDoctors.length ? (
            linkedDoctors.map(doctor => (
              <View key={doctor.linkId} style={styles.careTeamCard}>
                <View style={styles.careTeamAvatar}>
                  <Text style={styles.careTeamAvatarLabel}>
                    {doctor.name
                      ?.split(' ')
                      .map(part => part[0]?.toUpperCase() ?? '')
                      .slice(0, 2)
                      .join('') || 'DR'}
                  </Text>
                </View>
                <View style={styles.careTeamInfo}>
                  <Text style={styles.careTeamName}>
                    {doctor.name ? `Dr. ${doctor.name}` : 'Doctor'}
                  </Text>
                  {doctor.specialization ? (
                    <Text style={styles.careTeamMeta}>{doctor.specialization}</Text>
                  ) : null}
                  {doctor.latestReport ? (
                    <Text style={styles.careTeamReport}>
                      Last report{' '}
                      {new Date(doctor.latestReport.createdAt).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text style={styles.careTeamReport}>
                      Waiting for first monthly report
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.careTeamEmpty}>
              <Text style={styles.careTeamEmptyTitle}>No doctors connected yet</Text>
              <Text style={styles.careTeamEmptyCopy}>
                Ask your doctor to share their LifeBand QR so they can review your readings
                and send monthly reports.
              </Text>
              <TouchableOpacity
                style={styles.careTeamButton}
                onPress={handleManageCareTeam}>
                <Text style={styles.careTeamButtonLabel}>Link a doctor</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Monthly Reports */}
        <View style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Monthly Reports</Text>
            <TouchableOpacity onPress={handleManageCareTeam}>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>
          {recentReports.length ? (
            recentReports.map(report => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDoctor}>
                    {report.doctorName ? `Dr. ${report.doctorName}` : 'Doctor'}
                  </Text>
                  <Text style={styles.reportDate}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reportPeriod}>
                  {report.periodStart} → {report.periodEnd}
                </Text>
                <Text style={styles.reportSummary}>{report.summary}</Text>
                {report.recommendations ? (
                  <Text style={styles.reportRecommendations}>
                    Recommendations: {report.recommendations}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.careTeamEmpty}>
              <Text style={styles.careTeamEmptyTitle}>Monthly report pending</Text>
              <Text style={styles.careTeamEmptyCopy}>
                Doctors submit a monthly summary after reviewing your readings. Reports will
                appear here automatically.
              </Text>
            </View>
          )}
        </View>

        {/* Medicine Reminders Section */}
        <View style={styles.medicineSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💊 Medicine Reminders</Text>
            <Text style={styles.sectionSubtitle}>Prescribed by your care team</Text>
          </View>
          <View style={styles.medicineList}>
            {medicineReminders.map((medicine) => (
              <View key={medicine.id} style={styles.medicineItem}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <Text style={styles.medicineTime}>Take at {medicine.time}</Text>
                  <Text style={styles.medicineDoctor}>Prescribed by {medicine.doctor}</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.takenButton, 
                    medicine.taken && {backgroundColor: palette.success, opacity: 0.7}
                  ]} 
                  onPress={() => handleMedicineTaken(medicine.id)}>
                  <Text style={styles.takenButtonText}>
                    {medicine.taken ? '✓ Taken' : 'Mark Taken'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

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
        <View style={styles.tilesRow}>
          <ReadingTile
            label="Baby's Movement"
            value={summary.babyMovement}
            unit="movements/hr"
            trend={hasLiveData ? 'steady' : 'up'}
          />
          <ReadingTile
            label="Mother's Stress Level"
            value={summary.stressLevel}
            unit="%"
            trend={hasLiveData ? 'steady' : 'down'}
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

        <View style={styles.chartRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>🤰 Baby Movement Trend</Text>
            <Text style={styles.chartSubtitle}>Track your baby's activity over time</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              height={180}
              width={chartWidth}
              padding={{top: 16, left: 50, right: 20, bottom: 45}}
              scale={{x: 'time'}}>
              <VictoryAxis
                dependentAxis
                style={{
                  axis: {stroke: palette.border},
                  grid: {stroke: palette.border, strokeDasharray: '4'},
                }}
              />
              <VictoryAxis
                style={{
                  axis: {stroke: palette.border},
                  grid: {stroke: 'transparent'},
                }}
              />
              <VictoryLine
                data={hasLiveData ? babyMovementSeries : demoBabyMovement}
                style={{data: {stroke: palette.primary, strokeWidth: 2}}}
              />
            </VictoryChart>
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
  // New styles for Band Connection and Medicine features
  connectionSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  scanButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  scanButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.success,
    marginRight: spacing.sm,
  },
  statusText: {
    flex: 1,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: palette.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  disconnectButtonText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  medicineSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  medicineList: {
    gap: spacing.md,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: palette.accent,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  medicineTime: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  medicineDoctor: {
    fontSize: 12,
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  takenButton: {
    backgroundColor: palette.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  takenButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  // Enhanced scan button styles
  connectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  disconnectedContainer: {
    gap: spacing.md,
  },
  enhancedScanButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: palette.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  scanTextContainer: {
    alignItems: 'center',
  },
  scanButtonTitle: {
    color: palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scanButtonSubtitle: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
    marginTop: 2,
  },
  careTeamSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  sectionAction: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  careTeamLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  careTeamLoadingText: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  careTeamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
  },
  careTeamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  careTeamAvatarLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  careTeamInfo: {
    flex: 1,
    gap: 4,
  },
  careTeamName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  careTeamMeta: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  careTeamReport: {
    color: palette.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  careTeamEmpty: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    gap: spacing.sm,
  },
  careTeamEmptyTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  careTeamEmptyCopy: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  careTeamButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  careTeamButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  reportsSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  reportCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    gap: spacing.xs,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDoctor: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  reportDate: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  reportPeriod: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  reportSummary: {
    color: palette.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  reportRecommendations: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  // Pregnancy tracking styles
  pregnancySection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.maternal.blush,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  pregnancyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  pregnancyStatCard: {
    flex: 1,
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pregnancyStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  pregnancyStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  pregnancyStatSub: {
    fontSize: 10,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});

export default PatientHomeScreen;
