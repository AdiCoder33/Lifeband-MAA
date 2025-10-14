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

type VisitStatus = 'scheduled' | 'completed' | 'missed' | 'rescheduled';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

type MaternalVisit = {
  id: string;
  motherName: string;
  motherId: string;
  address: string;
  contactNumber: string;
  gestationWeek: number;
  visitType: 'anc' | 'pnc' | 'delivery' | 'follow-up';
  scheduledDate: string;
  scheduledTime: string;
  status: VisitStatus;
  priority: Priority;
  notes?: string;
  lastVisitDate?: string;
  riskFactors?: string[];
};

const MaternalVisitsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<VisitStatus | 'all'>('all');

  const visits: MaternalVisit[] = [
    {
      id: '1',
      motherName: 'Priya Sharma',
      motherId: 'M001',
      address: 'Village Whitefield, House No. 12',
      contactNumber: '+91-98765-43210',
      gestationWeek: 28,
      visitType: 'anc',
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00 AM',
      status: 'scheduled',
      priority: 'high',
      notes: 'High BP monitoring required',
      lastVisitDate: '2024-01-01',
      riskFactors: ['High BP', 'Previous complications'],
    },
    {
      id: '2',
      motherName: 'Anjali Reddy',
      motherId: 'M002',
      address: 'Village Whitefield, House No. 45',
      contactNumber: '+91-98765-43211',
      gestationWeek: 35,
      visitType: 'anc',
      scheduledDate: '2024-01-15',
      scheduledTime: '2:00 PM',
      status: 'completed',
      priority: 'normal',
      notes: 'Regular checkup completed',
      lastVisitDate: '2024-01-15',
    },
    {
      id: '3',
      motherName: 'Meera Patel',
      motherId: 'M003',
      address: 'Village Whitefield, House No. 78',
      contactNumber: '+91-98765-43212',
      gestationWeek: 0, // Post-delivery
      visitType: 'pnc',
      scheduledDate: '2024-01-16',
      scheduledTime: '11:00 AM',
      status: 'scheduled',
      priority: 'urgent',
      notes: 'Newborn 7 days old - check mother and baby health',
      lastVisitDate: '2024-01-09',
      riskFactors: ['C-section delivery'],
    },
  ];

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case 'completed':
        return palette.success;
      case 'scheduled':
        return palette.info;
      case 'missed':
        return palette.danger;
      case 'rescheduled':
        return palette.warning;
      default:
        return palette.textSecondary;
    }
  };

  const getPriorityColor = (priority: Priority) => {
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

  const getVisitTypeIcon = (type: string) => {
    switch (type) {
      case 'anc':
        return '🤱';
      case 'pnc':
        return '👶';
      case 'delivery':
        return '🏥';
      case 'follow-up':
        return '🔄';
      default:
        return '📅';
    }
  };

  const getVisitTypeName = (type: string) => {
    switch (type) {
      case 'anc':
        return 'Antenatal Care';
      case 'pnc':
        return 'Postnatal Care';
      case 'delivery':
        return 'Delivery Support';
      case 'follow-up':
        return 'Follow-up Visit';
      default:
        return 'Visit';
    }
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         visit.motherId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const todaysStats = {
    total: visits.filter(v => v.scheduledDate === '2024-01-15').length,
    completed: visits.filter(v => v.scheduledDate === '2024-01-15' && v.status === 'completed').length,
    scheduled: visits.filter(v => v.scheduledDate === '2024-01-15' && v.status === 'scheduled').length,
    urgent: visits.filter(v => v.priority === 'urgent').length,
  };

  const handleVisitAction = (visit: MaternalVisit, action: string) => {
    switch (action) {
      case 'start':
        Alert.alert('Start Visit', `Start visit with ${visit.motherName}?`);
        break;
      case 'complete':
        Alert.alert('Complete Visit', `Mark visit with ${visit.motherName} as completed?`);
        break;
      case 'reschedule':
        Alert.alert('Reschedule', `Reschedule visit with ${visit.motherName}`);
        break;
      case 'call':
        Alert.alert('Call Mother', `Calling ${visit.contactNumber}`);
        break;
      case 'navigate':
        Alert.alert('Navigate', `Opening directions to ${visit.address}`);
        break;
      case 'notes':
        Alert.alert('Add Notes', `Add notes for ${visit.motherName}`);
        break;
    }
  };

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todaysStats.total}</Text>
            <Text style={styles.statLabel}>Today's Visits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.success}]}>{todaysStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.info}]}>{todaysStats.scheduled}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, {color: palette.danger}]}>{todaysStats.urgent}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search mothers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={palette.textSecondary}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            {(['all', 'scheduled', 'completed', 'missed', 'rescheduled'] as const).map(status => (
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
            onPress={() => Alert.alert('New Visit', 'Schedule a new maternal visit')}>
            <Text style={styles.actionButtonText}>➕ Schedule Visit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Route Planning', 'Plan optimal visit route')}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>🗺️ Plan Route</Text>
          </TouchableOpacity>
        </View>

        {/* Visits List */}
        <View style={styles.visitsSection}>
          <Text style={styles.sectionTitle}>🏠 Maternal Home Visits</Text>
          
          {filteredVisits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏠</Text>
              <Text style={styles.emptyStateTitle}>No Visits Found</Text>
              <Text style={styles.emptyStateDescription}>
                {filterStatus === 'all' 
                  ? 'No visits scheduled'
                  : `No ${filterStatus} visits found`}
              </Text>
            </View>
          ) : (
            filteredVisits.map(visit => (
              <View key={visit.id} style={styles.visitCard}>
                <View style={styles.visitHeader}>
                  <View style={styles.motherInfo}>
                    <Text style={styles.motherName}>{visit.motherName}</Text>
                    <Text style={styles.motherId}>ID: {visit.motherId}</Text>
                    {visit.gestationWeek > 0 && (
                      <Text style={styles.gestationWeek}>
                        📅 {visit.gestationWeek} weeks pregnant
                      </Text>
                    )}
                    {visit.gestationWeek === 0 && (
                      <Text style={styles.gestationWeek}>
                        👶 Post-delivery care
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.visitMeta}>
                    <View style={styles.badges}>
                      <View
                        style={[
                          styles.statusBadge,
                          {backgroundColor: getStatusColor(visit.status)},
                        ]}>
                        <Text style={styles.badgeText}>{visit.status}</Text>
                      </View>
                      
                      <View
                        style={[
                          styles.priorityBadge,
                          {backgroundColor: getPriorityColor(visit.priority)},
                        ]}>
                        <Text style={styles.badgeText}>{visit.priority}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.visitDetails}>
                  <View style={styles.visitTypeContainer}>
                    <Text style={styles.visitTypeIcon}>{getVisitTypeIcon(visit.visitType)}</Text>
                    <Text style={styles.visitTypeText}>{getVisitTypeName(visit.visitType)}</Text>
                  </View>
                  
                  <Text style={styles.visitDateTime}>
                    📅 {visit.scheduledDate} at {visit.scheduledTime}
                  </Text>
                  
                  <Text style={styles.visitAddress}>📍 {visit.address}</Text>
                  
                  <Text style={styles.contactNumber}>📞 {visit.contactNumber}</Text>
                </View>
                
                {visit.riskFactors && visit.riskFactors.length > 0 && (
                  <View style={styles.riskFactorsContainer}>
                    <Text style={styles.riskFactorsLabel}>⚠️ Risk Factors:</Text>
                    <Text style={styles.riskFactorsText}>{visit.riskFactors.join(', ')}</Text>
                  </View>
                )}
                
                {visit.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>📝 Notes:</Text>
                    <Text style={styles.notesText}>{visit.notes}</Text>
                  </View>
                )}
                
                <View style={styles.visitActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.callBtn]}
                    onPress={() => handleVisitAction(visit, 'call')}>
                    <Text style={styles.actionBtnText}>📞 Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.navigateBtn]}
                    onPress={() => handleVisitAction(visit, 'navigate')}>
                    <Text style={styles.actionBtnText}>🗺️ Navigate</Text>
                  </TouchableOpacity>
                  
                  {visit.status === 'scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.startBtn]}
                      onPress={() => handleVisitAction(visit, 'start')}>
                      <Text style={styles.actionBtnText}>▶️ Start</Text>
                    </TouchableOpacity>
                  )}
                  
                  {visit.status === 'scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.completeBtn]}
                      onPress={() => handleVisitAction(visit, 'complete')}>
                      <Text style={styles.actionBtnText}>✅ Complete</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.notesBtn]}
                    onPress={() => handleVisitAction(visit, 'notes')}>
                    <Text style={styles.actionBtnText}>📝 Notes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  visitsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  visitCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  motherInfo: {
    flex: 1,
  },
  motherName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  motherId: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  gestationWeek: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '500',
  },
  visitMeta: {
    alignItems: 'flex-end',
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
  visitDetails: {
    marginBottom: spacing.md,
  },
  visitTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  visitTypeIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  visitTypeText: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  visitDateTime: {
    fontSize: 14,
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  visitAddress: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  contactNumber: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  riskFactorsContainer: {
    backgroundColor: palette.danger + '20',
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  riskFactorsLabel: {
    fontSize: 12,
    color: palette.danger,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  riskFactorsText: {
    fontSize: 14,
    color: palette.danger,
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
  visitActions: {
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
  navigateBtn: {
    backgroundColor: palette.info,
  },
  startBtn: {
    backgroundColor: palette.primary,
  },
  completeBtn: {
    backgroundColor: palette.success,
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
});

export default MaternalVisitsScreen;