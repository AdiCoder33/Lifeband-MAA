import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';
import { useFirebaseHealth } from '../../services/hooks/useFirebaseHealth';

type Medicine = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  category: 'prenatal' | 'supplement' | 'prescription' | 'other';
  notes?: string;
  taken: boolean;
  nextDue: Date;
};

const FirebaseMedicineTrackerScreen: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: ['08:00'],
    category: 'prenatal' as Medicine['category'],
    notes: ''
  });

  const firebaseHealth = useFirebaseHealth();

  // Load medicines from Firebase
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const firebaseMedicines = await firebaseHealth.getMedicines();
      
      // Convert Firebase medicine entries to your local format
      const convertedMedicines: Medicine[] = firebaseMedicines.map(med => ({
        id: med.id,
        name: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        time: med.timings,
        category: 'prescription', // You can enhance this mapping
        notes: med.notes || '',
        taken: med.takenToday.some(taken => taken), // Check if any dose was taken
        nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000) // Calculate next due time
      }));
      
      setMedicines(convertedMedicines);
    } catch (error) {
      console.error('Error loading medicines:', error);
      Alert.alert('Error', 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async () => {
    try {
      if (!newMedicine.name || !newMedicine.dosage) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      // Save to Firebase
      await firebaseHealth.saveMedicine({
        medicineName: newMedicine.name,
        dosage: newMedicine.dosage,
        frequency: newMedicine.frequency,
        timings: newMedicine.time,
        notes: newMedicine.notes
      });

      // Reload medicines list
      await loadMedicines();
      
      // Reset form and close modal
      setNewMedicine({
        name: '',
        dosage: '',
        frequency: 'Daily',
        time: ['08:00'],
        category: 'prenatal',
        notes: ''
      });
      setShowAddModal(false);
      
      Alert.alert('Success', 'Medicine added successfully');
    } catch (error) {
      console.error('Error adding medicine:', error);
      Alert.alert('Error', 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicineId: string) => {
    try {
      // Find the Firebase medicine entry
      const firebaseMedicines = await firebaseHealth.getMedicines();
      const firebaseMedicine = firebaseMedicines.find(med => med.id === medicineId);
      
      if (firebaseMedicine) {
        // Mark first dose as taken (you can enhance this for multiple doses)
        const updatedTakenToday = [...firebaseMedicine.takenToday];
        updatedTakenToday[0] = true;
        
        await firebaseHealth.updateMedicineStatus(medicineId, updatedTakenToday);
        
        // Update local state
        setMedicines(prev => prev.map(med => 
          med.id === medicineId 
            ? { ...med, taken: true }
            : med
        ));
        
        Alert.alert('Success', 'Medicine marked as taken');
      }
    } catch (error) {
      console.error('Error updating medicine status:', error);
      Alert.alert('Error', 'Failed to update medicine status');
    }
  };

  const getTodayStats = () => {
    const totalMedicines = medicines.length;
    const takenMedicines = medicines.filter(med => med.taken).length;
    const pendingMedicines = totalMedicines - takenMedicines;
    
    return { totalMedicines, takenMedicines, pendingMedicines };
  };

  const { totalMedicines, takenMedicines, pendingMedicines } = getTodayStats();

  if (loading && medicines.length === 0) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMedicines}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: palette.success + '20'}]}>
            <Text style={[styles.statNumber, {color: palette.success}]}>{takenMedicines}</Text>
            <Text style={styles.statLabel}>Taken</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: palette.warning + '20'}]}>
            <Text style={[styles.statNumber, {color: palette.warning}]}>{pendingMedicines}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Add Medicine Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add New Medicine</Text>
        </TouchableOpacity>

        {/* Medicines List */}
        <View style={styles.medicinesContainer}>
          <Text style={styles.sectionTitle}>Today's Medicines</Text>
          
          {medicines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No medicines added yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first medicine to get started</Text>
            </View>
          ) : (
            medicines.map(medicine => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{medicine.name}</Text>
                    <Text style={styles.medicineDosage}>{medicine.dosage} • {medicine.frequency}</Text>
                    <Text style={styles.medicineTime}>Time: {medicine.time.join(', ')}</Text>
                    {medicine.notes && (
                      <Text style={styles.medicineNotes}>Note: {medicine.notes}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      medicine.taken 
                        ? styles.takenButton 
                        : styles.pendingButton
                    ]}
                    onPress={() => !medicine.taken && markAsTaken(medicine.id)}
                    disabled={medicine.taken}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      medicine.taken 
                        ? styles.takenButtonText 
                        : styles.pendingButtonText
                    ]}>
                      {medicine.taken ? '✓ Taken' : 'Mark as Taken'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Medicine Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Medicine</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Medicine Name"
                value={newMedicine.name}
                onChangeText={(text) => setNewMedicine(prev => ({...prev, name: text}))}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Dosage (e.g., 1 tablet, 400mcg)"
                value={newMedicine.dosage}
                onChangeText={(text) => setNewMedicine(prev => ({...prev, dosage: text}))}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Frequency (e.g., Daily, Twice daily)"
                value={newMedicine.frequency}
                onChangeText={(text) => setNewMedicine(prev => ({...prev, frequency: text}))}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Notes (optional)"
                value={newMedicine.notes}
                onChangeText={(text) => setNewMedicine(prev => ({...prev, notes: text}))}
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddMedicine}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={palette.textOnPrimary} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Add Medicine</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: palette.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  addButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButtonText: {
    color: palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  medicinesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  medicineCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicineInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  medicineDosage: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  medicineTime: {
    fontSize: 12,
    color: palette.info,
    marginBottom: spacing.xs,
  },
  medicineNotes: {
    fontSize: 12,
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  statusButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    minWidth: 100,
    alignItems: 'center',
  },
  takenButton: {
    backgroundColor: palette.success + '20',
  },
  pendingButton: {
    backgroundColor: palette.warning + '20',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  takenButtonText: {
    color: palette.success,
  },
  pendingButtonText: {
    color: palette.warning,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 16,
    color: palette.textPrimary,
    marginBottom: spacing.md,
    backgroundColor: palette.background,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: palette.border,
    marginRight: spacing.sm,
  },
  saveButton: {
    backgroundColor: palette.primary,
    marginLeft: spacing.sm,
  },
  cancelButtonText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  saveButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
});

export default FirebaseMedicineTrackerScreen;