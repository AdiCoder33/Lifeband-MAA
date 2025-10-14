import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing, radii} from '../../theme';

type Contact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergency: boolean;
  isPrimary?: boolean;
};

type EmergencyService = {
  id: string;
  name: string;
  phone: string;
  description: string;
  icon: string;
  category: 'emergency' | 'medical' | 'maternal';
};

const EmergencyContactsScreen: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      phone: '+1-555-0123',
      relationship: 'Primary OB/GYN',
      isEmergency: true,
      isPrimary: true,
    },
    {
      id: '2',
      name: 'John Smith',
      phone: '+1-555-0456',
      relationship: 'Husband/Partner',
      isEmergency: true,
    },
    {
      id: '3',
      name: 'Memorial Hospital',
      phone: '+1-555-0789',
      relationship: 'Birth Hospital',
      isEmergency: true,
    },
    {
      id: '4',
      name: 'Mom - Mary Smith',
      phone: '+1-555-0321',
      relationship: 'Mother',
      isEmergency: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    isEmergency: false,
  });

  const emergencyServices: EmergencyService[] = [
    {
      id: '1',
      name: 'Emergency Services',
      phone: '911',
      description: 'Life-threatening emergencies',
      icon: '🚨',
      category: 'emergency',
    },
    {
      id: '2',
      name: 'Poison Control',
      phone: '1-800-222-1222',
      description: 'Poisoning emergencies',
      icon: '☠️',
      category: 'emergency',
    },
    {
      id: '3',
      name: 'Maternal Mental Health',
      phone: '1-833-9-HELP4MOMS',
      description: 'Postpartum depression support',
      icon: '💙',
      category: 'maternal',
    },
    {
      id: '4',
      name: 'Pregnancy Hotline',
      phone: '1-800-672-2296',
      description: '24/7 pregnancy support',
      icon: '🤱',
      category: 'maternal',
    },
    {
      id: '5',
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Crisis support via text',
      icon: '💬',
      category: 'emergency',
    },
  ];

  const makeCall = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}?`,
      `Do you want to call ${phone}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Call',
          onPress: () => {
            const phoneNumber = phone.replace(/[^\d+]/g, '');
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({
      name: '',
      phone: '',
      relationship: '',
      isEmergency: false,
    });
    setShowAddModal(false);
  };

  const deleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(contact => contact.id !== id));
          },
        },
      ]
    );
  };

  const emergencyContacts = contacts.filter(contact => contact.isEmergency);
  const regularContacts = contacts.filter(contact => !contact.isEmergency);

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <Text style={styles.headerSubtitle}>
            Quick access to important contacts during your pregnancy journey
          </Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Alert */}
        <View style={styles.emergencyAlert}>
          <Text style={styles.emergencyAlertTitle}>🚨 In Case of Emergency</Text>
          <Text style={styles.emergencyAlertText}>
            If you're experiencing severe bleeding, severe abdominal pain, 
            difficulty breathing, or other life-threatening symptoms, call 911 immediately.
          </Text>
        </View>

        {/* Emergency Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Emergency Services</Text>
          
          {emergencyServices.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                service.category === 'emergency' && styles.emergencyServiceCard,
              ]}
              onPress={() => makeCall(service.phone, service.name)}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePhone}>{service.phone}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                <View style={styles.callButton}>
                  <Text style={styles.callButtonText}>CALL</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 Emergency Contacts</Text>
          
          {emergencyContacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📱</Text>
              <Text style={styles.emptyStateText}>No emergency contacts added yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your doctor, partner, and hospital for quick access
              </Text>
            </View>
          ) : (
            emergencyContacts.map(contact => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {contact.name}
                      {contact.isPrimary && (
                        <Text style={styles.primaryBadge}> • PRIMARY</Text>
                      )}
                    </Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  </View>
                  
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={styles.emergencyCallButton}
                      onPress={() => makeCall(contact.phone, contact.name)}>
                      <Text style={styles.emergencyCallButtonText}>CALL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Regular Contacts */}
        {regularContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Other Contacts</Text>
            
            {regularContacts.map(contact => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  </View>
                  
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => makeCall(contact.phone, contact.name)}>
                      <Text style={styles.callButtonText}>CALL</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteContact(contact.id)}>
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Location Sharing', 'Share your location with emergency contacts')}>
              <Text style={styles.quickActionIcon}>📍</Text>
              <Text style={styles.quickActionText}>Share Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Medical Info', 'Quick access to your medical information')}>
              <Text style={styles.quickActionIcon}>🏥</Text>
              <Text style={styles.quickActionText}>Medical Info</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Insurance', 'View insurance card and information')}>
              <Text style={styles.quickActionIcon}>🆔</Text>
              <Text style={styles.quickActionText}>Insurance Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Birth Plan', 'Quick access to your birth plan')}>
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>Birth Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Safety Tips</Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tip}>🔢 Keep emergency contacts easily accessible</Text>
            <Text style={styles.tip}>📱 Program ICE (In Case of Emergency) in your phone</Text>
            <Text style={styles.tip}>🏠 Share your location with trusted contacts</Text>
            <Text style={styles.tip}>📝 Keep a list of medications and allergies handy</Text>
            <Text style={styles.tip}>🚗 Know the fastest route to your birth hospital</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Contact</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newContact.name}
              onChangeText={text => setNewContact(prev => ({...prev, name: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newContact.phone}
              onChangeText={text => setNewContact(prev => ({...prev, phone: text}))}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Relationship (e.g., Doctor, Partner, Mother)"
              value={newContact.relationship}
              onChangeText={text => setNewContact(prev => ({...prev, relationship: text}))}
            />
            
            <TouchableOpacity
              style={[
                styles.emergencyToggle,
                newContact.isEmergency && styles.emergencyToggleActive,
              ]}
              onPress={() => setNewContact(prev => ({...prev, isEmergency: !prev.isEmergency}))}>
              <Text
                style={[
                  styles.emergencyToggleText,
                  newContact.isEmergency && styles.emergencyToggleTextActive,
                ]}>
                {newContact.isEmergency ? '🔴 Emergency Contact' : '⚪ Regular Contact'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={addContact}>
                <Text style={styles.confirmButtonText}>Add Contact</Text>
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
  emergencyAlert: {
    backgroundColor: palette.maternal.blush,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: palette.danger,
  },
  emergencyAlertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  emergencyAlertText: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
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
  serviceCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  emergencyServiceCard: {
    borderLeftColor: palette.danger,
    backgroundColor: palette.maternal.blush,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  servicePhone: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  contactCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  primaryBadge: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  contactRelationship: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  callButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  callButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  emergencyCallButton: {
    backgroundColor: palette.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  emergencyCallButtonText: {
    color: palette.textOnDark,
    fontWeight: 'bold',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: palette.surface,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: palette.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
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
  quickActionButton: {
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
  quickActionText: {
    fontSize: 12,
    color: palette.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: palette.maternal.mint,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tip: {
    fontSize: 14,
    color: palette.textPrimary,
    marginBottom: spacing.sm,
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
  emergencyToggle: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  emergencyToggleActive: {
    backgroundColor: palette.danger,
    borderColor: palette.danger,
  },
  emergencyToggleText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  emergencyToggleTextActive: {
    color: palette.textOnDark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default EmergencyContactsScreen;