import React, {useMemo} from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppStore} from '../../store/useAppStore';
import {useReadingStore as useReadingStoreHook} from '../../store/useReadingStore';
import {useLiveRiskFeed} from '../../services/live/useLiveRiskFeed';
import {usePatientsQuery} from '../../features/patients/queries';
import {useSyncPatientsList} from '../../features/patients/usePatientsSync';
import {RiskFeedItem, RiskLevel} from '../../types/models';
import {DoctorStackScreenProps} from '../../navigation/DoctorNavigator';

const riskPriority: Record<RiskLevel, number> = {
  HIGH: 0,
  MODERATE: 1,
  LOW: 2,
};

const RiskFeedList: React.FC<{data: RiskFeedItem[]}> = ({data}) => {
  if (!data.length) {
    return (
      <Text style={styles.emptyHint}>
        Live risk alerts will appear here when patients are flagged.
      </Text>
    );
  }
  return (
    <View style={styles.card}>
      {data.map(item => (
        <View key={`${item.patientId}-${item.receivedAt}`} style={styles.feedRow}>
          <View style={[styles.riskPill, pillStyle(item.risk)]}>
            <Text style={styles.riskPillText}>{item.risk}</Text>
          </View>
          <View style={styles.feedBody}>
            <Text style={styles.feedTitle}>{item.patientName}</Text>
            {item.message ? (
              <Text style={styles.feedMessage}>{item.message}</Text>
            ) : null}
            <Text style={styles.feedTimestamp}>
              {new Date(item.receivedAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const pillStyle = (risk: RiskLevel) => {
  switch (risk) {
    case 'HIGH':
      return styles.pillHigh;
    case 'MODERATE':
      return styles.pillModerate;
    default:
      return styles.pillLow;
  }
};

type Navigation = DoctorStackScreenProps<'DoctorOverview'>['navigation'];

export const DoctorOverviewScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const riskFeed = useAppStore(state => state.riskFeed);
  const setSelectedPatient = useAppStore(state => state.setSelectedPatient);
  const offline = useAppStore(state => state.offline);
  const {data, isFetching, refetch} = usePatientsQuery();
  useSyncPatientsList(data);
  useLiveRiskFeed(true);
  const cachedPatients = useReadingStoreHook(state => state.patients);
  const patients = useMemo(() => {
    const list =
      data && data.length
        ? data.map(item => ({
            id: item.id,
            name: item.name,
            riskLevel: item.riskLevel ?? 'LOW',
            village: item.village,
            lastReadingAt: item.lastReadingAt,
          }))
        : Object.values(cachedPatients).map(item => ({
            id: item.id,
            name: item.name,
            riskLevel: item.riskLevel ?? 'LOW',
            village: item.village,
            lastReadingAt: item.lastReadingAt,
          }));
    return list.sort(
      (a, b) =>
        (riskPriority[a.riskLevel as RiskLevel] ??
          Number.MAX_SAFE_INTEGER) -
        (riskPriority[b.riskLevel as RiskLevel] ??
          Number.MAX_SAFE_INTEGER),
    );
  }, [cachedPatients, data]);

  const handlePatientPress = (id: string) => {
    navigation.navigate('PatientDetail', {patientId: id});
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }>
      <Text style={styles.heading}>Live Risk Feed</Text>
      <RiskFeedList data={riskFeed} />
      {offline ? (
        <Text style={styles.offlineBanner}>Offline mode - showing cached data</Text>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Patients</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={styles.link}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.patientRow}
            onPress={() => handlePatientPress(item.id)}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.name}</Text>
              {item.village ? (
                <Text style={styles.patientMeta}>{item.village}</Text>
              ) : null}
              {item.lastReadingAt ? (
                <Text style={styles.patientMeta}>
                  Last reading: {new Date(item.lastReadingAt).toLocaleString()}
                </Text>
              ) : null}
            </View>
            <View style={[styles.riskBadge, badgeStyle(item.riskLevel as RiskLevel)]}>
              <Text style={styles.riskBadgeText}>
                {(item.riskLevel || 'LOW').toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyHint}>
            No patients found. Pull to refresh once connectivity is available.
          </Text>
        }
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const badgeStyle = (risk: RiskLevel) => {
  switch (risk) {
    case 'HIGH':
      return styles.badgeHigh;
    case 'MODERATE':
      return styles.badgeModerate;
    default:
      return styles.badgeLow;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFBFF',
    marginBottom: 20,
  },
  emptyHint: {
    padding: 16,
    textAlign: 'center',
    color: '#80868B',
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  feedBody: {
    flex: 1,
    marginLeft: 12,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  feedMessage: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 2,
  },
  feedTimestamp: {
    fontSize: 11,
    color: '#9AA0A6',
    marginTop: 2,
  },
  riskPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  riskPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pillHigh: {
    backgroundColor: '#D93025',
  },
  pillModerate: {
    backgroundColor: '#F9AB00',
  },
  pillLow: {
    backgroundColor: '#0F9D58',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  link: {
    color: '#1A73E8',
    fontWeight: '600',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  patientMeta: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 2,
  },
  riskBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeHigh: {
    backgroundColor: '#D93025',
  },
  badgeModerate: {
    backgroundColor: '#F9AB00',
  },
  badgeLow: {
    backgroundColor: '#0F9D58',
  },
  offlineBanner: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF3CD',
    color: '#856404',
    marginBottom: 12,
  },
});

export default DoctorOverviewScreen;
