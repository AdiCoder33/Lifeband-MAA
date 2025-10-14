import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
  patientName?: string;
  patientId?: string;
  appointmentType?: string;
  duration: number;
};

type DaySchedule = {
  date: string;
  day: string;
  slots: TimeSlot[];
};

const DoctorScheduleScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');

  // Sample schedule data
  const schedule: DaySchedule[] = [
    {
      date: '2024-01-15',
      day: 'Monday',
      slots: [
        {
          id: '1',
          time: '09:00',
          available: false,
          patientName: 'Priya Sharma',
          patientId: 'P001',
          appointmentType: 'Consultation',
          duration: 30,
        },
        {
          id: '2',
          time: '09:30',
          available: false,
          patientName: 'Anjali Reddy',
          patientId: 'P002',
          appointmentType: 'Follow-up',
          duration: 45,
        },
        {
          id: '3',
          time: '10:15',
          available: true,
          duration: 30,
        },
        {
          id: '4',
          time: '10:45',
          available: true,
          duration: 30,
        },
        {
          id: '5',
          time: '11:15',
          available: false,
          patientName: 'Meera Patel',
          patientId: 'P003',
          appointmentType: 'Check-up',
          duration: 30,
        },
        {
          id: '6',
          time: '14:00',
          available: true,
          duration: 60,
        },
        {
          id: '7',
          time: '15:00',
          available: true,
          duration: 30,
        },
        {
          id: '8',
          time: '15:30',
          available: true,
          duration: 30,
        },
        {
          id: '9',
          time: '16:00',
          available: false,
          patientName: 'Kavitha Kumar',
          patientId: 'P004',
          appointmentType: 'Procedure',
          duration: 60,
        },
      ],
    },
  ];

  const currentDaySchedule = schedule.find(s => s.date === selectedDate) || schedule[0];
  
  const scheduleStats = {
    totalSlots: currentDaySchedule.slots.length,
    bookedSlots: currentDaySchedule.slots.filter(slot => !slot.available).length,
    availableSlots: currentDaySchedule.slots.filter(slot => slot.available).length,
    totalHours: currentDaySchedule.slots.reduce((total, slot) => total + slot.duration, 0) / 60,
  };

  const handleSlotAction = (slot: TimeSlot, action: string) => {
    switch (action) {
      case 'book':
        Alert.alert('Book Slot', `Book ${slot.time} slot for new appointment?`);
        break;
      case 'edit':
        Alert.alert('Edit Appointment', `Edit appointment at ${slot.time}`);
        break;
      case 'cancel':
        Alert.alert('Cancel Appointment', `Cancel appointment with ${slot.patientName}?`);
        break;
      case 'reschedule':
        Alert.alert('Reschedule', `Reschedule appointment with ${slot.patientName}`);
        break;
      case 'block':
        Alert.alert('Block Slot', `Block ${slot.time} slot as unavailable?`);
        break;
    }
  };

  const getSlotColor = (slot: TimeSlot) => {
    if (!slot.available) {
      switch (slot.appointmentType) {
        case 'Consultation':
          return palette.primary;
        case 'Follow-up':
          return palette.success;
        case 'Check-up':
          return palette.info;
        case 'Procedure':
          return palette.warning;
        default:
          return palette.textSecondary;
      }
    }
    return palette.surface;
  };

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{scheduleStats.totalSlots}</Text>
            <Text style={styles.statLabel}>Total Slots</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.success}]}>{scheduleStats.bookedSlots}</Text>
            <Text style={styles.statLabel}>Booked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.info}]}>{scheduleStats.availableSlots}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.primary}]}>{scheduleStats.totalHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>📅 Schedule Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {Array.from({length: 7}, (_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              const dateString = date.toISOString().split('T')[0];
              const isSelected = dateString === selectedDate;
              
              return (
                <TouchableOpacity
                  key={dateString}
                  style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                  onPress={() => setSelectedDate(dateString)}>
                  <Text style={[styles.dateDay, isSelected && styles.selectedDateText]}>
                    {date.toLocaleDateString('en-US', {weekday: 'short'})}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.selectedDateText]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.selectedDateText]}>
                    {date.toLocaleDateString('en-US', {month: 'short'})}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewModeSection}>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'day' && styles.activeViewMode]}
              onPress={() => setViewMode('day')}>
              <Text style={[styles.viewModeText, viewMode === 'day' && styles.activeViewModeText]}>
                Day View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
              onPress={() => setViewMode('week')}>
              <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>
                Week View
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('New Appointment', 'Schedule a new appointment')}>
            <Text style={styles.actionButtonText}>➕ New Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Block Time', 'Block time slots')}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>🚫 Block Time</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>
            🗓️ {currentDaySchedule.day} Schedule - {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          <View style={styles.timelineContainer}>
            {/* Morning Sessions */}
            <View style={styles.sessionContainer}>
              <Text style={styles.sessionTitle}>🌅 Morning Session</Text>
              {currentDaySchedule.slots
                .filter(slot => parseInt(slot.time.split(':')[0]) < 12)
                .map(slot => (
                  <View key={slot.id} style={[styles.slotCard, {borderLeftColor: getSlotColor(slot)}]}>
                    <View style={styles.slotHeader}>
                      <View style={styles.slotTime}>
                        <Text style={styles.timeText}>{slot.time}</Text>
                        <Text style={styles.durationText}>{slot.duration} min</Text>
                      </View>
                      
                      <View style={styles.slotStatus}>
                        {slot.available ? (
                          <View style={styles.availableBadge}>
                            <Text style={styles.availableText}>Available</Text>
                          </View>
                        ) : (
                          <View style={styles.bookedBadge}>
                            <Text style={styles.bookedText}>Booked</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {!slot.available && (
                      <View style={styles.appointmentDetails}>
                        <Text style={styles.patientName}>{slot.patientName}</Text>
                        <Text style={styles.patientId}>ID: {slot.patientId}</Text>
                        <Text style={styles.appointmentType}>{slot.appointmentType}</Text>
                      </View>
                    )}
                    
                    <View style={styles.slotActions}>
                      {slot.available ? (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.bookBtn]}
                            onPress={() => handleSlotAction(slot, 'book')}>
                            <Text style={styles.actionBtnText}>📅 Book</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.blockBtn]}
                            onPress={() => handleSlotAction(slot, 'block')}>
                            <Text style={styles.actionBtnText}>🚫 Block</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.editBtn]}
                            onPress={() => handleSlotAction(slot, 'edit')}>
                            <Text style={styles.actionBtnText}>✏️ Edit</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.rescheduleBtn]}
                            onPress={() => handleSlotAction(slot, 'reschedule')}>
                            <Text style={styles.actionBtnText}>🔄 Reschedule</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => handleSlotAction(slot, 'cancel')}>
                            <Text style={styles.actionBtnText}>❌ Cancel</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
            </View>
            
            {/* Afternoon Sessions */}
            <View style={styles.sessionContainer}>
              <Text style={styles.sessionTitle}>🌞 Afternoon Session</Text>
              {currentDaySchedule.slots
                .filter(slot => parseInt(slot.time.split(':')[0]) >= 12)
                .map(slot => (
                  <View key={slot.id} style={[styles.slotCard, {borderLeftColor: getSlotColor(slot)}]}>
                    <View style={styles.slotHeader}>
                      <View style={styles.slotTime}>
                        <Text style={styles.timeText}>{slot.time}</Text>
                        <Text style={styles.durationText}>{slot.duration} min</Text>
                      </View>
                      
                      <View style={styles.slotStatus}>
                        {slot.available ? (
                          <View style={styles.availableBadge}>
                            <Text style={styles.availableText}>Available</Text>
                          </View>
                        ) : (
                          <View style={styles.bookedBadge}>
                            <Text style={styles.bookedText}>Booked</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {!slot.available && (
                      <View style={styles.appointmentDetails}>
                        <Text style={styles.patientName}>{slot.patientName}</Text>
                        <Text style={styles.patientId}>ID: {slot.patientId}</Text>
                        <Text style={styles.appointmentType}>{slot.appointmentType}</Text>
                      </View>
                    )}
                    
                    <View style={styles.slotActions}>
                      {slot.available ? (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.bookBtn]}
                            onPress={() => handleSlotAction(slot, 'book')}>
                            <Text style={styles.actionBtnText}>📅 Book</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.blockBtn]}
                            onPress={() => handleSlotAction(slot, 'block')}>
                            <Text style={styles.actionBtnText}>🚫 Block</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.editBtn]}
                            onPress={() => handleSlotAction(slot, 'edit')}>
                            <Text style={styles.actionBtnText}>✏️ Edit</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.rescheduleBtn]}
                            onPress={() => handleSlotAction(slot, 'reschedule')}>
                            <Text style={styles.actionBtnText}>🔄 Reschedule</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => handleSlotAction(slot, 'cancel')}>
                            <Text style={styles.actionBtnText}>❌ Cancel</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </View>

        {/* Schedule Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 Daily Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Working Hours:</Text>
              <Text style={styles.summaryValue}>9:00 AM - 5:00 PM</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Appointments:</Text>
              <Text style={styles.summaryValue}>{scheduleStats.bookedSlots}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available Slots:</Text>
              <Text style={styles.summaryValue}>{scheduleStats.availableSlots}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Utilization:</Text>
              <Text style={styles.summaryValue}>
                {((scheduleStats.bookedSlots / scheduleStats.totalSlots) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  statCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
  },
  selectedDateCard: {
    backgroundColor: palette.primary,
  },
  dateDay: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  dateMonth: {
    fontSize: 10,
    color: palette.textSecondary,
  },
  selectedDateText: {
    color: palette.textOnPrimary,
  },
  viewModeSection: {
    marginBottom: spacing.lg,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.xs,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  activeViewMode: {
    backgroundColor: palette.primary,
  },
  viewModeText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  activeViewModeText: {
    color: palette.textOnPrimary,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: palette.card,
  },
  actionButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: palette.textPrimary,
  },
  scheduleSection: {
    marginBottom: spacing.xl,
  },
  timelineContainer: {
    gap: spacing.lg,
  },
  sessionContainer: {
    marginBottom: spacing.lg,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  slotCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slotTime: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  durationText: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  slotStatus: {
    alignItems: 'flex-end',
  },
  availableBadge: {
    backgroundColor: palette.success,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  bookedBadge: {
    backgroundColor: palette.warning,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  availableText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bookedText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: spacing.sm,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  patientId: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  appointmentType: {
    fontSize: 14,
    color: palette.primary,
    fontWeight: '500',
  },
  slotActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  actionBtn: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  bookBtn: {
    backgroundColor: palette.success,
  },
  blockBtn: {
    backgroundColor: palette.textSecondary,
  },
  editBtn: {
    backgroundColor: palette.info,
  },
  rescheduleBtn: {
    backgroundColor: palette.warning,
  },
  cancelBtn: {
    backgroundColor: palette.danger,
  },
  actionBtnText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  summarySection: {
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
});

export default DoctorScheduleScreen;