import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, radii, spacing} from '../../theme';
import {useLinkedPatientsQuery} from '../../features/doctor/queries';
import DoctorPatientLinkService from '../../services/firebase/DoctorPatientLinkService';
import {useAuth} from '../../context/AuthContext';
import type {DoctorInvite, LinkedPatient} from '../../types/models';

type PatientPriority = 'low' | 'medium' | 'high';
type PatientStatus = LinkedPatient['status'];

const STATUS_FILTERS: Array<'all' | PatientStatus> = [
  'all',
  'active',
  'pending',
  'revoked',
];

const priorityColor = (priority: PatientPriority) => {
  switch (priority) {
    case 'high':
      return palette.danger;
    case 'medium':
      return palette.warning;
    default:
      return palette.success;
  }
};

const statusColor = (status: PatientStatus) => {
  switch (status) {
    case 'active':
      return palette.success;
    case 'pending':
      return palette.warning;
    case 'revoked':
    default:
      return palette.textSecondary;
  }
};

const titleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const computePriority = (patient: LinkedPatient): PatientPriority => {
  const lastReading = parseDate(patient.lastReadingAt);
  if (!lastReading) {
    return 'high';
  }
  const diffDays =
    (Date.now() - lastReading.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 14) {
    return 'high';
  }
  if (diffDays > 7) {
    return 'medium';
  }
  return 'low';
};

const formatDate = (value?: string) => {
  const parsed = parseDate(value);
  if (!parsed) {
    return '—';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const PatientManagementScreen: React.FC = () => {
  const {user} = useAuth();
  const doctorId = user?.uid;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | PatientStatus>('all');
  const [selectedPatient, setSelectedPatient] = useState<LinkedPatient | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [latestInvite, setLatestInvite] = useState<DoctorInvite | null>(null);
  const {data = [], isLoading, isFetching} = useLinkedPatientsQuery();

  const decoratedPatients = useMemo(() => {
    return data.map(patient => ({
      ...patient,
      priority: computePriority(patient),
    }));
  }, [data]);

  const filteredPatients = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return decoratedPatients.filter(patient => {
      const matchesStatus =
        statusFilter === 'all' || patient.status === statusFilter;
      const matchesSearch =
        !search ||
        patient.patientName.toLowerCase().includes(search) ||
        patient.patientId.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [decoratedPatients, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = decoratedPatients.filter(p => p.status === 'active').length;
    const pending = decoratedPatients.filter(p => p.status === 'pending').length;
    return {
      total: decoratedPatients.length,
      active,
      pending,
    };
  }, [decoratedPatients]);

  const firstLoad = isLoading && data.length === 0;

  const openPatient = (patient: LinkedPatient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const callPatient = (patient: LinkedPatient) => {
    Alert.alert(
      'Contact not available',
      `Ask ${patient.patientName} to add contact details in their profile.`,
    );
  };

  const createInvite = async () => {
    if (!doctorId) {
      Alert.alert('Not signed in', 'Please sign in again to create invites.');
      return;
    }
    try {
      setCreatingInvite(true);
      const invite = await DoctorPatientLinkService.createInvite(doctorId);
      setLatestInvite(invite);
      setInviteModal(true);
    } catch (error) {
      Alert.alert(
        'Could not create invite',
        'Please check your connection and try again.',
      );
    } finally {
      setCreatingInvite(false);
    }
  };

  const shareInvite = async () => {
    if (!latestInvite) {
      return;
    }
    try {
      await Share.share({
        title: 'LifeBand doctor invite',
        message: `Scan this LifeBand QR code or enter manually:\nInvite ID: ${latestInvite.id}\nCode: ${latestInvite.code}`,
      });
    } catch (error) {
      console.log('Share invite failed', error);
    }
  };

  return (
    <ScreenBackground>
      {firstLoad ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.loaderLabel}>Loading patients…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {isFetching && !isLoading ? (
            <View style={styles.inlineStatus}>
              <ActivityIndicator color={palette.primary} size="small" />
              <Text style={styles.inlineStatusLabel}>
                Syncing latest roster…
              </Text>
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Linked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, {color: palette.success}]}>
                {stats.active}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, {color: palette.warning}]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addPatientButton,
              creatingInvite && styles.addPatientButtonDisabled,
            ]}
            disabled={creatingInvite}
            onPress={createInvite}>
            {creatingInvite ? (
              <ActivityIndicator color={palette.textOnPrimary} />
            ) : (
              <Text style={styles.addPatientLabel}>Add patient (QR link)</Text>
            )}
            <Text style={styles.addPatientHint}>Generate a one-time QR/code to link</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={palette.textSecondary}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}>
            {STATUS_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  statusFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(filter)}>
                <Text
                  style={[
                    styles.filterChipLabel,
                    statusFilter === filter && styles.filterChipLabelActive,
                  ]}>
                  {filter === 'all' ? 'All' : titleCase(filter)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredPatients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No patients yet</Text>
              <Text style={styles.emptyCopy}>
                Invite patients using the QR screen to populate this list.
              </Text>
            </View>
          ) : (
            filteredPatients.map(patient => (
              <View key={patient.patientId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.patientName}>{patient.patientName}</Text>
                    <Text style={styles.patientMeta}>
                      ID: {patient.patientId}
                    </Text>
                  </View>
                  <View style={styles.badges}>
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: statusColor(patient.status)},
                      ]}>
                      <Text style={styles.badgeLabel}>
                        {titleCase(patient.status)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: priorityColor(patient.priority)},
                      ]}>
                      <Text style={styles.badgeLabel}>
                        {titleCase(patient.priority)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View>
                    <Text style={styles.label}>Last Reading</Text>
                    <Text style={styles.value}>
                      {formatDate(patient.lastReadingAt)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Last Report</Text>
                    <Text style={styles.value}>
                      {formatDate(patient.lastReportSubmittedAt)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Village</Text>
                    <Text style={styles.value}>
                      {patient.village ?? '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryAction]}
                    onPress={() => openPatient(patient)}>
                    <Text style={styles.primaryActionLabel}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryAction]}
                    onPress={() => callPatient(patient)}>
                    <Text style={styles.secondaryActionLabel}>Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {selectedPatient?.patientName ?? 'Patient'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Status: {selectedPatient ? titleCase(selectedPatient.status) : '—'}
            </Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Linked on</Text>
              <Text style={styles.modalValue}>
                {formatDate(selectedPatient?.linkedAt)}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Last Reading</Text>
              <Text style={styles.modalValue}>
                {formatDate(selectedPatient?.lastReadingAt)}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Village</Text>
              <Text style={styles.modalValue}>
                {selectedPatient?.village ?? '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowModal(false)}>
              <Text style={styles.modalCloseLabel}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={inviteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModal(false)}>
        <View style={styles.inviteOverlay}>
          <View style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>Share this with your patient</Text>
            <Text style={styles.inviteCopy}>
              They can scan the QR or enter the code to link with you.
            </Text>
            <View style={styles.qrWrapper}>
              {latestInvite ? (
                <QRCode
                  value={`${latestInvite.id}|${latestInvite.code}`}
                  size={180}
                  backgroundColor={palette.surface}
                  color={palette.textPrimary}
                />
              ) : (
                <ActivityIndicator color={palette.primary} />
              )}
            </View>
            {latestInvite ? (
              <View style={styles.inviteMetaRow}>
                <View>
                  <Text style={styles.inviteMetaLabel}>Invite ID</Text>
                  <Text style={styles.inviteMetaValue}>{latestInvite.id}</Text>
                </View>
                <View>
                  <Text style={styles.inviteMetaLabel}>Code</Text>
                  <Text style={styles.inviteCode}>{latestInvite.code}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.inviteActions}>
              <TouchableOpacity
                style={[styles.inviteBtn, styles.inviteSecondary]}
                onPress={() => setInviteModal(false)}>
                <Text style={styles.inviteSecondaryLabel}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inviteBtn, styles.invitePrimary]}
                onPress={shareInvite}
                disabled={!latestInvite}>
                <Text style={styles.invitePrimaryLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderLabel: {
    marginTop: spacing.sm,
    color: palette.textSecondary,
  },
  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inlineStatusLabel: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: palette.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.textPrimary,
  },
  filterScroll: {
    marginVertical: spacing.sm,
  },
  filterChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterChipLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  filterChipLabelActive: {
    color: palette.textOnPrimary,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyCopy: {
    fontSize: 13,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  patientMeta: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeLabel: {
    color: palette.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    color: palette.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 14,
    color: palette.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: palette.primary,
  },
  primaryActionLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: palette.border,
  },
  secondaryActionLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  loaderLabelText: {
    color: palette.textSecondary,
  },
  addPatientButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addPatientButtonDisabled: {
    opacity: 0.7,
  },
  addPatientLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  addPatientHint: {
    color: palette.textOnPrimary,
    opacity: 0.85,
    marginTop: 2,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalLabel: {
    color: palette.textSecondary,
  },
  modalValue: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  modalClose: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  modalCloseLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  inviteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  inviteCard: {
    width: '100%',
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  inviteCopy: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  inviteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  inviteMetaLabel: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  inviteMetaValue: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  inviteCode: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inviteBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  invitePrimary: {
    backgroundColor: palette.primary,
  },
  invitePrimaryLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  inviteSecondary: {
    borderWidth: 1,
    borderColor: palette.border,
  },
  inviteSecondaryLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default PatientManagementScreen;
