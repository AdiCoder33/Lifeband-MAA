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
import ScreenBackground from '../../components/ScreenBackground';
import AppHeader from '../../components/AppHeader';
import {useBle} from '../../features/ble/BleProvider';
import ReadingTile from '../../components/ReadingTile';
import {useAppStore} from '../../store/useAppStore';
import {usePatientReadings} from '../../hooks/usePatientReadings';
import {palette, radii, spacing} from '../../theme';

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
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
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
    <ScreenBackground>
      <View style={styles.content}>
        <AppHeader
          title="Live streaming vitals"
          subtitle="See every heartbeat, saturation, and pressure update in real time."
          rightAccessory={
            <TouchableOpacity
              onPress={clearReadings}
              style={styles.clearButton}
              accessibilityRole="button">
              <Text style={styles.clearButtonLabel}>Clear history</Text>
            </TouchableOpacity>
          }
        />

        <Text style={styles.timestamp}>
          Last update · {formatTimestamp(lastReading?.timestamp)}
        </Text>

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
            label="HRV"
            value={lastReading?.hrv}
            unit="ms"
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
        <View style={styles.tilesRow}>
          <ReadingTile
            label="Systolic"
            value={lastReading?.systolic}
            unit="mmHg"
            trend="steady"
            variant="secondary"
          />
          <ReadingTile
            label="Diastolic"
            value={lastReading?.diastolic}
            unit="mmHg"
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
          <Text style={styles.chartTitle}>Heart rate stream</Text>
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
              data={chartData}
              interpolation="monotoneX"
              style={{data: {stroke: '#4C8BF5', strokeWidth: 3}}}
            />
          </VictoryChart>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent samples</Text>
          <Text style={styles.historyMeta}>
            {history.length ? `${history.length} readings in memory` : 'Waiting for readings'}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableLabel, styles.tableTimestamp]}>Time</Text>
          <Text style={styles.tableLabel}>HR</Text>
          <Text style={styles.tableLabel}>SpO2</Text>
          <Text style={styles.tableLabel}>BP</Text>
          <Text style={styles.tableLabel}>Temp</Text>
        </View>

        <FlatList
          data={history}
          keyExtractor={item => item.timestamp}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <View style={styles.row}>
              <Text style={[styles.rowValue, styles.rowTimestamp]}>
                {formatTimestamp(item.timestamp)}
              </Text>
              <Text style={styles.rowValue}>{item.heartRate ?? '--'} bpm</Text>
              <Text style={styles.rowValue}>{item.spo2 ?? '--'}%</Text>
              <Text style={styles.rowValue}>
                {item.systolic && item.diastolic
                  ? `${item.systolic}/${item.diastolic}`
                  : '--'}
              </Text>
              <Text style={styles.rowValue}>
                {item.temperature != null ? `${item.temperature}°C` : '--'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Waiting for LifeBand readings to stream in…
            </Text>
          }
        />
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  clearButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.surface,
  },
  clearButtonLabel: {
    color: palette.textOnDark,
    fontWeight: '600',
  },
  timestamp: {
    marginTop: spacing.sm,
    color: '#9CB3DC',
    fontSize: 13,
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  rangeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.surface,
    marginHorizontal: spacing.xs,
    backgroundColor: '#102F5A',
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
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  historyHeader: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  historyMeta: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  tableHeader: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tableLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
    textAlign: 'right',
  },
  tableTimestamp: {
    textAlign: 'left',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    color: palette.textSecondary,
    fontSize: 13,
  },
  rowTimestamp: {
    textAlign: 'left',
    fontWeight: '600',
    color: palette.textPrimary,
  },
  empty: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: palette.textSecondary,
  },
});

export default LiveStreamScreen;
