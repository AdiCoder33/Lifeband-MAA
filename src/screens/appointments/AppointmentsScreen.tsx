import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {palette, spacing, radii} from '../../theme';

type Appointment = {
  id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
  type: 'checkup' | 'ultrasound' | 'consultation' | 'emergency';
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
};

const AppointmentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Regular Prenatal Checkup',
      doctor: 'Dr. Sarah Johnson',
      date: '2025-10-15',
      time: '10:00 AM',
      type: 'checkup',
      status: 'upcoming',
      location: 'Maternal Health Center - Room 203',
      notes: 'Bring previous test results',
    },
    {
      id: '2',
      title: '20-Week Ultrasound',
      doctor: 'Dr. Michael Chen',
      date: '2025-10-22',
      time: '2:30 PM',
      type: 'ultrasound',
      status: 'upcoming',
      location: 'Radiology Department',
      notes: 'Gender reveal appointment',
    },
    {
      id: '3',
      title: 'Nutrition Consultation',
      doctor: 'Dr. Emily Rodriguez',
      date: '2025-10-08',
      time: '11:15 AM',
      type: 'consultation',
      status: 'completed',
      location: 'Wellness Center',
      notes: 'Discussed dietary plan for third trimester',
    },
    {
      id: '4',
      title: 'High Blood Pressure Follow-up',
      doctor: 'Dr. Sarah Johnson',
      date: '2025-10-29',
      time: '9:30 AM',
      type: 'checkup',
      status: 'upcoming',
      location: 'Maternal Health Center - Room 203',
      notes: 'Monitor BP trends from LifeBand data',
    },
  ]);

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'checkup':
        return '🩺';
      case 'ultrasound':
        return '📱';
      case 'consultation':
        return '💬';
      case 'emergency':
        return '🚨';
      default:
        return '📅';
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
        return palette.primary;
      case 'completed':
        return palette.success;
      case 'cancelled':
        return palette.danger;
      default:
        return palette.textSecondary;
    }
  };

  const handleReschedule = (appointmentId: string) => {
    Alert.alert(
      'Reschedule Appointment',
      'This will open the scheduling system to book a new time.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Continue', onPress: () => console.log('Reschedule:', appointmentId)},
      ]
    );
  };

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setAppointments(prev =>
              prev.map(apt =>
                apt.id === appointmentId ? {...apt, status: 'cancelled'} : apt
              )
            );
          },
        },
      ]
    );
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status !== 'upcoming');

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Book New Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🚨</Text>
              <Text style={styles.quickActionText}>Emergency Booking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateText}>No upcoming appointments</Text>
              <TouchableOpacity style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>Book Your Next Visit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingAppointments.map(appointment => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentType}>
                    <Text style={styles.appointmentIcon}>
                      {getTypeIcon(appointment.type)}
                    </Text>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                      <Text style={styles.appointmentDoctor}>{appointment.doctor}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, {backgroundColor: `${getStatusColor(appointment.status)}20`}]}>
                    <Text style={[styles.statusText, {color: getStatusColor(appointment.status)}]}>
                      {appointment.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>{appointment.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🕐</Text>
                    <Text style={styles.detailText}>{appointment.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{appointment.location}</Text>
                  </View>
                  {appointment.notes && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📝</Text>
                      <Text style={styles.detailText}>{appointment.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.appointmentActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rescheduleButton]}
                    onPress={() => handleReschedule(appointment.id)}>
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancel(appointment.id)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Past Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Appointments</Text>
          {pastAppointments.map(appointment => (
            <View key={appointment.id} style={[styles.appointmentCard, styles.pastAppointment]}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentType}>
                  <Text style={styles.appointmentIcon}>
                    {getTypeIcon(appointment.type)}
                  </Text>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    <Text style={styles.appointmentDoctor}>{appointment.doctor}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: `${getStatusColor(appointment.status)}20`}]}>
                  <Text style={[styles.statusText, {color: getStatusColor(appointment.status)}]}>
                    {appointment.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <Text style={styles.detailText}>{appointment.date}</Text>
                </View>
                {appointment.notes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📝</Text>
                    <Text style={styles.detailText}>{appointment.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textOnPrimary,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textOnPrimary,
  },
  appointmentCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pastAppointment: {
    opacity: 0.8,
    borderLeftWidth: 4,
    borderLeftColor: palette.textSecondary,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appointmentIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  appointmentDoctor: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  appointmentDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: palette.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  rescheduleButton: {
    backgroundColor: `${palette.primary}20`,
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
  },
  cancelButton: {
    backgroundColor: `${palette.danger}20`,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.danger,
  },
});

export default AppointmentsScreen;