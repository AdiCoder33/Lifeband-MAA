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
  VictoryGroup,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import {DoctorStackParamList} from '../../navigation/DoctorNavigator';
import {usePatientDetailQuery} from '../../features/patients/queries';
import {
  useSyncPatientDetail,
  useSyncPatientsList,
} from '../../features/patients/usePatientsSync';
import {usePatientReadings} from '../../hooks/usePatientReadings';
import {useAppStore} from '../../store/useAppStore';
import {useReadingStore} from '../../store/useReadingStore';

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
  useSyncPatientDetail(data, data?.readings);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {storedPatient?.name ?? data?.name ?? 'Patient'}
        </Text>
        <Text style={styles.meta}>
          Risk:{' '}
          <Text
            style={[
              styles.risk,
              riskStyle(storedPatient?.riskLevel ?? data?.riskLevel),
            ]}>
            {(storedPatient?.riskLevel ?? data?.riskLevel ?? 'LOW').toUpperCase()}
          </Text>
        </Text>
        <Text style={styles.meta}>
          Last reading: {formatDateTime(lastReading?.timestamp ?? data?.lastReadingAt)}
        </Text>
        <Text style={styles.meta}>
          {isFetching ? 'Refreshing data...' : ''}
        </Text>
      </View>

      <View style={styles.rangeRow}>
        {ranges.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.rangeButton,
              range.key === item.key && styles.rangeButtonActive,
            ]}
            onPress={() => setRange(item)}>
            <Text
              style={[
                styles.rangeButtonText,
                range.key === item.key && styles.rangeButtonTextActive,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Heart Rate</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={220}
          padding={{top: 24, left: 48, right: 16, bottom: 40}}
          scale={{x: 'time'}}>
          <VictoryAxis
            tickFormat={(value: Date | string | number) =>
              new Date(value).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }
          />
          <VictoryAxis dependentAxis />
          <VictoryLine
            data={heartRateSeries}
            style={{data: {stroke: '#1A73E8', strokeWidth: 3}}}
          />
        </VictoryChart>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>SpOÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={220}
          padding={{top: 24, left: 48, right: 16, bottom: 40}}
          scale={{x: 'time'}}>
          <VictoryAxis
            tickFormat={(value: Date | string | number) =>
              new Date(value).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }
          />
          <VictoryAxis dependentAxis />
          <VictoryLine
            data={spo2Series}
            style={{data: {stroke: '#0F9D58', strokeWidth: 3}}}
          />
        </VictoryChart>
      </View>

  <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Blood Pressure</Text>
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
              {name: 'SBP', symbol: {fill: '#D93025'}},
              {name: 'DBP', symbol: {fill: '#F9AB00'}},
            ]}
          />
          <VictoryAxis
            tickFormat={(value: Date | string | number) =>
              new Date(value).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }
          />
          <VictoryAxis dependentAxis />
          <VictoryGroup>
            <VictoryLine
              data={systolicSeries}
              style={{data: {stroke: '#D93025', strokeWidth: 3}}}
            />
            <VictoryLine
              data={diastolicSeries}
              style={{data: {stroke: '#F9AB00', strokeWidth: 3}}}
            />
          </VictoryGroup>
        </VictoryChart>
      </View>
    </ScrollView>
  );
};

const riskStyle = (risk?: string) => {
  switch (risk) {
    case 'HIGH':
      return styles.riskHigh;
    case 'MODERATE':
      return styles.riskModerate;
    default:
      return styles.riskLow;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFBFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202124',
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#5F6368',
  },
  risk: {
    fontWeight: '700',
  },
  riskHigh: {
    color: '#D93025',
  },
  riskModerate: {
    color: '#F9AB00',
  },
  riskLow: {
    color: '#0F9D58',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  rangeButtonActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  rangeButtonText: {
    color: '#1A73E8',
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#202124',
  },
});

export default PatientDetailScreen;
