import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {useAppStore} from '../store/useAppStore';
import ReadingTile from '../components/ReadingTile';
import {usePatientReadings} from '../hooks/usePatientReadings';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {name ? `${name}'s health` : 'Patient dashboard'}
      </Text>
      {summary.timestamp ? (
        <Text style={styles.subtitle}>
          Last synced reading: {new Date(summary.timestamp).toLocaleString()}
        </Text>
      ) : (
        <Text style={styles.subtitle}>
          Sync your LifeBand to start building your health trends.
        </Text>
      )}

      <View style={styles.tilesRow}>
        <ReadingTile label="Heart Rate" value={summary.heartRate} unit="bpm" />
        <ReadingTile label="SpO₂" value={summary.spo2} unit="%" />
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
        />
        <ReadingTile
          label="Temperature"
          value={summary.temperature}
          unit="°C"
        />
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Trends</Text>
        <Text style={styles.placeholderText}>
          Historical charts will appear here once more readings are synced.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#5F6368',
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeholder: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FE',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#5F6368',
  },
});

export default PatientHomeScreen;
