import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

  useEffect(() => {
    setSelectedPatient(params.patientId);
    return () => setSelectedPatient(undefined);
  }, [params.patientId, setSelectedPatient]);

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
