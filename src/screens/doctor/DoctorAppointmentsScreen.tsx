import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, radii, spacing} from '../../theme';
import {
  useDoctorAppointmentsQuery,
  useLinkedPatientsQuery,
  useUpdateAppointmentStatusMutation,
} from '../../features/doctor/queries';
import type {Appointment as FirebaseAppointment} from '../../services/firebase/health';
import type {LinkedPatient} from '../../types/models';

type AppointmentStatus = FirebaseAppointment['status'];
type AppointmentType = FirebaseAppointment['type'];

type AppointmentRow = FirebaseAppointment & {
  scheduledAt: Date | null;
  patientName: string;
  patientVillage?: string;
};

const DAYS_VISIBLE = 7;
const STATUS_FILTERS: Array<'all' | AppointmentStatus> = [
  'all',
  'scheduled',
  'rescheduled',
  'completed',
  'cancelled',
];

const TYPE_ICON: Record<AppointmentType, string> = {
  consultation: 'CONS',
  'follow-up': 'F-UP',
  checkup: 'CHK',
  emergency: 'EMR',
};

const titleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const ensureDate = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof (value as {toDate?: () => Date}).toDate === 'function') {
    return (value as {toDate: () => Date}).toDate();
  }
  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dateKey = (date: Date | null) =>
  date ? date.toISOString().split('T')[0] : '';

const formatSlot = (date: Date | null, duration: number) => {
  if (!date) {
    return 'Time pending';
  }
  const start = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  if (!duration) {
    return start;
  }
  const end = new Date(date.getTime() + duration * 60 * 1000).toLocaleTimeString(
    [],
    {hour: '2-digit', minute: '2-digit'},
  );
  return `${start} – ${end}`;
};

const derivePriority = (
  type: AppointmentType,
  status: AppointmentStatus,
): 'low' | 'normal' | 'high' | 'urgent' => {
  if (type === 'emergency') {
    return 'urgent';
  }
  if (status === 'cancelled') {
    return 'low';
  }
  if (type === 'follow-up') {
    return 'high';
  }
  return 'normal';
};

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'completed':
      return palette.success;
    case 'cancelled':
      return palette.danger;
    case 'rescheduled':
      return palette.warning;
    default:
      return palette.info;
  }
};

const getPriorityColor = (priority: 'low' | 'normal' | 'high' | 'urgent') => {
  switch (priority) {
    case 'urgent':
      return palette.danger;
    case 'high':
      return palette.warning;
    case 'normal':
      return palette.primary;
    default:
      return palette.textSecondary;
  }
};

const DoctorAppointmentsScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [statusFilter, setStatusFilter] =
    useState<'all' | AppointmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  const {
    data: appointmentsData = [],
    isLoading: appointmentsLoading,
    isFetching: appointmentsFetching,
  } = useDoctorAppointmentsQuery();
  const {data: linkedPatients = [], isLoading: patientsLoading} =
    useLinkedPatientsQuery();
  const updateStatus = useUpdateAppointmentStatusMutation();

  const patientLookup = useMemo(() => {
    const map = new Map<string, LinkedPatient>();
    linkedPatients.forEach(patient => {
      map.set(patient.patientId, patient);
    });
    return map;
  }, [linkedPatients]);

  const appointments = useMemo<AppointmentRow[]>(() => {
    return appointmentsData.map(item => {
      const scheduledAt = ensureDate(item.scheduledDate);
      const patient = patientLookup.get(item.patientId);
      return {
        ...item,
        scheduledAt,
        patientName:
          patient?.patientName ??
          patient?.patientId ??
          item.patientId ??
          'Patient',
        patientVillage: patient?.village,
      };
    });
  }, [appointmentsData, patientLookup]);

  const filteredAppointments = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return appointments
      .filter(item => {
        const matchesDate = dateKey(item.scheduledAt) === selectedDate;
        const matchesStatus =
          statusFilter === 'all' || item.status === statusFilter;
        const matchesSearch =
          !search ||
          item.patientName.toLowerCase().includes(search) ||
          (item.patientId ?? '').toLowerCase().includes(search);
        return matchesDate && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const aTime = a.scheduledAt?.getTime() ?? 0;
        const bTime = b.scheduledAt?.getTime() ?? 0;
        return aTime - bTime;
      });
  }, [appointments, searchQuery, selectedDate, statusFilter]);

  const dayStats = useMemo(() => {
    const todays = appointments.filter(
      item => dateKey(item.scheduledAt) === selectedDate,
    );
    return {
      total: todays.length,
      scheduled: todays.filter(
        item => item.status === 'scheduled' || item.status === 'rescheduled',
      ).length,
      completed: todays.filter(item => item.status === 'completed').length,
      cancelled: todays.filter(item => item.status === 'cancelled').length,
    };
  }, [appointments, selectedDate]);

  const confirmStatusChange = useCallback(
    (appointment: AppointmentRow, status: AppointmentStatus, label: string) => {
      Alert.alert(
        `Mark as ${label}`,
        `Update ${appointment.patientName}'s appointment to ${label.toLowerCase()}?`,
        [
          {text: 'Not now', style: 'cancel'},
          {
            text: 'Update',
            onPress: () =>
              updateStatus
                .mutateAsync({appointmentId: appointment.id, status})
                .catch(error => {
                  Alert.alert(
                    'Unable to update',
                    (error as Error)?.message ?? 'Please try again later.',
                  );
                }),
          },
        ],
      );
    },
    [updateStatus],
  );

  const handleCall = useCallback((appointment: AppointmentRow) => {
    Alert.alert(
      'Contact details',
      `Ask ${appointment.patientName} to add a phone number in their profile to enable calling from this screen.`,
    );
  }, []);

  const handleNotes = useCallback((appointment: AppointmentRow) => {
    Alert.alert(
      'Appointment notes',
      appointment.notes?.trim() || 'No notes recorded yet.',
    );
  }, []);

  const renderStatusFilter = (value: 'all' | AppointmentStatus) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.filterChip,
        statusFilter === value && styles.filterChipActive,
      ]}
      onPress={() => setStatusFilter(value)}>
      <Text
        style={[
          styles.filterChipLabel,
          statusFilter === value && styles.filterChipLabelActive,
        ]}>
        {value === 'all' ? 'All' : titleCase(value)}
      </Text>
    </TouchableOpacity>
  );

  const dateChips = Array.from({length: DAYS_VISIBLE}, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const key = date.toISOString().split('T')[0];
    const active = key === selectedDate;
    return (
      <TouchableOpacity
        key={key}
        style={[styles.dateChip, active && styles.dateChipActive]}
        onPress={() => setSelectedDate(key)}>
        <Text style={[styles.dateChipDay, active && styles.dateChipTextActive]}>
          {date.toLocaleDateString('en-US', {weekday: 'short'})}
        </Text>
        <Text
          style={[styles.dateChipNumber, active && styles.dateChipTextActive]}>
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  });

  const firstLoad =
    (appointmentsLoading || patientsLoading) && appointmentsData.length === 0;

  const selectedDateLabel = useMemo(() => {
    const date = new Date(selectedDate);
    if (Number.isNaN(date.getTime())) {
      return selectedDate;
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  return (
    <ScreenBackground>
      {firstLoad ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.loaderLabel}>Loading appointments…</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {appointmentsFetching && !appointmentsLoading ? (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={palette.primary} size="small" />
                <Text style={styles.inlineStatusLabel}>
                  Syncing latest updates…
                </Text>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dayStats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: palette.info}]}>
                  {dayStats.scheduled}
                </Text>
                <Text style={styles.statLabel}>Scheduled</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: palette.success}]}>
                  {dayStats.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: palette.danger}]}>
                  {dayStats.cancelled}
                </Text>
                <Text style={styles.statLabel}>Cancelled</Text>
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScroll}>
                {dateChips}
              </ScrollView>
            </View>

            <View style={styles.filtersSection}>
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
                style={styles.filtersScroll}>
                {STATUS_FILTERS.map(renderStatusFilter)}
              </ScrollView>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={() => setShowNewAppointment(true)}>
                <Text style={styles.primaryActionLabel}>New Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() =>
                  Alert.alert(
                    'Bulk actions',
                    'Select appointments from the list to update multiple entries (coming soon).',
                  )
                }>
                <Text style={styles.secondaryActionLabel}>Bulk Actions</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                Appointments — {selectedDateLabel}
              </Text>
              <Text style={styles.listMeta}>
                Showing {filteredAppointments.length} of {dayStats.total}
              </Text>
            </View>

            {filteredAppointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nothing scheduled</Text>
                <Text style={styles.emptyCopy}>
                  {statusFilter === 'all'
                    ? 'Patients have not booked a visit for this day yet.'
                    : `No ${titleCase(statusFilter)} visits found.`}
                </Text>
              </View>
            ) : (
              filteredAppointments.map(appointment => {
                const priority = derivePriority(
                  appointment.type,
                  appointment.status,
                );
                return (
                  <View key={appointment.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.slotLabel}>
                          {formatSlot(
                            appointment.scheduledAt,
                            appointment.duration,
                          )}
                        </Text>
                        {appointment.scheduledAt ? (
                          <Text style={styles.slotSubLabel}>
                            {appointment.scheduledAt.toLocaleDateString(
                              'en-US',
                              {month: 'short', day: 'numeric'},
                            )}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.badgesRow}>
                        <View
                          style={[
                            styles.badge,
                            {backgroundColor: getStatusColor(appointment.status)},
                          ]}>
                          <Text style={styles.badgeLabel}>
                            {titleCase(appointment.status)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            {backgroundColor: getPriorityColor(priority)},
                          ]}>
                          <Text style={styles.badgeLabel}>
                            {titleCase(priority)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.patientRow}>
                      <View style={styles.patientAvatar}>
                        <Text style={styles.patientAvatarLabel}>
                          {appointment.patientName.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>
                          {appointment.patientName}
                        </Text>
                        {appointment.patientId ? (
                          <Text style={styles.patientMeta}>
                            ID: {appointment.patientId}
                          </Text>
                        ) : null}
                        {appointment.patientVillage ? (
                          <Text style={styles.patientMeta}>
                            {appointment.patientVillage}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.typePill}>
                        <Text style={styles.typeIcon}>
                          {TYPE_ICON[appointment.type]}
                        </Text>
                        <Text style={styles.typeLabel}>
                          {titleCase(appointment.type)}
                        </Text>
                      </View>
                    </View>

                    {appointment.notes ? (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesLabel}>Notes</Text>
                        <Text style={styles.notesValue}>
                          {appointment.notes}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.actionsBar}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.callBtn]}
                        onPress={() => handleCall(appointment)}>
                        <Text style={styles.actionLabel}>Call</Text>
                      </TouchableOpacity>

                      {appointment.status !== 'completed' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.completeBtn]}
                          disabled={updateStatus.isPending}
                          onPress={() =>
                            confirmStatusChange(
                              appointment,
                              'completed',
                              'Completed',
                            )
                          }>
                          <Text style={styles.actionLabel}>Complete</Text>
                        </TouchableOpacity>
                      )}

                      {appointment.status !== 'rescheduled' &&
                        appointment.status !== 'completed' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.rescheduleBtn]}
                            disabled={updateStatus.isPending}
                            onPress={() =>
                              confirmStatusChange(
                                appointment,
                                'rescheduled',
                                'Rescheduled',
                              )
                            }>
                            <Text style={styles.actionLabel}>Reschedule</Text>
                          </TouchableOpacity>
                        )}

                      {appointment.status !== 'cancelled' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.cancelBtn]}
                          disabled={updateStatus.isPending}
                          onPress={() =>
                            confirmStatusChange(
                              appointment,
                              'cancelled',
                              'Cancelled',
                            )
                          }>
                          <Text style={styles.actionLabel}>Cancel</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.notesBtn]}
                        onPress={() => handleNotes(appointment)}>
                        <Text style={styles.actionLabel}>Notes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <Modal
            visible={showNewAppointment}
            transparent
            animationType="slide"
            onRequestClose={() => setShowNewAppointment(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>New appointment</Text>
                <Text style={styles.modalCopy}>
                  Booking from this dashboard will be unlocked once doctors can
                  define working hours. For now, invite patients to request a
                  visit from their app.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalPrimary}
                    onPress={() => setShowNewAppointment(false)}>
                    <Text style={styles.modalPrimaryLabel}>Understood</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSecondary}
                    onPress={() => setShowNewAppointment(false)}>
                    <Text style={styles.modalSecondaryLabel}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
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
    padding: spacing.xl,
  },
  loaderLabel: {
    marginTop: spacing.md,
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
    marginBottom: spacing.lg,
    gap: spacing.sm,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  dateScroll: {
    marginBottom: spacing.lg,
  },
  dateChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  dateChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  dateChipDay: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  dateChipNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  dateChipTextActive: {
    color: palette.textOnPrimary,
  },
  filtersSection: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.textPrimary,
  },
  filtersScroll: {
    marginTop: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primaryActionLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryActionLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  listMeta: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
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
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  slotSubLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textOnPrimary,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  patientAvatarLabel: {
    color: palette.textOnPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  patientInfo: {
    flex: 1,
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
  typePill: {
    alignItems: 'flex-end',
  },
  typeIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  typeLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textTransform: 'capitalize',
  },
  notesBox: {
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  notesLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  notesValue: {
    fontSize: 13,
    color: palette.textPrimary,
  },
  actionsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionBtn: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  callBtn: {
    backgroundColor: palette.info,
  },
  completeBtn: {
    backgroundColor: palette.success,
  },
  rescheduleBtn: {
    backgroundColor: palette.warning,
  },
  cancelBtn: {
    backgroundColor: palette.danger,
  },
  notesBtn: {
    backgroundColor: palette.textSecondary,
  },
  actionLabel: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalCopy: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modalPrimary: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalPrimaryLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  modalSecondary: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalSecondaryLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
});

export default DoctorAppointmentsScreen;
