import React, {useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import {useBle} from '../../features/ble/BleProvider';
import ReadingTile from '../../components/ReadingTile';
import {useAppStore} from '../../store/useAppStore';
import {usePatientReadings} from '../../hooks/usePatientReadings';

const ranges = [
  {key: '1h', label: '1H', days: 1 / 24},
  {key: '1d', label: '24H', days: 1},
  {key: '3d', label: '3D', days: 3},
];

const formatTimestamp = (value?: string) => {
  if (!value) {
    return 'No data yet';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString();
};

export const LiveStreamScreen: React.FC = () => {
  const {lastReading, readings: volatileReadings, clearReadings} = useBle();
  const selectedPatientId = useAppStore(state => state.selectedPatientId);
  const [range, setRange] = useState(ranges[0]);
  const persistedReadings = usePatientReadings(selectedPatientId, {
    days: range.days,
  });

  const chartData = useMemo(
    () =>
      persistedReadings.map(reading => ({
        x: new Date(reading.timestamp),
        y: reading.heartRate,
      })),
    [persistedReadings],
  );

  const history = persistedReadings.length
    ? persistedReadings
    : volatileReadings;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Stream</Text>
        <TouchableOpacity onPress={clearReadings}>
          <Text style={styles.clear}>Clear history</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.timestamp}>
        Last update: {formatTimestamp(lastReading?.timestamp)}
      </Text>

      <View style={styles.tilesRow}>
        <ReadingTile
          label="Heart Rate"
          value={lastReading?.heartRate}
          unit="bpm"
        />
        <ReadingTile label="SpO2" value={lastReading?.spo2} unit="%" />
      </View>
      <View style={styles.tilesRow}>
        <ReadingTile label="HRV" value={lastReading?.hrv} unit="ms" />
        <ReadingTile
          label="Temperature"
          value={lastReading?.temperature}
          unit="Ãƒâ€šÃ‚Â°C"
        />
      </View>
      <View style={styles.tilesRow}>
        <ReadingTile label="Systolic" value={lastReading?.systolic} unit="mmHg" />
        <ReadingTile label="Diastolic" value={lastReading?.diastolic} unit="mmHg" />
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

      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={220}
          padding={{top: 16, left: 48, right: 16, bottom: 32}}
          scale={{x: 'time'}}>
          <VictoryAxis
            tickFormat={(value: Date | string | number) =>
              new Date(value).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
          />
          <VictoryAxis dependentAxis tickFormat={(value: Date | string | number) => `${value}`} />
          <VictoryLine
            data={chartData}
            style={{data: {stroke: '#1A73E8', strokeWidth: 3}}}
          />
        </VictoryChart>
      </View>

      <Text style={styles.historyLabel}>Recent samples</Text>
      <FlatList
        data={history}
        keyExtractor={item => item.timestamp}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={styles.rowTimestamp}>{formatTimestamp(item.timestamp)}</Text>
            <Text style={styles.rowValue}>{item.heartRate} bpm</Text>
            <Text style={styles.rowValue}>{item.spo2}%</Text>
            <Text style={styles.rowValue}>
              {item.systolic}/{item.diastolic} mmHg
            </Text>
            <Text style={styles.rowValue}>{item.temperature}Ãƒâ€šÃ‚Â°C</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Waiting for readingsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202124',
  },
  clear: {
    color: '#D93025',
    fontWeight: '600',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 14,
    color: '#5F6368',
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
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
  chartContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFBFF',
    marginBottom: 16,
  },
  historyLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  listContent: {
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  rowTimestamp: {
    flex: 2,
    fontWeight: '600',
    color: '#202124',
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    color: '#5F6368',
  },
  empty: {
    paddingTop: 24,
    textAlign: 'center',
    color: '#80868B',
  },
});

export default LiveStreamScreen;
