import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, radii, spacing} from '../../theme';
import {
  useDoctorAppointmentsQuery,
  useLinkedPatientsQuery,
} from '../../features/doctor/queries';
import type {Appointment as FirebaseAppointment} from '../../services/firebase/health';
import type {LinkedPatient} from '../../types/models';

type AppointmentStatus = FirebaseAppointment['status'];
type AppointmentType = FirebaseAppointment['type'];

type AppointmentRow = FirebaseAppointment & {
  scheduledAt: Date | null;
  slotKey: string;
  patientName: string;
  patientVillage?: string;
};

type SlotRow = {
  id: string;
  label: string;
  available: boolean;
  appointments: AppointmentRow[];
};

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 17;
const SLOT_MINUTES = 30;
const VIEW_MODES: Array<'day' | 'week'> = ['day', 'week'];
const UPCOMING_DAYS = 5;

const pad = (value: number) => value.toString().padStart(2, '0');
const slotKey = (date: Date | null) =>
  date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : '';
const dateKey = (date: Date | null) =>
  date ? date.toISOString().split('T')[0] : '';
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

const buildTemplate = (isoDate: string): Array<{id: string; start: Date}> => {
  const base = new Date(isoDate);
  if (Number.isNaN(base.getTime())) {
    return [];
  }
  base.setHours(0, 0, 0, 0);
  const slots: Array<{id: string; start: Date}> = [];
  for (
    let minutes = DAY_START_HOUR * 60;
    minutes < DAY_END_HOUR * 60;
    minutes += SLOT_MINUTES
  ) {
    const slotDate = new Date(base);
    slotDate.setMinutes(minutes);
    slots.push({
      id: `${isoDate}-${slotKey(slotDate)}`,
      start: slotDate,
    });
  }
  return slots;
};

const getTypeLabel = (type: AppointmentType) => {
  switch (type) {
    case 'consultation':
      return 'Consultation';
    case 'follow-up':
      return 'Follow-up';
    case 'checkup':
      return 'Check-up';
    case 'emergency':
      return 'Emergency';
    default:
      return 'Visit';
  }
};

const DoctorScheduleScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const {data: appointmentsData = [], isLoading} = useDoctorAppointmentsQuery();
  const {data: linkedPatients = []} = useLinkedPatientsQuery();

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
        slotKey: slotKey(scheduledAt),
        patientName:
          patient?.patientName ??
          patient?.patientId ??
          item.patientId ??
          'Patient',
        patientVillage: patient?.village,
      };
    });
  }, [appointmentsData, patientLookup]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AppointmentRow[]>();
    appointments.forEach(appt => {
      const key = dateKey(appt.scheduledAt);
      if (!key) {
        return;
      }
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(appt);
    });
    return map;
  }, [appointments]);

  const slotsForSelectedDay = useMemo<SlotRow[]>(() => {
    const template = buildTemplate(selectedDate);
    if (!template.length) {
      return [];
    }
    const dayAppointments = appointmentsByDate.get(selectedDate) ?? [];
    const templateKeys = new Set(template.map(slot => slotKey(slot.start)));

    dayAppointments.forEach(appt => {
      if (appt.slotKey && !templateKeys.has(appt.slotKey) && appt.scheduledAt) {
        template.push({
          id: `${selectedDate}-${appt.slotKey}-extra`,
          start: appt.scheduledAt,
        });
        templateKeys.add(appt.slotKey);
      }
    });

    template.sort((a, b) => a.start.getTime() - b.start.getTime());

    return template.map(slot => {
      const key = slotKey(slot.start);
      const matches = dayAppointments.filter(appt => appt.slotKey === key);
      const label = slot.start.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: slot.id,
        label,
        available: matches.length === 0,
        appointments: matches,
      };
    });
  }, [appointmentsByDate, selectedDate]);

  const dayStats = useMemo(() => {
    const totalSlots = slotsForSelectedDay.length;
    const bookedSlots = slotsForSelectedDay.filter(slot => !slot.available).length;
    const availableSlots = totalSlots - bookedSlots;
    const hoursBooked =
      (appointmentsByDate
        .get(selectedDate)
        ?.reduce((sum, appt) => sum + (appt.duration ?? 0), 0) ?? 0) / 60;
    return {totalSlots, bookedSlots, availableSlots, hoursBooked};
  }, [appointmentsByDate, selectedDate, slotsForSelectedDay]);

  const weeklySummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({length: UPCOMING_DAYS}, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() + index);
      const key = day.toISOString().split('T')[0];
      const dayAppointments = appointmentsByDate.get(key) ?? [];
      const booked = dayAppointments.length;
      return {
        date: key,
        label: day.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        booked,
      };
    });
  }, [appointmentsByDate]);

  const firstLoad = isLoading && appointmentsData.length === 0;

  const handleSlotAction = (slot: SlotRow) => {
    if (slot.available) {
      Alert.alert(
        'Blocked slot',
        'Scheduling from this screen will be enabled when working hours are configured.',
      );
      return;
    }
    const appointment = slot.appointments[0];
    Alert.alert(
      'Visit details',
      `${appointment.patientName}\n${getTypeLabel(appointment.type)}`,
    );
  };

  return (
    <ScreenBackground>
      {firstLoad ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loaderLabel}>Loading schedule…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.modeRow}>
            {VIEW_MODES.map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  viewMode === mode && styles.modeButtonActive,
                ]}
                onPress={() => setViewMode(mode)}>
                <Text
                  style={[
                    styles.modeButtonLabel,
                    viewMode === mode && styles.modeButtonLabelActive,
                  ]}>
                  {titleCase(mode)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dayStats.totalSlots}</Text>
              <Text style={styles.statLabel}>Slots</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, {color: palette.success}]}>
                {dayStats.bookedSlots}
              </Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, {color: palette.info}]}>
                {dayStats.availableSlots}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {dayStats.hoursBooked.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Choose Day</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateScroll}>
              {weeklySummary.map(item => {
                const active = item.date === selectedDate;
                return (
                  <TouchableOpacity
                    key={item.date}
                    style={[
                      styles.dateChip,
                      active && styles.dateChipActive,
                    ]}
                    onPress={() => setSelectedDate(item.date)}>
                    <Text
                      style={[
                        styles.dateChipLabel,
                        active && styles.dateChipLabelActive,
                      ]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateChipCount,
                        active && styles.dateChipLabelActive,
                      ]}>
                      {item.booked} booked
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {viewMode === 'week' ? (
            <View style={styles.weekGrid}>
              {weeklySummary.map(item => (
                <View key={item.date} style={styles.weekCard}>
                  <Text style={styles.weekLabel}>{item.label}</Text>
                  <Text style={styles.weekValue}>{item.booked}</Text>
                  <Text style={styles.weekMeta}>booked visits</Text>
                </View>
              ))}
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Timeline</Text>
              {slotsForSelectedDay.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No working hours yet</Text>
                  <Text style={styles.emptyCopy}>
                    Define schedule slots to start accepting bookings.
                  </Text>
                </View>
              ) : (
                slotsForSelectedDay.map(slot => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      !slot.available && styles.slotBusy,
                    ]}
                    onPress={() => handleSlotAction(slot)}>
                    <View style={styles.slotHeader}>
                      <Text style={styles.slotTime}>{slot.label}</Text>
                      <View
                        style={[
                          styles.slotBadge,
                          slot.available
                            ? styles.slotBadgeAvailable
                            : styles.slotBadgeBusy,
                        ]}>
                        <Text
                          style={[
                            styles.slotBadgeLabel,
                            !slot.available && styles.slotBadgeLabelBusy,
                          ]}>
                          {slot.available ? 'Available' : 'Booked'}
                        </Text>
                      </View>
                    </View>
                    {!slot.available ? (
                      <View>
                        {slot.appointments.map(appt => (
                          <View key={appt.id} style={styles.slotDetails}>
                            <Text style={styles.slotPatient}>
                              {appt.patientName}
                            </Text>
                            <Text style={styles.slotMeta}>
                              {getTypeLabel(appt.type)}
                            </Text>
                            {appt.patientVillage ? (
                              <Text style={styles.slotMeta}>
                                {appt.patientVillage}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </ScrollView>
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
  modeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  modeButtonLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  modeButtonLabelActive: {
    color: palette.textOnPrimary,
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
    fontSize: 20,
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
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  dateChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  dateChipLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  dateChipLabelActive: {
    color: palette.textOnPrimary,
  },
  dateChipCount: {
    fontSize: 11,
    color: palette.textSecondary,
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  weekCard: {
    width: '48%',
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  weekLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  weekValue: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  weekMeta: {
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
  },
  emptyCopy: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  slotCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: palette.card,
  },
  slotBusy: {
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slotTime: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  slotBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  slotBadgeAvailable: {
    backgroundColor: palette.success,
  },
  slotBadgeBusy: {
    backgroundColor: palette.warning,
  },
  slotBadgeLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  slotBadgeLabelBusy: {
    color: palette.textOnPrimary,
  },
  slotDetails: {
    marginTop: spacing.xs,
  },
  slotPatient: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  slotMeta: {
    fontSize: 12,
    color: palette.textSecondary,
  },
});

export default DoctorScheduleScreen;
