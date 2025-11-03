import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import ScreenBackground from '../../components/ScreenBackground';

import ReadingTile from '../../components/ReadingTile';
import {DoctorStackParamList} from '../../navigation/DoctorNavigator';
import {usePatientDetailQuery} from '../../features/patients/queries';
import {
  useSyncPatientDetail,
  useSyncPatientsList,
} from '../../features/patients/usePatientsSync';
import { ReadingPayload } from '../../features/patients/types'; // Update the path to the correct module
import {usePatientReadings} from '../../hooks/usePatientReadings';
import {useAppStore} from '../../store/useAppStore';
import {useReadingStore} from '../../store/useReadingStore';
import {useAuth} from '../../context/AuthContext';
import DoctorPatientLinkService from '../../services/firebase/DoctorPatientLinkService';
import {MonthlyReportSummary} from '../../types/models';
import {palette, radii, spacing} from '../../theme';

const ranges = [
  {key: '1d', label: '24H', days: 1},
  {key: '7d', label: '7D', days: 7},
  {key: '30d', label: '30D', days: 30},
];

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : 'NA';

export const PatientDetailScreen: React.FC = () => {
  const {params} =
    useRoute<RouteProp<DoctorStackParamList, 'PatientDetail'>>();
  const [range, setRange] = useState(ranges[0]);
  const {data, isFetching} = usePatientDetailQuery(params.patientId);
  useSyncPatientDetail(data, data?.readings as ReadingPayload[] | undefined);
  useSyncPatientsList(data ? [data] : undefined);
  const storedPatient = useReadingStore(
    state => (params.patientId ? state.patients[params.patientId] : undefined),
  );
  const readings = usePatientReadings(params.patientId, {
    days: range.days,
  });
  const setSelectedPatient = useAppStore(state => state.setSelectedPatient);
  const {user} = useAuth();
  const doctorId = user?.uid;
  const [reports, setReports] = useState<MonthlyReportSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [reportRecommendations, setReportRecommendations] = useState('');
  const [reportPeriodStart, setReportPeriodStart] = useState('');
  const [reportPeriodEnd, setReportPeriodEnd] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const reportData = await DoctorPatientLinkService.getMonthlyReportsForPatient(
        params.patientId,
      );
      setReports(reportData);
    } catch (error) {
      console.log('Failed to load monthly reports', error);
    } finally {
      setReportsLoading(false);
    }
  }, [params.patientId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    setSelectedPatient(params.patientId);
    return () => setSelectedPatient(undefined);
  }, [params.patientId, setSelectedPatient]);

  const resetReportForm = () => {
    setReportSummary('');
    setReportRecommendations('');
    setReportPeriodStart('');
    setReportPeriodEnd('');
  };

  const handleOpenReportModal = () => {
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    setReportModalVisible(false);
    resetReportForm();
  };

  const handleSubmitReport = async () => {
    if (!doctorId) {
      Alert.alert('Not signed in', 'Please sign in again to submit reports.');
      return;
    }

    if (!reportSummary.trim()) {
      Alert.alert('Missing summary', 'Please add a summary of your review.');
      return;
    }

    if (!reportPeriodStart.trim() || !reportPeriodEnd.trim()) {
      Alert.alert(
        'Missing period',
        'Provide the start and end dates covered by this report.',
      );
      return;
    }

    try {
      setSubmittingReport(true);
      await DoctorPatientLinkService.submitMonthlyReport({
        doctorId,
        patientId: params.patientId,
        periodStart: reportPeriodStart.trim(),
        periodEnd: reportPeriodEnd.trim(),
        summary: reportSummary.trim(),
        recommendations: reportRecommendations.trim() || undefined,
      });
      await loadReports();
      Alert.alert('Report submitted', 'Monthly report shared with the patient.');
      handleCloseReportModal();
    } catch (error: any) {
      Alert.alert(
        'Unable to submit report',
        error?.message ?? 'Please try again later.',
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  const heartRateSeries = useMemo(
    () =>
      readings.map(item => ({
        x: new Date(item.timestamp),
        y: item.heartRate,
      })),
    [readings],
  );

  const spo2Series = useMemo(
    () =>
      readings.map(item => ({
        x: new Date(item.timestamp),
        y: item.spo2,
      })),
    [readings],
  );

  const systolicSeries = useMemo(
    () =>
      readings.map(item => ({
        x: new Date(item.timestamp),
        y: item.systolic,
      })),
    [readings],
  );

  const diastolicSeries = useMemo(
    () =>
      readings.map(item => ({
        x: new Date(item.timestamp),
        y: item.diastolic,
      })),
    [readings],
  );

  const lastReading = readings[0];
  const riskLevel = (storedPatient?.riskLevel ?? data?.riskLevel ?? 'LOW') as
    | 'LOW'
    | 'MODERATE'
    | 'HIGH';

  const patientName = storedPatient?.name ?? data?.name ?? 'Patient';
  const patientVillage = storedPatient?.village ?? data?.village;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>


        <View style={styles.topCard}>
          <View style={styles.topLeft}>
            <Text style={styles.label}>Risk level</Text>
            <View style={[styles.riskPill, riskStyle[riskLevel]]}>
              <Text style={[styles.riskLabel, riskTextStyle[riskLevel]]}>
                {riskLevel}
              </Text>
            </View>
            <Text style={styles.helper}>
              {riskLevel === 'HIGH'
                ? 'Prioritise outreach, consider escalation.'
                : riskLevel === 'MODERATE'
                ? 'Monitor trends as new vitals stream in.'
                : 'Stable - continue routine monitoring.'}
            </Text>
          </View>

          <View style={styles.topRight}>
            <Text style={styles.label}>Last reading</Text>
            <Text style={styles.value}>
              {lastReading?.timestamp
                ? new Date(lastReading.timestamp).toLocaleString()
                : formatDateTime(data?.lastReadingAt)}
            </Text>
            <Text style={styles.helper}>
              {patientVillage ? `Village: ${patientVillage}` : 'Location pending'}
            </Text>
            <Text style={styles.refreshHint}>
              {isFetching ? 'Refreshing data…' : 'Auto-sync keeps these charts fresh.'}
            </Text>
          </View>
        </View>

        <View style={styles.tilesRow}>
          <ReadingTile
            label="Heart Rate"
            value={lastReading?.heartRate}
            unit="bpm"
            trend="steady"
          />
          <ReadingTile
            label="SpO2"
            value={lastReading?.spo2}
            unit="%"
            trend="steady"
          />
        </View>
        <View style={styles.tilesRow}>
          <ReadingTile
            label="Blood Pressure"
            value={
              lastReading?.systolic && lastReading.diastolic
                ? `${lastReading.systolic}/${lastReading.diastolic}`
                : null
            }
            unit="mmHg"
            trend="steady"
            variant="secondary"
          />
          <ReadingTile
            label="Temperature"
            value={lastReading?.temperature}
            unit="°C"
            trend="steady"
            variant="secondary"
          />
        </View>

        <View style={styles.rangeRow}>
          {ranges.map(item => {
            const active = range.key === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.rangeButton, active && styles.rangeButtonActive]}
                onPress={() => setRange(item)}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.rangeButtonText,
                    active && styles.rangeButtonTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Heart rate trend</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={240}
            padding={{top: 32, left: 48, right: 16, bottom: 40}}
            scale={{x: 'time'}}>
            <VictoryAxis
              tickFormat={(value: Date | string | number) =>
                new Date(value).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }
              style={{
                axis: {stroke: palette.border},
                tickLabels: {fontSize: 11, fill: palette.textSecondary},
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value: number) => `${value}`}
              style={{
                axis: {stroke: palette.border},
                tickLabels: {fontSize: 11, fill: palette.textSecondary},
              }}
            />
            <VictoryLine
              data={heartRateSeries}
              interpolation="monotoneX"
              style={{data: {stroke: '#4C8BF5', strokeWidth: 3}}}
            />
          </VictoryChart>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Oxygen saturation</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={240}
            padding={{top: 32, left: 48, right: 16, bottom: 40}}
            scale={{x: 'time'}}>
            <VictoryAxis
              tickFormat={(value: Date | string | number) =>
                new Date(value).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }
              style={{
                axis: {stroke: palette.border},
                tickLabels: {fontSize: 11, fill: palette.textSecondary},
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value: number) => `${value}`}
              style={{
                axis: {stroke: palette.border},
                tickLabels: {fontSize: 11, fill: palette.textSecondary},
              }}
            />
            <VictoryLine
              data={spo2Series}
              interpolation="monotoneX"
              style={{data: {stroke: '#34A853', strokeWidth: 3}}}
            />
          </VictoryChart>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Blood pressure</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={240}
            padding={{top: 32, left: 48, right: 16, bottom: 40}}
            scale={{x: 'time'}}>
            <VictoryLegend
              x={60}
              orientation="horizontal"
              gutter={20}
              data={[
                {name: 'SBP', symbol: {fill: '#EA4335'}},
                {name: 'DBP', symbol: {fill: '#F9AB00'}},
              ]}
              style={{
                labels: {fill: palette.textSecondary},
              }}
            />
            <VictoryAxis
              tickFormat={(value: Date | string | number) =>
                new Date(value).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }
              style={{
                axis: {stroke: palette.border},
                tickLabels: {fontSize: 11, fill: palette.textSecondary},
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value: number) => `${value}`}
              style={{
                axis: {stroke: palette.border},
                tickLabels: {fontSize: 11, fill: palette.textSecondary},
              }}
            />
            <VictoryLine
              data={systolicSeries}
              interpolation="monotoneX"
              style={{data: {stroke: '#EA4335', strokeWidth: 3}}}
            />
            <VictoryLine
              data={diastolicSeries}
              interpolation="monotoneX"
              style={{data: {stroke: '#F9AB00', strokeWidth: 3}}}
            />
          </VictoryChart>
        </View>

        <View style={styles.monthlyReportSection}>
          <View style={styles.monthlyReportHeader}>
            <Text style={styles.monthlyReportTitle}>Monthly reports</Text>
            <TouchableOpacity onPress={loadReports}>
              <Text style={styles.monthlyReportAction}>Refresh</Text>
            </TouchableOpacity>
          </View>
          {reportsLoading ? (
            <View style={styles.reportLoading}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.reportLoadingText}>Loading reports…</Text>
            </View>
          ) : reports.length ? (
            reports.map(report => (
              <View key={report.id} style={styles.monthlyReportCard}>
                <View style={styles.monthlyReportCardHeader}>
                  <Text style={styles.monthlyReportPeriod}>
                    {report.periodStart} → {report.periodEnd}
                  </Text>
                  <Text style={styles.monthlyReportDate}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.monthlyReportSummary}>{report.summary}</Text>
                {report.recommendations ? (
                  <Text style={styles.monthlyReportRecommendations}>
                    Recommendations: {report.recommendations}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.reportEmptyState}>
              <Text style={styles.reportEmptyTitle}>No reports yet</Text>
              <Text style={styles.reportEmptyCopy}>
                Submit a monthly summary after reviewing the patient&apos;s readings.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleOpenReportModal}>
            <Text style={styles.reportButtonLabel}>Submit monthly report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Care coordination</Text>
          <Text style={styles.notesCopy}>
            Use these demo sections to capture escalations, adherence reminders, and
            consultation notes. Actual synced notes will replace these once shared
            through the LifeBand platform.
          </Text>
          <View style={styles.notesList}>
            <View style={styles.noteBullet} />
            <Text style={styles.noteItem}>
              Share this chart snapshot with the referring doctor for situational awareness.
            </Text>
          </View>
          <View style={styles.notesList}>
            <View style={styles.noteBullet} />
            <Text style={styles.noteItem}>
              For ASHA teams: log medication delivery and follow-up reminders here.
            </Text>
          </View>
          <View style={styles.notesList}>
            <View style={styles.noteBullet} />
            <Text style={styles.noteItem}>
              Patient education prompts appear here to guide lifestyle and adherence.
            </Text>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseReportModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit monthly report</Text>
            <Text style={styles.modalSubtitle}>
              Share a summary of the past month&apos;s review with the patient.
            </Text>
            <View style={styles.modalRow}>
              <View style={styles.modalField}>
                <Text style={styles.inputLabel}>Period start</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={palette.textSecondary}
                  style={styles.modalInput}
                  value={reportPeriodStart}
                  onChangeText={setReportPeriodStart}
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.inputLabel}>Period end</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={palette.textSecondary}
                  style={styles.modalInput}
                  value={reportPeriodEnd}
                  onChangeText={setReportPeriodEnd}
                />
              </View>
            </View>
            <View style={styles.modalField}>
              <Text style={styles.inputLabel}>Summary</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Key findings, risks, and next steps"
                placeholderTextColor={palette.textSecondary}
                value={reportSummary}
                onChangeText={setReportSummary}
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.inputLabel}>Recommendations (optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Prescriptions, follow-up plans, lifestyle guidance"
                placeholderTextColor={palette.textSecondary}
                value={reportRecommendations}
                onChangeText={setReportRecommendations}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondary]}
                onPress={handleCloseReportModal}
                disabled={submittingReport}>
                <Text style={styles.modalSecondaryLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary, submittingReport && styles.disabled]}
                onPress={handleSubmitReport}
                disabled={submittingReport}>
                {submittingReport ? (
                  <ActivityIndicator size="small" color={palette.textOnPrimary} />
                ) : (
                  <Text style={styles.modalPrimaryLabel}>Submit report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
};

const riskStyle: Record<'LOW' | 'MODERATE' | 'HIGH', {backgroundColor: string}> =
  {
    HIGH: {backgroundColor: '#EA433522'},
    MODERATE: {backgroundColor: '#F9AB0022'},
    LOW: {backgroundColor: '#34A85322'},
  };

const riskTextStyle: Record<'LOW' | 'MODERATE' | 'HIGH', {color: string}> = {
  HIGH: {color: '#EA4335'},
  MODERATE: {color: '#F9AB00'},
  LOW: {color: '#0F9D58'},
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  topCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topLeft: {
    flex: 1,
    marginRight: spacing.lg,
  },
  topRight: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: spacing.xs,
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  helper: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: palette.textSecondary,
  },
  refreshHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: palette.primary,
  },
  riskPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
  },
  riskLabel: {
    fontWeight: '700',
    fontSize: 13,
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  rangeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.surface,
    backgroundColor: '#102F5A',
    marginHorizontal: spacing.xs,
  },
  rangeButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  rangeButtonText: {
    color: palette.textOnDark,
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: palette.textOnPrimary,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  monthlyReportSection: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  monthlyReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthlyReportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  monthlyReportAction: {
    color: palette.primary,
    fontWeight: '600',
  },
  reportLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reportLoadingText: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  monthlyReportCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceSoft,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  monthlyReportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthlyReportPeriod: {
    fontWeight: '600',
    color: palette.textPrimary,
    fontSize: 13,
  },
  monthlyReportDate: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  monthlyReportSummary: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textPrimary,
  },
  monthlyReportRecommendations: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  reportEmptyState: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceSoft,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  reportEmptyTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  reportEmptyCopy: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  reportButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  reportButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: radii.xl,
    backgroundColor: palette.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  modalSubtitle: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  modalRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  modalInput: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.textPrimary,
    backgroundColor: palette.surface,
  },
  modalTextarea: {
    minHeight: 96,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  modalSecondary: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  modalSecondaryLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  modalPrimary: {
    backgroundColor: palette.primary,
  },
  modalPrimaryLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  notesCard: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: '#0F2B50',
    borderWidth: 1,
    borderColor: '#1F3F70',
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  notesCopy: {
    marginTop: spacing.sm,
    color: '#9CB3DC',
    fontSize: 13,
    lineHeight: 18,
  },
  notesList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  noteBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary,
    marginRight: spacing.sm,
    marginTop: spacing.sm / 2,
  },
  noteItem: {
    flex: 1,
    color: '#9CB3DC',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default PatientDetailScreen;
