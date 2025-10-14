import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  condition: string;
  lastVisit: string;
  nextAppointment?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'discharged';
  phone: string;
  email?: string;
  medicalRecord: string;
};

const PatientManagementScreen: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      gender: 'female',
      condition: 'Pregnancy - 24 weeks',
      lastVisit: '2024-10-10',
      nextAppointment: '2024-10-20',
      priority: 'medium',
      status: 'active',
      phone: '+1-555-0123',
      email: 'sarah.j@email.com',
      medicalRecord: 'MR001234',
    },
    {
      id: '2',
      name: 'Emily Davis',
      age: 32,
      gender: 'female',
      condition: 'Postpartum checkup',
      lastVisit: '2024-10-12',
      nextAppointment: '2024-11-12',
      priority: 'low',
      status: 'active',
      phone: '+1-555-0456',
      medicalRecord: 'MR001235',
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      age: 35,
      gender: 'female',
      condition: 'High-risk pregnancy',
      lastVisit: '2024-10-13',
      nextAppointment: '2024-10-15',
      priority: 'high',
      status: 'active',
      phone: '+1-555-0789',
      medicalRecord: 'MR001236',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.medicalRecord.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return palette.danger;
      case 'medium':
        return palette.warning;
      case 'low':
        return palette.success;
      default:
        return palette.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return palette.success;
      case 'inactive':
        return palette.warning;
      case 'discharged':
        return palette.textSecondary;
      default:
        return palette.textSecondary;
    }
  };

  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const callPatient = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}?`,
      `Do you want to call ${phone}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Call', onPress: () => {
          // In a real app, this would open the phone dialer
          Alert.alert('Calling...', `Calling ${name} at ${phone}`);
        }},
      ]
    );
  };

  const scheduleAppointment = (patient: Patient) => {
    Alert.alert(
      'Schedule Appointment',
      `Schedule a new appointment for ${patient.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Schedule', onPress: () => {
          Alert.alert('Success', 'Appointment scheduling interface would open here');
        }},
      ]
    );
  };

  const activePatients = patients.filter(p => p.status === 'active').length;
  const highPriorityPatients = patients.filter(p => p.priority === 'high').length;
  const upcomingAppointments = patients.filter(p => p.nextAppointment).length;

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Total Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activePatients}</Text>
            <Text style={styles.statLabel}>Active Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{highPriorityPatients}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{upcomingAppointments}</Text>
            <Text style={styles.statLabel}>Upcoming Appts</Text>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients, conditions, or medical records..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterContainer}>
            {(['all', 'active', 'inactive'] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.selectedFilterButton,
                ]}
                onPress={() => setFilterStatus(status)}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterStatus === status && styles.selectedFilterButtonText,
                  ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Patient List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patient Roster ({filteredPatients.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => Alert.alert('Add Patient', 'New patient registration form')}>
              <Text style={styles.addButtonText}>+ Add Patient</Text>
            </TouchableOpacity>
          </View>

          {filteredPatients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateText}>No patients found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Add your first patient to get started'}
              </Text>
            </View>
          ) : (
            filteredPatients.map(patient => (
              <View key={patient.id} style={styles.patientCard}>
                <View style={styles.patientHeader}>
                  <View style={styles.patientInfo}>
                    <View style={styles.patientNameRow}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <View style={styles.badges}>
                        <View
                          style={[
                            styles.priorityBadge,
                            {backgroundColor: getPriorityColor(patient.priority)},
                          ]}>
                          <Text style={styles.badgeText}>
                            {patient.priority.toUpperCase()}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {backgroundColor: getStatusColor(patient.status)},
                          ]}>
                          <Text style={styles.badgeText}>
                            {patient.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Text style={styles.patientDetails}>
                      {patient.age} years • {patient.gender} • MR: {patient.medicalRecord}
                    </Text>
                    <Text style={styles.patientCondition}>{patient.condition}</Text>
                    <Text style={styles.patientVisit}>
                      Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </Text>
                    {patient.nextAppointment && (
                      <Text style={styles.patientNextVisit}>
                        Next: {new Date(patient.nextAppointment).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.patientActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => viewPatientDetails(patient)}>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.callButton]}
                    onPress={() => callPatient(patient.phone, patient.name)}>
                    <Text style={[styles.actionButtonText, styles.callButtonText]}>Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.scheduleButton]}
                    onPress={() => scheduleAppointment(patient)}>
                    <Text style={[styles.actionButtonText, styles.scheduleButtonText]}>
                      Schedule
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Bulk Actions', 'Bulk patient operations')}>
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionTitle}>Bulk Operations</Text>
              <Text style={styles.quickActionDescription}>
                Send reminders, update records
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Export Data', 'Export patient data')}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionTitle}>Export Data</Text>
              <Text style={styles.quickActionDescription}>
                Generate reports and exports
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Patient Alerts', 'View patient alerts and notifications')}>
              <Text style={styles.quickActionIcon}>🔔</Text>
              <Text style={styles.quickActionTitle}>Patient Alerts</Text>
              <Text style={styles.quickActionDescription}>
                Overdue visits, critical updates
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Referrals', 'Manage patient referrals')}>
              <Text style={styles.quickActionIcon}>🏥</Text>
              <Text style={styles.quickActionTitle}>Referrals</Text>
              <Text style={styles.quickActionDescription}>
                Send and track referrals
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Patient Detail Modal */}
      <Modal
        visible={showPatientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPatientModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPatient && (
              <>
                <Text style={styles.modalTitle}>Patient Details</Text>
                
                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Personal Information</Text>
                    <Text style={styles.modalInfo}>Name: {selectedPatient.name}</Text>
                    <Text style={styles.modalInfo}>Age: {selectedPatient.age} years</Text>
                    <Text style={styles.modalInfo}>Gender: {selectedPatient.gender}</Text>
                    <Text style={styles.modalInfo}>Medical Record: {selectedPatient.medicalRecord}</Text>
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Contact Information</Text>
                    <Text style={styles.modalInfo}>Phone: {selectedPatient.phone}</Text>
                    {selectedPatient.email && (
                      <Text style={styles.modalInfo}>Email: {selectedPatient.email}</Text>
                    )}
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Medical Information</Text>
                    <Text style={styles.modalInfo}>Condition: {selectedPatient.condition}</Text>
                    <Text style={styles.modalInfo}>Priority: {selectedPatient.priority}</Text>
                    <Text style={styles.modalInfo}>Status: {selectedPatient.status}</Text>
                    <Text style={styles.modalInfo}>
                      Last Visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                    </Text>
                    {selectedPatient.nextAppointment && (
                      <Text style={styles.modalInfo}>
                        Next Appointment: {new Date(selectedPatient.nextAppointment).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </ScrollView>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowPatientModal(false);
                      // Navigate to patient detail screen
                      Alert.alert('Navigate', 'Would navigate to detailed patient view');
                    }}>
                    <Text style={styles.modalActionButtonText}>Full Medical Record</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalCloseButton]}
                    onPress={() => setShowPatientModal(false)}>
                    <Text style={[styles.modalActionButtonText, styles.modalCloseButtonText]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: palette.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  selectedFilterButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  selectedFilterButtonText: {
    color: palette.textOnPrimary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  addButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  addButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  patientCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  patientHeader: {
    marginBottom: spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: palette.textOnDark,
  },
  patientDetails: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  patientCondition: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  patientVisit: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  patientNextVisit: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '500',
  },
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  actionButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  callButton: {
    backgroundColor: palette.primary,
  },
  callButtonText: {
    color: palette.textOnPrimary,
  },
  scheduleButton: {
    backgroundColor: palette.accent,
  },
  scheduleButtonText: {
    color: palette.textOnDark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: palette.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalScroll: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  modalInfo: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  modalActionButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: palette.surface,
  },
  modalCloseButtonText: {
    color: palette.textSecondary,
  },
});

export default PatientManagementScreen;