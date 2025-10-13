import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

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

const MedicineTrackerScreen: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Prenatal Vitamins',
      dosage: '1 tablet',
      frequency: 'Daily',
      time: ['08:00'],
      category: 'prenatal',
      notes: 'Take with food',
      taken: true,
      nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Folic Acid',
      dosage: '400mcg',
      frequency: 'Daily',
      time: ['08:00'],
      category: 'supplement',
      taken: false,
      nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Iron Supplement',
      dosage: '65mg',
      frequency: 'Daily',
      time: ['20:00'],
      category: 'supplement',
      notes: 'Take on empty stomach',
      taken: false,
      nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    category: 'supplement' as Medicine['category'],
    notes: '',
  });

  const markAsTaken = (id: string) => {
    setMedicines(prev =>
      prev.map(med =>
        med.id === id
          ? {
              ...med,
              taken: true,
              nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
          : med,
      ),
    );
  };

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      Alert.alert('Error', 'Please fill in medicine name and dosage');
      return;
    }

    const medicine: Medicine = {
      id: Date.now().toString(),
      ...newMedicine,
      time: ['08:00'],
      taken: false,
      nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
    };

    setMedicines(prev => [...prev, medicine]);
    setNewMedicine({
      name: '',
      dosage: '',
      frequency: '',
      category: 'supplement',
      notes: '',
    });
    setShowAddModal(false);
  };

  const getCategoryColor = (category: Medicine['category']) => {
    switch (category) {
      case 'prenatal':
        return palette.primary;
      case 'supplement':
        return palette.accent;
      case 'prescription':
        return palette.danger;
      default:
        return palette.textSecondary;
    }
  };

  const getCategoryIcon = (category: Medicine['category']) => {
    switch (category) {
      case 'prenatal':
        return '🤱';
      case 'supplement':
        return '💊';
      case 'prescription':
        return '🩺';
      default:
        return '💉';
    }
  };

  const formatTimeUntilNext = (nextDue: Date) => {
    const now = new Date();
    const diff = nextDue.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const todaysMedicines = medicines.filter(med => !med.taken);
  const upcomingMedicines = medicines.filter(med => med.taken);

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Medicine Tracker</Text>
          <Text style={styles.headerSubtitle}>
            Stay on track with your maternal health medications
          </Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Medicines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Today ({todaysMedicines.length})</Text>
          
          {todaysMedicines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>✅</Text>
              <Text style={styles.emptyStateText}>All medicines taken for today!</Text>
            </View>
          ) : (
            todaysMedicines.map(medicine => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>
                      {getCategoryIcon(medicine.category)} {medicine.name}
                    </Text>
                    <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
                    <Text style={styles.medicineFrequency}>
                      {medicine.frequency} • Due in {formatTimeUntilNext(medicine.nextDue)}
                    </Text>
                    {medicine.notes && (
                      <Text style={styles.medicineNotes}>📝 {medicine.notes}</Text>
                    )}
                  </View>
                  
                  <View style={styles.medicineActions}>
                    <View
                      style={[
                        styles.categoryBadge,
                        {backgroundColor: getCategoryColor(medicine.category)},
                      ]}>
                      <Text style={styles.categoryText}>
                        {medicine.category.toUpperCase()}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.takeButton}
                      onPress={() => markAsTaken(medicine.id)}>
                      <Text style={styles.takeButtonText}>Mark as Taken</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Taken Today */}
        {upcomingMedicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Taken Today ({upcomingMedicines.length})</Text>
            
            {upcomingMedicines.map(medicine => (
              <View key={medicine.id} style={[styles.medicineCard, styles.takenCard]}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineInfo}>
                    <Text style={[styles.medicineName, styles.takenText]}>
                      ✅ {getCategoryIcon(medicine.category)} {medicine.name}
                    </Text>
                    <Text style={[styles.medicineDosage, styles.takenText]}>
                      {medicine.dosage}
                    </Text>
                    <Text style={[styles.medicineFrequency, styles.takenText]}>
                      Next dose: {medicine.nextDue.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  
                  <View
                    style={[
                      styles.categoryBadge,
                      {backgroundColor: palette.success},
                    ]}>
                    <Text style={styles.categoryText}>TAKEN</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Medication Tips</Text>
          <View style={styles.tipsContainer}>
            <Text style={styles.tip}>• Take prenatal vitamins with food to reduce nausea</Text>
            <Text style={styles.tip}>• Iron supplements are best absorbed on empty stomach</Text>
            <Text style={styles.tip}>• Set reminders for consistent timing</Text>
            <Text style={styles.tip}>• Always consult your doctor before changing medications</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Medicine Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Medicine</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Medicine Name"
              value={newMedicine.name}
              onChangeText={text => setNewMedicine(prev => ({...prev, name: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g., 1 tablet, 400mcg)"
              value={newMedicine.dosage}
              onChangeText={text => setNewMedicine(prev => ({...prev, dosage: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Frequency (e.g., Daily, Twice daily)"
              value={newMedicine.frequency}
              onChangeText={text => setNewMedicine(prev => ({...prev, frequency: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              value={newMedicine.notes}
              onChangeText={text => setNewMedicine(prev => ({...prev, notes: text}))}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={addMedicine}>
                <Text style={styles.confirmButtonText}>Add Medicine</Text>
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
  headerSection: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  addButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  medicineCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  takenCard: {
    backgroundColor: palette.maternal.mint,
    borderLeftColor: palette.success,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicineInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  medicineDosage: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  medicineFrequency: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  medicineNotes: {
    fontSize: 12,
    color: palette.accent,
    fontStyle: 'italic',
  },
  takenText: {
    opacity: 0.7,
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: palette.textOnDark,
  },
  takeButton: {
    backgroundColor: palette.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  takeButtonText: {
    color: palette.textOnDark,
    fontWeight: '600',
    fontSize: 12,
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
    color: palette.success,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: palette.maternal.cream,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  tip: {
    fontSize: 14,
    color: palette.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 20,
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
  },
  modalTitle: {
    fontSize: 20,
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
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: palette.surface,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    marginLeft: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
});

export default MedicineTrackerScreen;