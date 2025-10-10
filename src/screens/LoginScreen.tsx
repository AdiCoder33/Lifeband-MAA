import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const {login} = useAuth();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');

  const isDisabled = !name.trim() || !identifier.trim();

  const handleSubmit = () => {
    if (isDisabled) {
      return;
    }
    login({name: name.trim(), identifier: identifier.trim()});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>LifeBand MAA</Text>
        <Text style={styles.subtitle}>Mobile Assisted Analytics</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Staff / Patient ID</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="e.g. ASHA123"
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleSubmit}
          disabled={isDisabled}
          style={[styles.button, isDisabled && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#E8F0FE',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A73E8',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5F6368',
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFBFF',
    color: '#202124',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1A73E8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#96B7F2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LoginScreen;
