import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth, type UserRole} from '../context/AuthContext';
import {useAppStore} from '../store/useAppStore';

const ROLES: {role: UserRole; description: string}[] = [
  {role: 'ASHA', description: 'Community health worker for field data collection'},
  {role: 'Doctor', description: 'Review incoming vitals and flag escalations'},
  {role: 'Patient', description: 'View shared vitals and guidance'},
];

export const RoleSelectionScreen: React.FC = () => {
  const {selectRole, logout, name, identifier} = useAuth();
  const setSelectedPatient = useAppStore(state => state.setSelectedPatient);

  const handleSelect = (role: UserRole) => {
    if (role === 'Patient') {
      setSelectedPatient(identifier);
    } else {
      setSelectedPatient(undefined);
    }
    selectRole(role);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome back{name ? `, ${name}` : ''}</Text>
          <Text style={styles.subtitle}>Choose how you want to use LifeBand</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.link}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ROLES}
        keyExtractor={item => item.role}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item.role)}>
            <Text style={styles.cardTitle}>{item.role}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#5F6368',
  },
  link: {
    color: '#1A73E8',
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#5F6368',
  },
});

export default RoleSelectionScreen;
