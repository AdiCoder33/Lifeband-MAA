import React, {useMemo} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/ScreenBackground';
import AppHeader from '../../components/AppHeader';
import {useAppStore} from '../../store/useAppStore';
import {useReadingStore as useReadingStoreHook} from '../../store/useReadingStore';
import {useLiveRiskFeed} from '../../services/live/useLiveRiskFeed';
import {usePatientsQuery} from '../../features/patients/queries';
import {useSyncPatientsList} from '../../features/patients/usePatientsSync';
import {RiskFeedItem, RiskLevel} from '../../types/models';
import {DoctorStackScreenProps} from '../../navigation/DoctorNavigator';
import {palette, radii, spacing} from '../../theme';

const riskPriority: Record<RiskLevel, number> = {
  HIGH: 0,
  MODERATE: 1,
  LOW: 2,
};

const riskCopy: Record<RiskLevel, string> = {
  HIGH: 'Critical attention needed',
  MODERATE: 'Monitor closely',
  LOW: 'Stable',
};

const RiskFeedCard: React.FC<{data: RiskFeedItem[]}> = ({data}) => {
  if (!data.length) {
    return (
      <View style={styles.riskEmpty}>
        <Text style={styles.riskEmptyTitle}>All mothers are doing well 💕</Text>
        <Text style={styles.riskEmptyCopy}>
          Maternal care alerts from ASHA workers and monitoring devices will appear here when attention is needed.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.riskList}>
      {data.slice(0, 6).map(item => (
        <View key={`${item.patientId}-${item.receivedAt}`} style={styles.riskRow}>
          <View style={[styles.riskBadge, riskBadgeStyles[item.risk]]}>
            <Text style={styles.riskBadgeLabel}>{item.risk}</Text>
          </View>
          <View style={styles.riskBody}>
            <Text style={styles.riskTitle}>{item.patientName}</Text>
            {item.message ? (
              <Text style={styles.riskMessage}>{item.message}</Text>
            ) : null}
            <Text style={styles.riskMeta}>
              {new Date(item.receivedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              · {riskCopy[item.risk]}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const riskBadgeStyles: Record<
  RiskLevel,
  {backgroundColor: string; borderColor: string; color: string}
> = {
  HIGH: {
    backgroundColor: palette.maternal.blush,
    borderColor: palette.danger,
    color: palette.danger,
  },
  MODERATE: {
    backgroundColor: palette.maternal.peach,
    borderColor: palette.warning,
    color: palette.textPrimary,
  },
  LOW: {
    backgroundColor: palette.maternal.mint,
    borderColor: palette.success,
    color: palette.textPrimary,
  },
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
            riskLevel: (item.riskLevel ?? 'LOW') as RiskLevel,
            village: item.village,
            lastReadingAt: item.lastReadingAt,
          }))
        : Object.values(cachedPatients).map(item => ({
            id: item.id,
            name: item.name,
            riskLevel: (item.riskLevel ?? 'LOW') as RiskLevel,
            village: item.village,
            lastReadingAt: item.lastReadingAt,
          }));
    return list.sort(
      (a, b) =>
        (riskPriority[a.riskLevel] ?? Number.MAX_SAFE_INTEGER) -
        (riskPriority[b.riskLevel] ?? Number.MAX_SAFE_INTEGER),
    );
  }, [cachedPatients, data]);

  const highRiskCount = patients.filter(item => item.riskLevel === 'HIGH').length;
  const moderateRiskCount = patients.filter(
    item => item.riskLevel === 'MODERATE',
  ).length;

  const handlePatientPress = (id: string) => {
    setSelectedPatient(id);
    navigation.navigate('PatientDetail', {patientId: id});
  };

  return (
    <ScreenBackground>
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        refreshing={isFetching}
        onRefresh={refetch}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <AppHeader
              title="Care command centre"
              subtitle="Monitor escalations, prioritise outreach, and drill into patient details."
              rightAccessory={
                <TouchableOpacity
                  onPress={() => refetch()}
                  style={styles.refreshButton}
                  accessibilityRole="button">
                  <Text style={styles.refreshLabel}>Refresh</Text>
                </TouchableOpacity>
              }
            />

            {offline ? (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineTitle}>Offline mode</Text>
                <Text style={styles.offlineCopy}>
                  Showing cached patient data until the device reconnects.
                </Text>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardFirst]}>
                <Text style={styles.statLabel}>Total patients</Text>
                <Text style={styles.statValue}>{patients.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>High risk</Text>
                <Text style={[styles.statValue, styles.statHigh]}>
                  {highRiskCount}
                </Text>
              </View>
              <View style={[styles.statCard, styles.statCardLast]}>
                <Text style={styles.statLabel}>Moderate risk</Text>
                <Text style={[styles.statValue, styles.statModerate]}>
                  {moderateRiskCount}
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Maternal Care Alerts</Text>
                <Text style={styles.sectionMeta}>
                  Live alerts for expecting mothers and newborns from monitoring devices and ASHA workers.
                </Text>
              </View>
              <RiskFeedCard data={riskFeed} />
            </View>

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Maternal Care Registry</Text>
                <Text style={styles.sectionMeta}>
                  Tap to open the trending dashboard with demo charts and notes.
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => handlePatientPress(item.id)}
            style={styles.patientCard}
            accessibilityRole="button">
            <View style={styles.patientBadgeRow}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarLabel}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.patientMeta}>
                  {item.village ? `${item.village} · ` : ''}
                  Last reading{' '}
                  {item.lastReadingAt
                    ? new Date(item.lastReadingAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </Text>
              </View>
              <View style={[styles.patientRiskPill, riskPillStyles[item.riskLevel]]}>
                <Text style={[styles.patientRiskLabel, riskTextStyles[item.riskLevel]]}>
                  {item.riskLevel}
                </Text>
              </View>
            </View>
            <Text style={styles.patientHint}>
              View demo vitals timeline, quick notes, and care plan templates.
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptyCopy}>
              Once ASHA workers sync LifeBand data, patients will populate here automatically.
            </Text>
          </View>
        }
      />
    </ScreenBackground>
  );
};

const riskPillStyles: Record<RiskLevel, {backgroundColor: string}> = {
  HIGH: {backgroundColor: '#EA433522'},
  MODERATE: {backgroundColor: '#F9AB0022'},
  LOW: {backgroundColor: '#34A85322'},
};

const riskTextStyles: Record<RiskLevel, {color: string}> = {
  HIGH: {color: '#EA4335'},
  MODERATE: {color: '#F9AB00'},
  LOW: {color: '#0F9D58'},
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  refreshButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.surface,
  },
  refreshLabel: {
    color: palette.textOnDark,
    fontWeight: '600',
  },
  offlineBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: '#3C2E04',
    borderWidth: 1,
    borderColor: '#F9AB00',
  },
  offlineTitle: {
    color: '#F9AB00',
    fontWeight: '700',
  },
  offlineCopy: {
    marginTop: spacing.xs,
    color: '#FDE9B8',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.sm / 2,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: '#102F5A',
    borderWidth: 1,
    borderColor: '#1F3F70',
  },
  statCardFirst: {
    marginLeft: 0,
  },
  statCardLast: {
    marginRight: 0,
  },
  statLabel: {
    color: '#9CB3DC',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: 24,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  statHigh: {
    color: '#EA4335',
  },
  statModerate: {
    color: '#F9AB00',
  },
  sectionCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  sectionMeta: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: palette.textSecondary,
  },
  riskList: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  riskRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  riskBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: spacing.md,
  },
  riskBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textOnDark,
  },
  riskBody: {
    flex: 1,
  },
  riskTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  riskMessage: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 13,
  },
  riskMeta: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: palette.textSecondary,
  },
  riskEmpty: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceSoft,
  },
  riskEmptyTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  riskEmptyCopy: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: palette.textSecondary,
  },
  patientCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  patientBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  patientAvatarLabel: {
    fontWeight: '700',
    color: palette.textOnPrimary,
    fontSize: 18,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  patientMeta: {
    marginTop: 2,
    fontSize: 12,
    color: palette.textSecondary,
  },
  patientRiskPill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  patientRiskLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  patientHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: palette.textSecondary,
  },
  emptyState: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: palette.maternal.lavender,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  emptyCopy: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});

export default DoctorOverviewScreen;
