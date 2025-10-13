import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
type AppointmentType = 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'procedure';

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  symptoms?: string;
  contactNumber: string;
};

const DoctorAppointmentsScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Priya Sharma',
      patientId: 'P001',
      date: '2024-01-15',
      time: '09:00',
      duration: 30,
      type: 'consultation',
      status: 'confirmed',
      priority: 'normal',
      symptoms: 'Fever, headache',
      contactNumber: '+91-98765-43210',
      notes: 'First visit - general consultation',
    },
    {
      id: '2',
      patientName: 'Anjali Reddy',
      patientId: 'P002',
      date: '2024-01-15',
      time: '09:30',
      duration: 45,
      type: 'follow-up',
      status: 'scheduled',
      priority: 'high',
      symptoms: 'Follow-up for diabetes',
      contactNumber: '+91-98765-43211',
      notes: 'Check blood sugar levels',
    },
    {
      id: '3',
      patientName: 'Meera Patel',
      patientId: 'P003',
      date: '2024-01-15',
      time: '10:15',
      duration: 30,
      type: 'check-up',
      status: 'completed',
      priority: 'normal',
      symptoms: 'Regular check-up',
      contactNumber: '+91-98765-43212',
    },
    {
      id: '4',
      patientName: 'Kavitha Kumar',
      patientId: 'P004',
      date: '2024-01-15',
      time: '11:00',
      duration: 60,
      type: 'procedure',
      status: 'scheduled',
      priority: 'urgent',
      symptoms: 'Minor surgical procedure',
      contactNumber: '+91-98765-43213',
      notes: 'Pre-op preparations required',
    },
    {
      id: '5',
      patientName: 'Sunita Gupta',
      patientId: 'P005',
      date: '2024-01-15',
      time: '14:00',
      duration: 30,
      type: 'consultation',
      status: 'cancelled',
      priority: 'low',
      symptoms: 'Cold symptoms',
      contactNumber: '+91-98765-43214',
      notes: 'Patient rescheduled',
    },
  ];

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return palette.success;
      case 'scheduled':
        return palette.info;
      case 'completed':
        return palette.primary;
      case 'cancelled':
        return palette.danger;
      case 'no-show':
        return palette.warning;
      default:
        return palette.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return palette.danger;
      case 'high':
        return palette.warning;
      case 'normal':
        return palette.info;
      case 'low':
        return palette.textSecondary;
      default:
        return palette.textSecondary;
    }
  };

  const getTypeIcon = (type: AppointmentType) => {
    switch (type) {
      case 'consultation':
        return '👩‍⚕️';
      case 'follow-up':
        return '🔄';
      case 'check-up':
        return '🩺';
      case 'emergency':
        return '🚨';
      case 'procedure':
        return '🏥';
      default:
        return '📅';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === selectedDate;
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesStatus && matchesSearch;
  });

  const todaysStats = {
    total: appointments.filter(a => a.date === selectedDate).length,
    confirmed: appointments.filter(a => a.date === selectedDate && a.status === 'confirmed').length,
    completed: appointments.filter(a => a.date === selectedDate && a.status === 'completed').length,
    pending: appointments.filter(a => a.date === selectedDate && a.status === 'scheduled').length,
  };

  const handleAppointmentAction = (appointment: Appointment, action: string) => {
    switch (action) {
      case 'confirm':
        Alert.alert('Confirm Appointment', `Confirm appointment with ${appointment.patientName}?`);
        break;
      case 'reschedule':
        Alert.alert('Reschedule', `Reschedule appointment with ${appointment.patientName}`);
        break;
      case 'cancel':
        Alert.alert('Cancel Appointment', `Cancel appointment with ${appointment.patientName}?`);
        break;
      case 'complete':
        Alert.alert('Mark Complete', `Mark appointment with ${appointment.patientName} as completed?`);
        break;
      case 'call':
        Alert.alert('Call Patient', `Calling ${appointment.contactNumber}`);
        break;
      case 'notes':
        Alert.alert('Add Notes', `Add notes for ${appointment.patientName}`);
        break;
    }
  };

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todaysStats.total}</Text>
            <Text style={styles.statLabel}>Total Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.success}]}>{todaysStats.confirmed}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.primary}]}>{todaysStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.warning}]}>{todaysStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>📅 Select Date</Text>
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

        {/* Search & Filters */}
        <View style={styles.filtersSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={palette.textSecondary}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.activeFilterButton,
                ]}
                onPress={() => setFilterStatus(status)}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterStatus === status && styles.activeFilterButtonText,
                  ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowNewAppointment(true)}>
            <Text style={styles.actionButtonText}>➕ New Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Bulk Actions', 'Select multiple appointments for bulk actions')}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>⚡ Bulk Actions</Text>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>
            🗓️ Appointments - {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateTitle}>No Appointments Found</Text>
              <Text style={styles.emptyStateDescription}>
                {filterStatus === 'all' 
                  ? 'No appointments scheduled for this date'
                  : `No ${filterStatus} appointments found`}
              </Text>
            </View>
          ) : (
            filteredAppointments.map(appointment => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentTime}>
                    <Text style={styles.timeText}>{appointment.time}</Text>
                    <Text style={styles.durationText}>{appointment.duration} min</Text>
                  </View>
                  
                  <View style={styles.appointmentInfo}>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{appointment.patientName}</Text>
                      <Text style={styles.patientId}>ID: {appointment.patientId}</Text>
                    </View>
                    
                    <View style={styles.appointmentMeta}>
                      <View style={styles.typeContainer}>
                        <Text style={styles.typeIcon}>{getTypeIcon(appointment.type)}</Text>
                        <Text style={styles.typeText}>{appointment.type}</Text>
                      </View>
                      
                      <View style={styles.badges}>
                        <View
                          style={[
                            styles.statusBadge,
                            {backgroundColor: getStatusColor(appointment.status)},
                          ]}>
                          <Text style={styles.badgeText}>{appointment.status}</Text>
                        </View>
                        
                        <View
                          style={[
                            styles.priorityBadge,
                            {backgroundColor: getPriorityColor(appointment.priority)},
                          ]}>
                          <Text style={styles.badgeText}>{appointment.priority}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                
                {appointment.symptoms && (
                  <View style={styles.symptomsContainer}>
                    <Text style={styles.symptomsLabel}>Symptoms:</Text>
                    <Text style={styles.symptomsText}>{appointment.symptoms}</Text>
                  </View>
                )}
                
                {appointment.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                  </View>
                )}
                
                <View style={styles.appointmentActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.callBtn]}
                    onPress={() => handleAppointmentAction(appointment, 'call')}>
                    <Text style={styles.actionBtnText}>📞 Call</Text>
                  </TouchableOpacity>
                  
                  {appointment.status === 'scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.confirmBtn]}
                      onPress={() => handleAppointmentAction(appointment, 'confirm')}>
                      <Text style={styles.actionBtnText}>✅ Confirm</Text>
                    </TouchableOpacity>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.completeBtn]}
                      onPress={() => handleAppointmentAction(appointment, 'complete')}>
                      <Text style={styles.actionBtnText}>✔️ Complete</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rescheduleBtn]}
                    onPress={() => handleAppointmentAction(appointment, 'reschedule')}>
                    <Text style={styles.actionBtnText}>🔄 Reschedule</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.notesBtn]}
                    onPress={() => handleAppointmentAction(appointment, 'notes')}>
                    <Text style={styles.actionBtnText}>📝 Notes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* New Appointment Modal */}
      <Modal
        visible={showNewAppointment}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewAppointment(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ New Appointment</Text>
            <Text style={styles.modalDescription}>
              Create a new appointment for a patient
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowNewAppointment(false);
                  Alert.alert('New Appointment', 'Opening appointment booking form...');
                }}>
                <Text style={styles.modalButtonText}>Create Appointment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => setShowNewAppointment(false)}>
                <Text style={[styles.modalButtonText, styles.modalSecondaryButtonText]}>Cancel</Text>
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
  filtersSection: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 16,
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  statusFilters: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  activeFilterButton: {
    backgroundColor: palette.primary,
  },
  filterButtonText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
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
  appointmentsSection: {
    marginBottom: spacing.xl,
  },
  appointmentCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  appointmentTime: {
    marginRight: spacing.md,
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
  appointmentInfo: {
    flex: 1,
  },
  patientInfo: {
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
  },
  appointmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  typeText: {
    fontSize: 14,
    color: palette.textPrimary,
    textTransform: 'capitalize',
  },
  badges: {
    flexDirection: 'row',
  },
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.xs,
  },
  priorityBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.xs,
  },
  badgeText: {
    color: palette.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  symptomsContainer: {
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  symptomsLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  symptomsText: {
    fontSize: 14,
    color: palette.textPrimary,
  },
  notesContainer: {
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: palette.textPrimary,
  },
  appointmentActions: {
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
  callBtn: {
    backgroundColor: palette.success,
  },
  confirmBtn: {
    backgroundColor: palette.info,
  },
  completeBtn: {
    backgroundColor: palette.primary,
  },
  rescheduleBtn: {
    backgroundColor: palette.warning,
  },
  notesBtn: {
    backgroundColor: palette.textSecondary,
  },
  actionBtnText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  modalSecondaryButton: {
    backgroundColor: palette.surface,
  },
  modalButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalSecondaryButtonText: {
    color: palette.textPrimary,
  },
});

export default DoctorAppointmentsScreen;